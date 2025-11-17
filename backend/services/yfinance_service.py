# yfinance_service.py - 使用 yfinance 獲取股票數據

import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import logging
import warnings

# 抑制 yfinance 和 pandas 的警告訊息
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', message='.*pandas.*')

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)  # 顯示 INFO 級別以上的日誌，便於調試

# 台股代號映射（yfinance 使用 .TW 後綴）
def get_yfinance_ticker(stock_code: str) -> str:
    """
    將股票代號轉換為 yfinance 格式
    
    規則:
    - 如果股票代號是純數字（4位數），視為台股，加上 .TW 後綴
    - 如果股票代號包含字母，視為美股或其他市場，不加後綴
    - 如果已經包含 .TW 或 .TWO 後綴，直接返回
    - 如果以 ^ 開頭，視為指數，直接返回
    
    範例:
    - 2330 -> 2330.TW (台股)
    - AAPL -> AAPL (美股)
    - ^TWII -> ^TWII (指數)
    - 2330.TW -> 2330.TW (已經是正確格式)
    """
    # 如果已經包含後綴或是指數，直接返回
    if '.' in stock_code or stock_code.startswith('^'):
        return stock_code
    
    # 檢查是否為純數字（台股代號通常是4位數字）
    if stock_code.isdigit():
        return f"{stock_code}.TW"
    
    # 其他情況（美股等），直接返回
    return stock_code

def get_stock_info(stock_code: str) -> Optional[Dict]:
    """獲取股票基本資訊"""
    try:
        ticker = get_yfinance_ticker(stock_code)
        logger.debug(f"獲取股票 {stock_code} (ticker: {ticker}) 的基本資訊...")
        stock = yf.Ticker(ticker)
        
        # 使用 timeout 和更安全的獲取方式
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            info = stock.info
        
        # 檢查是否為有效數據（yfinance 在找不到股票時可能返回空字典或包含錯誤的字典）
        if not info or len(info) == 0:
            logger.warning(f"[get_stock_info] {stock_code} (ticker: {ticker}): No info available")
            return None
        
        # 檢查是否有錯誤訊息
        if 'error' in str(info).lower() or 'not found' in str(info).lower():
            logger.warning(f"[get_stock_info] {stock_code} (ticker: {ticker}): Error in info: {info}")
            return None
        
        # 對於台股，yfinance 可能沒有某些欄位，我們放寬檢查條件
        # 只要有任何有效數據（如股票名稱），就認為股票存在
        stock_name = info.get('longName') or info.get('shortName') or info.get('symbol')
        
        # 檢查關鍵欄位是否存在（如果連基本價格都沒有，可能是無效股票）
        # 但對於台股，我們放寬條件：只要有股票名稱就認為有效
        has_price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('previousClose')
        has_name = bool(stock_name)
        
        if not has_price and not has_name:
            logger.warning(f"[get_stock_info] {stock_code} (ticker: {ticker}): No price or name data available")
            logger.debug(f"[get_stock_info] Info keys: {list(info.keys())[:20] if info else 'None'}")
            return None
        
        # 如果有名稱但沒有價格，仍然返回數據（可能是非交易時間或數據暫時不可用）
        if has_name and not has_price:
            logger.info(f"[get_stock_info] {stock_code} (ticker: {ticker}): 有股票名稱但無價格數據，仍視為有效股票")
        
        # 獲取股票名稱（中文）
        stock_name = info.get('longName', info.get('shortName', stock_code))
        
        # 確保所有數值都是 Python 原生類型
        def to_float(value):
            if value is None:
                return 0.0
            try:
                return float(value)
            except (ValueError, TypeError):
                return 0.0
        
        return {
            'stockCode': stock_code,
            'stockName': stock_name,
            'currentPrice': to_float(info.get('currentPrice', info.get('regularMarketPrice', 0))),
            'previousClose': to_float(info.get('previousClose', 0)),
            'marketCap': to_float(info.get('marketCap', 0)),
            'volume': int(info.get('volume', 0)) if info.get('volume') else 0,
            'averageVolume': int(info.get('averageVolume', 0)) if info.get('averageVolume') else 0,
            'peRatio': to_float(info.get('trailingPE', 0)),
            'dividendYield': to_float(info.get('dividendYield', 0)) * 100 if info.get('dividendYield') else 0.0,
            'high52Week': to_float(info.get('fiftyTwoWeekHigh', 0)),
            'low52Week': to_float(info.get('fiftyTwoWeekLow', 0)),
            'open': to_float(info.get('open', 0)),
            'high': to_float(info.get('dayHigh', info.get('regularMarketDayHigh', 0))),
            'low': to_float(info.get('dayLow', info.get('regularMarketDayLow', 0))),
            'change': to_float(info.get('regularMarketChange', 0)),
            'changePercent': to_float(info.get('regularMarketChangePercent', 0)) * 100 if info.get('regularMarketChangePercent') else 0.0,
        }
    except Exception as e:
        logger.error(f"Error fetching stock info for {stock_code}: {str(e)}")
        return None

