# yfinance 使用指南

## 目錄
1. [快速開始](#快速開始)
2. [API 端點說明](#api-端點說明)
3. [股票代號格式](#股票代號格式)
4. [前端使用方式](#前端使用方式)
5. [常見問題](#常見問題)

---

## 快速開始

### 1. 啟動後端服務

```bash
# 進入 backend 目錄
cd backend

# 啟動服務（推薦方式）
python -m uvicorn main:app --reload --port 8000 --log-level warning
```

服務啟動後，訪問 http://127.0.0.1:8000/docs 查看完整的 API 文檔。

### 2. 測試連接

```bash
# 測試基本連接
curl http://127.0.0.1:8000/api/hello

# 測試獲取股票資訊（台積電）
curl http://127.0.0.1:8000/api/stock/info/2330
```

---

## API 端點說明

### 1. 獲取股票基本資訊

**端點：** `GET /api/stock/info/{stock_code}`

**範例：**
```bash
# 獲取台積電資訊
curl http://127.0.0.1:8000/api/stock/info/2330
```

**返回數據：**
```json
{
  "stockCode": "2330",
  "stockName": "Taiwan Semiconductor Manufacturing Company Limited",
  "currentPrice": 580.0,
  "previousClose": 579.0,
  "marketCap": 15000000000000,
  "volume": 25000000,
  "averageVolume": 23000000,
  "peRatio": 18.5,
  "dividendYield": 2.5,
  "high52Week": 600.0,
  "low52Week": 450.0,
  "open": 579.0,
  "high": 585.0,
  "low": 578.0,
  "change": 1.0,
  "changePercent": 0.17
}
```

---

### 2. 獲取盤中即時數據（成交明細）

**端點：** `GET /api/stock/intraday/{stock_code}`

**參數：**
- `period`: 時間週期（預設: `1d`）
  - 可選值：`1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`
- `interval`: 時間間隔（預設: `1m`）
  - 可選值：`1m`, `2m`, `5m`, `15m`, `30m`, `60m`, `90m`, `1h`, `1d`, `5d`, `1wk`, `1mo`, `3mo`

**範例：**
```bash
# 獲取台積電最近 1 天的 5 分鐘數據
curl "http://127.0.0.1:8000/api/stock/intraday/2330?period=1d&interval=5m"

# 獲取台積電最近 5 天的 1 小時數據
curl "http://127.0.0.1:8000/api/stock/intraday/2330?period=5d&interval=1h"
```

**返回數據：**
```json
{
  "stockCode": "2330",
  "data": [
    {
      "stockCode": "2330",
      "date": "2024-11-10",
      "time": "09:00:00",
      "price": 580.0,
      "change": 1.0,
      "changePercent": 0.17,
      "lots": 1250.5,
      "period": "早盤",
      "openPrice": 579.0,
      "highPrice": 582.0,
      "lowPrice": 578.0,
      "totalVolume": 1250500,
      "estimatedVolume": 1250500
    }
  ],
  "count": 78
}
```

---

### 3. 獲取日交易檔數據

**端點：** `GET /api/stock/daily/{stock_code}`

**參數：**
- `days`: 獲取最近幾天的數據（預設: `5`，範圍: 1-30）

**範例：**
```bash
# 獲取台積電最近 5 天的日交易數據
curl "http://127.0.0.1:8000/api/stock/daily/2330?days=5"

# 獲取台積電最近 10 天的日交易數據
curl "http://127.0.0.1:8000/api/stock/daily/2330?days=10"
```

**返回數據：**
```json
{
  "stockCode": "2330",
  "data": [
    {
      "stockCode": "2330",
      "stockName": "Taiwan Semiconductor Manufacturing Company Limited",
      "date": "2024-11-10",
      "closePrice": 580.0,
      "avgPrice": 580.5,
      "prevClose": 579.0,
      "openPrice": 579.0,
      "highPrice": 585.0,
      "lowPrice": 578.0,
      "change": 1.0,
      "changePercent": 0.17,
      "totalVolume": 25000000,
      "prevVolume": 23000000,
      "innerVolume": 12000000,
      "outerVolume": 13000000,
      "foreignInvestor": 5000000,
      "investmentTrust": 800000,
      "dealer": 1200000,
      "chips": 7000000,
      "mainBuy": 15000000,
      "mainSell": 10000000,
      "monthHigh": 590.0,
      "monthLow": 570.0,
      "quarterHigh": 600.0
    }
  ],
  "count": 5
}
```

---

### 4. 批量獲取多個股票資訊

**端點：** `GET /api/stock/batch`

**參數：**
- `stock_codes`: 股票代號，用逗號分隔（必填）

**範例：**
```bash
# 批量獲取台積電和鴻海的資訊
curl "http://127.0.0.1:8000/api/stock/batch?stock_codes=2330,2317"
```

**返回數據：**
```json
{
  "stocks": [
    {
      "stockCode": "2330",
      "stockName": "Taiwan Semiconductor Manufacturing Company Limited",
      "currentPrice": 580.0,
      ...
    },
    {
      "stockCode": "2317",
      "stockName": "Hon Hai Precision Industry Co., Ltd.",
      "currentPrice": 105.0,
      ...
    }
  ],
  "count": 2
}
```

---

### 5. 獲取大盤指數數據

**端點：** `GET /api/stock/market-index`

**參數：**
- `index_code`: 指數代號（預設: `^TWII` 加權指數）
  - `^TWII`: 台灣加權指數
  - `^IXIC`: 那斯達克指數
  - `^GSPC`: S&P 500
  - `^DJI`: 道瓊指數
- `days`: 獲取最近幾天的數據（預設: `5`，範圍: 1-30）

**範例：**
```bash
# 獲取加權指數最近 5 天的數據
curl "http://127.0.0.1:8000/api/stock/market-index?index_code=^TWII&days=5"

# 獲取加權指數最近 10 天的數據
curl "http://127.0.0.1:8000/api/stock/market-index?index_code=^TWII&days=10"
```

**返回數據：**
```json
{
  "indexCode": "^TWII",
  "data": [
    {
      "date": "2024-11-10",
      "indexName": "TSEC Weighted Index",
      "closePrice": 17500.0,
      "openPrice": 17450.0,
      "highPrice": 17520.0,
      "lowPrice": 17430.0,
      "change": 50.0,
      "changePercent": 0.29,
      "volume": 15000000000
    }
  ],
  "count": 5
}
```

---

## 股票代號格式

### 台股代號

yfinance 使用 `.TW` 後綴來表示台股，但**您只需要輸入數字代號**，系統會自動轉換。

**範例：**
- 台積電：輸入 `2330`，系統自動轉換為 `2330.TW`
- 鴻海：輸入 `2317`，系統自動轉換為 `2317.TW`
- 聯發科：輸入 `2454`，系統自動轉換為 `2454.TW`

### 美股代號

直接使用股票代號，無需後綴。

**範例：**
- Apple：`AAPL`
- Microsoft：`MSFT`
- Tesla：`TSLA`

### 指數代號

使用 `^` 前綴。

**範例：**
- 台灣加權指數：`^TWII`
- 那斯達克指數：`^IXIC`
- S&P 500：`^GSPC`
- 道瓊指數：`^DJI`

---

## 前端使用方式

### 在 React 組件中使用

```typescript
import { getStockInfo, getIntradayData, getDailyTradeData, getMarketIndexData } from '../services/stockApi'

// 獲取股票基本資訊
const stockInfo = await getStockInfo('2330')
console.log(stockInfo)

// 獲取盤中數據
const intradayData = await getIntradayData('2330', '1d', '5m')
console.log(intradayData)

// 獲取日交易數據
const dailyData = await getDailyTradeData('2330', 5)
console.log(dailyData)

// 獲取大盤指數數據
const marketIndex = await getMarketIndexData('^TWII', 5)
console.log(marketIndex)
```

### 在 Function1Page 中使用

前端頁面 `Function1Page` 已經整合了 yfinance 功能：

1. **輸入股票代號**：在頁面上方的輸入框中輸入股票代號（用逗號分隔多個）
   - 例如：`2330,2317`

2. **點擊「載入數據」**或按 Enter 鍵

3. **查看結果**：
   - 大盤走勢圖（日K線）
   - Table 1：成交明細
   - Table 2：日交易檔

---

## 常見問題

### 1. 為什麼某些數據是估算值？

yfinance 對台股的支持有限，部分數據（如內盤、外盤、外資、投信等）無法直接獲取，因此使用估算值。

### 2. 為什麼盤中數據獲取失敗？

- **市場未開盤**：盤中數據只在交易時間內可用
- **網路問題**：檢查網路連接
- **後端未啟動**：確認後端服務正在運行

### 3. 如何獲取更多歷史數據？

調整 `days` 參數（最大 30 天），或使用 `period` 參數獲取更長時間範圍的數據。

### 4. 為什麼有些股票代號無法獲取數據？

- 確認股票代號正確
- 確認該股票在 yfinance 中有數據
- 某些冷門股票可能沒有數據

### 5. 如何減少 API 請求次數？

使用批量獲取 API (`/api/stock/batch`) 一次獲取多個股票資訊。

---

## 進階使用

### 自定義時間範圍

```python
# 在 backend/services/yfinance_service.py 中修改
# 可以調整 period 和 interval 參數來獲取不同時間範圍的數據
```

### 添加新的數據欄位

1. 在 `backend/services/yfinance_service.py` 中添加數據處理邏輯
2. 在 `backend/main.py` 中更新 API 端點
3. 在前端 `frontend/src/services/stockApi.ts` 中添加對應的 TypeScript 介面

---

## 📚 相關文件

- `backend/services/yfinance_service.py` - yfinance 服務實現
- `backend/main.py` - API 端點定義
- `frontend/src/services/stockApi.ts` - 前端 API 服務
- `frontend/src/pages/Function1Page.tsx` - 前端使用範例

---

## 提示

1. **開發時**：使用 `--log-level warning` 減少日誌輸出
2. **生產環境**：建議添加 API 速率限制和錯誤重試機制
3. **數據更新**：yfinance 數據有延遲，非即時數據
4. **測試**：使用 `backend/test_connection.py` 測試連接

---

如有問題，請查看 `backend/README.md` 或檢查後端日誌。

