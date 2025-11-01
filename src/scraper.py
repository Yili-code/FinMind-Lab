"""
scraper.py
自動從台灣證交所及多來源擷取股票資料模組。
提供:
- fetch_stock_data: 擷取股票歷史資料（API/副來源)
- save_raw_data: 儲存原始資料（CSV/JSON)

依需求自動處理重試與日誌。
"""

import os
import json
import pandas as pd
import requests
import logging
from tenacity import retry, stop_after_attempt, wait_fixed
from datetime import datetime
from typing import Any, Literal

logging.basicConfig(
    filename='./logs/scraper.log',
    filemode='a',
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    encoding='utf-8'
)

def fetch_stock_data(stock_id: str, start_date: str, end_date: str, source: Literal['TWSE', 'yahoo'] = 'TWSE') -> pd.DataFrame:
    """
    由指定來源自動抓取單一台股股票的歷史資料。
    參數:
        stock_id (str): 股票代碼。
        start_date (str): 起始日期(yyyy-mm-dd)。
        end_date (str): 結束日期(yyyy-mm-dd)。
        source (str): 資料來源（'TWSE', 'yahoo'），預設 TWSE。
    回傳:
        pd.DataFrame
    """
    if source == 'TWSE':
        return _fetch_twse(stock_id, start_date, end_date)
    elif source == 'yahoo':
        return _fetch_yahoo(stock_id, start_date, end_date)
    else:
        raise ValueError('Unsupported data source')

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def _fetch_twse(stock_id: str, start_date: str, end_date: str) -> pd.DataFrame:
    """
    連接台灣證交所 API 擷取股票資料，並自動重試。
    """
    logging.info(f"[TWSE] Start fetching {stock_id} {start_date}~{end_date}")
    # 這裡僅提供參考基礎抓法，詳細 API 參數需依官方文件微調
    df_total = pd.DataFrame()
    date_iter = pd.date_range(start=start_date, end=end_date, freq='M')
    for date in date_iter:
        api_url = f'https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date={date.strftime('%Y%m01')}&stockNo={stock_id}'
        r = requests.get(api_url)
        r.raise_for_status()
        payload = r.json()
        cols = payload['fields']
        rows = payload['data']
        temp = pd.DataFrame(rows, columns=cols)
        df_total = pd.concat([df_total, temp])
    logging.info(f"Downloaded {len(df_total)} rows.")
    return df_total

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def _fetch_yahoo(stock_id: str, start_date: str, end_date: str) -> pd.DataFrame:
    """
    使用 yfinance 擷取 Yahoo 股價資料
    """
    import yfinance as yf
    logging.info(f"[Yahoo] Start fetching {stock_id} {start_date}~{end_date}")
    ticker = yf.Ticker(stock_id + ".TW")
    df = ticker.history(start=start_date, end=end_date)
    df = df.reset_index()
    logging.info(f"[Yahoo] Completed with {len(df)} rows.");
    return df

def save_raw_data(data: pd.DataFrame, stock_id: str, fmt: Literal['csv','json']='csv') -> str:
    """
    將原始資料儲存至 data/raw/。
    參數:
        data (pd.DataFrame): 欲儲存資料。
        stock_id (str): 股票代碼。
        fmt (str): 檔案格式 'csv' or 'json'。
    回傳: 檔案路徑
    """
    dir_path = './data/raw/'
    os.makedirs(dir_path, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    fname = f'{stock_id}_{ts}.{fmt}'
    fpath = os.path.join(dir_path, fname)
    try:
        if fmt == 'csv':
            data.to_csv(fpath, index=False)
        else:
            data.to_json(fpath, orient='records', force_ascii=False)
        logging.info(f'Raw data saved: {fpath}')
    except Exception as e:
        logging.error(f'Failed to save raw data: {e}')
        raise
    return fpath
