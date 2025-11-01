"""
visualizer.py
股票技術分析、K 線、報表產生模組
- plot_price_with_sma: K線+均線
- plot_candlestick: K線圖
- generate_report: 產生圖表/報表 (PNG/PDF)
"""

import os
import logging
import matplotlib.pyplot as plt
import mplfinance as mpf
import pandas as pd
from datetime import datetime

logging.basicConfig(
    filename='./logs/visualizer.log',
    filemode='a',
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    encoding='utf-8'
)

def plot_price_with_sma(df: pd.DataFrame, stock_id: str, savefig: bool = True) -> str:
    """
    股票收盤價與簡單移動平均線(SMA)折線圖
    輸入:
        df: 已帶 MA 欄 (如 MA5, MA20)
        stock_id: 股票代碼
        savefig: 是否輸出圖檔
    回傳: 圖檔路徑（如 savefig 為 True)
    """
    plt.figure(figsize=(10,6))
    plt.plot(df['Date'], df['Close'], label='Close')
    for col in df.columns:
        if col.startswith('MA'):
            plt.plot(df['Date'], df[col], label=col)
    plt.legend()
    plt.title(f'{stock_id} Close & Moving Averages')
    plt.xlabel('Date')
    plt.ylabel('Price')
    path = ''
    if savefig:
        os.makedirs('./data/reports/', exist_ok=True)
        path = f'./data/reports/{stock_id}_price_ma_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png'
        plt.savefig(path)
        plt.close()
        logging.info(f'Exported Close+MA chart: {path}')
    return path

def plot_candlestick(df: pd.DataFrame, stock_id: str, savefig: bool = True) -> str:
    """
    產生蠟燭圖/成交量圖（mplfinance）
    輸入: df, stock_id, savefig
    回傳: 圖檔路徑
    """
    df_mpf = df.copy()
    df_mpf.set_index('Date', inplace=True)
    df_mpf.index = pd.to_datetime(df_mpf.index)
    path = ''
    if savefig:
        os.makedirs('./data/reports/', exist_ok=True)
        path = f'./data/reports/{stock_id}_candlestick_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png'
        mpf.plot(df_mpf, type='candle', volume=True, style='yahoo', savefig=path)
        logging.info(f'Exported candlestick chart: {path}')
    return path

def generate_report(stock_id: str, charts: list) -> str:
    """
    整合所有圖表與摘要產生 PDF 報表
    參數: stock_id, charts 圖片檔路徑list
    回傳: PDF 路徑
    """
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    pdf_path = f'./data/reports/{stock_id}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf'
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4
    y = height-60
    c.setFont('Helvetica', 18)
    c.drawString(50,y, f'{stock_id} Stock Report')
    c.setFont('Helvetica', 12)
    y -= 40
    for chart in charts:
        c.drawString(60, y, os.path.basename(chart))
        y -= 20
        c.drawImage(chart, 60, y-300, width=450, height=300, preserveAspectRatio=True)
        y -= 340
        if y < 100:
            c.showPage()
            y = height-60
    c.save()
    logging.info(f'Generated report PDF: {pdf_path}')
    return pdf_path
