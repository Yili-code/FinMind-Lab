#!/usr/bin/env python
# test_connection.py - 測試後端連接

import requests
import sys

def test_backend():
    """測試後端 API 是否正常運行"""
    base_url = "http://localhost:8000"
    
    print("測試後端連接...")
    print(f"後端 URL: {base_url}\n")
    
    # 測試根路徑
    try:
        response = requests.get(f"{base_url}/")
        print(f"✓ 根路徑測試: {response.status_code}")
        print(f"  回應: {response.json()}\n")
    except Exception as e:
        print(f"✗ 根路徑測試失敗: {e}\n")
        return False
    
    # 測試 hello API
    try:
        response = requests.get(f"{base_url}/api/hello")
        print(f"✓ /api/hello 測試: {response.status_code}")
        print(f"  回應: {response.json()}\n")
    except Exception as e:
        print(f"✗ /api/hello 測試失敗: {e}\n")
        return False
    
    # 測試股票資訊 API
    try:
        response = requests.get(f"{base_url}/api/stock/info/2330", timeout=10)
        print(f"✓ 股票資訊 API 測試: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  股票代號: {data.get('stockCode')}")
            print(f"  股票名稱: {data.get('stockName')}")
            print(f"  當前價格: {data.get('currentPrice')}\n")
        else:
            print(f"  錯誤: {response.text}\n")
    except Exception as e:
        print(f"✗ 股票資訊 API 測試失敗: {e}\n")
        print("  這可能是正常的，如果 yfinance 無法獲取數據\n")
    
    print("後端連接測試完成！")
    return True

if __name__ == "__main__":
    success = test_backend()
    sys.exit(0 if success else 1)

