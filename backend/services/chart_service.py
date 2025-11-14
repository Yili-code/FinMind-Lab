# chart_service.py - 圖表生成服務

import matplotlib
matplotlib.use('Agg')  # 使用非交互式後端
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.patches import Rectangle
from datetime import datetime
import io
import base64
import pandas as pd
from typing import List, Dict, Optional
import warnings

# 抑制 matplotlib 警告
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
    生成 K 線圖（Candlestick Chart）
    
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
    
    # 確保日期列是 datetime 類型
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])
        df = df.sort_values('date')
    
    if len(df) == 0:
        raise ValueError("沒有有效的日期數據")
    
    # 設置中文字體（如果可用）
    plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei', 'Arial Unicode MS', 'DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    
    # 創建圖表和子圖
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(width, height), 
                                    gridspec_kw={'height_ratios': [3, 1], 'hspace': 0.1})
    
    # 準備數據
    dates = df['date'].values
    opens = df['open'].values
    highs = df['high'].values
    lows = df['low'].values
    closes = df['close'].values
    volumes = df.get('volume', df.get('成交量', [0] * len(df))).values
    
    # 繪製 K 線圖
    for i, date in enumerate(dates):
        open_price = opens[i]
        high_price = highs[i]
        low_price = lows[i]
        close_price = closes[i]
        
        # 判斷漲跌
        is_up = close_price >= open_price
        color = '#ef4444' if is_up else '#22c55e'  # 紅色上漲，綠色下跌
        
        # 繪製影線（最高到最低）
        ax1.plot([i, i], [low_price, high_price], color=color, linewidth=1.5, alpha=0.8)
        
        # 繪製實體（開盤到收盤）
        body_height = abs(close_price - open_price)
        body_bottom = min(open_price, close_price)
        
        # 如果開盤價和收盤價相同，繪製一條線
        if body_height < 0.01:
            ax1.plot([i - 0.3, i + 0.3], [open_price, open_price], 
                    color=color, linewidth=2)
        else:
            rect = Rectangle((i - 0.3, body_bottom), 0.6, body_height,
                           facecolor=color, edgecolor=color, linewidth=0.5, alpha=0.9)
            ax1.add_patch(rect)
    
    # 設置 K 線圖的標籤和格式
    ax1.set_xlim(-0.5, len(dates) - 0.5)
    ax1.set_ylabel('價格', fontsize=12, fontweight='bold')
    ax1.grid(True, alpha=0.3, linestyle='--')
    ax1.set_facecolor('#0a0f24')
    fig.patch.set_facecolor('#0a0f24')
    ax1.tick_params(colors='#E0E8FF', labelsize=10)
    ax1.spines['bottom'].set_color('#4DD0E1')
    ax1.spines['top'].set_color('#4DD0E1')
    ax1.spines['right'].set_color('#4DD0E1')
    ax1.spines['left'].set_color('#4DD0E1')
    
    # 設置 X 軸日期標籤
    if len(dates) > 0:
        step = max(1, len(dates) // 10)  # 最多顯示 10 個標籤
        ax1.set_xticks(range(0, len(dates), step))
        ax1.set_xticklabels([pd.Timestamp(d).strftime('%m/%d') if isinstance(d, pd.Timestamp) 
                            else str(d)[:10] for d in dates[::step]], 
                           rotation=45, ha='right', color='#E0E8FF', fontsize=9)
    
    # 設置標題
    chart_title = title or f"{stock_code} - {stock_name}" if stock_name else f"{stock_code} K線圖"
    ax1.set_title(chart_title, fontsize=14, fontweight='bold', color='#E0E8FF', pad=20)
    
    # 繪製成交量柱狀圖
    colors_volume = ['#ef4444' if closes[i] >= opens[i] else '#22c55e' 
                     for i in range(len(dates))]
    ax2.bar(range(len(dates)), volumes, color=colors_volume, alpha=0.6, width=0.6)
    ax2.set_xlim(-0.5, len(dates) - 0.5)
    ax2.set_ylabel('成交量', fontsize=10, fontweight='bold', color='#E0E8FF')
    ax2.set_xlabel('日期', fontsize=10, fontweight='bold', color='#E0E8FF')
    ax2.grid(True, alpha=0.3, linestyle='--')
    ax2.set_facecolor('#0a0f24')
    ax2.tick_params(colors='#E0E8FF', labelsize=9)
    ax2.spines['bottom'].set_color('#4DD0E1')
    ax2.spines['top'].set_color('#4DD0E1')
    ax2.spines['right'].set_color('#4DD0E1')
    ax2.spines['left'].set_color('#4DD0E1')
    
    # 設置成交量 X 軸標籤
    if len(dates) > 0:
        ax2.set_xticks(range(0, len(dates), step))
        ax2.set_xticklabels([pd.Timestamp(d).strftime('%m/%d') if isinstance(d, pd.Timestamp) 
                            else str(d)[:10] for d in dates[::step]], 
                           rotation=45, ha='right', color='#E0E8FF', fontsize=9)
    
    # 格式化成交量標籤
    ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{x/1e6:.1f}M' if x >= 1e6 else f'{x/1e3:.1f}K'))
    
    # 調整佈局
    plt.tight_layout()
    
    # 將圖表轉換為 base64 字符串
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, facecolor='#0a0f24', 
                edgecolor='none', bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    
    return img_base64

