# Finfo

一個完整的股票數據分析平台，使用 FastAPI 作為後端，React + TypeScript + Vite 作為前端，提供台灣股票數據查詢、財務報表分析、股票群組管理和 BOM（物料清單）管理等功能。

## 專案特色

- **完整的股票數據服務**：從 Yahoo Finance 獲取台灣股票數據
- **資料庫持久化**：自動將 API 獲取的數據保存到資料庫，避免重複請求
- **智能快取系統**：內存快取和資料庫快取雙層架構，提升響應速度
- **財務報表分析**：支援損益表、資產負債表、現金流量表
- **股票群組管理**：可自定義股票群組，方便分類管理
- **BOM 管理**：支援 ETF 等產品的成分股管理
- **API 限額追蹤**：監控 API 使用情況，避免過量請求
- **現代化前端界面**：使用 React 19 + TypeScript + Vite 構建

## 技術棧

### 後端
- **Python 3.10+**
- **FastAPI 0.121.0** - 現代化的 Web 框架
- **SQLite/PostgreSQL** - 資料庫支援（可配置，預設 PostgreSQL）
- **yfinance 0.2.50** - Yahoo Finance 數據獲取
- **pandas 2.2.3** - 數據處理
- **Pydantic 2.12.3** - 數據驗證
- **psycopg2-binary** - PostgreSQL 驅動
- **Uvicorn** - ASGI 伺服器

### 前端
- **React 19.1.1** - UI 框架
- **TypeScript 5.9.3** - 型別安全
- **Vite 7.2.2** - 建置工具
- **React Router DOM 7.9.5** - 路由管理
- **Recharts 3.3.0** - 圖表視覺化

## 目錄結構

```
Finfo/
├── backend/              # FastAPI 後端
│   ├── main.py           # 主應用程式
│   ├── database.py       # 資料庫連接管理（支援 SQLite/PostgreSQL）
│   ├── crud.py           # 資料庫 CRUD 操作
│   ├── db_utils.py       # 資料庫工具函數（SQL 兼容性處理）
│   ├── services/         # 服務層
│   │   ├── yfinance_service.py      # 股票數據服務
│   │   ├── cache_service.py         # 快取服務（內存+資料庫雙層快取）
│   │   ├── api_quota_tracker.py     # API 限額追蹤
│   │   └── chart_service.py          # 圖表生成服務
│   ├── DATABASE_CONFIG.md           # 資料庫配置文檔
│   ├── TESTING.md                   # 測試指南
│   ├── YFINANCE_GUIDE.md             # yfinance 使用指南
│   ├── requirements.txt  # Python 依賴
│   ├── start_server.bat  # Windows 啟動腳本
│   └── start_server.sh   # Linux/Mac 啟動腳本
├── frontend/             # React 前端
│   ├── src/
│   │   ├── pages/        # 頁面組件
│   │   ├── components/   # UI 組件
│   │   │   ├── Common/   # 通用組件（LoadingSpinner, ApiQuotaDisplay, TableToolbar）
│   │   │   ├── Function1/ # 數據整合組件
│   │   │   ├── Function2/ # 股票基本檔管理組件
│   │   │   └── Financial/ # 財務報表組件
│   │   ├── services/     # API 服務（stockApi, stockGroupApi）
│   │   ├── types/        # TypeScript 型別定義
│   │   ├── contexts/     # React Context 狀態管理
│   │   └── utils/        # 工具函數
│   ├── package.json      # Node.js 依賴
│   └── vite.config.ts    # Vite 配置（含 API 代理）
└── README.md            # 本文件
```

## 快速開始

### 前置需求

- Python 3.10+（Windows 可用 `py -3`）
- Node.js 18+
- （可選）PostgreSQL 12+（預設使用 SQLite）

### 1. 啟動後端

```powershell
# 進入後端目錄
cd backend

# 建立虛擬環境（如果還沒有）
py -3 -m venv .venv

# 啟動虛擬環境
.\.venv\Scripts\Activate.ps1

# 安裝依賴
pip install -r requirements.txt

# 啟動服務
python -m uvicorn main:app --reload --port 8000
```

後端啟動於 `http://127.0.0.1:8000/`

- API 文檔：`http://127.0.0.1:8000/docs` (Swagger UI)
- API 文檔：`http://127.0.0.1:8000/redoc` (ReDoc)

### 2. 啟動前端

另開一個終端機：

```powershell
# 進入前端目錄
cd frontend

# 安裝依賴（首次運行）
npm install

# 啟動開發伺服器
npm run dev
```

前端啟動於 `http://localhost:5173/`

> 在開發模式下，`frontend/vite.config.ts` 已設定代理 `/api` → `http://127.0.0.1:8000`

## 主要功能

### 1. 股票數據查詢
- 股票基本資訊
- 盤中即時數據
- 日交易歷史數據
- 大盤指數數據
- 批量查詢

### 2. 財務報表分析
- 損益表（Income Statement）
- 資產負債表（Balance Sheet）
- 現金流量表（Cash Flow Statement）

### 3. 股票群組管理
- 創建/編輯/刪除股票群組
- 將股票加入/移除群組
- 查詢股票所屬群組
- 批量管理

### 4. BOM（物料清單）管理
- 管理 ETF 等產品的成分股
- 支援數量、權重、單位等屬性
- 樹狀結構查詢

### 5. 數據持久化
- 自動保存 API 獲取的數據到資料庫
- 優先從資料庫讀取，減少 API 請求
- 支援 SQLite 和 PostgreSQL

