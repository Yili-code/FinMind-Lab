# stock_helpers.py - 股票相關工具函數

import time
from typing import Optional, Dict, List, Tuple
from core.logging_config import get_logger
from core.exceptions import StockNotFoundError, YFinanceAPIError
from services.yfinance_service import get_stock_info, get_yfinance_ticker

logger = get_logger(__name__)


def get_stock_data_with_cache(
    stock_code: str,
    cache_key: str,
    cache_type: str,
    fetch_func,
    save_to_db_func: Optional[callable] = None,
    ttl: int = 300
) -> Optional[Dict]:
    """
    帶快取的股票數據獲取函數
    
    參數:
        stock_code: 股票代號
        cache_key: 快取鍵
        cache_type: 快取類型（用於限額追蹤）
        fetch_func: 從 API 獲取數據的函數
        save_to_db_func: 保存到資料庫的函數（可選）
        ttl: 快取 TTL（秒）
    
    返回:
        股票數據字典或 None
    """
    from core.dependencies import CACHE_AVAILABLE, DB_AVAILABLE
    from services.cache_service import (
        get_from_memory_cache,
        set_to_memory_cache,
        get_cache_key,
        CACHE_TTL
    )
    from services.api_quota_tracker import quota_tracker
    
    start_time = time.time()
    
    # 1. 嘗試從內存快取獲取
    if CACHE_AVAILABLE:
        cached_data = get_from_memory_cache(cache_key)
        if cached_data is not None:
            logger.info(f"[快取] 從內存快取獲取 {cache_type}: {stock_code}")
            return cached_data
    
    # 2. 嘗試從資料庫獲取
    if DB_AVAILABLE and save_to_db_func:
        try:
            db_data = save_to_db_func(stock_code)
            if db_data is not None:
                logger.info(f"[資料庫] 從資料庫獲取 {cache_type}: {stock_code}")
                # 放入快取
                if CACHE_AVAILABLE:
                    set_to_memory_cache(cache_key, db_data, ttl)
                return db_data
        except Exception as e:
            logger.warning(f"[資料庫] 從資料庫獲取失敗: {str(e)}")
    
    # 3. 檢查 API 限額
    if CACHE_AVAILABLE:
        rate_limits = quota_tracker.check_rate_limit()
        if not rate_limits['minute_ok']:
            logger.warning("[API 限額] 每分鐘請求數已達上限，請稍後再試")
        if not rate_limits['hour_ok']:
            logger.warning("[API 限額] 每小時請求數已達上限，請稍後再試")
    
    # 4. 從 yfinance API 獲取
    yfinance_ticker = get_yfinance_ticker(stock_code)
    logger.info(f"[API] 從 yfinance 獲取 {cache_type}: {stock_code} -> {yfinance_ticker}")
    
    try:
        data = fetch_func(stock_code)
        response_time = time.time() - start_time
        
        # 記錄 API 請求
        if CACHE_AVAILABLE:
            quota_tracker.record_request(cache_type, stock_code, data is not None, response_time)
        
        if data is None:
            logger.warning(f"[API 響應] 無法獲取股票 {stock_code} 的 {cache_type}")
            return None
        
        # 5. 保存到快取和資料庫
        if CACHE_AVAILABLE:
            set_to_memory_cache(cache_key, data, ttl)
        
        if DB_AVAILABLE and save_to_db_func:
            try:
                save_to_db_func(data)
                logger.info(f"[資料庫] 已自動保存 {cache_type}: {stock_code}")
            except Exception as e:
                logger.warning(f"[資料庫] 保存失敗: {str(e)}")
        
        logger.info(f"[API 響應] 成功獲取股票 {stock_code} 的 {cache_type}（耗時: {response_time:.2f}秒）")
        return data
        
    except Exception as e:
        error_msg = str(e)
        if '429' in error_msg or 'Too Many Requests' in error_msg:
            raise YFinanceAPIError("API 請求過於頻繁，請稍後再試", stock_code)
        raise YFinanceAPIError(error_msg, stock_code)


def validate_stock_code(stock_code: str) -> bool:
    """驗證股票代號格式"""
    if not stock_code or not isinstance(stock_code, str):
        return False
    # 台股：4位數字，美股：字母，指數：^開頭
    return (
        stock_code.isdigit() and len(stock_code) == 4 or
        stock_code.isalpha() or
        stock_code.startswith('^')
    )


def diagnose_empty_data(stock_code: str) -> Dict:
    """診斷空數據的原因"""
    try:
        stock_info = get_stock_info(stock_code)
        if stock_info is None:
            return {
                "stockCode": stock_code,
                "data": [],
                "count": 0,
                "warning": (
                    f"無法獲取股票 {stock_code} 的數據。可能原因：\n"
                    "1. 股票代號不正確（請確認是台灣股票代號，例如：2330）\n"
                    "2. 股票已下市或暫停交易\n"
                    "3. yfinance 無法訪問該股票數據（可能需要檢查網絡連接）\n\n"
                    "建議：\n"
                    "• 確認股票代號格式正確（台灣股票：4位數字，例如 2330）\n"
                    "• 嘗試其他股票代號（例如：2317, 2454, 2308）\n"
                    "• 檢查後端日誌查看詳細錯誤信息"
                )
            }
        else:
            stock_name = stock_info.get('stockName', stock_code)
            return {
                "stockCode": stock_code,
                "data": [],
                "count": 0,
                "warning": (
                    f"股票 {stock_code} ({stock_name}) 的歷史數據為空。可能原因：\n"
                    "1. 非交易時間（週末或假日）\n"
                    "2. 數據源暫時不可用（yfinance API 限制或網絡問題）\n"
                    "3. 指定的時間範圍內沒有交易數據\n"
                    "4. 股票可能暫停交易\n\n"
                    "建議：\n"
                    "• 確認當前是否為台灣股市交易時間（週一至週五 9:00-13:30）\n"
                    "• 嘗試增加查詢天數（例如：days=30）\n"
                    "• 檢查網絡連接和 yfinance API 狀態\n"
                    "• 查看後端日誌獲取詳細錯誤信息"
                )
            }
    except Exception as e:
        logger.error(f"診斷股票數據時發生錯誤: {str(e)}")
        return {
            "stockCode": stock_code,
            "data": [],
            "count": 0,
            "warning": f"無法驗證股票 {stock_code} 的有效性。錯誤: {str(e)}"
        }
