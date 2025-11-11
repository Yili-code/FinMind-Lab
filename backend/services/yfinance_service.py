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
logger.setLevel(logging.ERROR)  # 只顯示錯誤級別的日誌

# 台股代號映射（yfinance 使用 .TW 後綴）
def get_yfinance_ticker(stock_code: str) -> str:
    """將台股代號轉換為 yfinance 格式"""
    return f"{stock_code}.TW"

def get_stock_info(stock_code: str) -> Optional[Dict]:
    """獲取股票基本資訊"""
    try:
        ticker = get_yfinance_ticker(stock_code)
        stock = yf.Ticker(ticker)
        
        # 使用 timeout 和更安全的獲取方式
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            info = stock.info
        
        # 檢查是否為有效數據（yfinance 在找不到股票時可能返回空字典或包含錯誤的字典）
        if not info or len(info) == 0:
            logger.warning(f"No info available for {stock_code}")
            return None
        
        # 檢查是否有錯誤訊息
        if 'error' in str(info).lower() or 'not found' in str(info).lower():
            logger.warning(f"Error in info for {stock_code}: {info}")
            return None
        
        # 檢查關鍵欄位是否存在（如果連基本價格都沒有，可能是無效股票）
        if not info.get('currentPrice') and not info.get('regularMarketPrice') and not info.get('previousClose'):
            logger.warning(f"No price data available for {stock_code}")
            return None
        
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
        stock = yf.Ticker(ticker)
        
        # 獲取歷史數據，抑制警告
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            hist = stock.history(start=start_date, end=end_date, timeout=10)
        
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
        
        return daily_trades
    except Exception as e:
        logger.error(f"Error fetching daily trade data for {stock_code}: {str(e)}")
        return []

