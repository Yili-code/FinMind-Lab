# FinMind Lab Backend

## 啟動後端服務

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

## 常見問題

### 1. yfinance 警告訊息

yfinance 在運行時會產生許多警告訊息（如 FutureWarning、UserWarning），這些是正常的，不會影響功能。代碼中已經添加了警告過濾器來抑制這些訊息。

### 2. 台股數據獲取

- yfinance 對台股的支持有限
- 部分數據（如內盤、外盤、外資等）是估算值
- 盤中數據需要市場開盤時才能獲取

### 3. API 端點

- `GET /api/stock/info/{stock_code}` - 獲取股票基本資訊
- `GET /api/stock/intraday/{stock_code}` - 獲取盤中即時數據
- `GET /api/stock/daily/{stock_code}` - 獲取日交易檔數據
- `GET /api/stock/batch?stock_codes=2330,2317` - 批量獲取股票資訊

## 依賴

見 `requirements.txt`

