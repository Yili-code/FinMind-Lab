# Finfo Backend Documentation

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

Finfo Backend 是一個基於 FastAPI 的股票數據服務後端，主要功能是從 Yahoo Finance 獲取台灣股票數據，並提供 RESTful API 給前端應用程式使用。後端支援獲取股票基本資訊、盤中數據、日交易數據、大盤指數以及財務報表等資訊。

---

## 技術棧

### 核心框架與語言
- **Python**: 主要開發語言
- **FastAPI**: 現代化的 Web 框架，提供自動 API 文檔生成
- **Uvicorn**: ASGI 伺服器，用於運行 FastAPI 應用

### 數據處理
- **yfinance 0.2.50**: Yahoo Finance 數據獲取庫
- **pandas 2.2.3**: 數據處理和分析庫
- **numpy**: 數值計算庫
- **matplotlib**: 圖表生成庫
- **mplfinance**: 金融圖表庫

### 資料庫
- **SQLite3**: 輕量級資料庫（Python 內建，可選）
- **PostgreSQL**: 生產級資料庫（預設，需 psycopg2-binary）

### 數據驗證與序列化
- **Pydantic**: 數據驗證和設定管理
- **email-validator**: 電子郵件格式驗證

### 其他依賴
- **python-dotenv**: 環境變數管理
- **python-multipart**: 表單數據處理
- **websockets**: WebSocket 支援（FastAPI 依賴）
- **psycopg2-binary**: PostgreSQL 資料庫驅動

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
│  │  - SQLite/PostgreSQL 連接管理                    │   │
│  │  - 資料庫初始化                                   │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                       │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  services/cache_service.py                       │   │
│  │  - 內存快取管理                                   │   │
│  │  - 資料庫快取管理                                 │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                       │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  services/api_quota_tracker.py                    │   │
│  │  - API 限額追蹤                                   │   │
│  │  - 請求統計                                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  PostgreSQL/    │
              │  SQLite DB      │
              │  finfo          │
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
├── database.py                  # 資料庫連接與初始化（支援 SQLite/PostgreSQL）
├── db_utils.py                  # 資料庫工具函數（SQL 兼容性處理）
├── crud.py                      # 資料庫 CRUD 操作
├── requirements.txt             # Python 依賴套件列表
├── start_server.sh              # Linux/Mac 啟動腳本
├── start_server.bat             # Windows 啟動腳本
├── start_server_no_reload.bat   # Windows 無重載啟動腳本
├── README.md                   # 本文件
├── DATABASE_CONFIG.md           # 資料庫配置文檔
├── TESTING.md                   # 測試文檔
├── YFINANCE_GUIDE.md            # yfinance 使用指南
└── services/
    ├── __init__.py              # 服務模組初始化
    ├── yfinance_service.py      # yfinance 服務封裝
    ├── cache_service.py          # 快取服務（內存+資料庫雙層快取）
    ├── api_quota_tracker.py     # API 限額追蹤服務
    └── chart_service.py          # 圖表生成服務
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

#### 3. `services/cache_service.py` - 快取服務層
**職責**:
- 提供內存快取和資料庫快取雙層架構
- 管理快取 TTL（Time To Live）
- 自動清理過期快取

**相依關係**:
- 依賴: `db_utils`, `database`, `time`, `logging`
- 被依賴: `main.py`

**主要函數**:
- `get_from_memory_cache()`: 從內存快取獲取數據
- `set_to_memory_cache()`: 設置內存快取
- `get_cache_key()`: 生成快取鍵
- `get_cache_stats()`: 獲取快取統計資訊

#### 4. `services/api_quota_tracker.py` - API 限額追蹤服務
**職責**:
- 追蹤 yfinance API 使用情況
- 記錄請求次數、成功率、響應時間
- 提供統計資訊

**相依關係**:
- 依賴: `time`, `logging`, `collections`, `dataclasses`
- 被依賴: `main.py`

**主要功能**:
- `record_request()`: 記錄 API 請求
- `get_stats()`: 獲取統計資訊（每分鐘/每小時/每天）
- 自動追蹤請求限額

#### 5. `db_utils.py` - 資料庫工具函數
**職責**:
- 處理 SQLite 和 PostgreSQL 的 SQL 語法差異
- 提供統一的 SQL 介面

**相依關係**:
- 依賴: `database`
- 被依賴: `crud.py`, `cache_service.py`

**主要函數**:
- `prepare_sql()`: 將 SQL 語句轉換為當前資料庫格式

