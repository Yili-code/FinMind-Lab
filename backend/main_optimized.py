# main_optimized.py - 優化後的主應用程式

"""
Finfo Backend - 優化版本

主要改進：
1. 模組化路由結構（使用 APIRouter）
2. 統一的配置管理
3. 改進的錯誤處理
4. 優化的日誌系統
5. 依賴注入支持
"""

import warnings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

# 導入核心模組
from core.config import (
    API_TITLE,
    API_VERSION,
    API_DESCRIPTION,
    CORS_ORIGINS,
    HOST,
    PORT,
    DEBUG
)
from core.logging_config import setup_logging, get_logger
from core.dependencies import DB_AVAILABLE, CACHE_AVAILABLE

# 導入路由
from routers import base, stocks, stock_groups, stock_stocks, bom, stats

# 初始化日誌
setup_logging()
logger = get_logger(__name__)

# 抑制不必要的警告
warnings.filterwarnings('ignore')

# 初始化資料庫
if DB_AVAILABLE:
    try:
        from database import init_database
        init_database()
        logger.info("資料庫初始化成功")
    except Exception as e:
        logger.warning(f"資料庫初始化失敗: {str(e)}，將跳過自動保存功能")

# 建立 FastAPI 應用程式
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊路由
app.include_router(base.router)
app.include_router(stocks.router)
app.include_router(stock_groups.router)
app.include_router(stock_stocks.router)  # 股票與群組關聯路由（特殊路徑）
app.include_router(bom.router)
app.include_router(stats.router)

# 啟動事件
@app.on_event("startup")
async def startup_event():
    """應用程式啟動時執行"""
    logger.info("=" * 80)
    logger.info(f"{API_TITLE} v{API_VERSION} 啟動成功")
    logger.info(f"資料庫服務: {'啟用' if DB_AVAILABLE else '未啟用'}")
    logger.info(f"快取服務: {'啟用' if CACHE_AVAILABLE else '未啟用'}")
    logger.info(f"API 文檔: http://{HOST}:{PORT}/docs")
    logger.info("=" * 80)


@app.on_event("shutdown")
async def shutdown_event():
    """應用程式關閉時執行"""
    logger.info("應用程式正在關閉...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_optimized:app",
        host=HOST,
        port=PORT,
        log_level="info",
        reload=DEBUG
    )
