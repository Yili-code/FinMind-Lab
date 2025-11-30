# Finfo - 前端專案架構說明

##  專案概述

Finfo 是一個專為金融數據分析與研究打造的前端應用程式，提供豐富的股票數據查詢、視覺化分析與財務報表功能。

##  技術棧

### 核心框架與語言
- **React 19.1.1** - 前端 UI 框架
- **TypeScript 5.9.3** - 型別安全的 JavaScript 超集
- **Vite 7.1.7** - 現代化的前端建置工具與開發伺服器

### 路由與導航
- **React Router DOM 7.9.5** - 單頁應用程式（SPA）路由管理

### 資料視覺化
- **Recharts 3.3.0** - React 圖表庫，用於繪製股票走勢圖

### 開發工具
- **ESLint 9.36.0** - 程式碼品質檢查工具
- **TypeScript ESLint 8.45.0** - TypeScript 專用的 ESLint 規則
- **@vitejs/plugin-react 5.0.4** - Vite 的 React 支援外掛

##  專案目錄結構

```
frontend/
├── public/                 # 靜態資源目錄
│   └── vite.svg
├── src/
│   ├── assets/            # 靜態資源（圖片、字體等）
│   │   └── react.svg
│   ├── components/        # React 組件
│   │   ├── Common/       # 通用組件
│   │   │   ├── TableToolbar.tsx
│   │   │   ├── TableToolbar.css
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LoadingSpinner.css
│   │   │   ├── ApiQuotaDisplay.tsx
│   │   │   └── ApiQuotaDisplay.css
│   │   ├── Financial/    # 財務報表相關組件
│   │   │   ├── BalanceSheetForm.tsx
│   │   │   ├── BalanceSheetTable.tsx
│   │   │   ├── CashFlowForm.tsx
│   │   │   ├── CashFlowTable.tsx
│   │   │   ├── IncomeStatementForm.tsx
│   │   │   ├── IncomeStatementTable.tsx
│   │   │   ├── FinancialDebug.tsx
│   │   │   ├── FinancialForm.css
│   │   │   └── FinancialTable.css
│   │   ├── Function1/    # 功能一：數據整合相關組件
│   │   │   ├── DailyTradeTable.tsx
│   │   │   ├── DailyTradeTable.css
│   │   │   ├── StockChart.tsx
│   │   │   ├── StockChart.css
│   │   │   ├── StockChartMatplotlib.tsx
│   │   │   ├── TradeDetailTable.tsx
│   │   │   └── TradeDetailTable.css
│   │   ├── Function2/    # 功能二：股票基本檔管理組件
│   │   │   ├── StockBasicForm.tsx
│   │   │   ├── StockBasicForm.css
│   │   │   ├── StockBasicTable.tsx
│   │   │   └── StockBasicTable.css
│   │   ├── Footer.tsx    # 頁尾組件
│   │   ├── Footer.css
│   │   ├── Navbar.tsx    # 導航列組件
│   │   └── Navbar.css
│   ├── contexts/         # React Context 狀態管理
│   │   └── StockContext.tsx  # 股票選擇狀態管理
│   ├── data/             # 初始資料與模擬資料
│   │   ├── initData.ts   # 初始化資料
│   │   ├── mockData.ts   # 模擬資料
│   │   └── mockFinancialData.ts  # 模擬財務資料
│   ├── pages/            # 頁面組件
│   │   ├── ContactPage.tsx
│   │   ├── ContactPage.css
│   │   ├── EntryPage.tsx      # 入口頁面
│   │   ├── EntryPage.css
│   │   ├── FinancialReportsPage.tsx  # 財務報表頁面
│   │   ├── FinancialReportsPage.css
│   │   ├── Function1Page.tsx  # 功能一頁面
│   │   ├── Function1Page.css
│   │   ├── Function2Page.tsx  # 功能二頁面
│   │   ├── Function2Page.css
│   │   ├── FunctionPage.css
│   │   ├── PrivacyPage.tsx
│   │   ├── PrivacyPage.css
│   │   ├── TermsPage.tsx
│   │   └── TermsPage.css
│   ├── services/         # API 服務層
│   │   ├── financialStorageService.ts  # 財務資料儲存服務
│   │   ├── stockApi.ts   # 股票 API 服務（與後端通訊）
│   │   ├── stockGroupApi.ts  # 股票群組管理 API 服務
│   │   └── storageService.ts  # 本地儲存服務（localStorage）
│   ├── styles/           # 全域樣式
│   │   └── design-system.css  # 設計系統 CSS 變數
│   ├── types/            # TypeScript 型別定義
│   │   ├── financial.ts  # 財務報表相關型別
│   │   └── stock.ts      # 股票相關型別
│   ├── utils/            # 工具函數
│   │   ├── dataUtils.ts  # 資料處理工具
│   │   └── diagnoseApi.ts  # API 診斷工具
│   ├── App.tsx           # 根組件（路由配置）
│   ├── App.css           # 根組件樣式
│   ├── main.tsx          # 應用程式入口點
│   └── index.css         # 全域樣式
├── dist/                 # 建置輸出目錄
├── node_modules/         # 依賴套件
├── index.html            # HTML 入口檔案
├── package.json          # 專案配置與依賴
├── package-lock.json     # 依賴鎖定檔
├── vite.config.ts        # Vite 建置配置
├── tsconfig.json         # TypeScript 主配置
├── tsconfig.app.json     # TypeScript 應用程式配置
├── tsconfig.node.json    # TypeScript Node 配置
└── eslint.config.js      # ESLint 配置

```

