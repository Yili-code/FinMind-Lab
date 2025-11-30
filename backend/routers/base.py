# base.py - 基礎路由（測試、聯絡表單等）

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
import json
import os
from pathlib import Path
from core.config import FAVICON_PATH
from core.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="", tags=["基礎"])


# 聯絡表單資料模型
class ContactForm(BaseModel):
    """聯絡表單資料模型"""
    name: str = Field(..., description="姓名", example="張三")
    email: EmailStr = Field(..., description="電子郵件地址", example="user@example.com")
    subject: str = Field(..., description="主題", example="詢問產品資訊")
    message: str = Field(..., description="訊息內容", example="我想了解更多關於產品的資訊...")
    
    class Config:
        schema_extra = {
            "example": {
                "name": "張三",
                "email": "user@example.com",
                "subject": "詢問產品資訊",
                "message": "我想了解更多關於產品的資訊，請與我聯繫。"
            }
        }


@router.get("/favicon.ico")
async def favicon():
    """返回 favicon 圖標"""
    absolute_path = os.path.abspath(FAVICON_PATH)
    if os.path.exists(absolute_path):
        file_mtime = os.path.getmtime(absolute_path)
        return FileResponse(
            path=absolute_path,
            media_type="image/png",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "Last-Modified": datetime.fromtimestamp(file_mtime).strftime("%a, %d %b %Y %H:%M:%S GMT"),
                "ETag": f'"{int(file_mtime)}"'
            }
        )
    else:
        raise HTTPException(status_code=404, detail=f"Favicon not found at {absolute_path}")


@router.get("/", response_class=HTMLResponse)
def read_root():
    """返回主頁 HTML"""
    html_content = """
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Finfo API</title>
        <link rel="icon" type="image/png" href="/favicon.ico?v=2">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: black;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px;
            }
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                padding: 40px;
                max-width: 600px;
                width: 100%;
                text-align: center;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 2.5em;
            }
            .status {
                display: inline-block;
                background: #10b981;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9em;
                margin-top: 30px;
                margin-bottom: 15px;
            }
            .links {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-top: 30px;
            }
            a {
                display: inline-block;
                padding: 12px 24px;
                background: white;
                color: black;
                text-decoration: none;
                border-radius: 8px;
                transition: transform 0.2s, box-shadow 0.2s;
                font-weight: 500;
            }
            a:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            .info {
                margin-top: 30px;
                padding-top: 30px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Finfo API</h1>
            <span class="status">OPERATING</span>
            <div class="links">
                <a href="/docs" target="_blank">Swagger API 文檔</a>
                <a href="/redoc" target="_blank">ReDoc API 文檔</a>
                <a href="/api/hello" target="_blank">測試 API 端點</a>
            </div>
            <div class="info">
                <p><strong>API 基礎 URL:</strong> http://127.0.0.1:8000/</p>
                <p>使用 Swagger UI 來探索所有可用的 API 端點</p>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@router.get(
    "/api/hello",
    summary="測試 API 連接",
    description="用於測試後端 API 是否正常運作的簡單端點。"
)
def read_hello():
    """測試 API 連接端點"""
    logger.info("=" * 80)
    logger.info(f"[API 請求] GET /api/hello")
    logger.info("=" * 80)
    logger.info(f"[API 響應] 成功返回測試訊息")
    return {"message": "Successfully connected to the backend!!!"}


@router.post(
    "/api/contact",
    summary="提交聯絡表單",
    description="接收並儲存用戶的聯絡表單資料。"
)
async def submit_contact(form: ContactForm):
    """提交聯絡表單"""
    try:
        logger.info("=" * 80)
        logger.info(f"[API 請求] POST /api/contact")
        logger.info(f"[參數] name: {form.name}, email: {form.email}, subject: {form.subject}")
        logger.info(f"[參數] message: {form.message[:50]}..." if len(form.message) > 50 else f"[參數] message: {form.message}")
        logger.info("=" * 80)
        
        contact_record = {
            "timestamp": datetime.now().isoformat(),
            "name": form.name,
            "email": form.email,
            "subject": form.subject,
            "message": form.message
        }
        
        # 儲存到檔案
        from core.config import CONTACTS_DIR
        contacts_dir = CONTACTS_DIR
        if not os.path.exists(contacts_dir):
            os.makedirs(contacts_dir)
        
        filename = f"{contacts_dir}/contact_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(contact_record, f, ensure_ascii=False, indent=2)
            logger.info(f"[API 響應] 成功處理聯絡表單，已儲存到: {filename}")
        except Exception as e:
            logger.warning(f"[API 警告] 無法儲存聯絡表單到檔案: {str(e)}，但請求已處理")
        
        return {
            "success": True,
            "message": "您的訊息已成功送出，我們會盡快回覆您！"
        }
    except Exception as e:
        logger.error(f"[API 錯誤] 處理表單時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"處理表單時發生錯誤: {str(e)}")
