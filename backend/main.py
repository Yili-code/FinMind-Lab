# main.py 是後端主程式，負責提供 API 給前端存取

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime
import json
import os
import warnings
import logging
from typing import Optional, List
try:
    # 從 backend 目錄運行時
    from services.yfinance_service import (
        get_stock_info,
        get_intraday_data,
        get_daily_trade_data,
        get_market_index_data,
        get_financial_statements
    )
except ImportError:
    # 從項目根目錄運行時
    from backend.services.yfinance_service import (
        get_stock_info,
        get_intraday_data,
        get_daily_trade_data,
        get_market_index_data,
        get_financial_statements
    )

# 抑制不必要的警告和日誌
warnings.filterwarnings('ignore')
logging.getLogger('yfinance').setLevel(logging.ERROR)
logging.getLogger('urllib3').setLevel(logging.ERROR)
logging.getLogger('uvicorn').setLevel(logging.WARNING)
logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
logging.getLogger('fastapi').setLevel(logging.WARNING)

app = FastAPI(title="FinMind Lab API")

# 允許前端存取後端 API: 加入 CORS 中介層設定
app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:5173",
		"http://localhost:3000",
		"http://127.0.0.1:5173",
		"http://127.0.0.1:3000",
	],  # 允許多個前端端口
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# 聯絡表單資料模型
class ContactForm(BaseModel):
	name: str
	email: EmailStr
	subject: str
	message: str

# 測試 API 是否正常運作
@app.get("/")
def read_root():
	return {"message": "Hello from FastAPI"}

# 測試前端是否能夠正常存取後端 API
@app.get("/api/hello")
def read_hello():
	return {"message": "Successfully connected to the backend!!!"}

# 處理聯絡表單提交
@app.post("/api/contact")
async def submit_contact(form: ContactForm):
	try:
		# 建立聯絡記錄
		contact_record = {
			"timestamp": datetime.now().isoformat(),
			"name": form.name,
			"email": form.email,
			"subject": form.subject,
			"message": form.message
		}
		
		# 儲存到檔案（實際應用中應該儲存到資料庫）
		contacts_dir = "contacts"
		if not os.path.exists(contacts_dir):
			os.makedirs(contacts_dir)
		
		filename = f"{contacts_dir}/contact_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
		with open(filename, 'w', encoding='utf-8') as f:
			json.dump(contact_record, f, ensure_ascii=False, indent=2)
		
		# 這裡可以加入發送郵件的功能
		# 例如使用 smtplib 或第三方郵件服務
		
		return {
			"success": True,
			"message": "您的訊息已成功送出，我們會盡快回覆您！"
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"處理表單時發生錯誤: {str(e)}")

# ========== 股票數據 API ==========

@app.get("/api/stock/info/{stock_code}")
async def get_stock_information(stock_code: str):
	"""獲取股票基本資訊"""
	try:
		info = get_stock_info(stock_code)
		if info is None:
			raise HTTPException(status_code=404, detail=f"無法獲取股票 {stock_code} 的資訊")
		return info
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"獲取股票資訊時發生錯誤: {str(e)}")

@app.get("/api/stock/intraday/{stock_code}")
async def get_stock_intraday(
	stock_code: str,
	period: str = Query("1d", description="時間週期: 1d, 5d, 1mo 等"),
	interval: str = Query("1m", description="時間間隔: 1m, 5m, 15m, 1h, 1d 等")
):
	"""獲取股票盤中即時數據（成交明細）"""
	try:
		data = get_intraday_data(stock_code, period=period, interval=interval)
		return {
			"stockCode": stock_code,
			"data": data,
			"count": len(data)
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"獲取盤中數據時發生錯誤: {str(e)}")

@app.get("/api/stock/daily/{stock_code}")
async def get_stock_daily(
	stock_code: str,
	days: int = Query(5, description="獲取最近幾天的數據", ge=1, le=30)
):
	"""獲取股票日交易檔數據"""
	try:
		data = get_daily_trade_data(stock_code, days=days)
		return {
			"stockCode": stock_code,
			"data": data,
			"count": len(data)
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"獲取日交易數據時發生錯誤: {str(e)}")

@app.get("/api/stock/batch")
async def get_multiple_stocks(
	stock_codes: str = Query(..., description="股票代號，用逗號分隔，例如: 2330,2317")
):
	"""批量獲取多個股票的基本資訊"""
	try:
		codes = [code.strip() for code in stock_codes.split(',')]
		results = []
		for code in codes:
			info = get_stock_info(code)
			if info:
				results.append(info)
		return {
			"stocks": results,
			"count": len(results)
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"批量獲取股票資訊時發生錯誤: {str(e)}")

@app.get("/api/stock/market-index")
async def get_market_index(
	index_code: str = Query("^TWII", description="指數代號，預設為 ^TWII (加權指數)"),
	days: int = Query(5, description="獲取最近幾天的數據", ge=1, le=30)
):
	"""獲取大盤指數數據"""
	try:
		data = get_market_index_data(index_code, days=days)
		return {
			"indexCode": index_code,
			"data": data,
			"count": len(data)
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"獲取大盤指數數據時發生錯誤: {str(e)}")

@app.get("/api/stock/financial/{stock_code}")
async def get_stock_financial(stock_code: str):
	"""獲取股票財務報表數據（損益表、資產負債表、現金流量表）"""
	try:
		data = get_financial_statements(stock_code)
		if data is None:
			raise HTTPException(status_code=404, detail=f"無法獲取股票 {stock_code} 的財務報表數據")
		return data
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"獲取財務報表數據時發生錯誤: {str(e)}")