## 檔案相依關係

### 應用程式入口流程

```
index.html
  └── main.tsx
      ├── App.tsx (根組件)
      │   ├── StockProvider (Context)
      │   ├── Router (路由管理)
      │   │   ├── Navbar (導航列)
      │   │   ├── Routes (路由配置)
      │   │   │   ├── EntryPage (入口頁)
      │   │   │   ├── Function1Page (功能一)
      │   │   │   ├── Function2Page (功能二)
      │   │   │   ├── FinancialReportsPage (財務報表)
      │   │   │   ├── ContactPage (聯絡頁)
      │   │   │   ├── PrivacyPage (隱私頁)
      │   │   │   └── TermsPage (條款頁)
      │   │   └── Footer (頁尾)
      │   └── App.css
      └── index.css
```

### 核心模組相依關係

#### 1. 狀態管理層 (Context)
```
StockContext.tsx
  └── 提供 selectedStockCode 狀態
      ├── Function1Page (使用 useStock)
      └── 其他需要股票選擇狀態的組件
```

#### 2. 服務層 (Services)
```
stockApi.ts
  ├── 依賴: 後端 API (http://127.0.0.1:8000/api)
  └── 提供:
      ├── getStockInfo()
      ├── getIntradayData()
      ├── getDailyTradeData()
      ├── getFinancialStatements()
      └── getMarketIndexData()

stockGroupApi.ts
  ├── 依賴: 後端 API (http://127.0.0.1:8000/api)
  └── 提供:
      ├── createStockGroup()
      ├── getAllStockGroups()
      ├── getStockGroup()
      ├── updateStockGroup()
      ├── deleteStockGroup()
      ├── addStockToGroup()
      ├── removeStockFromGroup()
      ├── getGroupStocks()
      ├── getStockGroups()
      └── getAllStocksWithGroups()

storageService.ts
  └── 提供 localStorage 封裝
      └── Function2Page (使用)

financialStorageService.ts
  └── 提供財務資料儲存
      └── FinancialReportsPage (使用)
```

#### 3. 型別定義層 (Types)
```
stock.ts
  ├── TradeDetail (成交明細)
  ├── DailyTrade (日交易檔)
  └── StockBasic (股票基本檔)

financial.ts
  ├── IncomeStatementItem (損益表)
  ├── BalanceSheetItem (資產負債表)
  └── CashFlowItem (現金流量表)
```

#### 4. 頁面組件相依關係

**Function1Page (功能一：數據整合)**
```
Function1Page.tsx
  ├── 使用: StockContext (useStock)
  ├── 使用: stockApi (getIntradayData, getDailyTradeData, getMarketIndexData)
  ├── 使用: types/stock (TradeDetail, DailyTrade)
  └── 渲染:
      ├── StockChart (股票圖表)
      ├── TradeDetailTable (成交明細表)
      └── DailyTradeTable (日交易表)
```

**Function2Page (功能二：股票基本檔管理)**
```
Function2Page.tsx
  ├── 使用: storageService (本地儲存)
  ├── 使用: types/stock (StockBasic)
  └── 渲染:
      ├── StockBasicForm (表單)
      └── StockBasicTable (表格)
```

**FinancialReportsPage (財務報表)**
```
FinancialReportsPage.tsx
  ├── 使用: stockApi (getFinancialStatements)
  ├── 使用: types/financial (IncomeStatementItem, BalanceSheetItem, CashFlowItem)
  └── 渲染:
      ├── IncomeStatementTable (損益表)
      ├── BalanceSheetTable (資產負債表)
      └── CashFlowTable (現金流量表)
```

##  架構設計模式

### 1. 組件化架構
- **頁面組件 (Pages)**: 負責頁面層級的邏輯與佈局
- **功能組件 (Components)**: 可重用的 UI 組件
- **通用組件 (Common)**: 跨功能使用的共用組件

### 2. 狀態管理
- **React Context API**: 用於跨組件共享狀態（股票選擇）
- **本地狀態 (useState)**: 組件內部狀態管理
- **localStorage**: 持久化資料儲存

### 3. 服務層模式
- **API 服務**: 封裝後端 API 呼叫邏輯
- **儲存服務**: 封裝資料持久化邏輯
- **工具函數**: 可重用的資料處理函數

### 4. 型別安全
- **TypeScript**: 完整的型別定義確保型別安全
- **介面定義**: 統一的資料結構定義

