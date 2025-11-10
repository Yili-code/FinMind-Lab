# FinMind Lab Backend

## 啟動後端服務

### 方法 1: 從 backend 目錄運行（推薦）
```bash
cd backend
python -m uvicorn main:app --reload --port 8000 --log-level warning
```

### 方法 2: 從項目根目錄運行
```bash
python -m uvicorn backend.main:app --reload --port 8000 --log-level warning
```

**注意：** 
- 推薦使用方法 1，從 `backend` 目錄運行，這樣可以避免模組導入問題。
- 使用 `--log-level warning` 可以減少非必要的日誌輸出，只顯示警告和錯誤訊息。

服務啟動後，您應該看到：
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
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

## 故障排除

### 如果後端無法啟動

1. **運行診斷工具**：
   ```bash
   cd backend
   python check_backend.py
   ```
   這會檢查所有必要的組件和配置。

2. **檢查端口是否被占用**：
   - Windows: `netstat -ano | findstr :8000`
   - Linux/Mac: `lsof -i :8000`
   - 如果端口被占用，可以：
     - 關閉占用端口的程序
     - 或使用其他端口：`--port 8001`

3. **檢查 Python 環境**：
   ```bash
   python --version  # 應該顯示 Python 3.8+
   pip list | findstr fastapi  # 檢查是否安裝了 fastapi
   ```

4. **重新安裝依賴**：
   ```bash
   pip install -r requirements.txt
   ```

5. **檢查錯誤訊息**：
   - 如果看到 `IndentationError`，檢查 `main.py` 的縮排
   - 如果看到 `ModuleNotFoundError`，確認在 `backend` 目錄下運行
   - 如果看到 `Address already in use`，端口被占用

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
- `GET /api/stock/market-index` - 獲取大盤指數數據

## 依賴

見 `requirements.txt`

