"""
cleaner.py
股票原始資料清理及儲存模組。
包含:
- normalize_data: 欄位標準化
- fill_missing_prices: 遺漏資料補齊
- save_to_sqlite: 儲存 (cleaned) 至 SQLite
"""

import os
import pandas as pd
import sqlite3
import logging
from typing import Optional

logging.basicConfig(
    filename='./logs/cleaner.log',
    filemode='a',
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)

def normalize_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    將不同來源原始資料格式標準化。
    輸入:
        df (pd.DataFrame): 原始股票資料
    輸出:
        pd.DataFrame: 格式統一/排序/命名標準
    """
    # 示意: 欄位標準化
    rename_map = {'收盤價':'Close', '開盤價':'Open', '最高價':'High', '最低價':'Low', '成交股數':'Volume'}
    df = df.rename(columns=rename_map)
    main_cols = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
    for c in main_cols:
        if c not in df:
            df[c] = None
    df = df[main_cols]
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    df = df.sort_values('Date').reset_index(drop=True)
    logging.info("欄位標準化完成")
    return df

def fill_missing_prices(df: pd.DataFrame) -> pd.DataFrame:
    """
    遺漏的價格補值（線性插值簡例)。
    輸入：
        df (pd.DataFrame)
    輸出：
        pd.DataFrame
    """
    col_types = ['Open','High','Low','Close']
    for c in col_types:
        df[c] = pd.to_numeric(df[c], errors='coerce')
        df[c] = df[c].interpolate(method='linear')
    df['Volume'] = pd.to_numeric(df['Volume'], errors='coerce').fillna(0)
    logging.info("遺漏值處理完成")
    return df

def save_to_sqlite(df: pd.DataFrame, db_path: Optional[str] = './data/cleaned/stocks.db') -> None:
    """
    資料儲存至 SQLite 資料庫。
    參數：
        df: 清理後資料
        db_path: 儲存檔案路徑
    """
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    try:
        df.to_sql('stocks', conn, if_exists='append', index=False)
        logging.info(f'儲存至 SQLite：{db_path}')
    finally:
        conn.close()
