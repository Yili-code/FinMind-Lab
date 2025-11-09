# FinMind Lab Backend

## 啟動後端服務

### 方法 1: 從 backend 目錄運行（推薦）
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### 方法 2: 從項目根目錄運行
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

**注意：** 推薦使用方法 1，從 `backend` 目錄運行，這樣可以避免模組導入問題。

服務啟動後，您應該看到：
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## 測試連接

### 方法 1: 使用測試腳本
```bash
cd backend
python test_connection.py
```

### 方法 2: 使用瀏覽器
打開瀏覽器訪問：
- http://localhost:8000/ - 應該看到 `{"message":"Hello from FastAPI"}`
- http://localhost:8000/api/hello - 應該看到 `{"message":"Successfully connected to the backend!!!"}`
- http://localhost:8000/docs - FastAPI 自動生成的 API 文檔

### 方法 3: 使用 curl
```bash
curl http://localhost:8000/api/hello
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

