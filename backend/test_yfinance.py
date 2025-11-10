# test_yfinance.py - 測試 yfinance 模組的所有功能

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.yfinance_service import (
    get_stock_info,
    get_intraday_data,
    get_daily_trade_data,
    get_market_index_data
)

def test_stock_info():
    """測試獲取股票基本資訊"""
    print("\n" + "="*60)
    print("測試 1: 獲取股票基本資訊")
    print("="*60)
    
    test_codes = ['2330', '2317', '2454']
    
    for code in test_codes:
        print(f"\n測試股票代號: {code}")
        try:
            info = get_stock_info(code)
            if info:
                print(f"✓ 成功獲取 {code} 的資訊")
                print(f"  股票名稱: {info.get('stockName', 'N/A')}")
                print(f"  當前價格: {info.get('currentPrice', 'N/A')}")
                print(f"  前收盤價: {info.get('previousClose', 'N/A')}")
                print(f"  成交量: {info.get('volume', 'N/A')}")
            else:
                print(f"✗ 無法獲取 {code} 的資訊（返回 None）")
        except Exception as e:
            print(f"✗ 錯誤: {str(e)}")

def test_intraday_data():
    """測試獲取盤中即時數據"""
    print("\n" + "="*60)
    print("測試 2: 獲取盤中即時數據（成交明細）")
    print("="*60)
    
    test_codes = ['2330', '2317']
    periods = ['1d', '5d']
    intervals = ['5m', '15m']
    
    for code in test_codes:
        for period in periods:
            for interval in intervals:
                print(f"\n測試: {code}, period={period}, interval={interval}")
                try:
                    data = get_intraday_data(code, period=period, interval=interval)
                    if data:
                        print(f"✓ 成功獲取 {len(data)} 筆數據")
                        if len(data) > 0:
                            print(f"  第一筆數據: {data[0]}")
                            print(f"  最後一筆數據: {data[-1]}")
                    else:
                        print(f"⚠ 返回空數據（可能是市場休市或數據不可用）")
                except Exception as e:
                    print(f"✗ 錯誤: {str(e)}")

def test_daily_trade_data():
    """測試獲取日交易檔數據"""
    print("\n" + "="*60)
    print("測試 3: 獲取日交易檔數據")
    print("="*60)
    
    test_codes = ['2330', '2317', '2454']
    days_list = [5, 10]
    
    for code in test_codes:
        for days in days_list:
            print(f"\n測試: {code}, days={days}")
            try:
                data = get_daily_trade_data(code, days=days)
                if data:
                    print(f"✓ 成功獲取 {len(data)} 筆數據")
                    if len(data) > 0:
                        first = data[0]
                        print(f"  第一筆數據:")
                        print(f"    日期: {first.get('date')}")
                        print(f"    收盤價: {first.get('closePrice')}")
                        print(f"    漲跌: {first.get('change')}")
                        print(f"    成交量: {first.get('totalVolume')}")
                else:
                    print(f"⚠ 返回空數據")
            except Exception as e:
                print(f"✗ 錯誤: {str(e)}")

def test_market_index_data():
    """測試獲取大盤指數數據"""
    print("\n" + "="*60)
    print("測試 4: 獲取大盤指數數據")
    print("="*60)
    
    index_codes = ['^TWII', '^IXIC', '^GSPC']
    days_list = [5, 10]
    
    for index_code in index_codes:
        for days in days_list:
            print(f"\n測試: {index_code}, days={days}")
            try:
                data = get_market_index_data(index_code, days=days)
                if data:
                    print(f"✓ 成功獲取 {len(data)} 筆數據")
                    if len(data) > 0:
                        first = data[0]
                        print(f"  第一筆數據:")
                        print(f"    日期: {first.get('date')}")
                        print(f"    指數名稱: {first.get('indexName')}")
                        print(f"    收盤價: {first.get('closePrice')}")
                        print(f"    漲跌: {first.get('change')}")
                else:
                    print(f"⚠ 返回空數據")
            except Exception as e:
                print(f"✗ 錯誤: {str(e)}")

def test_error_handling():
    """測試錯誤處理"""
    print("\n" + "="*60)
    print("測試 5: 錯誤處理（無效股票代號）")
    print("="*60)
    
    invalid_codes = ['9999', 'INVALID', '0000']
    
    for code in invalid_codes:
        print(f"\n測試無效代號: {code}")
        try:
            info = get_stock_info(code)
            if info is None:
                print(f"✓ 正確處理無效代號（返回 None）")
            else:
                print(f"⚠ 返回了數據（可能代號有效）")
        except Exception as e:
            print(f"✓ 正確捕獲錯誤: {str(e)}")

def main():
    """執行所有測試"""
    print("\n" + "="*60)
    print("開始測試 yfinance 模組")
    print("="*60)
    
    try:
        test_stock_info()
        test_intraday_data()
        test_daily_trade_data()
        test_market_index_data()
        test_error_handling()
        
        print("\n" + "="*60)
        print("所有測試完成！")
        print("="*60)
    except KeyboardInterrupt:
        print("\n\n測試被中斷")
    except Exception as e:
        print(f"\n\n測試過程中發生未預期的錯誤: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

