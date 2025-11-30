# bom.py - BOM（物料清單）管理路由

from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel, Field
from typing import Optional
from core.logging_config import get_logger
from core.dependencies import DB_AVAILABLE
from core.exceptions import DatabaseError
from database import get_db_connection
from db_utils import prepare_sql
from crud import (
    add_bom_item,
    get_bom_by_parent,
    get_parents_by_child,
    update_bom_item,
    delete_bom_item,
    get_bom_tree
)

logger = get_logger(__name__)

router = APIRouter(prefix="/api/stocks", tags=["股票 BOM 管理"])


# BOM 資料模型
class BOMItemCreate(BaseModel):
    """創建 BOM 項目的資料模型"""
    childStockCode: str = Field(..., description="子股票代號", example="2330")
    quantity: float = Field(1.0, description="數量", example=1.0)
    weight: Optional[float] = Field(None, description="權重（選填）", example=0.5)
    unit: Optional[str] = Field(None, description="單位（選填）", example="股")
    notes: Optional[str] = Field(None, description="備註（選填）", example="主要持股")


class BOMItemUpdate(BaseModel):
    """更新 BOM 項目的資料模型"""
    quantity: Optional[float] = Field(None, description="數量", example=1.0)
    weight: Optional[float] = Field(None, description="權重", example=0.5)
    unit: Optional[str] = Field(None, description="單位", example="股")
    notes: Optional[str] = Field(None, description="備註", example="主要持股")


@router.post("/{parent_stock_code}/bom", summary="添加 BOM 項目", description="將子股票添加到父股票的物料清單中。")
async def add_bom_item_endpoint(
    parent_stock_code: str = Path(..., description="父股票代號"),
    bom_data: BOMItemCreate = ...
):
    """添加 BOM 項目"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        success = add_bom_item(
            parent_stock_code,
            bom_data.childStockCode,
            bom_data.quantity if hasattr(bom_data, 'quantity') and bom_data.quantity is not None else 1.0,
            bom_data.weight if hasattr(bom_data, 'weight') else None,
            bom_data.unit if hasattr(bom_data, 'unit') else None,
            bom_data.notes if hasattr(bom_data, 'notes') else None
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="無法添加 BOM 項目")
        
        return {"success": True, "message": "BOM 項目已成功添加"}
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"添加 BOM 項目時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"添加 BOM 項目時發生錯誤: {str(e)}")


@router.get("/{stock_code}/bom", summary="獲取股票的 BOM", description="獲取指定股票的所有子股票（物料清單）。")
async def get_stock_bom(stock_code: str = Path(..., description="股票代號")):
    """獲取股票的 BOM"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        bom_items = get_bom_by_parent(stock_code)
        return bom_items
    except DatabaseError:
        raise
    except Exception as e:
        logger.error(f"獲取 BOM 列表時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取 BOM 列表時發生錯誤: {str(e)}")


@router.get("/{stock_code}/bom/parents", summary="獲取包含該股票的父股票列表", description="獲取所有將指定股票作為子項目的父股票列表。")
async def get_stock_bom_parents(stock_code: str = Path(..., description="股票代號")):
    """獲取包含該股票的父股票列表"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        parents = get_parents_by_child(stock_code)
        return parents
    except DatabaseError:
        raise
    except Exception as e:
        logger.error(f"獲取父股票列表時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取父股票列表時發生錯誤: {str(e)}")


@router.put("/{parent_stock_code}/bom/{child_stock_code}", summary="更新 BOM 項目", description="更新指定 BOM 項目的數量、權重等資訊。")
async def update_bom_item_endpoint(
    parent_stock_code: str = Path(..., description="父股票代號"),
    child_stock_code: str = Path(..., description="子股票代號"),
    bom_data: BOMItemUpdate = ...
):
    """更新 BOM 項目"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        # 先獲取 BOM 項目的 ID
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(prepare_sql("""
            SELECT id FROM stock_bom 
            WHERE parent_stock_code = ? AND child_stock_code = ?
        """), (parent_stock_code, child_stock_code))
        bom_item = cursor.fetchone()
        conn.close()
        
        if not bom_item:
            raise HTTPException(status_code=404, detail="找不到指定的 BOM 項目")
        
        success = update_bom_item(
            bom_item['id'],
            bom_data.quantity if hasattr(bom_data, 'quantity') else None,
            bom_data.weight if hasattr(bom_data, 'weight') else None,
            bom_data.unit if hasattr(bom_data, 'unit') else None,
            bom_data.notes if hasattr(bom_data, 'notes') else None
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="無法更新 BOM 項目")
        
        return {"success": True, "message": "BOM 項目已成功更新"}
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"更新 BOM 項目時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"更新 BOM 項目時發生錯誤: {str(e)}")


@router.delete("/{parent_stock_code}/bom/{child_stock_code}", summary="刪除 BOM 項目", description="從父股票的物料清單中移除子股票。")
async def delete_bom_item_endpoint(
    parent_stock_code: str = Path(..., description="父股票代號"),
    child_stock_code: str = Path(..., description="子股票代號")
):
    """刪除 BOM 項目"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        success = delete_bom_item(parent_stock_code, child_stock_code)
        if not success:
            raise HTTPException(status_code=404, detail="找不到指定的 BOM 項目")
        
        return {"success": True, "message": "BOM 項目已成功刪除"}
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"刪除 BOM 項目時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"刪除 BOM 項目時發生錯誤: {str(e)}")


@router.get("/{stock_code}/bom/tree", summary="獲取 BOM 樹狀結構", description="獲取指定股票的完整 BOM 樹狀結構（遞迴）。")
async def get_stock_bom_tree(
    stock_code: str = Path(..., description="股票代號"),
    max_depth: int = Query(3, description="最大深度", ge=1, le=10)
):
    """獲取 BOM 樹狀結構"""
    try:
        if not DB_AVAILABLE:
            raise DatabaseError("資料庫服務未啟用")
        
        tree = get_bom_tree(stock_code, max_depth)
        if tree is None:
            raise HTTPException(status_code=404, detail=f"找不到股票 {stock_code} 的 BOM 樹狀結構")
        
        return tree
    except (DatabaseError, HTTPException):
        raise
    except Exception as e:
        logger.error(f"獲取 BOM 樹狀結構時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"獲取 BOM 樹狀結構時發生錯誤: {str(e)}")