#### 6. `database.py` - 資料庫管理
**職責**:
- SQLite/PostgreSQL 資料庫連接管理
- 資料庫初始化
- 表格創建和索引建立

**相依關係**:
- 依賴: `sqlite3` (Python 內建), `psycopg2` (PostgreSQL)
- 被依賴: `crud.py`, `cache_service.py`

**主要功能**:
- `get_db_connection()`: 取得資料庫連線
- `init_database()`: 初始化資料庫表格
- `get_param_placeholder()`: 獲取參數佔位符（%s 或 ?）

#### 7. `crud.py` - 資料庫操作
**職責**:
- 實現所有資料庫 CRUD 操作
- 提供資料庫操作的業務邏輯層

**相依關係**:
- 依賴: `database.py`, `db_utils.py`, `uuid`, `datetime`
- 被依賴: `main.py`

**主要功能**:
- 股票基本檔的 CRUD 操作
- 損益表的 CRUD 操作
- 資產負債表的 CRUD 操作
- 現金流量表的 CRUD 操作
- 股票群組管理（創建、查詢、更新、刪除）
- 股票群組與股票的關聯管理
- BOM（物料清單）管理

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

### 股票群組管理端點

| 方法 | 路徑 | 說明 | 參數 |
|------|------|------|------|
| POST | `/api/stock-groups` | 創建股票群組 | `groupName`, `description` (JSON) |
| GET | `/api/stock-groups` | 獲取所有群組 | 無 |
| GET | `/api/stock-groups/{group_id}` | 獲取群組詳情 | `group_id` (路徑) |
| PUT | `/api/stock-groups/{group_id}` | 更新群組 | `groupName`, `description` (JSON) |
| DELETE | `/api/stock-groups/{group_id}` | 刪除群組 | `group_id` (路徑) |
| POST | `/api/stock-groups/{group_id}/stocks` | 將股票加入群組 | `stockCode` (JSON) |
| DELETE | `/api/stock-groups/{group_id}/stocks/{stock_code}` | 移除股票 | `group_id`, `stock_code` (路徑) |
| GET | `/api/stock-groups/{group_id}/stocks` | 獲取群組中的股票 | `group_id` (路徑) |
| GET | `/api/stocks/{stock_code}/groups` | 獲取股票所屬群組 | `stock_code` (路徑) |
| GET | `/api/stocks/groups` | 獲取所有股票的群組對應關係 | 無 |

### BOM（物料清單）管理端點

| 方法 | 路徑 | 說明 | 參數 |
|------|------|------|------|
| POST | `/api/stocks/{parent_stock_code}/bom` | 添加 BOM 項目 | `childStockCode`, `quantity`, `weight`, `unit` (JSON) |
| GET | `/api/stocks/{stock_code}/bom` | 獲取股票的 BOM | `stock_code` (路徑) |
| GET | `/api/stocks/{stock_code}/bom/parents` | 獲取包含該股票的父股票 | `stock_code` (路徑) |
| PUT | `/api/stocks/{parent_stock_code}/bom/{child_stock_code}` | 更新 BOM 項目 | `quantity`, `weight`, `unit` (JSON) |
| DELETE | `/api/stocks/{parent_stock_code}/bom/{child_stock_code}` | 刪除 BOM 項目 | `parent_stock_code`, `child_stock_code` (路徑) |
| GET | `/api/stocks/{stock_code}/bom/tree` | 獲取 BOM 樹狀結構 | `stock_code` (路徑) |

### 統計與監控端點

| 方法 | 路徑 | 說明 | 參數 |
|------|------|------|------|
| GET | `/api/stats/quota` | 獲取 API 限額統計 | 無 |
| GET | `/api/stats/cache` | 獲取快取統計 | 無 |

### API 文檔

FastAPI 自動生成互動式 API 文檔：
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## 資料庫結構

### 資料庫: `finfo` (PostgreSQL) 或 `finfo.db` (SQLite)

#### Table 1: `stock_basics` - 股票基本檔
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

#### Table 2: `income_statements` - 損益表
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

#### Table 3: `balance_sheets` - 資產負債表
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

#### Table 4: `cash_flows` - 現金流量表
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

#### Table 5: `daily_trades` - 日交易數據
儲存股票的日交易數據。

**主要欄位**:
- `id`: 主鍵
- `stock_code`: 股票代號
- `trade_date`: 交易日期
- `open_price`: 開盤價
- `high_price`: 最高價
- `low_price`: 最低價
- `close_price`: 收盤價
- `volume`: 成交量
- 其他交易數據...

