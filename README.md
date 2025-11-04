# Data-Scraper-Project

以 Python FastAPI 作為後端，React + TypeScript + Vite 作為前端的全端範例骨架。

## 目錄結構

```
backend/            # FastAPI 後端
frontend/           # Vite React + TS 前端
.venv/              # Python 虛擬環境（本機）
```

## 前置需求
- Python 3.10+（Windows 可用 `py -3`）
- Node.js 18+

## 安裝與啟動

### 1) 建立並啟動後端
```powershell
cd D:\code\projects\Data-Scraper-Project
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.main:app --reload --port 8000
```

後端啟動於 `http://localhost:8000`，API 範例：`GET /api/hello`

### 2) 啟動前端
另開一個終端機：
```powershell
cd D:\code\projects\Data-Scraper-Project\frontend
npm run dev
```

前端啟動於 `http://localhost:5173`。

> 在開發模式下，`frontend/vite.config.ts` 已設定代理 `/api` → `http://localhost:8000`。

## 驗證
- 進入前端頁面可看到「Backend: Hello from FastAPI」字樣。
- 若顯示「無法連線到後端」，請確認後端已啟動且埠號為 8000。

## 部署建議
- 後端：以 `uvicorn`/`gunicorn`（Linux）或容器化部署，設定 CORS 允許實際前端域名。
- 前端：`npm run build` 產物放置於 CDN 或靜態伺服器；正式環境建議由反向代理（例如 Nginx）統一轉發 `/api` 到後端。

