# yfinance 模組測試文檔

## 測試概述

本文檔說明如何測試 yfinance 模組的所有功能，確保系統正常運作。

## 測試步驟

### 1. 測試 yfinance 服務模組

運行以下命令測試 yfinance 服務模組：

```bash
cd backend
python test_yfinance.py
```

**預期結果：**
- ✓ 所有股票資訊獲取成功
- ✓ 盤中數據獲取成功
- ✓ 日交易數據獲取成功
- ✓ 大盤指數數據獲取成功
- ✓ 錯誤處理正確（無效代號返回 None）

### 2. 啟動後端服務器

在一個終端中啟動後端服務器：

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**預期輸出：**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 3. 測試後端 API 端點

在另一個終端中運行 API 測試：

```bash
cd backend
python test_api.py
```

**預期結果：**
- ✓ /api/hello - 連接成功
- ✓ /api/stock/info/{stock_code} - 獲取股票資訊成功
- ✓ /api/stock/intraday/{stock_code} - 獲取盤中數據成功
- ✓ /api/stock/daily/{stock_code} - 獲取日交易數據成功
- ✓ /api/stock/market-index - 獲取大盤指數成功
- ✓ /api/stock/batch - 批量獲取成功

### 4. 測試前端整合

1. 啟動前端開發服務器：

```bash
cd frontend
npm run dev
```

2. 在瀏覽器中打開 `http://localhost:5173`

3. 導航到 Function1 頁面

4. 測試以下功能：
   - 輸入股票代號（例如：2330,2317）
   - 點擊「載入數據」按鈕
   - 檢查 Table 1（股票成交明細）是否顯示數據
   - 檢查 Table 2（股票日交易檔）是否顯示數據
   - 檢查大盤走勢圖是否顯示數據
   - 測試點擊表格行進行篩選

## 已知問題和解決方案

### 問題 1: 數據類型問題（np.float64）

**問題：** 返回的數據中包含 numpy 類型（np.float64），導致 JSON 序列化問題。

**解決方案：** 已在 `yfinance_service.py` 中所有函數添加 `float()` 轉換，確保返回 Python 原生類型。

### 問題 2: 無效股票代號處理

**問題：** yfinance 在找不到股票時可能返回空字典而不是拋出異常。

**解決方案：** 已在 `get_stock_info` 中添加多層檢查：
- 檢查字典是否為空
- 檢查是否包含錯誤訊息
- 檢查關鍵欄位（價格）是否存在

### 問題 3: 市場休市時數據為空

**問題：** 在市場休市時，某些 API 可能返回空數據。

**解決方案：** 所有函數在返回空數據時返回空列表 `[]`，前端會顯示相應的提示訊息。

## 測試數據範例

### 有效的股票代號
- `2330` - 台積電
- `2317` - 鴻海
- `2454` - 聯發科
- `2308` - 台達電
- `2412` - 中華電

### 大盤指數代號
- `^TWII` - 台灣加權指數
- `^IXIC` - 納斯達克指數
- `^GSPC` - 標普 500 指數

### 無效的股票代號（用於測試錯誤處理）
- `9999` - 不存在的代號
- `INVALID` - 無效格式
- `0000` - 無效代號

## 性能考量

### 請求頻率
- yfinance 對請求頻率有限制，建議：
  - 單個股票資訊請求間隔至少 1 秒
  - 批量請求時使用適當的延遲
  - 避免在短時間內發送大量請求

### 超時設定
- 所有 yfinance 請求都設置了 `timeout=10` 秒
- 如果請求超時，函數會返回空數據或 None

## 日誌和調試

### 啟用詳細日誌

在 `yfinance_service.py` 中修改日誌級別：

```python
logger.setLevel(logging.DEBUG)  # 改為 DEBUG 以查看詳細日誌
```

### 常見錯誤訊息

1. **"No info available for {stock_code}"**
   - 原因：無法獲取股票資訊
   - 解決：檢查股票代號是否正確，或市場是否休市

2. **"Error fetching stock info"**
   - 原因：網絡錯誤或 yfinance API 問題
   - 解決：檢查網絡連接，稍後重試

3. **"Empty history data"**
   - 原因：請求的時間範圍內沒有數據
   - 解決：調整時間範圍或檢查市場是否休市

## 持續改進

### 待優化項目

1. **緩存機制**
   - 實現數據緩存，減少對 yfinance 的請求
   - 對於不常變動的數據（如股票基本資訊）可以緩存更長時間

2. **錯誤重試**
   - 實現自動重試機制，處理臨時網絡錯誤
   - 使用指數退避策略

3. **數據驗證**
   - 添加更嚴格的數據驗證
   - 檢查數據的完整性和合理性

4. **並發處理**
   - 優化批量請求的並發處理
   - 使用異步請求提高效率

## 聯繫和支援

如果遇到問題，請檢查：
1. 後端服務器是否正在運行
2. 網絡連接是否正常
3. yfinance 庫是否已正確安裝
4. 股票代號格式是否正確（台股需要 4 位數字）