### 6. 快取系統
- 內存快取（Memory Cache）
- 資料庫快取（Database Cache）
- 可配置的 TTL（Time To Live）

### 7. API 限額追蹤
- 監控 API 請求次數
- 追蹤成功率和響應時間
- 防止過量請求

## 資料庫配置

### PostgreSQL（預設）

系統預設使用 PostgreSQL。在 `backend` 目錄創建 `.env` 文件：

```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finfo
DB_USER=postgres
DB_PASSWORD=your_password
```

### SQLite（可選）

如需使用 SQLite，在 `backend` 目錄的 `.env` 文件中設定：

```env
DB_TYPE=sqlite
SQLITE_DB_PATH=finfo.db
```

無需額外配置，系統會自動創建資料庫文件。

詳細配置說明請參考 [資料庫配置文檔](./backend/DATABASE_CONFIG.md)

## API 端點概覽

### 基礎端點
- `GET /` - 健康檢查
- `GET /api/hello` - 測試連接
- `POST /api/contact` - 聯絡表單

### 股票數據
- `GET /api/stock/info/{stock_code}` - 獲取股票基本資訊
- `GET /api/stock/intraday/{stock_code}` - 獲取盤中數據
- `GET /api/stock/daily/{stock_code}` - 獲取日交易數據
- `GET /api/stock/financial/{stock_code}` - 獲取財務報表
- `GET /api/stock/batch` - 批量獲取股票資訊
- `GET /api/stock/market-index` - 獲取大盤指數

### 股票群組管理
- `POST /api/stock-groups` - 創建群組
- `GET /api/stock-groups` - 獲取所有群組
- `GET /api/stock-groups/{group_id}` - 獲取群組詳情
- `PUT /api/stock-groups/{group_id}` - 更新群組
- `DELETE /api/stock-groups/{group_id}` - 刪除群組
- `POST /api/stock-groups/{group_id}/stocks` - 將股票加入群組
- `DELETE /api/stock-groups/{group_id}/stocks/{stock_code}` - 移除股票
- `GET /api/stock-groups/{group_id}/stocks` - 獲取群組中的股票
- `GET /api/stocks/{stock_code}/groups` - 獲取股票所屬群組
- `GET /api/stocks/groups` - 獲取所有股票的群組對應關係

### BOM 管理
- `POST /api/stocks/{parent_stock_code}/bom` - 添加 BOM 項目
- `GET /api/stocks/{stock_code}/bom` - 獲取股票的 BOM
- `GET /api/stocks/{stock_code}/bom/parents` - 獲取包含該股票的父股票
- `PUT /api/stocks/{parent_stock_code}/bom/{child_stock_code}` - 更新 BOM 項目
- `DELETE /api/stocks/{parent_stock_code}/bom/{child_stock_code}` - 刪除 BOM 項目
- `GET /api/stocks/{stock_code}/bom/tree` - 獲取 BOM 樹狀結構

### 統計與監控
- `GET /api/stats/quota` - 獲取 API 限額統計
- `GET /api/stats/cache` - 獲取快取統計

詳細的 API 文檔請訪問 `http://127.0.0.1:8000/docs`

## 開發指南

### 後端開發

1. **添加新的 API 端點**：
   - 在 `main.py` 中添加路由函數
   - 如需資料庫操作，在 `crud.py` 中添加函數
   - 如需數據獲取邏輯，在 `services/` 中添加服務

2. **資料庫操作**：
   - 使用 `crud.py` 中的函數進行資料庫操作
   - 使用 `prepare_sql()` 確保 SQL 語句兼容 SQLite 和 PostgreSQL

3. **快取使用**：
   - 使用 `services/cache_service.py` 中的快取函數
   - 內存快取和資料庫快取雙層架構
   - 使用 `get_cache_key()` 生成快取鍵
   - 不同數據類型有不同的 TTL 設定

4. **API 限額追蹤**：
   - 使用 `services/api_quota_tracker.py` 追蹤 API 使用情況
   - 自動記錄請求次數、成功率、響應時間
   - 提供統計資訊供前端顯示

### 前端開發

1. **添加新頁面**：
   - 在 `src/pages/` 中創建頁面組件
   - 在 `App.tsx` 中添加路由

2. **API 調用**：
   - 在 `src/services/stockApi.ts` 中添加 API 函數
   - 使用 TypeScript 型別確保型別安全

3. **狀態管理**：
   - 使用 React Context 進行跨組件狀態共享
   - 使用 localStorage 進行本地持久化

## 部署建議

### 後端
- 使用 `uvicorn` 或 `gunicorn`（Linux）部署
- 設定 CORS 允許實際前端域名
- 配置環境變數（資料庫連接等）
- 建議使用 PostgreSQL 作為生產環境資料庫

### 前端
- 執行 `npm run build` 建置生產版本
- 將 `dist/` 目錄部署到 CDN 或靜態伺服器
- 正式環境建議由反向代理（例如 Nginx）統一轉發 `/api` 到後端

## 相關文檔

- [後端文檔](./backend/README.md) - 詳細的後端架構和 API 說明
- [前端文檔](./frontend/README.md) - 詳細的前端架構和組件說明
- [資料庫配置](./backend/DATABASE_CONFIG.md) - 資料庫配置指南
- [測試指南](./backend/TESTING.md) - 測試相關文檔
- [yfinance 使用指南](./backend/YFINANCE_GUIDE.md) - yfinance 庫使用說明

## 授權

本專案為 Finfo 的一部分。
