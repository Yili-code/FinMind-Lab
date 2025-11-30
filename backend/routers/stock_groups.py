# stock_groups.py - 股票群組管理路由

from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, Field
from typing import Optional
from core.logging_config import get_logger
from core.dependencies import DB_AVAILABLE
from core.exceptions import DatabaseError
from crud import (
    create_stock_group,
    get_all_stock_groups,
    get_stock_group_by_id,
    update_stock_group,
    delete_stock_group,
    add_stock_to_group,
    remove_stock_from_group,
    get_stocks_by_group,
    get_groups_by_stock,
    get_stocks_with_groups
)

logger = get_logger(__name__)

router = APIRouter(prefix="/api/stock-groups", tags=["股票群組管理"])


# 群組資料模型
class StockGroupCreate(BaseModel):
    """創建群組的資料模型"""
    groupName: str = Field(..., description="群組名稱", example="台積電集團")
    description: Optional[str] = Field(None, description="群組描述", example="台積電相關股票")


class StockGroupUpdate(BaseModel):
    """更新群組的資料模型"""
    groupName: Optional[str] = Field(None, description="群組名稱", example="台積電集團")
    description: Optional[str] = Field(None, description="群組描述", example="台積電相關股票")


class AddStockToGroupRequest(BaseModel):
    """將股票加入群組的請求模型"""
    stockCode: str = Field(..., description="股票代號", example="2330")


@router.post("", summary="創建股票群組", description="創建一個新的股票群組。")
async def create_group(group_data: StockGroupCreate):
    """創建股票群組"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        logger.info(f"[API 請求] POST /api/stock-groups")
        logger.info(f"[參數] groupName: {group_data.groupName}, description: {group_data.description}")
        
        result = create_stock_group(group_data.groupName, group_data.description)
        if result is None:
            raise HTTPException(status_code=400, detail=f"群組名稱 '{group_data.groupName}' 已存在")
        
        logger.info(f"[API 響應] 成功創建群組: {result['groupName']}")
        return result
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"創建股票群組時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"創建股票群組時發生錯誤: {str(e)}")


@router.get("", summary="獲取所有股票群組", description="獲取所有股票群組及其股票數量。")
async def get_all_groups():
    """獲取所有股票群組"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        groups = get_all_stock_groups()
        return groups
    except DatabaseError:
        raise
    except Exception as e:
        logger.error(f"獲取股票群組列表時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取股票群組列表時發生錯誤: {str(e)}")


@router.get("/{group_id}", summary="獲取股票群組詳情", description="根據群組 ID 獲取股票群組的詳細資訊。")
async def get_group(group_id: str = Path(..., description="群組 ID")):
    """獲取股票群組詳情"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        group = get_stock_group_by_id(group_id)
        if group is None:
            raise HTTPException(status_code=404, detail=f"找不到群組 ID: {group_id}")
        
        return group
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"獲取股票群組詳情時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取股票群組詳情時發生錯誤: {str(e)}")


@router.put("/{group_id}", summary="更新股票群組", description="更新股票群組的名稱或描述。")
async def update_group(
    group_id: str = Path(..., description="群組 ID"),
    group_data: StockGroupUpdate = ...
):
    """更新股票群組"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        success = update_stock_group(
            group_id,
            group_data.groupName if hasattr(group_data, 'groupName') and group_data.groupName else None,
            group_data.description if hasattr(group_data, 'description') and group_data.description else None
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="更新失敗，可能是群組不存在或群組名稱已存在")
        
        updated_group = get_stock_group_by_id(group_id)
        if updated_group is None:
            raise HTTPException(status_code=404, detail="找不到更新後的群組")
        
        return updated_group
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"更新股票群組時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"更新股票群組時發生錯誤: {str(e)}")


@router.delete("/{group_id}", summary="刪除股票群組", description="刪除股票群組（會自動移除群組中的所有股票）。")
async def delete_group(group_id: str = Path(..., description="群組 ID")):
    """刪除股票群組"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        success = delete_stock_group(group_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"找不到群組 ID: {group_id}")
        
        return {"message": "群組已成功刪除", "groupId": group_id}
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"刪除股票群組時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"刪除股票群組時發生錯誤: {str(e)}")


@router.post("/{group_id}/stocks", summary="將股票加入群組", description="將指定的股票加入群組。")
async def add_stock_to_group_endpoint(
    group_id: str = Path(..., description="群組 ID"),
    request: AddStockToGroupRequest = ...
):
    """將股票加入群組"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        success = add_stock_to_group(group_id, request.stockCode)
        if not success:
            raise HTTPException(status_code=400, detail="無法將股票加入群組，可能是群組不存在或股票已在群組中")
        
        return {"message": "股票已成功加入群組", "groupId": group_id, "stockCode": request.stockCode}
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"將股票加入群組時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"將股票加入群組時發生錯誤: {str(e)}")


@router.delete("/{group_id}/stocks/{stock_code}", summary="將股票從群組中移除", description="將指定的股票從群組中移除。")
async def remove_stock_from_group_endpoint(
    group_id: str = Path(..., description="群組 ID"),
    stock_code: str = Path(..., description="股票代號")
):
    """將股票從群組中移除"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        success = remove_stock_from_group(group_id, stock_code)
        if not success:
            raise HTTPException(status_code=404, detail="找不到指定的群組或股票關聯")
        
        return {"message": "股票已成功從群組中移除", "groupId": group_id, "stockCode": stock_code}
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"將股票從群組中移除時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"將股票從群組中移除時發生錯誤: {str(e)}")


@router.get("/{group_id}/stocks", summary="獲取群組中的所有股票", description="獲取指定群組中的所有股票代號列表。")
async def get_group_stocks(group_id: str = Path(..., description="群組 ID")):
    """獲取群組中的所有股票"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        stocks = get_stocks_by_group(group_id)
        return {"groupId": group_id, "stocks": stocks}
    except DatabaseError:
        raise
    except Exception as e:
        logger.error(f"獲取群組股票列表時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取群組股票列表時發生錯誤: {str(e)}")


# 注意：這些路由需要在主應用程式中單獨註冊，因為它們的路徑不同
