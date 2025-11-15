# main.py 是後端主程式，負責提供 API 給前端存取

from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
import json
import os
import warnings
import logging
from typing import Optional, List
import sys
from pathlib import Path

# 添加項目根目錄到 Python 路徑（如果從項目根目錄運行）
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

try:
	# 從 backend 目錄運行時
	from services.yfinance_service import (
		get_stock_info,
		get_intraday_data,
		get_daily_trade_data,
		get_market_index_data,
		get_financial_statements,
		get_yfinance_ticker
	)
	from services.chart_service import generate_candlestick_chart
except ImportError:
	try:
		# 從項目根目錄運行時
		from backend.services.yfinance_service import (
			get_stock_info,
			get_intraday_data,
			get_daily_trade_data,
			get_market_index_data,
			get_financial_statements,
			get_yfinance_ticker
		)
		from backend.services.chart_service import generate_candlestick_chart
	except ImportError:
		# 如果兩種方式都失敗，嘗試直接導入（假設在 backend 目錄）
		import os
		os.chdir(backend_dir)
		from services.yfinance_service import (
			get_stock_info,
			get_intraday_data,
			get_daily_trade_data,
			get_market_index_data,
			get_financial_statements,
			get_yfinance_ticker
		)
		from services.chart_service import generate_candlestick_chart

# 抑制不必要的警告和日誌
warnings.filterwarnings('ignore')
logging.getLogger('yfinance').setLevel(logging.ERROR)
logging.getLogger('urllib3').setLevel(logging.ERROR)
logging.getLogger('uvicorn').setLevel(logging.WARNING)
logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
logging.getLogger('fastapi').setLevel(logging.WARNING)
# 設置我們自己的服務日誌級別為 INFO，便於調試
logging.getLogger('services.yfinance_service').setLevel(logging.INFO)
logging.getLogger('__main__').setLevel(logging.INFO)

# 建立 FastAPI 實例
app = FastAPI(
	title="FinMind Lab API",
	description="提供台灣股票數據的 RESTful API 服務，包括股票基本資訊、盤中數據、日交易數據、大盤指數和財務報表等。",
	version="1.0.0",
	docs_url="/docs",
	redoc_url="/redoc"
)

# 允許前端存取後端 API: 加入 CORS 中介層設定
app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:5173",
		"http://localhost:3000",
	],  # 允許多個前端端口
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# 聯絡表單資料模型
class ContactForm(BaseModel):
	"""
	聯絡表單資料模型
	
	用於接收用戶提交的聯絡表單資訊。
	"""
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

# Favicon 端點
@app.get("/favicon.ico")
async def favicon():
	"""返回 favicon 圖標"""
	import os
	favicon_path = backend_dir / "backend.png"
	# 使用絕對路徑確保找到正確的文件
	absolute_path = os.path.abspath(favicon_path)
	if os.path.exists(absolute_path):
		# 獲取文件修改時間作為版本標識
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

