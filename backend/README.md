# FinMind Lab Backend Documentation

##  目錄

- [專案概述](#專案概述)
- [技術棧](#技術棧)
- [架構說明](#架構說明)
- [檔案結構與相依關係](#檔案結構與相依關係)
- [API 端點](#api-端點)
- [資料庫結構](#資料庫結構)
- [安裝與運行](#安裝與運行)
- [開發指南](#開發指南)

---

## 專案概述

FinMind Lab Backend 是一個基於 FastAPI 的股票數據服務後端，主要功能是從 Yahoo Finance 獲取台灣股票數據，並提供 RESTful API 給前端應用程式使用。後端支援獲取股票基本資訊、盤中數據、日交易數據、大盤指數以及財務報表等資訊。

---

## 技術棧

### 核心框架與語言
- **Python**: 主要開發語言
- **FastAPI**: 現代化的 Web 框架，提供自動 API 文檔生成
- **Uvicorn**: ASGI 伺服器，用於運行 FastAPI 應用

### 數據處理
- **yfinance**: Yahoo Finance 數據獲取庫
- **pandas**: 數據處理和分析庫
- **SQLite3**: 輕量級資料庫（Python 內建）

### 數據驗證與序列化
- **Pydantic**: 數據驗證和設定管理
- **email-validator**: 電子郵件格式驗證

### 其他依賴
- **python-dotenv**: 環境變數管理
- **python-multipart**: 表單數據處理
- **websockets**: WebSocket 支援（FastAPI 依賴）

### 開發工具
- **watchfiles**: 檔案監控（用於自動重載）
- **httptools**: HTTP 工具庫

---

## 架構說明

### 整體架構

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                   │
│              (http://localhost:5173)                    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP Requests
                       │ (RESTful API)
┌──────────────────────▼──────────────────────────────────┐
│                    FastAPI Server                       │
│              (http://127.0.0.1:8000/)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  main.py                                         │   │
│  │  - API 路由定義                                   │   │
│  │  - CORS 中介層                                    │   │
│  │  - 錯誤處理                                       │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                       │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  services/yfinance_service.py                    │   │
│  │  - 股票數據獲取邏輯                               │   │
│  │  - yfinance 封裝                                 │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                       │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  models.py                                       │   │
│  │  - Pydantic 數據模型                              │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                       │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  crud.py                                         │   │
│  │  - 資料庫 CRUD 操作                               │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                       │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  database.py                                     │   │
│  │  - SQLite 連接管理                                │   │
│  │  - 資料庫初始化                                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    SQLite DB    │
              │  finmind_lab.db │
              └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Yahoo Finance  │
              │   (yfinance)    │
              └─────────────────┘
```

### 請求流程

1. **前端請求** → FastAPI 接收 HTTP 請求
2. **路由處理** → `main.py` 中的路由函數處理請求
3. **業務邏輯** → 調用 `services/yfinance_service.py` 中的函數獲取數據
4. **數據處理** → 使用 pandas 處理和轉換數據
5. **數據驗證** → 使用 Pydantic 模型驗證數據格式
6. **返回響應** → 將處理後的數據以 JSON 格式返回給前端

---

## 檔案結構與相依關係

### 檔案結構

```
backend/
├── main.py                      # 主應用程式入口
├── models.py                    # Pydantic 數據模型
├── database.py                  # 資料庫連接與初始化
├── crud.py                      # 資料庫 CRUD 操作
├── requirements.txt             # Python 依賴套件列表
├── start_server.sh              # Linux/Mac 啟動腳本
├── start_server.bat             # Windows 啟動腳本
├── check_backend.py             # 後端診斷工具
├── test_api.py                  # API 測試腳本
├── test_connection.py           # 連接測試腳本
├── test_yfinance.py             # yfinance 測試腳本
├── README.md                    # 本文件
├── TESTING.md                   # 測試文檔
├── YFINANCE_GUIDE.md            # yfinance 使用指南
└── services/
    ├── __init__.py              # 服務模組初始化
    └── yfinance_service.py      # yfinance 服務封裝
```

### 檔案相依關係圖

```
main.py
  ├── FastAPI (框架)
  ├── CORS Middleware (中介層)
  ├── services/yfinance_service.py
  │     ├── yfinance (外部庫)
  │     ├── pandas (數據處理)
  │     └── logging (日誌)
  ├── models.py (數據模型)
  │     └── Pydantic (驗證)
  ├── crud.py (資料庫操作)
  │     ├── database.py (連接管理)
  │     │     └── sqlite3 (資料庫)
  │     └── models.py (數據模型)
  └── Pydantic BaseModel (表單驗證)
```

### 各檔案詳細說明

#### 1. `main.py` - 主應用程式
**職責**:
- FastAPI 應用程式初始化
- API 路由定義
- CORS 中介層配置
- 錯誤處理

**相依關係**:
- 依賴: `services/yfinance_service.py`, `pydantic`, `fastapi`
- 被依賴: 無（應用程式入口）

**主要功能**:
- 定義所有 API 端點
- 處理 HTTP 請求和響應
- 管理 CORS 設定以允許前端存取

#### 2. `services/yfinance_service.py` - 數據服務層
**職責**:
- 封裝 yfinance 庫的調用
- 處理股票數據獲取邏輯
- 數據格式轉換和清理

**相依關係**:
- 依賴: `yfinance`, `pandas`, `datetime`, `logging`
- 被依賴: `main.py`

**主要函數**:
- `get_yfinance_ticker()`: 將台股代號轉換為 yfinance 格式
- `get_stock_info()`: 獲取股票基本資訊
- `get_intraday_data()`: 獲取盤中即時數據
- `get_daily_trade_data()`: 獲取日交易檔數據
- `get_market_index_data()`: 獲取大盤指數數據
- `get_financial_statements()`: 獲取財務報表數據

#### 3. `models.py` - 數據模型
**職責**:
- 定義 Pydantic 數據模型
- 數據驗證和序列化

**相依關係**:
- 依賴: `pydantic`
- 被依賴: `crud.py`, `main.py`

**主要模型**:
- `StockBasicBase`, `StockBasicCreate`, `StockBasic`: 股票基本檔
- `IncomeStatementBase`, `IncomeStatementCreate`, `IncomeStatement`: 損益表
- `BalanceSheetBase`, `BalanceSheetCreate`, `BalanceSheet`: 資產負債表
- `CashFlowBase`, `CashFlowCreate`, `CashFlow`: 現金流量表

#### 4. `database.py` - 資料庫管理
**職責**:
- SQLite 資料庫連接管理
- 資料庫初始化
- 表格創建和索引建立

**相依關係**:
- 依賴: `sqlite3` (Python 內建)
- 被依賴: `crud.py`

**主要功能**:
- `get_db_connection()`: 取得資料庫連線
- `init_database()`: 初始化資料庫表格

#### 5. `crud.py` - 資料庫操作
**職責**:
- 實現所有資料庫 CRUD 操作
- 提供資料庫操作的業務邏輯層

**相依關係**:
- 依賴: `database.py`, `models.py`, `uuid`, `datetime`
- 被依賴: 目前未在 main.py 中使用（預留功能）

**主要功能**:
- 股票基本檔的 CRUD 操作
- 損益表的 CRUD 操作
- 資產負債表的 CRUD 操作
- 現金流量表的 CRUD 操作

---

## API 端點

### 基礎端點

| 方法 | 路徑 | 說明 | 參數 |
|------|------|------|------|
| GET | `/` | 測試 API 是否正常運作 | 無 |
| GET | `/api/hello` | 測試前端連接 | 無 |
| POST | `/api/contact` | 處理聯絡表單提交 | `ContactForm` (JSON) |

### 股票數據端點

| 方法 | 路徑 | 說明 | 參數 |
|------|------|------|------|
| GET | `/api/stock/info/{stock_code}` | 獲取股票基本資訊 | `stock_code` (路徑參數) |
| GET | `/api/stock/intraday/{stock_code}` | 獲取盤中即時數據 | `stock_code` (路徑), `period` (查詢), `interval` (查詢) |
| GET | `/api/stock/daily/{stock_code}` | 獲取日交易檔數據 | `stock_code` (路徑), `days` (查詢, 1-30) |
| GET | `/api/stock/batch` | 批量獲取股票資訊 | `stock_codes` (查詢, 逗號分隔) |
| GET | `/api/stock/market-index` | 獲取大盤指數數據 | `index_code` (查詢), `days` (查詢, 1-30) |
| GET | `/api/stock/financial/{stock_code}` | 獲取財務報表數據 | `stock_code` (路徑) |

### API 文檔

FastAPI 自動生成互動式 API 文檔：
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## 資料庫結構

### SQLite 資料庫: `finmind_lab.db`

#### Table 3: `stock_basics` - 股票基本檔
儲存股票的基本資訊，包括代號、名稱、產業、財務指標等。

**主要欄位**:
- `id`: 主鍵
- `stock_code`: 股票代號 (唯一)
- `stock_name`: 股票名稱
- `industry`: 產業別
- `market`: 上市/上櫃
- `capital`: 股本
- `pe_ratio`: 本益比
- 其他財務指標...

#### Table 4: `income_statements` - 損益表
儲存股票的損益表數據。

**主要欄位**:
- `id`: 主鍵
- `stock_code`: 股票代號
- `period`: 期間 (年/季)
- `revenue`: 營業收入
- `gross_profit`: 營業毛利
- `operating_income`: 營業利益
- `net_income`: 稅後淨利
- 其他損益項目...

#### Table 5: `balance_sheets` - 資產負債表
儲存股票的資產負債表數據。

**主要欄位**:
- `id`: 主鍵
- `stock_code`: 股票代號
- `period`: 期間
- `total_assets`: 總資產
- `shareholders_equity`: 股東權益
- `current_assets`: 流動資產
- `current_liabilities`: 流動負債
- 其他資產負債項目...

#### Table 6: `cash_flows` - 現金流量表
儲存股票的現金流量表數據。

**主要欄位**:
- `id`: 主鍵
- `stock_code`: 股票代號
- `period`: 期間
- `operating_cash_flow`: 營業現金流
- `investing_cash_flow`: 投資現金流
- `financing_cash_flow`: 融資現金流
- `free_cash_flow`: 自由現金流
- `net_cash_flow`: 淨現金流
- 其他現金流項目...

**索引**:
- `idx_stock_basics_code`: 股票代號索引
- `idx_income_stock_code`: 損益表股票代號索引
- `idx_balance_stock_code`: 資產負債表股票代號索引
- `idx_cashflow_stock_code`: 現金流量表股票代號索引

---

## 安裝與運行

### 前置需求

- Python 3.8 或更高版本
- pip (Python 套件管理器)

### 安裝步驟

1. **進入後端目錄**:
   ```bash
   cd backend
   ```

2. **安裝依賴套件**:
   ```bash
   pip install -r requirements.txt
   ```

3. **初始化資料庫** (可選):
   ```bash
   python database.py
   ```

### 啟動伺服器

#### Windows
```bash
start_server.bat
```
或手動啟動:
```bash
python -m uvicorn main:app --reload --port 8000
```

#### Linux/Mac
```bash
chmod +x start_server.sh
./start_server.sh
```
或手動啟動:
```bash
python -m uvicorn main:app --reload --port 8000
```

### 驗證安裝

1. **檢查後端狀態**:
   ```bash
   python check_backend.py
   ```

2. **測試 API 連接**:
   ```bash
   python test_connection.py
   ```

3. **測試 API 端點**:
   ```bash
   python test_api.py
   ```

4. **測試 yfinance**:
   ```bash
   python test_yfinance.py
   ```

### 訪問 API

- **API 基礎 URL**: `http://127.0.0.1:8000/`
- **Swagger 文檔**: `http://127.0.0.1:8000/docs`
- **ReDoc 文檔**: `http://127.0.0.1:8000/redoc`

---

## 開發指南

### 開發環境設定

1. **環境變數** (可選):
   創建 `.env` 檔案:
   ```env
   API_PORT=8000
   DEBUG=True
   ```

2. **日誌設定**:
   日誌級別在 `main.py` 和 `yfinance_service.py` 中設定，預設為 ERROR/WARNING 級別。

### 添加新的 API 端點

1. 在 `main.py` 中添加路由函數:
   ```python
   @app.get("/api/your-endpoint")
   async def your_function():
       # 實現邏輯
       return {"message": "success"}
   ```

2. 如需新的數據獲取邏輯，在 `services/yfinance_service.py` 中添加函數。

### 添加新的資料庫表格

1. 在 `models.py` 中定義 Pydantic 模型
2. 在 `database.py` 的 `init_database()` 中添加表格創建 SQL
3. 在 `crud.py` 中添加 CRUD 操作函數

### 錯誤處理

- 使用 FastAPI 的 `HTTPException` 處理錯誤
- 所有 API 端點都包含 try-except 錯誤處理
- 日誌記錄在 `yfinance_service.py` 中使用 `logging` 模組

### 數據格式轉換

- yfinance 返回的數據可能包含 numpy 類型，需要轉換為 Python 原生類型
- 使用 `float()` 和 `int()` 進行類型轉換
- 處理 `None` 值和空數據情況

### 性能優化建議

1. **請求頻率**: yfinance 對請求頻率有限制，建議：
   - 單個股票資訊請求間隔至少 1 秒
   - 批量請求時使用適當的延遲

2. **超時設定**: 所有 yfinance 請求都設置了 `timeout=10` 秒

3. **緩存**: 可以考慮添加 Redis 緩存層來減少對 yfinance 的請求

### 注意事項

1. **台股代號格式**: yfinance 使用 `.TW` 後綴，例如 `2330.TW`
2. **市場休市**: 在市場休市時，某些 API 可能返回空數據
3. **數據準確性**: 部分數據（如內盤、外盤、外資等）是估算值
4. **警告訊息**: yfinance 會產生許多警告訊息，已通過 `warnings.filterwarnings()` 抑制

---

## 相關文檔

- [TESTING.md](./TESTING.md) - 測試指南
- [YFINANCE_GUIDE.md](./YFINANCE_GUIDE.md) - yfinance 使用指南

---

## 授權

本專案為 FinMind Lab 的一部分。
