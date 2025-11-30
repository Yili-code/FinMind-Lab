# exceptions.py - 自定義異常類

from fastapi import HTTPException, status
from typing import Optional, Dict, Any


class BaseAPIException(HTTPException):
    """基礎 API 異常類"""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


class StockNotFoundError(BaseAPIException):
    """股票未找到異常"""
    
    def __init__(self, stock_code: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"無法獲取股票 {stock_code} 的資訊",
            error_code="STOCK_NOT_FOUND"
        )


class DatabaseError(BaseAPIException):
    """資料庫錯誤"""
    
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"資料庫服務錯誤: {detail}",
            error_code="DATABASE_ERROR"
        )


class CacheError(BaseAPIException):
    """快取錯誤"""
    
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"快取服務錯誤: {detail}",
            error_code="CACHE_ERROR"
        )


class RateLimitError(BaseAPIException):
    """API 限額錯誤"""
    
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            error_code="RATE_LIMIT_EXCEEDED"
        )


class YFinanceAPIError(BaseAPIException):
    """yfinance API 錯誤"""
    
    def __init__(self, detail: str, stock_code: Optional[str] = None):
        message = f"yfinance API 錯誤: {detail}"
        if stock_code:
            message = f"獲取股票 {stock_code} 數據時發生錯誤: {detail}"
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=message,
            error_code="YFINANCE_API_ERROR"
        )