# 測試 API 是否正常運作
@app.get("/", response_class=HTMLResponse)
def read_root():
	"""返回主頁 HTML"""
	html_content = """
	<!DOCTYPE html>
	<html lang="zh-TW">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>FinMind Lab API</title>
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
				margin-bottom: 15x;
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
			<h1>FinMind Lab API</h1>
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

# 測試前端是否能夠正常存取後端 API
@app.get(
	"/api/hello",
	summary="測試 API 連接",
	description="用於測試後端 API 是否正常運作的簡單端點。",
	tags=["測試"]
)
def read_hello():
	"""
	測試 API 連接端點
	
	返回成功訊息，用於驗證後端服務是否正常運行。
	
	**響應示例:**
	```json
	{
		"message": "Successfully connected to the backend!!!"
	}
	```
	"""
	logger = logging.getLogger(__name__)
	logger.info("=" * 80)
	logger.info(f"[API 請求] GET /api/hello")
	logger.info("=" * 80)
	logger.info(f"[API 響應] 成功返回測試訊息")
	return {"message": "Successfully connected to the backend!!!"}

# 處理聯絡表單提交
@app.post(
	"/api/contact",
	summary="提交聯絡表單",
	description="接收並儲存用戶的聯絡表單資料。",
	tags=["聯絡"]
)
async def submit_contact(form: ContactForm):
	"""
	提交聯絡表單
	
	接收用戶的聯絡資訊（姓名、電子郵件、主題、訊息）並儲存到檔案中。
	
	**請求體參數:**
	- `name`: 姓名（必填）
	- `email`: 電子郵件地址（必填，需符合電子郵件格式）
	- `subject`: 主題（必填）
	- `message`: 訊息內容（必填）
	
	**響應示例:**
	```json
	{
		"success": true,
		"message": "您的訊息已成功送出，我們會盡快回覆您！"
	}
	```
	
	**錯誤響應:**
	- `500`: 處理表單時發生錯誤
	"""
	try:
		# 記錄 API 請求信息
		logger = logging.getLogger(__name__)
		logger.info("=" * 80)
		logger.info(f"[API 請求] POST /api/contact")
		logger.info(f"[參數] name: {form.name}, email: {form.email}, subject: {form.subject}")
		logger.info(f"[參數] message: {form.message[:50]}..." if len(form.message) > 50 else f"[參數] message: {form.message}")
		logger.info("=" * 80)
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
		
		logger.info(f"[API 響應] 成功處理聯絡表單，已儲存到: {filename}")
		return {
			"success": True,
			"message": "您的訊息已成功送出，我們會盡快回覆您！"
		}
	except Exception as e:
		logger.error(f"[API 錯誤] 處理表單時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"處理表單時發生錯誤: {str(e)}")

# ========== 股票數據 API ==========

# 獲取股票基本資訊
@app.get(
	"/api/stock/info/{stock_code}",
	summary="獲取股票基本資訊",
	description="獲取指定股票代號的基本資訊，包括股票名稱、當前價格、市值等。",
	tags=["股票數據"]
)
async def get_stock_information(
	stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330")
):
	"""
	獲取股票基本資訊
	
	根據股票代號獲取股票的基本資訊，包括：
	- 股票名稱
	- 當前價格
	- 市值
	- 本益比
	- 產業別
	- 其他財務指標
	
	**路徑參數:**
	- `stock_code`: 股票代號（例如：2330 代表台積電）
	
	**響應示例:**
	```json
	{
		"stockCode": "2330",
		"stockName": "台積電",
		"currentPrice": 580.0,
		"marketCap": 1500000000000,
		"peRatio": 25.5,
		"industry": "半導體"
	}
	```
	
	**錯誤響應:**
	- `404`: 無法獲取股票資訊（股票代號不存在或無效）
	- `500`: 獲取股票資訊時發生錯誤
	"""
	try:
		# 記錄 API 請求信息
		logger = logging.getLogger(__name__)
		yfinance_ticker = get_yfinance_ticker(stock_code)
		logger.info("=" * 80)
		logger.info(f"[API 請求] GET /api/stock/info/{stock_code}")
		logger.info(f"[參數] stock_code: {stock_code} -> yfinance ticker: {yfinance_ticker}")
		logger.info("=" * 80)
		
		info = get_stock_info(stock_code)
		if info is None:
			logger.warning(f"[API 響應] 無法獲取股票 {stock_code} 的資訊")
			raise HTTPException(status_code=404, detail=f"無法獲取股票 {stock_code} 的資訊")
		
		logger.info(f"[API 響應] 成功獲取股票 {stock_code} 的資訊")
		return info
	except HTTPException:
		raise
	except Exception as e:
		logger.error(f"[API 錯誤] 獲取股票資訊時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取股票資訊時發生錯誤: {str(e)}")

# 獲取股票盤中即時數據（成交明細）
@app.get(
	"/api/stock/intraday/{stock_code}",
	summary="獲取股票盤中即時數據",
	description="獲取指定股票代號的盤中即時交易數據（成交明細）。",
	tags=["股票數據"]
)
async def get_stock_intraday(
	stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330"),
	period: str = Query("1d", description="時間週期，可選值: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max", example="1d"),
	interval: str = Query("1m", description="時間間隔，可選值: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo", example="1m")
):
	"""
	獲取股票盤中即時數據（成交明細）
	
	獲取指定股票在指定時間週期和間隔內的盤中即時交易數據。
	
	**路徑參數:**
	- `stock_code`: 股票代號（例如：2330）
	
	**查詢參數:**
	- `period`: 時間週期（預設: 1d）
		- `1d`: 1天
		- `5d`: 5天
		- `1mo`: 1個月
		- `3mo`: 3個月
		- 更多選項請參考 yfinance 文檔
	- `interval`: 時間間隔（預設: 1m）
		- `1m`: 1分鐘
		- `5m`: 5分鐘
		- `15m`: 15分鐘
		- `1h`: 1小時
		- `1d`: 1天
	
	**響應示例:**
	```json
	{
		"stockCode": "2330",
		"data": [
			{
				"date": "2024-01-15 09:00:00",
				"price": 580.0,
				"openPrice": 579.5,
				"highPrice": 580.5,
				"lowPrice": 579.0,
				"totalVolume": 1000000
			}
		],
		"count": 390
	}
	```
	
	**錯誤響應:**
	- `500`: 獲取盤中數據時發生錯誤
	"""
	try:
		# 記錄 API 請求信息
		logger = logging.getLogger(__name__)
		yfinance_ticker = get_yfinance_ticker(stock_code)
		logger.info("=" * 80)
		logger.info(f"[API 請求] GET /api/stock/intraday/{stock_code}")
		logger.info(f"[參數] stock_code: {stock_code} -> yfinance ticker: {yfinance_ticker}")
		logger.info(f"[參數] period: {period}, interval: {interval}")
		logger.info("=" * 80)
		
		data = get_intraday_data(stock_code, period=period, interval=interval)
		logger.info(f"[API 響應] 成功獲取股票 {stock_code} 的盤中數據，共 {len(data)} 筆")
		return {
			"stockCode": stock_code,
			"data": data,
			"count": len(data)
		}
	except Exception as e:
		logger.error(f"[API 錯誤] 獲取盤中數據時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取盤中數據時發生錯誤: {str(e)}")

# 獲取股票日交易檔數據
@app.get(
	"/api/stock/daily/{stock_code}",
	summary="獲取股票日交易數據",
	description="獲取指定股票代號的歷史日交易數據，包括開盤價、收盤價、最高價、最低價和成交量。",
	tags=["股票數據"]
)
async def get_stock_daily(
	stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330"),
	days: int = Query(5, description="獲取最近幾天的數據（範圍: 1-2000）", ge=1, le=2000, example=30)
):
	"""
	獲取股票日交易數據
	
	獲取指定股票在最近 N 天的歷史日交易數據，包括每日的開盤價、收盤價、最高價、最低價和成交量。
	
	**路徑參數:**
	- `stock_code`: 股票代號（例如：2330）
	
	**查詢參數:**
	- `days`: 獲取最近幾天的數據（範圍: 1-2000，預設: 5）
	
	**響應示例:**
	```json
	{
		"stockCode": "2330",
		"data": [
			{
				"date": "2024-01-15",
				"openPrice": 579.0,
				"closePrice": 580.0,
				"highPrice": 581.0,
				"lowPrice": 578.5,
				"totalVolume": 15000000
			}
		],
		"count": 30
	}
	```
	
	**注意事項:**
	- 如果數據為空，響應中會包含 `warning` 欄位說明可能的原因
	- 非交易時間（週末或假日）可能無法獲取最新數據
	
	**錯誤響應:**
	- `500`: 獲取日交易數據時發生錯誤
	"""
	try:
		import logging
		logger = logging.getLogger(__name__)
		yfinance_ticker = get_yfinance_ticker(stock_code)
		logger.info("=" * 80)
		logger.info(f"[API 請求] GET /api/stock/daily/{stock_code}")
		logger.info(f"[參數] stock_code: {stock_code} -> yfinance ticker: {yfinance_ticker}")
		logger.info(f"[參數] days: {days}")
		logger.info("=" * 80)
		
		data = get_daily_trade_data(stock_code, days=days)
		logger.info(f"後端返回數據量: {len(data)}")
		
		# 如果數據為空，返回警告信息但不拋出錯誤
		if len(data) == 0:
			logger.warning(f"股票 {stock_code} 的數據為空，開始診斷...")
			# 嘗試獲取股票信息來驗證股票代號是否有效
			from services.yfinance_service import get_stock_info
			try:
				stock_info = get_stock_info(stock_code)
				if stock_info is None:
					# 股票代號無效
					logger.warning(f"股票 {stock_code} 的信息無法獲取，可能代號不正確")
					return {
						"stockCode": stock_code,
						"data": [],
						"count": 0,
						"warning": f"無法獲取股票 {stock_code} 的數據。可能原因：\n1. 股票代號不正確（請確認是台灣股票代號，例如：2330）\n2. 股票已下市或暫停交易\n3. yfinance 無法訪問該股票數據（可能需要檢查網絡連接）\n\n建議：\n• 確認股票代號格式正確（台灣股票：4位數字，例如 2330）\n• 嘗試其他股票代號（例如：2317, 2454, 2308）\n• 檢查後端日誌查看詳細錯誤信息"
					}
				else:
					# 股票信息存在但歷史數據為空（可能是非交易時間）
					stock_name = stock_info.get('stockName', stock_code)
					logger.warning(f"股票 {stock_code} ({stock_name}) 的信息存在，但歷史數據為空")
					return {
						"stockCode": stock_code,
						"data": [],
						"count": 0,
						"warning": f"股票 {stock_code} ({stock_name}) 的歷史數據為空。可能原因：\n1. 非交易時間（週末或假日）\n2. 數據源暫時不可用（yfinance API 限制或網絡問題）\n3. 指定的時間範圍內沒有交易數據\n4. 股票可能暫停交易\n\n建議：\n• 確認當前是否為台灣股市交易時間（週一至週五 9:00-13:30）\n• 嘗試增加查詢天數（例如：days=30）\n• 檢查網絡連接和 yfinance API 狀態\n• 查看後端日誌獲取詳細錯誤信息"
					}
			except Exception as info_err:
				logger.error(f"獲取股票信息時發生錯誤: {str(info_err)}")
				return {
					"stockCode": stock_code,
					"data": [],
					"count": 0,
					"warning": f"無法驗證股票 {stock_code} 的有效性。錯誤: {str(info_err)}"
				}
		
		logger.info(f"成功返回股票 {stock_code} 的數據，共 {len(data)} 筆")
		return {
			"stockCode": stock_code,
			"data": data,
			"count": len(data)
		}
	except Exception as e:
		import logging
		logger = logging.getLogger(__name__)
		logger.error(f"獲取日交易數據時發生異常: {str(e)}")
		import traceback
		logger.error(f"錯誤堆棧:\n{traceback.format_exc()}")
		raise HTTPException(status_code=500, detail=f"獲取日交易數據時發生錯誤: {str(e)}")

# 批量獲取多個股票的基本資訊
@app.get(
	"/api/stock/batch",
	summary="批量獲取股票資訊",
	description="一次獲取多個股票的基本資訊，提高查詢效率。",
	tags=["股票數據"]
)
async def get_multiple_stocks(
	stock_codes: str = Query(..., description="股票代號，用逗號分隔（例如: 2330,2317,2454）", example="2330,2317,2454")
):
	"""
	批量獲取多個股票的基本資訊
	
	一次查詢多個股票的基本資訊，適合需要同時查看多檔股票資訊的場景。
	
	**查詢參數:**
	- `stock_codes`: 股票代號列表，用逗號分隔（例如: 2330,2317,2454）
	
	**響應示例:**
	```json
	{
		"stocks": [
			{
				"stockCode": "2330",
				"stockName": "台積電",
				"currentPrice": 580.0
			},
			{
				"stockCode": "2317",
				"stockName": "鴻海",
				"currentPrice": 105.0
			}
		],
		"count": 2
	}
	```
	
	**注意事項:**
	- 無效的股票代號會被自動跳過，不會出現在結果中
	- 建議一次查詢不超過 10 個股票，以避免響應時間過長
	
	**錯誤響應:**
	- `500`: 批量獲取股票資訊時發生錯誤
	"""
	try:
		# 記錄 API 請求信息
		logger = logging.getLogger(__name__)
		codes = [code.strip() for code in stock_codes.split(',')]
		logger.info("=" * 80)
		logger.info(f"[API 請求] GET /api/stock/batch")
		logger.info(f"[參數] stock_codes: {stock_codes}")
		logger.info(f"[參數] 解析後的股票代號列表: {codes}")
		
		# 記錄每個股票代號的 yfinance ticker
		yfinance_tickers = [get_yfinance_ticker(code) for code in codes]
		logger.info(f"[參數] yfinance tickers: {yfinance_tickers}")
		logger.info("=" * 80)
		
		results = []
		for code in codes:
			info = get_stock_info(code)
			if info:
				results.append(info)
		
		logger.info(f"[API 響應] 成功獲取 {len(results)}/{len(codes)} 個股票的資訊")
		return {
			"stocks": results,
			"count": len(results)
		}
	except Exception as e:
		logger.error(f"[API 錯誤] 批量獲取股票資訊時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"批量獲取股票資訊時發生錯誤: {str(e)}")

# 獲取大盤指數數據
@app.get(
	"/api/stock/market-index",
	summary="獲取大盤指數數據",
	description="獲取台灣股市大盤指數的歷史數據，預設為加權指數（^TWII）。",
	tags=["股票數據"]
)
async def get_market_index(
	index_code: str = Query("^TWII", description="指數代號，預設為 ^TWII (加權指數)，其他選項: ^TWOII (櫃買指數)", example="^TWII"),
	days: int = Query(5, description="獲取最近幾天的數據（範圍: 1-30）", ge=1, le=30, example=10)
):
	"""
	獲取大盤指數數據
	
	獲取台灣股市大盤指數的歷史數據，包括開盤價、收盤價、最高價、最低價和成交量。
	
	**查詢參數:**
	- `index_code`: 指數代號（預設: ^TWII）
		- `^TWII`: 加權指數（上市）
		- `^TWOII`: 櫃買指數（上櫃）
	- `days`: 獲取最近幾天的數據（範圍: 1-30，預設: 5）
	
	**響應示例:**
	```json
	{
		"indexCode": "^TWII",
		"data": [
			{
				"date": "2024-01-15",
				"openPrice": 17500.0,
				"closePrice": 17550.0,
				"highPrice": 17600.0,
				"lowPrice": 17480.0,
				"totalVolume": 2000000000
			}
		],
		"count": 10
	}
	```
	
	**錯誤響應:**
	- `500`: 獲取大盤指數數據時發生錯誤
	"""
	try:
		# 記錄 API 請求信息
		logger = logging.getLogger(__name__)
		logger.info("=" * 80)
		logger.info(f"[API 請求] GET /api/stock/market-index")
		logger.info(f"[參數] index_code: {index_code}")
		logger.info(f"[參數] days: {days}")
		logger.info("=" * 80)
		
		data = get_market_index_data(index_code, days=days)
		logger.info(f"[API 響應] 成功獲取指數 {index_code} 的數據，共 {len(data)} 筆")
		return {
			"indexCode": index_code,
			"data": data,
			"count": len(data)
		}
	except Exception as e:
		logger.error(f"[API 錯誤] 獲取大盤指數數據時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取大盤指數數據時發生錯誤: {str(e)}")

# 獲取股票財務報表數據（損益表、資產負債表、現金流量表）
@app.get(
	"/api/stock/financial/{stock_code}",
	summary="獲取股票財務報表",
	description="獲取指定股票的財務報表數據，包括損益表、資產負債表和現金流量表。",
	tags=["股票數據"]
)
async def get_stock_financial(
	stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330")
):
	"""
	獲取股票財務報表數據
	
	獲取指定股票的完整財務報表數據，包括：
	- **損益表（Income Statement）**: 營業收入、營業成本、稅後淨利等
	- **資產負債表（Balance Sheet）**: 總資產、總負債、股東權益等
	- **現金流量表（Cash Flow）**: 營業現金流、投資現金流、融資現金流等
	
	**路徑參數:**
	- `stock_code`: 股票代號（例如：2330）
	
	**響應示例:**
	```json
	{
		"stockCode": "2330",
		"incomeStatement": [
			{
				"period": "2023-Q4",
				"revenue": 625530000000,
				"netIncome": 238710000000
			}
		],
		"balanceSheet": [
			{
				"period": "2023-Q4",
				"totalAssets": 5000000000000,
				"shareholdersEquity": 3000000000000
			}
		],
		"cashFlow": [
			{
				"period": "2023-Q4",
				"operatingCashFlow": 300000000000,
				"freeCashFlow": 250000000000
			}
		]
	}
	```
	
	**注意事項:**
	- yfinance 對台股財務報表的支持可能有限
	- 某些股票可能沒有可用的財務數據
	- 數據格式可能因股票而異
	
	**錯誤響應:**
	- `404`: 無法獲取財務報表數據（股票代號不存在或無財務數據）
	- `500`: 獲取財務報表數據時發生錯誤
	"""
	try:
		import logging
		logger = logging.getLogger(__name__)
		yfinance_ticker = get_yfinance_ticker(stock_code)
		logger.info("=" * 80)
		logger.info(f"[API 請求] GET /api/stock/financial/{stock_code}")
		logger.info(f"[參數] stock_code: {stock_code} -> yfinance ticker: {yfinance_ticker}")
		logger.info("=" * 80)
		
		data = get_financial_statements(stock_code)
		
		if data is None:
			error_msg = f"無法獲取股票 {stock_code} 的財務報表數據。可能原因：1) yfinance 對台股財務報表支持有限 2) 該股票沒有可用的財務數據 3) 數據格式不匹配。請查看後端日誌獲取詳細信息。"
			logger.warning(f"[API 響應] ❌ 錯誤: {error_msg}")
			raise HTTPException(status_code=404, detail=error_msg)
		
		logger.info(f"[API 響應] 成功獲取股票 {stock_code} 的財務報表數據")
		logger.info(f"[API 響應] 數據結構: incomeStatement={'有數據' if data.get('incomeStatement') else 'null'}, "
		           f"balanceSheet={'有數據' if data.get('balanceSheet') else 'null'}, "
		           f"cashFlow={'有數據' if data.get('cashFlow') else 'null'}")
		return data
	except HTTPException:
		raise
	except Exception as e:
		import logging
		logger = logging.getLogger(__name__)
		error_msg = f"獲取財務報表數據時發生錯誤: {str(e)}"
		logger.error(f"[API] {error_msg}")
		import traceback
		logger.error(f"[API] 錯誤堆棧:\n{traceback.format_exc()}")
		raise HTTPException(status_code=500, detail=error_msg)

# 生成 K 線圖
@app.post(
	"/api/stock/chart/{stock_code}",
	summary="生成股票 K 線圖",
	description="根據股票數據生成 K 線圖（Candlestick Chart），返回 Base64 編碼的圖片。",
	tags=["股票數據"]
)
async def generate_stock_chart(
	stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330"),
	period: str = Query("1d", description="時間週期，可選值: 1d, 5d, 1mo, 3mo, 6mo, 1y 等", example="1mo"),
	interval: str = Query("1d", description="時間間隔，可選值: 1m, 5m, 15m, 1h, 1d 等。注意：5m, 15m, 30m, 1h, 1mo 使用盤中數據，其他使用日交易數據", example="1d"),
	days: int = Query(100, description="獲取最近幾天的數據（用於日交易數據，範圍: 1-2000）", ge=1, le=2000, example=100)
):
	"""
	生成股票 K 線圖
	
	根據指定的股票代號、時間週期和間隔生成 K 線圖（Candlestick Chart），並返回 Base64 編碼的 PNG 圖片。
	
	**數據源選擇:**
	- 當 `interval` 為 `5m`, `15m`, `30m`, `1h`, `1mo` 時，使用盤中數據
	- 其他情況使用日交易數據
	
	**路徑參數:**
	- `stock_code`: 股票代號（例如：2330）
	
	**查詢參數:**
	- `period`: 時間週期（預設: 1d）
		- `1d`: 1天
		- `5d`: 5天
		- `1mo`: 1個月
		- `3mo`: 3個月
		- `6mo`: 6個月
		- `1y`: 1年
	- `interval`: 時間間隔（預設: 1d）
		- `1m`, `5m`, `15m`, `30m`, `1h`: 使用盤中數據
		- `1d`: 使用日交易數據
	- `days`: 獲取最近幾天的數據（僅用於日交易數據，範圍: 1-2000，預設: 100）
	
	**響應示例:**
	```json
	{
		"stockCode": "2330",
		"stockName": "台積電",
		"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
		"dataCount": 100
	}
	```
	
	**注意事項:**
	- 圖表數據點限制為最多 100 個
	- 圖片為 Base64 編碼的 PNG 格式，可直接用於 `<img>` 標籤的 `src` 屬性
	- 響應中的 `image` 欄位已包含 `data:image/png;base64,` 前綴
	
	**錯誤響應:**
	- `404`: 無法獲取股票數據
	- `500`: 生成圖表時發生錯誤
	"""
	try:
		# 記錄 API 請求信息
		logger = logging.getLogger(__name__)
		yfinance_ticker = get_yfinance_ticker(stock_code)
		logger.info("=" * 80)
		logger.info(f"[API 請求] POST /api/stock/chart/{stock_code}")
		logger.info(f"[參數] stock_code: {stock_code} -> yfinance ticker: {yfinance_ticker}")
		logger.info(f"[參數] period: {period}, interval: {interval}, days: {days}")
		logger.info("=" * 80)
		
		# 判斷使用哪種數據源
		use_intraday = interval in ['5m', '15m', '30m', '1h', '1mo']
		logger.info(f"[數據源] 使用{'盤中數據' if use_intraday else '日交易數據'}")
		
		if use_intraday:
			# 使用盤中數據
			data_list = get_intraday_data(stock_code, period=period, interval=interval)
			stock_info = get_stock_info(stock_code)
			stock_name = stock_info.get('stockName', stock_code) if stock_info else stock_code
			
			# 轉換數據格式
			chart_data = []
			for item in data_list[:100]:  # 限制為 100 個數據點
				chart_data.append({
					'date': item.get('date', ''),
					'open': item.get('openPrice', 0),
					'high': item.get('highPrice', 0),
					'low': item.get('lowPrice', 0),
					'close': item.get('price', 0),
					'volume': item.get('totalVolume', item.get('estimatedVolume', 0))
				})
		else:
			# 使用日交易數據
			data_list = get_daily_trade_data(stock_code, days=days)
			stock_info = get_stock_info(stock_code)
			stock_name = stock_info.get('stockName', stock_code) if stock_info else stock_code
			
			# 轉換數據格式
			chart_data = []
			for item in data_list[:100]:  # 限制為 100 個數據點
				chart_data.append({
					'date': item.get('date', ''),
					'open': item.get('openPrice', 0),
					'high': item.get('highPrice', 0),
					'low': item.get('lowPrice', 0),
					'close': item.get('closePrice', 0),
					'volume': item.get('totalVolume', item.get('estimatedVolume', 0))
				})
		
		if not chart_data:
			raise HTTPException(status_code=404, detail=f"無法獲取股票 {stock_code} 的數據")
		
		# 生成圖表
		img_base64 = generate_candlestick_chart(
			data=chart_data,
			stock_code=stock_code,
			stock_name=stock_name,
			title=f"{stock_code} - {stock_name} ({interval})"
		)
		
		logger.info(f"[API 響應] 成功生成股票 {stock_code} 的 K 線圖，數據點數: {len(chart_data)}")
		return JSONResponse(content={
			"stockCode": stock_code,
			"stockName": stock_name,
			"image": f"data:image/png;base64,{img_base64}",
			"dataCount": len(chart_data)
		})
	except HTTPException:
		raise
	except Exception as e:
		logger.error(f"[API 錯誤] 生成圖表時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"生成圖表時發生錯誤: {str(e)}")

if __name__ == "__main__":
	import uvicorn
	uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info", reload=True)