def get_intraday_data(stock_code: str, period: str = "1d", interval: str = "1m") -> List[Dict]:
    """獲取盤中即時數據（成交明細）"""
    try:
        ticker = get_yfinance_ticker(stock_code)
        stock = yf.Ticker(ticker)
        
        # 獲取歷史數據，抑制警告
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            hist = stock.history(period=period, interval=interval, timeout=10)
        
        if hist.empty:
            return []
        
        # 轉換為列表格式
        trade_details = []
        base_open = float(hist.iloc[0]['Open']) if len(hist) > 0 else 0
        
        for idx, row in hist.iterrows():
            change = float(row['Close']) - base_open if base_open > 0 else 0
            change_percent = (change / base_open * 100) if base_open > 0 else 0
            
            trade_details.append({
                'stockCode': stock_code,
                'date': idx.strftime('%Y-%m-%d'),
                'time': idx.strftime('%H:%M:%S'),
                'price': float(row['Close']),
                'change': round(float(change), 2),
                'changePercent': round(float(change_percent), 2),
                'lots': round(float(row['Volume']) / 1000, 2),  # 轉換為張數
                'period': '早盤' if idx.hour < 12 else '午盤',
                'openPrice': float(row['Open']),
                'highPrice': float(row['High']),
                'lowPrice': float(row['Low']),
                'totalVolume': int(row['Volume']),
                'estimatedVolume': int(row['Volume']),
            })
        
        return trade_details
    except Exception as e:
        logger.error(f"Error fetching intraday data for {stock_code}: {str(e)}")
        return []

def get_market_index_data(index_code: str = "^TWII", days: int = 5) -> List[Dict]:
    """獲取大盤指數數據（加權指數）"""
    try:
        stock = yf.Ticker(index_code)
        
        # 獲取歷史數據
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            hist = stock.history(start=start_date, end=end_date, timeout=10)
        
        if hist.empty:
            return []
        
        # 獲取指數資訊
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            info = stock.info
        
        index_name = info.get('longName', info.get('shortName', '加權指數')) if info else '加權指數'
        
        # 轉換為列表格式
        index_data = []
        for idx, row in hist.iterrows():
            idx_loc = hist.index.get_loc(idx)
            prev_close = float(hist.iloc[idx_loc - 1]['Close']) if idx_loc > 0 else float(row['Open'])
            change = float(row['Close']) - prev_close
            change_percent = (change / prev_close * 100) if prev_close > 0 else 0
            
            index_data.append({
                'date': idx.strftime('%Y-%m-%d'),
                'indexName': index_name,
                'closePrice': float(row['Close']),
                'openPrice': float(row['Open']),
                'highPrice': float(row['High']),
                'lowPrice': float(row['Low']),
                'change': round(float(change), 2),
                'changePercent': round(float(change_percent), 2),
                'volume': int(row['Volume']),
            })
        
        return index_data
    except Exception as e:
        logger.error(f"Error fetching market index data: {str(e)}")
        return []

