# test_api.py - 測試後端 API 端點

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_hello():
    """測試 hello 端點"""
    print("\n" + "="*60)
    print("測試 API: /api/hello")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/api/hello", timeout=5)
        if response.status_code == 200:
            print(f"[OK] 成功: {response.json()}")
            return True
        else:
            print(f"[X] 失敗: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("[X] 無法連接到後端服務器，請確認後端是否正在運行")
        print("  運行命令: cd backend && python -m uvicorn main:app --reload --port 8000")
        return False
    except Exception as e:
        print(f"[X] 錯誤: {str(e)}")
        return False

def test_stock_info(stock_code: str):
    """測試獲取股票資訊"""
    print(f"\n測試 API: /api/stock/info/{stock_code}")
    try:
        response = requests.get(f"{BASE_URL}/api/stock/info/{stock_code}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] 成功獲取 {stock_code} 的資訊")
            print(f"  股票名稱: {data.get('stockName', 'N/A')}")
            print(f"  當前價格: {data.get('currentPrice', 'N/A')}")
            return True
        else:
            print(f"[X] 失敗: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[X] 錯誤: {str(e)}")
        return False

def test_intraday_data(stock_code: str):
    """測試獲取盤中數據"""
    print(f"\n測試 API: /api/stock/intraday/{stock_code}")
    try:
        response = requests.get(
            f"{BASE_URL}/api/stock/intraday/{stock_code}?period=1d&interval=5m",
            timeout=15
        )
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0)
            print(f"[OK] 成功獲取 {count} 筆盤中數據")
            if count > 0:
                first = data.get('data', [])[0]
                print(f"  第一筆: {first.get('date')} {first.get('time')} - 價格: {first.get('price')}")
            return True
        else:
            print(f"[X] 失敗: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[X] 錯誤: {str(e)}")
        return False

def test_daily_trade_data(stock_code: str):
    """測試獲取日交易數據"""
    print(f"\n測試 API: /api/stock/daily/{stock_code}")
    try:
        response = requests.get(
            f"{BASE_URL}/api/stock/daily/{stock_code}?days=5",
            timeout=15
        )
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0)
            print(f"[OK] 成功獲取 {count} 筆日交易數據")
            if count > 0:
                first = data.get('data', [])[0]
                print(f"  第一筆: {first.get('date')} - 收盤價: {first.get('closePrice')}")
            return True
        else:
            print(f"[X] 失敗: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[X] 錯誤: {str(e)}")
        return False

def test_market_index():
    """測試獲取大盤指數數據"""
    print(f"\n測試 API: /api/stock/market-index")
    try:
        response = requests.get(
            f"{BASE_URL}/api/stock/market-index?index_code=^TWII&days=5",
            timeout=15
        )
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0)
            print(f"[OK] 成功獲取 {count} 筆大盤指數數據")
            if count > 0:
                first = data.get('data', [])[0]
                print(f"  第一筆: {first.get('date')} - 指數: {first.get('closePrice')}")
            return True
        else:
            print(f"[X] 失敗: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[X] 錯誤: {str(e)}")
        return False

def test_batch_stocks():
    """測試批量獲取股票資訊"""
    print(f"\n測試 API: /api/stock/batch")
    try:
        response = requests.get(
            f"{BASE_URL}/api/stock/batch?stock_codes=2330,2317,2454",
            timeout=20
        )
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0)
            print(f"[OK] 成功獲取 {count} 個股票的資訊")
            return True
        else:
            print(f"[X] 失敗: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[X] 錯誤: {str(e)}")
        return False

def main():
    """執行所有 API 測試"""
    print("\n" + "="*60)
    print("開始測試後端 API 端點")
    print("="*60)
    
    # 先測試連接
    if not test_hello():
        print("\n[警告] 後端服務器未運行，請先啟動後端服務")
        return
    
    # 測試各個端點
    results = []
    
    results.append(("股票資訊 (2330)", test_stock_info("2330")))
    results.append(("盤中數據 (2330)", test_intraday_data("2330")))
    results.append(("日交易數據 (2330)", test_daily_trade_data("2330")))
    results.append(("大盤指數", test_market_index()))
    results.append(("批量股票", test_batch_stocks()))
    
    # 總結
    print("\n" + "="*60)
    print("測試結果總結")
    print("="*60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    for name, result in results:
        status = "[OK] 通過" if result else "[X] 失敗"
        print(f"{status}: {name}")
    
    print(f"\n總計: {passed}/{total} 測試通過")
    print("="*60)

if __name__ == "__main__":
    main()

