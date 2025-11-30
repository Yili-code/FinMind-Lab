# config.py - 應用程式配置管理

import os
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

# 項目根目錄
BASE_DIR = Path(__file__).parent.parent

# API 配置
API_TITLE = os.getenv("API_TITLE", "Finfo API")
API_VERSION = os.getenv("API_VERSION", "1.0.0")
API_DESCRIPTION = os.getenv(
    "API_DESCRIPTION",
    "提供台灣股票數據的 RESTful API 服務，包括股票基本資訊、盤中數據、日交易數據、大盤指數和財務報表等。"
)

# 伺服器配置
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
RELOAD = os.getenv("RELOAD", "True").lower() == "true"

# CORS 配置
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
]

# 資料庫配置
DB_TYPE = os.getenv("DB_TYPE", "postgresql").lower()
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "finfo")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "finfo.db")

# 日誌配置
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = os.getenv(
    "LOG_FORMAT",
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# 快取配置
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "True").lower() == "true"
CACHE_TTL_STOCK_INFO = int(os.getenv("CACHE_TTL_STOCK_INFO", "300"))  # 5分鐘
CACHE_TTL_DAILY_TRADE = int(os.getenv("CACHE_TTL_DAILY_TRADE", "600"))  # 10分鐘
CACHE_TTL_FINANCIAL = int(os.getenv("CACHE_TTL_FINANCIAL", "3600"))  # 1小時

# API 限額配置
API_RATE_LIMIT_PER_MINUTE = int(os.getenv("API_RATE_LIMIT_PER_MINUTE", "20"))
API_RATE_LIMIT_PER_HOUR = int(os.getenv("API_RATE_LIMIT_PER_HOUR", "200"))
API_RATE_LIMIT_PER_DAY = int(os.getenv("API_RATE_LIMIT_PER_DAY", "2000"))

# 文件路徑配置
CONTACTS_DIR = BASE_DIR / "contacts"
FAVICON_PATH = BASE_DIR / "backend.png"
