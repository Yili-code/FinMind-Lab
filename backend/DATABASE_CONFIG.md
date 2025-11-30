# 資料庫配置說明

## 環境變數配置

在 `backend` 目錄下創建 `.env` 文件，並配置以下環境變數：

### PostgreSQL 配置（推薦用於生產環境）

```env
# 資料庫類型
DB_TYPE=postgresql

# PostgreSQL 連接配置
DB_HOST=your_postgresql_host
DB_PORT=5432
DB_NAME=finfo
DB_USER=your_username
DB_PASSWORD=your_password
```

### SQLite 配置（用於開發環境）

```env
# 資料庫類型
DB_TYPE=sqlite

# SQLite 文件路徑（可設，預設為 finfo.db）
SQLITE_DB_PATH=finfo.db
```

## 安裝依賴

確保已安裝 PostgreSQL 驅動：

```bash
pip install -r requirements.txt
```

## 資料庫初始化

系統會在啟動時自動初始化資料庫表格。如果資料庫不存在，請先創建：

### PostgreSQL

```sql
CREATE DATABASE finfo;
```

### SQLite

SQLite 會自動創建資料庫文件。

## 注意事項

1. **生產環境**：建議使用 PostgreSQL 或其他線上資料庫
2. **開發環境**：可以使用 SQLite 進行快速開發
3. **安全性**：請勿將 `.env` 文件提交到版本控制系統
4. **連接池**：生產環境建議配置連接池以提高效能



