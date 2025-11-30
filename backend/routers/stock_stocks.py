# stock_stocks.py - 股票與群組關聯路由（特殊路徑）

from fastapi import APIRouter, HTTPException, Path
from core.logging_config import get_logger
from core.dependencies import DB_AVAILABLE
from core.exceptions import DatabaseError
from crud import get_groups_by_stock, get_stocks_with_groups

logger = get_logger(__name__)

# 注意：這個路由使用 /api/stocks 前綴，而不是 /api/stock-groups
router = APIRouter(prefix="/api/stocks", tags=["股票群組管理"])


@router.get("/{stock_code}/groups", summary="獲取股票所屬的群組", description="獲取指定股票所屬的所有群組。")
async def get_stock_groups(stock_code: str = Path(..., description="股票代號")):
    """獲取股票所屬的群組"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        groups = get_groups_by_stock(stock_code)
        return groups
    except DatabaseError:
        raise
    except Exception as e:
        logger.error(f"獲取股票所屬群組時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取股票所屬群組時發生錯誤: {str(e)}")


@router.get("/groups", summary="獲取所有股票的群組對應關係", description="獲取所有股票及其所屬群組的對應關係。")
async def get_all_stocks_with_groups():
    """獲取所有股票的群組對應關係"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        result = get_stocks_with_groups()
        return result
    except DatabaseError:
        raise
    except Exception as e:
        logger.error(f"獲取股票群組對應關係時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取股票群組對應關係時發生錯誤: {str(e)}")
