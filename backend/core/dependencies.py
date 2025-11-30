# dependencies.py - FastAPI 依賴注入

from typing import Optional
from fastapi import Depends, HTTPException, status
from database import get_db_connection, DB_TYPE
from core.exceptions import DatabaseError, CacheError
from core.config import CACHE_ENABLED

# 檢查資料庫可用性
try:
    from database import init_database
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False

# 檢查快取可用性
try:
    from services.cache_service import get_from_memory_cache, set_to_memory_cache
    CACHE_AVAILABLE = True
except ImportError:
    CACHE_AVAILABLE = False


def get_database():
    """資料庫依賴注入"""
    if not DB_AVAILABLE:
        raise DatabaseError("資料庫服務未啟用")
    try:
        conn = get_db_connection()
        try:
            yield conn
        finally:
            conn.close()
    except Exception as e:
        raise DatabaseError(f"無法連接資料庫: {str(e)}")


def check_cache_available():
    """檢查快取服務是否可用"""
    if not CACHE_AVAILABLE:
        raise CacheError("快取服務未啟用")
    return True