def get_daily_trade_data(stock_code: str, days: int = 5) -> List[Dict]:
    """獲取日交易檔數據"""
    try:
        ticker = get_yfinance_ticker(stock_code)
        logger.info(f"嘗試獲取股票 {stock_code} (yfinance ticker: {ticker}) 的日交易數據，天數: {days}")
        stock = yf.Ticker(ticker)
        
        # 獲取歷史數據，抑制警告
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        logger.info(f"查詢日期範圍: {start_date.strftime('%Y-%m-%d')} 到 {end_date.strftime('%Y-%m-%d')}")
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            hist = stock.history(start=start_date, end=end_date, timeout=10)
        
        logger.info(f"yfinance 返回的歷史數據行數: {len(hist)}")
        
        if hist.empty:
            logger.warning(f"股票 {stock_code} 的歷史數據為空。可能原因：1) 非交易時間 2) 股票代號錯誤 3) yfinance API 限制 4) 網絡問題")
            # 嘗試使用 period 參數獲取數據（作為備選方案）
            try:
                logger.info(f"嘗試使用 period 參數獲取股票 {stock_code} 的數據...")
                hist_period = stock.history(period=f"{days}d", timeout=10)
                logger.info(f"使用 period 參數獲得的數據行數: {len(hist_period)}")
                if not hist_period.empty:
                    hist = hist_period
                    logger.info(f"成功使用 period 參數獲取到數據")
                else:
                    logger.warning(f"使用 period 參數也無法獲取數據")
            except Exception as e:
                logger.warning(f"使用 period 參數獲取數據失敗: {str(e)}")
            
            if hist.empty:
                return []
        
        # 獲取股票資訊
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            info = stock.info
        
        stock_name = info.get('longName', info.get('shortName', stock_code)) if info else stock_code
        
        # 轉換為列表格式
        daily_trades = []
        for idx, row in hist.iterrows():
            idx_loc = hist.index.get_loc(idx)
            prev_close = float(hist.iloc[idx_loc - 1]['Close']) if idx_loc > 0 else float(row['Open'])
            change = float(row['Close']) - prev_close
            change_percent = (change / prev_close * 100) if prev_close > 0 else 0
            
            # 計算均價（簡單使用收盤價）
            avg_price = (float(row['High']) + float(row['Low']) + float(row['Close'])) / 3
            
            volume = int(row['Volume'])
            prev_volume = int(hist.iloc[idx_loc - 1]['Volume']) if idx_loc > 0 else volume
            
            daily_trades.append({
                'stockCode': stock_code,
                'stockName': stock_name,
                'date': idx.strftime('%Y-%m-%d'),
                'closePrice': float(row['Close']),
                'avgPrice': round(float(avg_price), 2),
                'prevClose': float(prev_close),
                'openPrice': float(row['Open']),
                'highPrice': float(row['High']),
                'lowPrice': float(row['Low']),
                'change': round(float(change), 2),
                'changePercent': round(float(change_percent), 2),
                'totalVolume': volume,
                'prevVolume': prev_volume,
                'innerVolume': int(volume * 0.48),  # 估算內盤
                'outerVolume': int(volume * 0.52),  # 估算外盤
                'foreignInvestor': int(volume * 0.2),  # 估算外資
                'investmentTrust': int(volume * 0.05),  # 估算投信
                'dealer': int(volume * 0.08),  # 估算自營商
                'chips': int(volume * 0.28),  # 估算籌碼
                'mainBuy': int(volume * 0.6),  # 估算主買
                'mainSell': int(volume * 0.4),  # 估算主賣
                'monthHigh': float(hist['High'].max()),  # 月高
                'monthLow': float(hist['Low'].min()),  # 月低
                'quarterHigh': float(hist['High'].max()),  # 季高（簡化為月高）
            })
        
        logger.info(f"成功處理股票 {stock_code} 的日交易數據，共 {len(daily_trades)} 筆")
        return daily_trades
    except Exception as e:
        error_msg = f"獲取股票 {stock_code} 的日交易數據時發生錯誤: {str(e)}"
        logger.error(error_msg)
        logger.error(f"錯誤類型: {type(e).__name__}")
        import traceback
        logger.error(f"錯誤堆棧:\n{traceback.format_exc()}")
        return []

