# stats.py - 統計路由

from fastapi import APIRouter, HTTPException
from core.logging_config import get_logger
from core.dependencies import CACHE_AVAILABLE
from core.exceptions import CacheError
from services.cache_service import get_cache_stats
from services.api_quota_tracker import quota_tracker

logger = get_logger(__name__)

router = APIRouter(prefix="/api/stats", tags=["統計"])


@router.get(
    "/quota",
    summary="獲取 yfinance API 限額統計",
    description="獲取 yfinance API 的使用情況和限額信息，包括請求次數、成功率、剩餘限額等。"
)
async def get_api_quota_stats():
    """獲取 yfinance API 限額統計"""
    if not CACHE_AVAILABLE:
        raise CacheError("快取服務未啟用")
    
    stats = quota_tracker.get_stats()
    return stats


@router.get(
    "/cache",
    summary="獲取快取統計",
    description="獲取內存快取的統計信息，包括快取鍵數量、快取大小等。"
)
async def get_cache_stats_endpoint():
    """獲取快取統計信息"""
    if not CACHE_AVAILABLE:
        raise CacheError("快取服務未啟用")
    
    stats = get_cache_stats()
    return stats
