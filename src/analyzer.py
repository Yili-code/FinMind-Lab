"""
analyzer.py
進行台股數據技術指標計算分析。
- calculate_indicators: 指標 (MA、RSI ...) 計算
- save_analysis: 儲存分析結果
"""

import logging
import pandas as pd
import numpy as np
from typing import List

logging.basicConfig(
    filename='./logs/analyzer.log',
    filemode='a',
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    encoding='utf-8'
)

def calculate_indicators(df: pd.DataFrame, indicators_list: List[str]) -> pd.DataFrame:
    """
    計算指定技術指標並新增為欄位
    參數：
       df: 已清理股價資料
       indicators_list: 指標 ['MA5', 'MA20', 'RSI14', ...]
    回傳：
       df (pd.DataFrame) 含指標欄
    """
    result = df.copy()
    for item in indicators_list:
        if item.startswith('MA'):
            n = int(item[2:])
            result[f'MA{n}'] = result['Close'].rolling(n).mean()
        elif item.startswith('RSI'):
            n = int(item[3:])
            # RSI 簡版
            delta = result['Close'].diff()
            gain = (delta.where(delta>0, 0)).rolling(n).mean()
            loss = (-delta.where(delta<0, 0)).rolling(n).mean()
            rs = gain / loss
            result[f'RSI{n}'] = 100 - (100 / (1 + rs))
        # (可擴充更多)
    logging.info(f'Indicator calculation completed: {indicators_list}')
    return result

def save_analysis(df: pd.DataFrame, stock_id: str, fmt: str = 'csv') -> str:
    """
    儲存分析後資料到 data/reports
    參數: df、stock_id、fmt（csv/json）
    回傳: 實際路徑
    """
    import os, json
    from datetime import datetime
    dir_path = './data/reports/'
    os.makedirs(dir_path, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    fname = f'{stock_id}_analysis_{ts}.{fmt}'
    fpath = os.path.join(dir_path, fname)
    try:
        if fmt=='csv':
            df.to_csv(fpath, index=False)
        else:
            df.to_json(fpath, orient='records', force_ascii=False)
        logging.info(f'Analysis saved: {fpath}')
    except Exception as e:
        logging.error(f'Failed to save analysis: {e}')
        raise
    return fpath