def get_financial_statements(stock_code: str) -> Optional[Dict]:
    """獲取財務報表數據（損益表、資產負債表、現金流量表）
    
    參數:
        stock_code: 股票代號（例如：'2330' 或 'AAPL'）
    
    說明:
        - 優先使用 yfinance 的 ticker.quarterly_financials（季度損益表）、ticker.quarterly_balance_sheet（季度資產負債表）、ticker.quarterly_cashflow（季度現金流量表）
        - 如果季度報表為空，則嘗試使用年度報表作為備選
    """
    try:
        # ========== 階段 4: 數據抓取準備 ==========
        logger.info("=" * 50)
        logger.info("[階段 4: 數據抓取準備]")
        ticker = get_yfinance_ticker(stock_code)
        logger.info(f"[階段 4] 股票代號轉換: {stock_code} -> yfinance ticker: {ticker}")
        logger.info(f"[階段 4] 準備使用 yfinance 獲取財務報表數據")
        
        stock = yf.Ticker(ticker)
        logger.info(f"[階段 4] 創建 yfinance Ticker 對象成功")
        
        stock_name = stock_code
        info = None
        
        # 獲取股票名稱
        try:
            logger.info(f"[階段 4] 嘗試獲取股票基本資訊...")
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                info = stock.info
                if info:
                    stock_name = info.get('longName', info.get('shortName', stock_code))
                    logger.info(f"[階段 4] ✅ 獲取股票名稱成功: {stock_name}")
        except Exception as info_error:
            logger.warning(f"[階段 4] ⚠️ 無法獲取股票資訊，使用股票代號作為名稱: {str(info_error)}")
        
        # ========== 階段 4: 從 yfinance 抓取數據 ==========
        logger.info(f"[階段 4] 開始從 yfinance 抓取財務報表數據（優先使用季度報表）...")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            
            # 優先獲取季度財務報表（添加異常處理）
            financials = pd.DataFrame()
            balance_sheet = pd.DataFrame()
            cashflow = pd.DataFrame()
            
            def safe_get_dataframe(getter_func, name):
                """安全地獲取 DataFrame，處理各種異常情況"""
                try:
                    df = getter_func()
                    if df is None:
                        logger.warning(f"{name} 返回 None")
                        return pd.DataFrame()
                    if not isinstance(df, pd.DataFrame):
                        logger.warning(f"{name} 不是 DataFrame 類型，而是 {type(df)}")
                        return pd.DataFrame()
                    logger.info(f"{name} 獲取成功，類型: {type(df)}, 形狀: {df.shape}, 是否為空: {df.empty}")
                    return df
                except AttributeError as e:
                    logger.warning(f"{name} 屬性不存在: {str(e)}")
                    return pd.DataFrame()
                except Exception as e:
                    logger.warning(f"獲取 {name} 時發生錯誤: {str(e)}")
                    import traceback
                    logger.debug(f"錯誤堆棧:\n{traceback.format_exc()}")
                    return pd.DataFrame()
            
            financials = safe_get_dataframe(lambda: stock.quarterly_financials, "季度損益表")
            balance_sheet = safe_get_dataframe(lambda: stock.quarterly_balance_sheet, "季度資產負債表")
            cashflow = safe_get_dataframe(lambda: stock.quarterly_cashflow, "季度現金流量表")
            
            # 如果季度報表為空，嘗試年度報表作為備選
            if financials.empty:
                logger.info(f"季度損益表為空，嘗試獲取年度損益表...")
                financials = safe_get_dataframe(lambda: stock.financials, "年度損益表")
            
            if balance_sheet.empty:
                logger.info(f"季度資產負債表為空，嘗試獲取年度資產負債表...")
                balance_sheet = safe_get_dataframe(lambda: stock.balance_sheet, "年度資產負債表")
            
            if cashflow.empty:
                logger.info(f"季度現金流量表為空，嘗試獲取年度現金流量表...")
                cashflow = safe_get_dataframe(lambda: stock.cashflow, "年度現金流量表")
        
        # 檢查是否至少獲取到一些財務報表數據
        logger.info(f"[階段 4] 數據抓取結果:")
        logger.info(f"  - 損益表: {'空' if financials.empty else f'{len(financials)} 行'}")
        logger.info(f"  - 資產負債表: {'空' if balance_sheet.empty else f'{len(balance_sheet)} 行'}")
        logger.info(f"  - 現金流量表: {'空' if cashflow.empty else f'{len(cashflow)} 行'}")
        
        if financials.empty and balance_sheet.empty and cashflow.empty:
            logger.error(f"[階段 4] ❌ 錯誤: 無法從 yfinance 獲取任何財務報表數據")
            return None
        
        logger.info(f"[階段 4] ✅ 數據抓取完成，至少有一個報表有數據")
        
        # 詳細記錄 DataFrame 的內容（用於調試）
        if not financials.empty:
            logger.info(f"損益表欄位列表（前20個）: {list(financials.index)[:20]}")
            logger.info(f"損益表期間列表: {list(financials.columns)}")
        if not balance_sheet.empty:
            logger.info(f"資產負債表欄位列表（前20個）: {list(balance_sheet.index)[:20]}")
            logger.info(f"資產負債表期間列表: {list(balance_sheet.columns)}")
        if not cashflow.empty:
            logger.info(f"現金流量表欄位列表（前20個）: {list(cashflow.index)[:20]}")
            logger.info(f"現金流量表期間列表: {list(cashflow.columns)}")
        
        # 如果所有 DataFrame 都是空的，記錄警告
        if financials.empty and balance_sheet.empty and cashflow.empty:
            logger.warning(f"警告：股票 {stock_code} 的所有財務報表 DataFrame 都是空的。這可能是因為：")
            logger.warning(f"1. yfinance 對台股財務報表支持有限")
            logger.warning(f"2. 該股票在 yfinance 中沒有財務數據")
            logger.warning(f"3. 網絡問題或 API 限制")
            # 嘗試檢查股票是否存在
            if info:
                logger.info(f"股票資訊存在，股票名稱: {stock_name}")
            else:
                logger.warning(f"股票資訊也不存在，可能股票代號錯誤或 yfinance 無法識別")
        
        def to_float(value):
            if value is None or pd.isna(value):
                return 0.0
            try:
                return float(value)
            except (ValueError, TypeError):
                return 0.0
        
        def safe_get_value(df, row_name, period, alternatives=None):
            """安全地從 DataFrame 獲取值"""
            if alternatives is None:
                alternatives = []
            # 嘗試主要欄位名
            if row_name in df.index:
                try:
                    value = df.loc[row_name, period]
                    result = to_float(value)
                    if result != 0:
                        return result
                except (KeyError, IndexError) as e:
                    logger.debug(f"無法從 DataFrame 獲取 {row_name}: {e}")
            # 嘗試替代欄位名
            for alt in alternatives:
                if alt in df.index:
                    try:
                        value = df.loc[alt, period]
                        result = to_float(value)
                        if result != 0:
                            return result
                    except (KeyError, IndexError) as e:
                        logger.debug(f"無法從 DataFrame 獲取 {alt}: {e}")
            return 0.0
        
        # ========== 階段 5: 數據轉換為 JSON 格式 ==========
        logger.info("=" * 50)
        logger.info("[階段 5: 數據轉換為 JSON 格式]")
        logger.info(f"[階段 5] 開始將 DataFrame 轉換為 JSON 格式")
        
        # 處理損益表（取最新一期的數據）
        income_data = None
        try:
            logger.info(f"[階段 5] 處理損益表...")
            if not financials.empty and len(financials.columns) > 0:
                # 從 DataFrame 的 columns（期間）中獲取最新一期
                latest_period = financials.columns[0]  # yfinance 返回的 DataFrame columns 是期間（如 2024-12-31）
                # 將期間轉換為字符串格式（用於返回給前端）
                period_str = str(latest_period) if not hasattr(latest_period, 'strftime') else latest_period.strftime('%Y-%m-%d')
                
                logger.info(f"處理損益表，期間: {period_str}, 可用欄位: {list(financials.index)[:10]}")
                
                # 從 financials DataFrame 中提取數據（使用期間作為列索引）
                revenue = safe_get_value(financials, 'Total Revenue', latest_period, ['Revenue', 'Total Revenues'])
                gross_profit = safe_get_value(financials, 'Gross Profit', latest_period)
                operating_expenses = safe_get_value(financials, 'Operating Expenses', latest_period, ['Total Operating Expenses'])
                operating_income = safe_get_value(financials, 'Operating Income', latest_period, ['EBIT', 'Operating Income or Loss'])
                net_income = safe_get_value(financials, 'Net Income', latest_period, ['Net Income Common Stockholders', 'Net Income From Continuing Operations'])
                other_income = safe_get_value(financials, 'Other Income', latest_period, ['Other Income/Expenses'])
                
                # 計算比率
                gross_profit_ratio = (gross_profit / revenue * 100) if revenue > 0 else 0
                operating_expenses_ratio = (operating_expenses / revenue * 100) if revenue > 0 else 0
                operating_income_ratio = (operating_income / revenue * 100) if revenue > 0 else 0
                
                # 只有當至少有一些有效數據時才創建 income_data
                if revenue > 0 or gross_profit != 0 or operating_income != 0 or net_income != 0:
                    income_data = {
                        'id': f'{stock_code}-{period_str}',
                        'stockCode': stock_code,
                        'stockName': stock_name,
                        'period': period_str,
                        'revenue': revenue,
                        'grossProfit': gross_profit,
                        'grossProfitRatio': round(gross_profit_ratio, 1),
                        'operatingExpenses': operating_expenses,
                        'operatingExpensesRatio': round(operating_expenses_ratio, 1),
                        'operatingIncome': operating_income,
                        'operatingIncomeRatio': round(operating_income_ratio, 1),
                        'netIncome': net_income,
                        'otherIncome': other_income,
                    }
                    logger.info(f"[階段 5] ✅ 損益表轉換成功，收入: {revenue}, 淨利: {net_income}")
                else:
                    logger.warning(f"[階段 5] ⚠️ 損益表數據無效，所有值為 0 或缺失")
        except Exception as e:
            logger.error(f"[階段 5] ❌ 處理損益表時發生錯誤: {str(e)}")
            import traceback
            logger.error(f"[階段 5] 錯誤堆棧:\n{traceback.format_exc()}")
        
        # 處理資產負債表（取最新一期的數據）
        balance_data = None
        try:
            logger.info(f"[階段 5] 處理資產負債表...")
            if not balance_sheet.empty and len(balance_sheet.columns) > 0:
                # 從 DataFrame 的 columns（期間）中獲取最新一期
                latest_period = balance_sheet.columns[0]
                period_str = str(latest_period) if not hasattr(latest_period, 'strftime') else latest_period.strftime('%Y-%m-%d')
                
                logger.info(f"處理資產負債表，期間: {period_str}, 可用欄位: {list(balance_sheet.index)[:10]}")
                
                # 從 balance_sheet DataFrame 中提取數據（使用期間作為列索引）
                total_assets = safe_get_value(balance_sheet, 'Total Assets', latest_period)
                shareholders_equity = safe_get_value(balance_sheet, 'Stockholders Equity', latest_period, ['Total Stockholders Equity', 'Total Equity'])
                current_assets = safe_get_value(balance_sheet, 'Current Assets', latest_period)
                current_liabilities = safe_get_value(balance_sheet, 'Current Liabilities', latest_period)
                
                # 計算比率
                total_assets_ratio = 100.0  # 基準
                shareholders_equity_ratio = (shareholders_equity / total_assets * 100) if total_assets > 0 else 0
                current_assets_ratio = (current_assets / total_assets * 100) if total_assets > 0 else 0
                current_liabilities_ratio = (current_liabilities / total_assets * 100) if total_assets > 0 else 0
                
                # 只有當至少有一些有效數據時才創建 balance_data
                if total_assets > 0:
                    balance_data = {
                        'id': f'{stock_code}-{period_str}',
                        'stockCode': stock_code,
                        'stockName': stock_name,
                        'period': period_str,
                        'totalAssets': total_assets,
                        'totalAssetsRatio': round(total_assets_ratio, 1),
                        'shareholdersEquity': shareholders_equity,
                        'shareholdersEquityRatio': round(shareholders_equity_ratio, 1),
                        'currentAssets': current_assets,
                        'currentAssetsRatio': round(current_assets_ratio, 1),
                        'currentLiabilities': current_liabilities,
                        'currentLiabilitiesRatio': round(current_liabilities_ratio, 1),
                    }
                    logger.info(f"[階段 5] ✅ 資產負債表轉換成功，總資產: {total_assets}, 股東權益: {shareholders_equity}")
                else:
                    logger.warning(f"[階段 5] ⚠️ 資產負債表數據無效，總資產為 0 或缺失")
        except Exception as e:
            logger.error(f"[階段 5] ❌ 處理資產負債表時發生錯誤: {str(e)}")
            import traceback
            logger.error(f"[階段 5] 錯誤堆棧:\n{traceback.format_exc()}")
        
        # 處理現金流量表（取最新一期的數據）
        cashflow_data = None
        try:
            logger.info(f"[階段 5] 處理現金流量表...")
            if not cashflow.empty and len(cashflow.columns) > 0:
                # 從 DataFrame 的 columns（期間）中獲取最新一期
                latest_period = cashflow.columns[0]
                period_str = str(latest_period) if not hasattr(latest_period, 'strftime') else latest_period.strftime('%Y-%m-%d')
                
                logger.info(f"處理現金流量表，期間: {period_str}, 可用欄位: {list(cashflow.index)[:10]}")
                
                # 從 cashflow DataFrame 中提取數據（使用期間作為列索引）
                operating_cash_flow = safe_get_value(cashflow, 'Operating Cash Flow', latest_period, ['Total Cash From Operating Activities', 'Cash From Operating Activities'])
                investing_cash_flow = safe_get_value(cashflow, 'Investing Cash Flow', latest_period, ['Total Cashflows From Investing Activities', 'Cash From Investing Activities'])
                financing_cash_flow = safe_get_value(cashflow, 'Financing Cash Flow', latest_period, ['Total Cash From Financing Activities', 'Cash From Financing Activities'])
                free_cash_flow = safe_get_value(cashflow, 'Free Cash Flow', latest_period)
                net_cash_flow = operating_cash_flow + investing_cash_flow + financing_cash_flow
                
                # 計算比率（以 operating_cash_flow 為基準）
                base = abs(operating_cash_flow) if operating_cash_flow != 0 else 1
                investing_cash_flow_ratio = (investing_cash_flow / base * 100) if base > 0 else 0
                financing_cash_flow_ratio = (financing_cash_flow / base * 100) if base > 0 else 0
                free_cash_flow_ratio = (free_cash_flow / base * 100) if base > 0 else 0
                net_cash_flow_ratio = (net_cash_flow / base * 100) if base > 0 else 0
                
                # 只有當至少有一些有效數據時才創建 cashflow_data
                if operating_cash_flow != 0 or investing_cash_flow != 0 or financing_cash_flow != 0:
                    cashflow_data = {
                        'id': f'{stock_code}-{period_str}',
                        'stockCode': stock_code,
                        'stockName': stock_name,
                        'period': period_str,
                        'operatingCashFlow': operating_cash_flow,
                        'investingCashFlow': investing_cash_flow,
                        'investingCashFlowRatio': round(investing_cash_flow_ratio, 1),
                        'financingCashFlow': financing_cash_flow,
                        'financingCashFlowRatio': round(financing_cash_flow_ratio, 1),
                        'freeCashFlow': free_cash_flow,
                        'freeCashFlowRatio': round(free_cash_flow_ratio, 1),
                        'netCashFlow': net_cash_flow,
                        'netCashFlowRatio': round(net_cash_flow_ratio, 1),
                    }
                    logger.info(f"[階段 5] ✅ 現金流量表轉換成功，營業現金流: {operating_cash_flow}, 淨現金流: {net_cash_flow}")
                else:
                    logger.warning(f"[階段 5] ⚠️ 現金流量表數據無效，所有值為 0 或缺失")
        except Exception as e:
            logger.error(f"[階段 5] ❌ 處理現金流量表時發生錯誤: {str(e)}")
            import traceback
            logger.error(f"[階段 5] 錯誤堆棧:\n{traceback.format_exc()}")
        
        # 組裝最終的 JSON 響應
        logger.info(f"[階段 5] 組裝最終 JSON 響應...")
        result = {
            'incomeStatement': income_data,
            'balanceSheet': balance_data,
            'cashFlow': cashflow_data,
        }
        
        # 檢查是否至少有一個報表有數據
        if not income_data and not balance_data and not cashflow_data:
            logger.warning(f"[階段 5] ❌ 錯誤: 股票 {stock_code} 的所有財務報表數據都為空或無效")
            return None
        
        logger.info(f"[階段 5] ✅ 數據轉換完成，準備返回 JSON")
        logger.info(f"[階段 5] 最終結果: incomeStatement={'有數據' if income_data else 'null'}, "
                   f"balanceSheet={'有數據' if balance_data else 'null'}, "
                   f"cashFlow={'有數據' if cashflow_data else 'null'}")
        return result
    except Exception as e:
        logger.error(f"獲取股票 {stock_code} 的財務報表數據時發生錯誤: {str(e)}")
        import traceback
        logger.error(f"錯誤堆棧:\n{traceback.format_exc()}")
        return None