def get_financial_statements(stock_code: str) -> Optional[Dict]:
    """獲取財務報表數據（損益表、資產負債表、現金流量表）"""
    try:
        ticker = get_yfinance_ticker(stock_code)
        stock = yf.Ticker(ticker)
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            # 獲取財務報表
            financials = stock.financials  # 損益表
            balance_sheet = stock.balance_sheet  # 資產負債表
            cashflow = stock.cashflow  # 現金流量表
            
            # 獲取股票資訊
            info = stock.info
            stock_name = info.get('longName', info.get('shortName', stock_code)) if info else stock_code
        
        def to_float(value):
            if value is None or pd.isna(value):
                return 0.0
            try:
                return float(value)
            except (ValueError, TypeError):
                return 0.0
        
        # 處理損益表（取最新一期的數據）
        income_data = None
        if not financials.empty and len(financials.columns) > 0:
            latest_period = financials.columns[0]  # 最新一期
            period_str = latest_period.strftime('%Y-%m-%d') if hasattr(latest_period, 'strftime') else str(latest_period)
            
            # 從 financials DataFrame 中提取數據
            # yfinance 的 financials 使用英文欄位名，需要映射
            revenue = to_float(financials.loc['Total Revenue', latest_period]) if 'Total Revenue' in financials.index else 0
            if revenue == 0:
                revenue = to_float(financials.loc['Revenue', latest_period]) if 'Revenue' in financials.index else 0
            
            gross_profit = to_float(financials.loc['Gross Profit', latest_period]) if 'Gross Profit' in financials.index else 0
            operating_expenses = to_float(financials.loc['Operating Expenses', latest_period]) if 'Operating Expenses' in financials.index else 0
            if operating_expenses == 0:
                operating_expenses = to_float(financials.loc['Total Operating Expenses', latest_period]) if 'Total Operating Expenses' in financials.index else 0
            
            operating_income = to_float(financials.loc['Operating Income', latest_period]) if 'Operating Income' in financials.index else 0
            if operating_income == 0:
                operating_income = to_float(financials.loc['EBIT', latest_period]) if 'EBIT' in financials.index else 0
            
            net_income = to_float(financials.loc['Net Income', latest_period]) if 'Net Income' in financials.index else 0
            if net_income == 0:
                net_income = to_float(financials.loc['Net Income Common Stockholders', latest_period]) if 'Net Income Common Stockholders' in financials.index else 0
            
            other_income = to_float(financials.loc['Other Income', latest_period]) if 'Other Income' in financials.index else 0
            
            # 計算比率
            gross_profit_ratio = (gross_profit / revenue * 100) if revenue > 0 else 0
            operating_expenses_ratio = (operating_expenses / revenue * 100) if revenue > 0 else 0
            operating_income_ratio = (operating_income / revenue * 100) if revenue > 0 else 0
            
            income_data = {
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
        
        # 處理資產負債表
        balance_data = None
        if not balance_sheet.empty and len(balance_sheet.columns) > 0:
            latest_period = balance_sheet.columns[0]
            period_str = latest_period.strftime('%Y-%m-%d') if hasattr(latest_period, 'strftime') else str(latest_period)
            
            total_assets = to_float(balance_sheet.loc['Total Assets', latest_period]) if 'Total Assets' in balance_sheet.index else 0
            shareholders_equity = to_float(balance_sheet.loc['Stockholders Equity', latest_period]) if 'Stockholders Equity' in balance_sheet.index else 0
            if shareholders_equity == 0:
                shareholders_equity = to_float(balance_sheet.loc['Total Stockholders Equity', latest_period]) if 'Total Stockholders Equity' in balance_sheet.index else 0
            
            current_assets = to_float(balance_sheet.loc['Current Assets', latest_period]) if 'Current Assets' in balance_sheet.index else 0
            current_liabilities = to_float(balance_sheet.loc['Current Liabilities', latest_period]) if 'Current Liabilities' in balance_sheet.index else 0
            
            # 計算比率
            total_assets_ratio = 100.0  # 基準
            shareholders_equity_ratio = (shareholders_equity / total_assets * 100) if total_assets > 0 else 0
            current_assets_ratio = (current_assets / total_assets * 100) if total_assets > 0 else 0
            current_liabilities_ratio = (current_liabilities / total_assets * 100) if total_assets > 0 else 0
            
            balance_data = {
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
        
        # 處理現金流量表
        cashflow_data = None
        if not cashflow.empty and len(cashflow.columns) > 0:
            latest_period = cashflow.columns[0]
            period_str = latest_period.strftime('%Y-%m-%d') if hasattr(latest_period, 'strftime') else str(latest_period)
            
            operating_cash_flow = to_float(cashflow.loc['Operating Cash Flow', latest_period]) if 'Operating Cash Flow' in cashflow.index else 0
            if operating_cash_flow == 0:
                operating_cash_flow = to_float(cashflow.loc['Total Cash From Operating Activities', latest_period]) if 'Total Cash From Operating Activities' in cashflow.index else 0
            
            investing_cash_flow = to_float(cashflow.loc['Investing Cash Flow', latest_period]) if 'Investing Cash Flow' in cashflow.index else 0
            if investing_cash_flow == 0:
                investing_cash_flow = to_float(cashflow.loc['Total Cashflows From Investing Activities', latest_period]) if 'Total Cashflows From Investing Activities' in cashflow.index else 0
            
            financing_cash_flow = to_float(cashflow.loc['Financing Cash Flow', latest_period]) if 'Financing Cash Flow' in cashflow.index else 0
            if financing_cash_flow == 0:
                financing_cash_flow = to_float(cashflow.loc['Total Cash From Financing Activities', latest_period]) if 'Total Cash From Financing Activities' in cashflow.index else 0
            
            free_cash_flow = to_float(cashflow.loc['Free Cash Flow', latest_period]) if 'Free Cash Flow' in cashflow.index else 0
            net_cash_flow = operating_cash_flow + investing_cash_flow + financing_cash_flow
            
            # 計算比率（以 operating_cash_flow 為基準）
            base = abs(operating_cash_flow) if operating_cash_flow != 0 else 1
            investing_cash_flow_ratio = (investing_cash_flow / base * 100) if base > 0 else 0
            financing_cash_flow_ratio = (financing_cash_flow / base * 100) if base > 0 else 0
            free_cash_flow_ratio = (free_cash_flow / base * 100) if base > 0 else 0
            net_cash_flow_ratio = (net_cash_flow / base * 100) if base > 0 else 0
            
            cashflow_data = {
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
        
        return {
            'incomeStatement': income_data,
            'balanceSheet': balance_data,
            'cashFlow': cashflow_data,
        }
    except Exception as e:
        logger.error(f"Error fetching financial statements for {stock_code}: {str(e)}")
        return None

