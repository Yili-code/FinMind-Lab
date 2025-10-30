"""
main.py
自動化擷取、清理、分析、視覺化及報表產生執行程式
"""
import sys
import traceback
from src.scraper import fetch_stock_data, save_raw_data
from src.cleaner import normalize_data, fill_missing_prices, save_to_sqlite
from src.analyzer import calculate_indicators, save_analysis
from src.visualizer import plot_price_with_sma, plot_candlestick, generate_report


def main():
    try:
        stock_id = input('請輸入股票代碼: ').strip()
        start = input('開始日期 (yyyy-mm-dd): ').strip()
        end = input('結束日期 (yyyy-mm-dd): ').strip()
        print('[1/4] 正在抓取資料...')
        df_raw = fetch_stock_data(stock_id, start, end)
        save_raw_data(df_raw, stock_id)

        print('[2/4] 清理中...')
        df_clean = normalize_data(df_raw)
        df_clean = fill_missing_prices(df_clean)
        save_to_sqlite(df_clean)

        print('[3/4] 分析中...')
        indicators = ['MA5', 'MA20', 'RSI14']
        df_ana = calculate_indicators(df_clean, indicators)
        save_analysis(df_ana, stock_id)

        print('[4/4] 產生報表完成')
        chart1 = plot_price_with_sma(df_ana, stock_id)
        chart2 = plot_candlestick(df_ana, stock_id)
        report_path = generate_report(stock_id, [chart1, chart2])
        print(f'PDF報表已生成：{report_path}')
    except Exception as e:
        print('發生錯誤:', e)
        print(traceback.format_exc())

if __name__ == '__main__':
    main()