##  後端整合

### API 代理設定
在 `vite.config.ts` 中配置了開發環境的 API 代理：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### API 端點

**股票數據**:
- `/api/stock/info/{stockCode}` - 獲取股票基本資訊
- `/api/stock/intraday/{stockCode}` - 獲取盤中即時數據
- `/api/stock/daily/{stockCode}` - 獲取日交易檔數據
- `/api/stock/financial/{stockCode}` - 獲取財務報表數據
- `/api/stock/market-index` - 獲取大盤指數數據
- `/api/stock/batch` - 批量獲取股票資訊

**股票群組管理**:
- `/api/stock-groups` - 群組 CRUD 操作
- `/api/stock-groups/{group_id}/stocks` - 群組股票管理
- `/api/stocks/{stock_code}/groups` - 股票所屬群組查詢
- `/api/stocks/groups` - 所有股票群組對應關係

**統計與監控**:
- `/api/stats/quota` - API 限額統計
- `/api/stats/cache` - 快取統計

## 樣式系統

### CSS 變數設計系統
使用 `design-system.css` 定義全域 CSS 變數，包括：
- 顏色系統（主色、次色、錯誤、成功等）
- 間距系統
- 字體系統
- 邊框半徑
- 陰影效果

### 樣式組織
- **全域樣式**: `index.css`, `design-system.css`
- **組件樣式**: 每個組件對應的 `.css` 檔案
- **頁面樣式**: 每個頁面對應的 `.css` 檔案

## 開發指令

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 執行 ESLint 檢查
npm run lint
```

## 建置優化

### 程式碼分割
在 `vite.config.ts` 中配置了手動程式碼分割：
- `react-vendor`: React 相關套件
- `chart-vendor`: Recharts 圖表庫

### 路由懶加載
在 `App.tsx` 中使用 `React.lazy()` 實現路由組件的懶加載，減少初始載入時間。

## 資料流程

### Function1Page 資料流程
```
使用者輸入股票代號
  ↓
Function1Page 呼叫 stockApi
  ↓
stockApi 透過 fetch 請求後端 API
  ↓
後端返回資料
  ↓
轉換為前端型別 (TradeDetail, DailyTrade)
  ↓
更新組件狀態
  ↓
渲染表格與圖表
```

### Function2Page 資料流程
```
使用者操作 (新增/編輯/刪除)
  ↓
Function2Page 呼叫 storageService
  ↓
storageService 操作 localStorage
  ↓
更新組件狀態
  ↓
重新渲染表格
```

### FinancialReportsPage 資料流程
```
使用者輸入股票代號
  ↓
FinancialReportsPage 呼叫 stockApi.getFinancialStatements()
  ↓
stockApi 請求後端 API
  ↓
後端返回財務報表資料
  ↓
轉換為前端型別 (IncomeStatementItem, BalanceSheetItem, CashFlowItem)
  ↓
儲存到 localStorage
  ↓
更新組件狀態
  ↓
渲染三個財務報表表格
```

## 主要功能模組

### 1. 數據整合 (Function1)
- 股票成交明細查詢與顯示
- 日交易檔查詢與顯示
- 股票走勢圖視覺化
- 大盤指數顯示
- 表格連動篩選功能

### 2. 股票基本檔管理 (Function2)
- 股票基本資訊的新增、編輯、刪除
- 本地儲存管理
- 表格篩選功能

### 3. 財務報表 (FinancialReports)
- 損益表查詢與顯示
- 資產負債表查詢與顯示
- 現金流量表查詢與顯示
- 多股票群組管理
- 財務摘要顯示

### 4. 股票群組管理
- 創建/編輯/刪除股票群組
- 將股票加入/移除群組
- 查詢股票所屬群組
- 批量管理

### 5. API 限額監控
- 顯示 API 使用統計（每分鐘/每小時/每天）
- 請求成功率追蹤
- 響應時間監控

## 環境變數

可在專案根目錄建立 `.env` 檔案設定環境變數：

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 注意事項

1. **後端服務**: 前端需要後端服務運行在 `http://127.0.0.1:8000/` 才能正常運作
2. **資料儲存**: Function2 和 FinancialReports 使用 `localStorage` 儲存資料，清除瀏覽器資料會導致資料遺失
3. **型別安全**: 所有 API 回應都應該符合定義的 TypeScript 介面
4. **錯誤處理**: API 呼叫都包含錯誤處理邏輯，會顯示友善的錯誤訊息

## 🔮 未來規劃

- [x] 整合實際的資料庫（PostgreSQL/SQLite）支援
- [x] 股票群組管理功能
- [x] BOM（物料清單）管理功能
- [x] API 限額追蹤與監控
- [x] 雙層快取系統（內存+資料庫）
- [ ] 加入更多圖表類型與分析工具
- [ ] 實作使用者認證與授權
- [ ] 加入資料匯出功能
- [ ] 優化行動裝置體驗
- [ ] 加入單元測試與整合測試
