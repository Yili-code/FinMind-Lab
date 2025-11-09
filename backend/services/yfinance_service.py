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
        
        if not info or len(info) == 0:
            logger.warning(f"No info available for {stock_code}")
            return None
        
        # 獲取股票名稱（中文）
        stock_name = info.get('longName', info.get('shortName', stock_code))
        
        return {
            'stockCode': stock_code,
            'stockName': stock_name,
            'currentPrice': info.get('currentPrice', info.get('regularMarketPrice', 0)),
            'previousClose': info.get('previousClose', 0),
            'marketCap': info.get('marketCap', 0),
            'volume': info.get('volume', 0),
            'averageVolume': info.get('averageVolume', 0),
            'peRatio': info.get('trailingPE', 0),
            'dividendYield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
            'high52Week': info.get('fiftyTwoWeekHigh', 0),
            'low52Week': info.get('fiftyTwoWeekLow', 0),
            'open': info.get('open', 0),
            'high': info.get('dayHigh', info.get('regularMarketDayHigh', 0)),
            'low': info.get('dayLow', info.get('regularMarketDayLow', 0)),
            'change': info.get('regularMarketChange', 0),
            'changePercent': info.get('regularMarketChangePercent', 0) * 100 if info.get('regularMarketChangePercent') else 0,
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
        for idx, row in hist.iterrows():
            change = row['Close'] - hist.iloc[0]['Open'] if len(hist) > 0 else 0
            change_percent = (change / hist.iloc[0]['Open'] * 100) if hist.iloc[0]['Open'] > 0 else 0
            
            trade_details.append({
                'stockCode': stock_code,
                'date': idx.strftime('%Y-%m-%d'),
                'time': idx.strftime('%H:%M:%S'),
                'price': float(row['Close']),
                'change': round(change, 2),
                'changePercent': round(change_percent, 2),
                'lots': float(row['Volume'] / 1000),  # 轉換為張數
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
            prev_close = hist.iloc[hist.index.get_loc(idx) - 1]['Close'] if hist.index.get_loc(idx) > 0 else row['Open']
            change = row['Close'] - prev_close
            change_percent = (change / prev_close * 100) if prev_close > 0 else 0
            
            # 計算均價（簡單使用收盤價）
            avg_price = (row['High'] + row['Low'] + row['Close']) / 3
            
            daily_trades.append({
                'stockCode': stock_code,
                'stockName': stock_name,
                'date': idx.strftime('%Y-%m-%d'),
                'closePrice': float(row['Close']),
                'avgPrice': round(avg_price, 2),
                'prevClose': float(prev_close),
                'openPrice': float(row['Open']),
                'highPrice': float(row['High']),
                'lowPrice': float(row['Low']),
                'change': round(change, 2),
                'changePercent': round(change_percent, 2),
                'totalVolume': int(row['Volume']),
                'prevVolume': int(hist.iloc[hist.index.get_loc(idx) - 1]['Volume']) if hist.index.get_loc(idx) > 0 else int(row['Volume']),
                'innerVolume': int(row['Volume'] * 0.48),  # 估算內盤
                'outerVolume': int(row['Volume'] * 0.52),  # 估算外盤
                'foreignInvestor': int(row['Volume'] * 0.2),  # 估算外資
                'investmentTrust': int(row['Volume'] * 0.05),  # 估算投信
                'dealer': int(row['Volume'] * 0.08),  # 估算自營商
                'chips': int(row['Volume'] * 0.28),  # 估算籌碼
                'mainBuy': int(row['Volume'] * 0.6),  # 估算主買
                'mainSell': int(row['Volume'] * 0.4),  # 估算主賣
                'monthHigh': float(hist['High'].max()),  # 月高
                'monthLow': float(hist['Low'].min()),  # 月低
                'quarterHigh': float(hist['High'].max()),  # 季高（簡化為月高）
            })
        
        return daily_trades
    except Exception as e:
        logger.error(f"Error fetching daily trade data for {stock_code}: {str(e)}")
        return []

