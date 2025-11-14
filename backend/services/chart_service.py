# chart_service.py - 圖表生成服務（使用 mplfinance）

import matplotlib
matplotlib.use('Agg')  # 使用非交互式後端
import matplotlib.pyplot as plt
import mplfinance as mpf
from datetime import datetime
import io
import base64
import pandas as pd
from typing import List, Dict, Optional
import warnings

# 抑制 matplotlib 和 mplfinance 警告
warnings.filterwarnings('ignore')

def generate_candlestick_chart(
    data: List[Dict],
    stock_code: str,
    stock_name: str = "",
    title: str = "",
    width: int = 12,
    height: int = 6
) -> str:
    """
    使用 mplfinance 生成 K 線圖（Candlestick Chart）
    
    參數:
        data: 股票數據列表，每個元素應包含 date, open, high, low, close, volume
        stock_code: 股票代號
        stock_name: 股票名稱
        title: 圖表標題
        width: 圖表寬度（英寸）
        height: 圖表高度（英寸）
    
    返回:
        base64 編碼的圖片字符串
    """
    if not data:
        raise ValueError("數據為空，無法生成圖表")
    
    # 轉換為 DataFrame
    df = pd.DataFrame(data)
    
    # 確保日期列是 datetime 類型並設置為索引
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])
        df = df.sort_values('date')
        df.set_index('date', inplace=True)
    
    if len(df) == 0:
        raise ValueError("沒有有效的日期數據")
    
    # 確保必要的列存在
    required_cols = ['open', 'high', 'low', 'close']
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"缺少必要的列: {col}")
    
    # 重命名列以符合 mplfinance 的要求（如果需要的話）
    column_mapping = {
        'open': 'Open',
        'high': 'High',
        'low': 'Low',
        'close': 'Close',
        'volume': 'Volume'
    }
    
    # 創建符合 mplfinance 格式的 DataFrame
    mplf_df = pd.DataFrame()
    for old_col, new_col in column_mapping.items():
        if old_col in df.columns:
            mplf_df[new_col] = df[old_col]
        elif old_col == 'volume' and '成交量' in df.columns:
            mplf_df[new_col] = df['成交量']
    
    # 如果沒有成交量數據，創建一個零數組
    if 'Volume' not in mplf_df.columns:
        mplf_df['Volume'] = 0
    
    # 設置自定義樣式（深色主題）
    mc = mpf.make_marketcolors(
        up='#ef4444',      # 上漲顏色（紅色）
        down='#22c55e',    # 下跌顏色（綠色）
        edge='inherit',    # 邊框顏色繼承
        wick={'upcolor': '#ef4444', 'downcolor': '#22c55e'},  # 影線顏色
        volume='in',       # 成交量顏色跟隨價格
        inherit=True
    )
    
    style = mpf.make_mpf_style(
        marketcolors=mc,
        gridstyle='--',           # 網格樣式
        gridcolor='#4DD0E1',      # 網格顏色
        gridwidth=0.5,
        facecolor='#0a0f24',      # 背景顏色
        edgecolor='#4DD0E1',      # 邊框顏色
        figcolor='#0a0f24',       # 圖表背景顏色
        y_on_right=False,         # Y 軸在左側
        rc={
            'axes.labelcolor': '#E0E8FF',
            'axes.edgecolor': '#4DD0E1',
            'xtick.color': '#E0E8FF',
            'ytick.color': '#E0E8FF',
            'text.color': '#E0E8FF',
            'font.size': 10,
            'font.family': ['Microsoft JhengHei', 'Arial Unicode MS', 'DejaVu Sans']
        }
    )
    
    # 設置標題
    chart_title = title or f"{stock_code} - {stock_name}" if stock_name else f"{stock_code} K線圖"
    
    # 配置圖表參數
    plot_kwargs = {
        'type': 'candle',          # K 線圖類型
        'style': style,            # 自定義樣式
        'volume': True,            # 顯示成交量
        'figsize': (width, height),
        'title': chart_title,
        'ylabel': '價格',
        'ylabel_lower': '成交量',
        'xlabel': '日期',
        'show_nontrading': False,  # 不顯示非交易日
        'returnfig': True,         # 返回 figure 對象
        'savefig': dict(
            format='png',
            dpi=100,
            bbox_inches='tight',
            facecolor='#0a0f24',
            edgecolor='none'
        )
    }
    
    # 使用 mplfinance 繪製圖表
    try:
        fig, axes = mpf.plot(
            mplf_df,
            **plot_kwargs
        )
        
        # 將圖表轉換為 base64 字符串
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=100, facecolor='#0a0f24', 
                    edgecolor='none', bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
        
        return img_base64
        
    except Exception as e:
        # 如果 mplfinance 繪製失敗，嘗試使用簡化版本
        import traceback
        print(f"mplfinance 繪製失敗，錯誤: {str(e)}")
        print(traceback.format_exc())
        
        # 使用備選方案：簡化的 mplfinance 配置
        try:
            fig, axes = mpf.plot(
                mplf_df,
                type='candle',
                volume=True,
                style=style,
                figsize=(width, height),
                returnfig=True
            )
            
            buf = io.BytesIO()
            fig.savefig(buf, format='png', dpi=100, facecolor='#0a0f24', 
                        edgecolor='none', bbox_inches='tight')
            buf.seek(0)
            img_base64 = base64.b64encode(buf.read()).decode('utf-8')
            plt.close(fig)
            
            return img_base64
        except Exception as e2:
            raise ValueError(f"無法生成圖表: {str(e2)}")

