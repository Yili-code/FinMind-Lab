# stocks.py - 股票數據路由

from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Dict, Optional
import time
from core.logging_config import get_logger
from core.exceptions import StockNotFoundError, YFinanceAPIError
from core.dependencies import CACHE_AVAILABLE, DB_AVAILABLE
from services.yfinance_service import (
    get_stock_info,
    get_intraday_data,
    get_daily_trade_data,
    get_market_index_data,
    get_financial_statements,
    get_yfinance_ticker
)
from services.cache_service import (
    get_from_memory_cache,
    set_to_memory_cache,
    get_cache_key,
    CACHE_TTL
)
from services.api_quota_tracker import quota_tracker
from crud import (
    save_stock_basic,
    save_daily_trades,
    get_stock_basic_from_db,
    get_daily_trades_from_db,
    get_income_statement_from_db,
    get_balance_sheet_from_db,
    get_cash_flow_from_db,
    save_income_statement,
    save_balance_sheet,
    save_cash_flow
)
from utils.stock_helpers import diagnose_empty_data

logger = get_logger(__name__)

router = APIRouter(prefix="/api/stock", tags=["股票數據"])


@router.get(
    "/info/{stock_code}",
    summary="獲取股票基本資訊",
    description="獲取指定股票代號的基本資訊，包括股票名稱、當前價格、市值等。"
)
async def get_stock_information(
    stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330")
):
    """獲取股票基本資訊"""
    try:
        start_time = time.time()
        logger.info("=" * 80)
        logger.info(f"[API 請求] GET /api/stock/info/{stock_code}")
        logger.info("=" * 80)
        
        # 1. 嘗試從內存快取獲取
        cache_key = get_cache_key('stock_info', stock_code)
        if CACHE_AVAILABLE:
            cached_data = get_from_memory_cache(cache_key)
            if cached_data is not None:
                logger.info(f"[快取] 從內存快取獲取股票基本資訊: {stock_code}")
                return cached_data
        
        # 2. 嘗試從資料庫獲取
        if DB_AVAILABLE:
            db_data = get_stock_basic_from_db(stock_code)
            if db_data is not None:
                logger.info(f"[資料庫] 從資料庫獲取股票基本資訊: {stock_code}")
                if CACHE_AVAILABLE:
                    set_to_memory_cache(cache_key, db_data, CACHE_TTL['stock_info'])
                return db_data
        
        # 3. 檢查 API 限額
        if CACHE_AVAILABLE:
            rate_limits = quota_tracker.check_rate_limit()
            if not rate_limits['minute_ok']:
                logger.warning("[API 限額] 每分鐘請求數已達上限，請稍後再試")
            if not rate_limits['hour_ok']:
                logger.warning("[API 限額] 每小時請求數已達上限，請稍後再試")
        
        # 4. 從 yfinance API 獲取
        yfinance_ticker = get_yfinance_ticker(stock_code)
        logger.info(f"[API] 從 yfinance 獲取股票基本資訊: {stock_code} -> {yfinance_ticker}")
        
        info = get_stock_info(stock_code)
        response_time = time.time() - start_time
        
        # 記錄 API 請求
        if CACHE_AVAILABLE:
            quota_tracker.record_request('stock_info', stock_code, info is not None, response_time)
        
        if info is None:
            logger.warning(f"[API 響應] 無法獲取股票 {stock_code} 的資訊")
            raise StockNotFoundError(stock_code)
        
        # 5. 保存到快取和資料庫
        if CACHE_AVAILABLE:
            set_to_memory_cache(cache_key, info, CACHE_TTL['stock_info'])
        
        if DB_AVAILABLE:
            try:
                save_stock_basic(info)
                logger.info(f"[資料庫] 已自動保存股票基本資訊: {stock_code}")
            except Exception as e:
                logger.warning(f"[資料庫] 保存股票基本資訊失敗: {str(e)}")
        
        logger.info(f"[API 響應] 成功獲取股票 {stock_code} 的資訊（耗時: {response_time:.2f}秒）")
        return info
    except (StockNotFoundError, YFinanceAPIError):
        raise
    except Exception as e:
        logger.error(f"[API 錯誤] 獲取股票資訊時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取股票資訊時發生錯誤: {str(e)}")