#### Table 6: `stock_groups` - 股票群組
儲存股票群組資訊。

**主要欄位**:
- `id`: 主鍵（UUID）
- `group_name`: 群組名稱
- `description`: 群組描述
- `created_at`: 創建時間
- `updated_at`: 更新時間

#### Table 7: `stock_group_members` - 股票群組成員
儲存股票與群組的關聯關係。

**主要欄位**:
- `id`: 主鍵
- `group_id`: 群組 ID（外鍵）
- `stock_code`: 股票代號
- `created_at`: 加入時間

#### Table 8: `bom_items` - BOM（物料清單）項目
儲存股票的 BOM 資訊（例如 ETF 的成分股）。

**主要欄位**:
- `id`: 主鍵
- `parent_stock_code`: 父股票代號
- `child_stock_code`: 子股票代號
- `quantity`: 數量
- `weight`: 權重
- `unit`: 單位
- `created_at`: 創建時間
- `updated_at`: 更新時間

#### Table 9: `cache_items` - 快取項目
儲存資料庫快取的數據。

**主要欄位**:
- `id`: 主鍵
- `cache_key`: 快取鍵（唯一）
- `cache_value`: 快取值（JSON）
- `expires_at`: 過期時間
- `created_at`: 創建時間

**索引**:
- `idx_stock_basics_code`: 股票代號索引
- `idx_income_stock_code`: 損益表股票代號索引
- `idx_balance_stock_code`: 資產負債表股票代號索引
- `idx_cashflow_stock_code`: 現金流量表股票代號索引
- `idx_daily_trades_stock_date`: 日交易數據股票代號和日期索引
- `idx_stock_group_members_group`: 股票群組成員群組 ID 索引
- `idx_stock_group_members_stock`: 股票群組成員股票代號索引
- `idx_bom_items_parent`: BOM 項目父股票代號索引
- `idx_bom_items_child`: BOM 項目子股票代號索引
- `idx_cache_items_key`: 快取項目鍵索引
- `idx_cache_items_expires`: 快取項目過期時間索引

---

## 安裝與運行

### 前置需求

- Python 3.10 或更高版本
- pip (Python 套件管理器)
- （可選）PostgreSQL 12+（預設使用 PostgreSQL，也可使用 SQLite）

### 安裝步驟

1. **進入後端目錄**:
   ```bash
   cd backend
   ```

2. **安裝依賴套件**:
   ```bash
   pip install -r requirements.txt
   ```

3. **配置資料庫** (可選):
   在 `backend` 目錄創建 `.env` 文件：
   ```env
   DB_TYPE=postgresql  # 或 sqlite
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=finfo
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```
   詳細配置請參考 [DATABASE_CONFIG.md](./DATABASE_CONFIG.md)

4. **初始化資料庫**:
   資料庫會在首次啟動時自動初始化，無需手動執行

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

1. 在 `database.py` 的 `init_database()` 中添加表格創建 SQL（使用 `prepare_sql()` 確保兼容性）
2. 在 `crud.py` 中添加 CRUD 操作函數（使用 `prepare_sql()` 處理 SQL 語法差異）
3. 如需 Pydantic 模型，在 `main.py` 中定義（目前主要使用字典和資料庫直接操作）

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
   - 系統已內建 API 限額追蹤，可監控使用情況

2. **超時設定**: 所有 yfinance 請求都設置了 `timeout=10` 秒

3. **快取系統**: 
   - 已實現內存快取和資料庫快取雙層架構
   - 不同數據類型有不同的 TTL 設定
   - 自動清理過期快取

4. **資料庫優化**:
   - 已建立適當的索引提升查詢效能
   - 使用 `prepare_sql()` 確保 SQL 語句兼容 SQLite 和 PostgreSQL

### 注意事項

1. **台股代號格式**: yfinance 使用 `.TW` 後綴，例如 `2330.TW`
2. **市場休市**: 在市場休市時，某些 API 可能返回空數據
3. **數據準確性**: 部分數據（如內盤、外盤、外資等）是估算值
4. **警告訊息**: yfinance 會產生許多警告訊息，已通過 `warnings.filterwarnings()` 抑制

---

## 相關文檔

- [DATABASE_CONFIG.md](./DATABASE_CONFIG.md) - 資料庫配置指南
- [TESTING.md](./TESTING.md) - 測試指南
- [YFINANCE_GUIDE.md](./YFINANCE_GUIDE.md) - yfinance 使用指南

---

## 授權

本專案為 Finfo 的一部分。