@router.get(
    "/intraday/{stock_code}",
    summary="獲取股票盤中即時數據",
    description="獲取指定股票代號的盤中即時交易數據（成交明細）。"
)
async def get_stock_intraday(
    stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330"),
    period: str = Query("1d", description="時間週期", example="1d"),
    interval: str = Query("1m", description="時間間隔", example="1m")
):
    """獲取股票盤中即時數據（成交明細）"""
    try:
        yfinance_ticker = get_yfinance_ticker(stock_code)
        logger.info("=" * 80)
        logger.info(f"[API 請求] GET /api/stock/intraday/{stock_code}")
        logger.info(f"[參數] stock_code: {stock_code} -> yfinance ticker: {yfinance_ticker}")
        logger.info(f"[參數] period: {period}, interval: {interval}")
        logger.info("=" * 80)
        
        data = get_intraday_data(stock_code, period=period, interval=interval)
        logger.info(f"[API 響應] 成功獲取股票 {stock_code} 的盤中數據，共 {len(data)} 筆")
        return {
            "stockCode": stock_code,
            "data": data,
            "count": len(data)
        }
    except Exception as e:
        logger.error(f"[API 錯誤] 獲取盤中數據時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取盤中數據時發生錯誤: {str(e)}")


@router.get(
    "/daily/{stock_code}",
    summary="獲取股票日交易數據",
    description="獲取指定股票代號的歷史日交易數據，包括開盤價、收盤價、最高價、最低價和成交量。"
)
async def get_stock_daily(
    stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330"),
    days: int = Query(5, description="獲取最近幾天的數據（範圍: 1-2000）", ge=1, le=2000, example=30)
):
    """獲取股票日交易數據"""
    try:
        start_time = time.time()
        logger.info("=" * 80)
        logger.info(f"[API 請求] GET /api/stock/daily/{stock_code}")
        logger.info(f"[參數] stock_code: {stock_code}, days: {days}")
        logger.info("=" * 80)
        
        # 1. 嘗試從內存快取獲取
        cache_key = get_cache_key('daily_trade', stock_code, days)
        if CACHE_AVAILABLE:
            cached_data = get_from_memory_cache(cache_key)
            if cached_data is not None:
                logger.info(f"[快取] 從內存快取獲取日交易數據: {stock_code}")
                return {
                    "stockCode": stock_code,
                    "data": cached_data,
                    "count": len(cached_data),
                    "source": "cache"
                }
        
        # 2. 嘗試從資料庫獲取
        if DB_AVAILABLE:
            db_data = get_daily_trades_from_db(stock_code, days)
            if db_data and len(db_data) > 0:
                logger.info(f"[資料庫] 從資料庫獲取日交易數據: {stock_code}, 共 {len(db_data)} 筆")
                if CACHE_AVAILABLE:
                    set_to_memory_cache(cache_key, db_data, CACHE_TTL['daily_trade'])
                return {
                    "stockCode": stock_code,
                    "data": db_data,
                    "count": len(db_data),
                    "source": "database"
                }
        
        # 3. 檢查 API 限額
        if CACHE_AVAILABLE:
            rate_limits = quota_tracker.check_rate_limit()
            if not rate_limits['minute_ok']:
                logger.warning("[API 限額] 每分鐘請求數已達上限，請稍後再試")
            if not rate_limits['hour_ok']:
                logger.warning("[API 限額] 每小時請求數已達上限，請稍後再試")
        
        # 4. 從 yfinance API 獲取
        yfinance_ticker = get_yfinance_ticker(stock_code)
        logger.info(f"[API] 從 yfinance 獲取日交易數據: {stock_code} -> {yfinance_ticker}")
        
        data = get_daily_trade_data(stock_code, days=days)
        response_time = time.time() - start_time
        
        # 記錄 API 請求
        if CACHE_AVAILABLE:
            quota_tracker.record_request('daily_trade', stock_code, len(data) > 0, response_time)
        
        logger.info(f"後端返回數據量: {len(data)}（耗時: {response_time:.2f}秒）")
        
        # 如果數據為空，返回警告信息但不拋出錯誤
        if len(data) == 0:
            logger.warning(f"股票 {stock_code} 的數據為空，開始診斷...")
            return diagnose_empty_data(stock_code)
        
        logger.info(f"成功返回股票 {stock_code} 的數據，共 {len(data)} 筆")
        
        # 5. 保存到快取和資料庫
        if len(data) > 0:
            if CACHE_AVAILABLE:
                set_to_memory_cache(cache_key, data, CACHE_TTL['daily_trade'])
            
            if DB_AVAILABLE:
                try:
                    saved_count = save_daily_trades(stock_code, data)
                    logger.info(f"[資料庫] 已自動保存 {saved_count}/{len(data)} 筆日交易數據: {stock_code}")
                except Exception as e:
                    logger.warning(f"[資料庫] 保存日交易數據失敗: {str(e)}")
        
        return {
            "stockCode": stock_code,
            "data": data,
            "count": len(data),
            "source": "api"
        }
    except Exception as e:
        logger.error(f"獲取日交易數據時發生異常: {str(e)}")
        import traceback
        logger.error(f"錯誤堆棧:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"獲取日交易數據時發生錯誤: {str(e)}")


@router.get(
    "/batch",
    summary="批量獲取股票資訊",
    description="一次獲取多個股票的基本資訊，提高查詢效率。"
)
async def get_multiple_stocks(
    stock_codes: str = Query(..., description="股票代號，用逗號分隔（例如: 2330,2317,2454）", example="2330,2317,2454")
):
    """批量獲取多個股票的基本資訊"""
    try:
        codes = [code.strip() for code in stock_codes.split(',')]
        logger.info("=" * 80)
        logger.info(f"[API 請求] GET /api/stock/batch")
        logger.info(f"[參數] stock_codes: {stock_codes}")
        logger.info(f"[參數] 解析後的股票代號列表: {codes}")
        
        yfinance_tickers = [get_yfinance_ticker(code) for code in codes]
        logger.info(f"[參數] yfinance tickers: {yfinance_tickers}")
        logger.info("=" * 80)
        
        results = []
        for code in codes:
            info = get_stock_info(code)
            if info:
                results.append(info)
                if DB_AVAILABLE:
                    try:
                        save_stock_basic(info)
                        logger.debug(f"[資料庫] 已自動保存股票基本資訊: {code}")
                    except Exception as e:
                        logger.warning(f"[資料庫] 保存股票基本資訊失敗 ({code}): {str(e)}")
        
        logger.info(f"[API 響應] 成功獲取 {len(results)}/{len(codes)} 個股票的資訊")
        return {
            "stocks": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"[API 錯誤] 批量獲取股票資訊時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"批量獲取股票資訊時發生錯誤: {str(e)}")


@router.get(
    "/market-index",
    summary="獲取大盤指數數據",
    description="獲取台灣股市大盤指數的歷史數據，預設為加權指數（^TWII）。"
)
async def get_market_index(
    index_code: str = Query("^TWII", description="指數代號，預設為 ^TWII (加權指數)", example="^TWII"),
    days: int = Query(5, description="獲取最近幾天的數據（範圍: 1-30）", ge=1, le=30, example=10)
):
    """獲取大盤指數數據"""
    try:
        logger.info("=" * 80)
        logger.info(f"[API 請求] GET /api/stock/market-index")
        logger.info(f"[參數] index_code: {index_code}")
        logger.info(f"[參數] days: {days}")
        logger.info("=" * 80)
        
        data = get_market_index_data(index_code, days=days)
        logger.info(f"[API 響應] 成功獲取指數 {index_code} 的數據，共 {len(data)} 筆")
        return {
            "indexCode": index_code,
            "data": data,
            "count": len(data)
        }
    except Exception as e:
        logger.error(f"[API 錯誤] 獲取大盤指數數據時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取大盤指數數據時發生錯誤: {str(e)}")


@router.get(
    "/financial/{stock_code}",
    summary="獲取股票財務報表",
    description="獲取指定股票的財務報表數據，包括損益表、資產負債表和現金流量表。"
)
async def get_stock_financial(
    stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330")
):
    """獲取股票財務報表數據"""
    try:
        start_time = time.time()
        logger.info("=" * 80)
        logger.info(f"[API 請求] GET /api/stock/financial/{stock_code}")
        logger.info(f"[參數] stock_code: {stock_code}")
        logger.info("=" * 80)
        
        # 1. 嘗試從內存快取獲取
        cache_key = get_cache_key('financial', stock_code)
        if CACHE_AVAILABLE:
            cached_data = get_from_memory_cache(cache_key)
            if cached_data is not None:
                logger.info(f"[快取] 從內存快取獲取財務報表: {stock_code}")
                return cached_data
        
        # 2. 嘗試從資料庫獲取
        if DB_AVAILABLE:
            income = get_income_statement_from_db(stock_code)
            balance = get_balance_sheet_from_db(stock_code)
            cashflow = get_cash_flow_from_db(stock_code)
            
            if income or balance or cashflow:
                db_data = {
                    'incomeStatement': income,
                    'balanceSheet': balance,
                    'cashFlow': cashflow,
                }
                logger.info(f"[資料庫] 從資料庫獲取財務報表: {stock_code}")
                if CACHE_AVAILABLE:
                    set_to_memory_cache(cache_key, db_data, CACHE_TTL['financial'])
                return db_data
        
        # 3. 檢查 API 限額
        if CACHE_AVAILABLE:
            rate_limits = quota_tracker.check_rate_limit()
            if not rate_limits['minute_ok']:
                logger.warning("[API 限額] 每分鐘請求數已達上限，請稍後再試")
            if not rate_limits['hour_ok']:
                logger.warning("[API 限額] 每小時請求數已達上限，請稍後再試")
        
        # 4. 從 yfinance API 獲取
        yfinance_ticker = get_yfinance_ticker(stock_code)
        logger.info(f"[API] 從 yfinance 獲取財務報表: {stock_code} -> {yfinance_ticker}")
        
        data = get_financial_statements(stock_code)
        response_time = time.time() - start_time
        
        # 記錄 API 請求
        if CACHE_AVAILABLE:
            quota_tracker.record_request('financial', stock_code, data is not None, response_time)
        
        if data is None:
            stock_info = None
            try:
                stock_info = get_stock_info(stock_code)
            except Exception:
                pass
            
            if stock_info is None:
                error_msg = (
                    f"無法獲取股票 {stock_code} 的財務報表數據。\n\n可能原因：\n"
                    "1. yfinance API 請求過於頻繁（429 錯誤）- 請稍後再試\n"
                    "2. 股票代號不正確\n"
                    "3. yfinance 暫時無法訪問該股票數據\n"
                    "4. yfinance 對台股財務報表支持有限\n\n"
                    "建議：\n"
                    "• 等待幾秒後再試（避免 API 限制）\n"
                    "• 嘗試使用美股代號測試（例如：AAPL, MSFT, TSLA）\n"
                    "• 查看後端日誌獲取詳細錯誤信息"
                )
                logger.warning(f"[API 響應] 無法獲取財務報表數據: {error_msg}")
                raise HTTPException(status_code=404, detail=error_msg)
            else:
                stock_name = stock_info.get('stockName', stock_code)
                error_msg = (
                    f"無法獲取股票 {stock_code} ({stock_name}) 的財務報表數據。\n\n可能原因：\n"
                    "1. yfinance 對台股財務報表支持有限\n"
                    "2. 該股票沒有可用的財務數據\n"
                    "3. 數據格式不匹配\n"
                    "4. yfinance API 請求限制（429 錯誤）\n\n"
                    "建議：\n"
                    "- 等待幾秒後再試（避免 API 限制）\n"
                    "- 嘗試使用美股代號測試（例如：AAPL, MSFT, TSLA）\n"
                    "- 查看後端日誌獲取詳細信息"
                )
                logger.warning(f"[API 響應] 財務報表數據為空: {error_msg}")
                raise HTTPException(status_code=404, detail=error_msg)
        
        logger.info(f"[API 響應] 成功獲取股票 {stock_code} 的財務報表數據（耗時: {response_time:.2f}秒）")
        
        # 5. 保存到快取和資料庫
        if data:
            if CACHE_AVAILABLE:
                set_to_memory_cache(cache_key, data, CACHE_TTL['financial'])
            
            if DB_AVAILABLE:
                try:
                    if data.get('incomeStatement'):
                        save_income_statement(data['incomeStatement'])
                        logger.info(f"[資料庫] 已自動保存損益表: {stock_code}")
                    if data.get('balanceSheet'):
                        save_balance_sheet(data['balanceSheet'])
                        logger.info(f"[資料庫] 已自動保存資產負債表: {stock_code}")
                    if data.get('cashFlow'):
                        save_cash_flow(data['cashFlow'])
                        logger.info(f"[資料庫] 已自動保存現金流量表: {stock_code}")
                except Exception as e:
                    logger.warning(f"[資料庫] 保存財務報表數據失敗: {str(e)}")
        
        return data
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"獲取財務報表數據時發生錯誤: {str(e)}"
        logger.error(f"[API 錯誤] {error_msg}")
        import traceback
        logger.error(f"[API 錯誤] 錯誤堆棧:\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"獲取財務報表數據時發生錯誤: {str(e)}。請檢查後端日誌獲取詳細信息。"
        )
