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
from pathlib import Path as PathlibPath

# 導入資料庫相關模組
try:
	from database import init_database, get_db_connection
	from db_utils import prepare_sql
	from crud import (
		save_stock_basic,
		save_income_statement,
		save_balance_sheet,
		save_cash_flow,
		save_daily_trades,
		get_stock_basic_from_db,
		get_daily_trades_from_db,
		get_income_statement_from_db,
		get_balance_sheet_from_db,
		get_cash_flow_from_db,
		create_stock_group,
		get_all_stock_groups,
		get_stock_group_by_id,
		update_stock_group,
		delete_stock_group,
		add_stock_to_group,
		remove_stock_from_group,
		get_stocks_by_group,
		get_groups_by_stock,
		get_stocks_with_groups,
		add_bom_item,
		get_bom_by_parent,
		get_parents_by_child,
		update_bom_item,
		delete_bom_item,
		get_bom_tree
	)
	DB_AVAILABLE = True
	logging.info("資料庫模組載入成功")
except ImportError as e:
	DB_AVAILABLE = False
	logging.warning(f"資料庫模組未找到: {str(e)}，將跳過自動保存功能")

# 導入快取和限額追蹤服務
try:
	from services.cache_service import (
		get_from_memory_cache,
		set_to_memory_cache,
		get_cache_key,
		get_cache_stats,
		CACHE_TTL
	)
	from services.api_quota_tracker import quota_tracker
	CACHE_AVAILABLE = True
	logging.info("快取服務載入成功")
except ImportError as e:
	CACHE_AVAILABLE = False
	logging.warning(f"快取服務未找到: {str(e)}，將跳過快取功能")

# 初始化資料庫（應用啟動時）
if DB_AVAILABLE:
	try:
		init_database()
		logging.info("資料庫初始化成功")
	except Exception as e:
		logging.warning(f"資料庫初始化失敗: {str(e)}，將跳過自動保存功能")
		DB_AVAILABLE = False

# 添加項目根目錄到 Python 路徑（如果從項目根目錄運行）
backend_dir = PathlibPath(__file__).parent
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
	# 圖表生成功能已禁用以避免錯誤
	# from services.chart_service import generate_candlestick_chart
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
		# 圖表生成功能已禁用以避免錯誤
		# from backend.services.chart_service import generate_candlestick_chart
	except ImportError:
		# 如果兩種方式都失敗，嘗試直接導入（假設在 backend 目錄）
		os.chdir(backend_dir)
		from services.yfinance_service import (
			get_stock_info,
			get_intraday_data,
			get_daily_trade_data,
			get_market_index_data,
			get_financial_statements,
			get_yfinance_ticker
		)
		# 圖表生成功能已禁用以避免錯誤
		# from services.chart_service import generate_candlestick_chart

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
	title="Finfo API",
	description="""
	提供台灣股票數據的 RESTful API 服務，包括股票基本資訊、盤中數據、日交易數據、大盤指數和財務報表等。
	
	## 數據來源
	- 本 API 使用 **yfinance** Python 庫從 **Yahoo Finance** 獲取股票數據
	- 數據來源網址：https://finance.yahoo.com/
	- 對於台股代號（如 2330），系統會自動轉換為 yfinance 格式（2330.TW）
	
	## API 架構說明
	- **前端/客戶端** → **本後端 API** → **yfinance 庫** → **Yahoo Finance**-
	- Swagger UI 中顯示的是本後端 API 端點（例如：`/api/stock/financial/2330`）
	- 後端內部會調用 yfinance 來訪問 Yahoo Finance 的數據
	""",
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
		import time
		start_time = time.time()
		
		logger.info("=" * 80)
		logger.info(f"[API 請求] GET /api/stock/info/{stock_code}")
		logger.info("=" * 80)
		
		# 1. 嘗試從內存快取獲取
		cache_key = get_cache_key('stock_info', stock_code)
		if CACHE_AVAILABLE:
			cached_data = get_from_memory_cache(cache_key)
			if cached_data is not None:
				logger.info(f"[快取] 從內存快取獲取股票基本資訊: {stock_code}")
				return cached_data
		
		# 2. 嘗試從資料庫獲取
		if DB_AVAILABLE:
			db_data = get_stock_basic_from_db(stock_code)
			if db_data is not None:
				logger.info(f"[資料庫] 從資料庫獲取股票基本資訊: {stock_code}")
				# 放入快取
				if CACHE_AVAILABLE:
					set_to_memory_cache(cache_key, db_data, CACHE_TTL['stock_info'])
				return db_data
		
		# 3. 檢查 API 限額
		if CACHE_AVAILABLE:
			rate_limits = quota_tracker.check_rate_limit()
			if not rate_limits['minute_ok']:
				logger.warning("[API 限額] 每分鐘請求數已達上限，請稍後再試")
			if not rate_limits['hour_ok']:
				logger.warning("[API 限額] 每小時請求數已達上限，請稍後再試")
		
		# 4. 從 yfinance API 獲取
		yfinance_ticker = get_yfinance_ticker(stock_code)
		logger.info(f"[API] 從 yfinance 獲取股票基本資訊: {stock_code} -> {yfinance_ticker}")
		
		info = get_stock_info(stock_code)
		response_time = time.time() - start_time
		
		# 記錄 API 請求
		if CACHE_AVAILABLE:
			quota_tracker.record_request('stock_info', stock_code, info is not None, response_time)
		
		if info is None:
			logger.warning(f"[API 響應] 無法獲取股票 {stock_code} 的資訊")
			raise HTTPException(status_code=404, detail=f"無法獲取股票 {stock_code} 的資訊")
		
		# 5. 保存到快取和資料庫
		if CACHE_AVAILABLE:
			set_to_memory_cache(cache_key, info, CACHE_TTL['stock_info'])
		
		if DB_AVAILABLE:
			try:
				save_stock_basic(info)
				logger.info(f"[資料庫] 已自動保存股票基本資訊: {stock_code}")
			except Exception as e:
				logger.warning(f"[資料庫] 保存股票基本資訊失敗: {str(e)}")
		
		logger.info(f"[API 響應] 成功獲取股票 {stock_code} 的資訊（耗時: {response_time:.2f}秒）")
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
		import time
		logger = logging.getLogger(__name__)
		start_time = time.time()
		
		logger.info("=" * 80)
		logger.info(f"[API 請求] GET /api/stock/daily/{stock_code}")
		logger.info(f"[參數] stock_code: {stock_code}, days: {days}")
		logger.info("=" * 80)
		
		# 1. 嘗試從內存快取獲取
		cache_key = get_cache_key('daily_trade', stock_code, days)
		if CACHE_AVAILABLE:
			cached_data = get_from_memory_cache(cache_key)
			if cached_data is not None:
				logger.info(f"[快取] 從內存快取獲取日交易數據: {stock_code}")
				return {
					"stockCode": stock_code,
					"data": cached_data,
					"count": len(cached_data),
					"source": "cache"
				}
		
		# 2. 嘗試從資料庫獲取
		if DB_AVAILABLE:
			db_data = get_daily_trades_from_db(stock_code, days)
			if db_data and len(db_data) > 0:
				logger.info(f"[資料庫] 從資料庫獲取日交易數據: {stock_code}, 共 {len(db_data)} 筆")
				# 放入快取
				if CACHE_AVAILABLE:
					set_to_memory_cache(cache_key, db_data, CACHE_TTL['daily_trade'])
				return {
					"stockCode": stock_code,
					"data": db_data,
					"count": len(db_data),
					"source": "database"
				}
		
		# 3. 檢查 API 限額
		if CACHE_AVAILABLE:
			rate_limits = quota_tracker.check_rate_limit()
			if not rate_limits['minute_ok']:
				logger.warning("[API 限額] 每分鐘請求數已達上限，請稍後再試")
			if not rate_limits['hour_ok']:
				logger.warning("[API 限額] 每小時請求數已達上限，請稍後再試")
		
		# 4. 從 yfinance API 獲取
		yfinance_ticker = get_yfinance_ticker(stock_code)
		logger.info(f"[API] 從 yfinance 獲取日交易數據: {stock_code} -> {yfinance_ticker}")
		
		data = get_daily_trade_data(stock_code, days=days)
		response_time = time.time() - start_time
		
		# 記錄 API 請求
		if CACHE_AVAILABLE:
			quota_tracker.record_request('daily_trade', stock_code, len(data) > 0, response_time)
		
		logger.info(f"後端返回數據量: {len(data)}（耗時: {response_time:.2f}秒）")
		
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
		
		# 5. 保存到快取和資料庫
		if len(data) > 0:
			if CACHE_AVAILABLE:
				set_to_memory_cache(cache_key, data, CACHE_TTL['daily_trade'])
			
			if DB_AVAILABLE:
				try:
					saved_count = save_daily_trades(stock_code, data)
					logger.info(f"[資料庫] 已自動保存 {saved_count}/{len(data)} 筆日交易數據: {stock_code}")
				except Exception as e:
					logger.warning(f"[資料庫] 保存日交易數據失敗: {str(e)}")
		
		return {
			"stockCode": stock_code,
			"data": data,
			"count": len(data),
			"source": "api"
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
				# 自動保存到資料庫
				if DB_AVAILABLE:
					try:
						save_stock_basic(info)
						logger.debug(f"[資料庫] 已自動保存股票基本資訊: {code}")
					except Exception as e:
						logger.warning(f"[資料庫] 保存股票基本資訊失敗 ({code}): {str(e)}")
		
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
	
	獲取指定股票的最新一期財務報表數據，包括：
	- **損益表（Income Statement）**: 營業收入、營業成本、稅後淨利等
	- **資產負債表（Balance Sheet）**: 總資產、總負債、股東權益等
	- **現金流量表（Cash Flow）**: 營業現金流、投資現金流、融資現金流等
	
	**重要說明:**
	- 本 API **只返回最新一期的財務報表數據**（例如：2025Q2）
	- 期間格式為季度格式（YYYYQN），例如：2025Q2 表示 2025 年第 2 季
	- 系統會自動選擇最新的可用報表期間
	
	**數據來源:**
	- 本 API 使用 yfinance 庫從 Yahoo Finance 獲取數據
	- 對於台股（如 2330），系統會自動轉換為 yfinance 格式（2330.TW）
	- 實際數據來源：https://finance.yahoo.com/quote/2330.TW/financials
	
	**路徑參數:**
	- `stock_code`: 股票代號（例如：2330 或 AAPL）
		- 台股：4位數字（如 2330），系統會轉換為 2330.TW
		- 美股：字母代號（如 AAPL），直接使用
	
	**響應示例:**

	```json
	{
		"incomeStatement": {
			"id": "2330-2025Q2",
			"stockCode": "2330",
			"stockName": "台積電",
			"period": "2025Q2",
			"revenue": 625530000000,
			"netIncome": 238710000000
		},
		"balanceSheet": {
			"id": "2330-2025Q2",
			"stockCode": "2330",
			"stockName": "台積電",
			"period": "2025Q2",
			"totalAssets": 5000000000000,
			"shareholdersEquity": 3000000000000
		},
		"cashFlow": {
			"id": "2330-2025Q2",
			"stockCode": "2330",
			"stockName": "台積電",
			"period": "2025Q2",
			"operatingCashFlow": 300000000000,
			"freeCashFlow": 250000000000
		}
	}
	```
	
	**注意事項:**
	- yfinance 對台股財務報表的支持可能有限
	- 某些股票可能沒有可用的財務數據
	- 數據格式可能因股票而異
	- 只返回最新一期的數據，不包含歷史報表
	
	**錯誤響應:**
	- `404`: 無法獲取財務報表數據（股票代號不存在或無財務數據）
	- `500`: 獲取財務報表數據時發生錯誤
	"""
	try:
		import logging
		import time
		logger = logging.getLogger(__name__)
		start_time = time.time()
		
		logger.info("=" * 80)
		logger.info(f"[API 請求] GET /api/stock/financial/{stock_code}")
		logger.info(f"[參數] stock_code: {stock_code}")
		logger.info("=" * 80)
		
		# 1. 嘗試從內存快取獲取
		cache_key = get_cache_key('financial', stock_code)
		if CACHE_AVAILABLE:
			cached_data = get_from_memory_cache(cache_key)
			if cached_data is not None:
				logger.info(f"[快取] 從內存快取獲取財務報表: {stock_code}")
				return cached_data
		
		# 2. 嘗試從資料庫獲取
		if DB_AVAILABLE:
			income = get_income_statement_from_db(stock_code)
			balance = get_balance_sheet_from_db(stock_code)
			cashflow = get_cash_flow_from_db(stock_code)
			
			if income or balance or cashflow:
				db_data = {
					'incomeStatement': income,
					'balanceSheet': balance,
					'cashFlow': cashflow,
				}
				logger.info(f"[資料庫] 從資料庫獲取財務報表: {stock_code}")
				# 放入快取
				if CACHE_AVAILABLE:
					set_to_memory_cache(cache_key, db_data, CACHE_TTL['financial'])
				return db_data
		
		# 3. 檢查 API 限額
		if CACHE_AVAILABLE:
			rate_limits = quota_tracker.check_rate_limit()
			if not rate_limits['minute_ok']:
				logger.warning("[API 限額] 每分鐘請求數已達上限，請稍後再試")
			if not rate_limits['hour_ok']:
				logger.warning("[API 限額] 每小時請求數已達上限，請稍後再試")
		
		# 4. 從 yfinance API 獲取
		yfinance_ticker = get_yfinance_ticker(stock_code)
		logger.info(f"[API] 從 yfinance 獲取財務報表: {stock_code} -> {yfinance_ticker}")
		
		data = get_financial_statements(stock_code)
		response_time = time.time() - start_time
		
		# 記錄 API 請求
		if CACHE_AVAILABLE:
			quota_tracker.record_request('financial', stock_code, data is not None, response_time)
		
		if data is None:
			# 嘗試獲取股票基本資訊來判斷是股票不存在還是財務報表數據不可用
			stock_info = None
			try:
				stock_info = get_stock_info(stock_code)
			except Exception as e:
				logger.debug(f"[API] 獲取股票基本資訊時發生錯誤（不影響判斷）: {str(e)}")
			
			# 即使 get_stock_info 失敗，也給出更友好的錯誤訊息
			# 因為可能是 yfinance API 限制（429 Too Many Requests）或其他網絡問題
			if stock_info is None:
				# 股票基本資訊也無法獲取，可能是股票不存在、網絡問題或 API 限制
				error_msg = f"無法獲取股票 {stock_code} 的財務報表數據。\n\n可能原因：\n1. yfinance API 請求過於頻繁（429 錯誤）- 請稍後再試\n2. 股票代號不正確（台股為4位數字，例如：2330；美股為字母代號，例如：AAPL）\n3. yfinance 暫時無法訪問該股票數據\n4. yfinance 對台股財務報表支持有限\n\n建議：\n• 等待幾秒後再試（避免 API 限制）\n• 嘗試使用美股代號測試（例如：AAPL, MSFT, TSLA）\n• 查看後端日誌獲取詳細錯誤信息"
				logger.warning(f"[API 響應] 無法獲取財務報表數據: {error_msg}")
				raise HTTPException(status_code=404, detail=error_msg)
			else:
				# 股票存在但財務報表數據不可用
				stock_name = stock_info.get('stockName', stock_code)
				error_msg = f"無法獲取股票 {stock_code} ({stock_name}) 的財務報表數據。\n\n可能原因：\n1. yfinance 對台股財務報表支持有限\n2. 該股票沒有可用的財務數據\n3. 數據格式不匹配\n4. yfinance API 請求限制（429 錯誤）\n\n建議：\n- 等待幾秒後再試（避免 API 限制）\n- 嘗試使用美股代號測試（例如：AAPL, MSFT, TSLA）\n- 查看後端日誌獲取詳細信息"
				logger.warning(f"[API 響應] 財務報表數據為空: {error_msg}")
				raise HTTPException(status_code=404, detail=error_msg)
		
		logger.info(f"[API 響應] 成功獲取股票 {stock_code} 的財務報表數據（耗時: {response_time:.2f}秒）")
		logger.info(f"[API 響應] 數據結構: incomeStatement={'有數據' if data.get('incomeStatement') else 'null'}, "
		           f"balanceSheet={'有數據' if data.get('balanceSheet') else 'null'}, "
		           f"cashFlow={'有數據' if data.get('cashFlow') else 'null'}")
		
		# 5. 保存到快取和資料庫
		if data:
			if CACHE_AVAILABLE:
				set_to_memory_cache(cache_key, data, CACHE_TTL['financial'])
			
			if DB_AVAILABLE:
				try:
					if data.get('incomeStatement'):
						save_income_statement(data['incomeStatement'])
						logger.info(f"[資料庫] 已自動保存損益表: {stock_code}")
					if data.get('balanceSheet'):
						save_balance_sheet(data['balanceSheet'])
						logger.info(f"[資料庫] 已自動保存資產負債表: {stock_code}")
					if data.get('cashFlow'):
						save_cash_flow(data['cashFlow'])
						logger.info(f"[資料庫] 已自動保存現金流量表: {stock_code}")
				except Exception as e:
					logger.warning(f"[資料庫] 保存財務報表數據失敗: {str(e)}")
		
		return data
	except HTTPException:
		raise
	except Exception as e:
		import logging
		logger = logging.getLogger(__name__)
		error_msg = f"獲取財務報表數據時發生錯誤: {str(e)}"
		logger.error(f"[API 錯誤] {error_msg}")
		import traceback
		logger.error(f"[API 錯誤] 錯誤堆棧:\n{traceback.format_exc()}")
		raise HTTPException(
			status_code=500, 
			detail=f"獲取財務報表數據時發生錯誤: {str(e)}。請檢查後端日誌獲取詳細信息。"
		)

# 圖表生成功能已移除以避免錯誤
@app.post(
	"/api/stock/chart/{stock_code}",
	summary="生成股票 K 線圖（已禁用）",
	description="根據股票數據生成 K 線圖（Candlestick Chart），返回 Base64 編碼的圖片。",
	tags=["股票數據"]
)
async def generate_stock_chart(
	stock_code: str = Path(..., description="股票代號（台灣股票為4位數字，例如：2330）", example="2330"),
	period: str = Query("1d", description="時間週期，可選值: 1d, 5d, 1mo, 3mo, 6mo, 1y 等", example="1mo"),
	interval: str = Query("1d", description="時間間隔，可選值: 1m, 5m, 15m, 1h, 1d 等。注意：5m, 15m, 30m, 1h, 1mo 使用盤中數據，其他使用日交易數據", example="1d"),
	days: int = Query(100, description="獲取最近幾天的數據（用於日交易數據，範圍: 1-2000）", ge=1, le=2000, example=100)
):
	"""圖表生成功能已禁用以避免錯誤"""
	raise HTTPException(status_code=503, detail="圖表生成功能已禁用以避免錯誤")

# ========== 股票群組管理 API ==========

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

# 創建股票群組
@app.post(
	"/api/stock-groups",
	summary="創建股票群組",
	description="創建一個新的股票群組。",
	tags=["股票群組管理"]
)
async def create_group(group_data: StockGroupCreate):
	"""
	創建股票群組
	
	創建一個新的股票群組，用於分類管理股票。
	
	**請求體參數:**
	- `groupName`: 群組名稱（必填，唯一）
	- `description`: 群組描述（選填）
	
	**響應示例:**
	```json
	{
		"id": "uuid",
		"groupName": "台積電集團",
		"description": "台積電相關股票",
		"stockCount": 0
	}
	```
	"""
	"""
	獲取所有股票群組
	
	返回所有股票群組的列表，包括每個群組的股票數量。
	
	**響應示例:**
	```json
	[
		{
			"id": "uuid",
			"groupName": "台積電集團",
			"description": "台積電相關股票",
			"stockCount": 5,
			"createdAt": "2024-01-01T00:00:00",
			"updatedAt": "2024-01-01T00:00:00"
		}
	]
	```
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		logger = logging.getLogger(__name__)
		logger.info(f"[API 請求] POST /api/stock-groups")
		logger.info(f"[參數] groupName: {group_data.groupName}, description: {group_data.description}")
		
		result = create_stock_group(group_data.groupName, group_data.description)
		if result is None:
			raise HTTPException(status_code=400, detail=f"群組名稱 '{group_data.groupName}' 已存在")
		
		logger.info(f"[API 響應] 成功創建群組: {result['groupName']}")
		return result
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"創建股票群組時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"創建股票群組時發生錯誤: {str(e)}")

# 獲取所有股票群組
@app.get(
	"/api/stock-groups",
	summary="獲取所有股票群組",
	description="獲取所有股票群組及其股票數量。",
	tags=["股票群組管理"]
)
async def get_all_groups():
	"""
	獲取所有股票群組
	
	返回所有股票群組的列表，包括每個群組的股票數量。
	
	**響應示例:**
	```json
	[
		{
			"id": "uuid",
			"groupName": "台積電集團",
			"description": "台積電相關股票",
			"stockCount": 5,
			"createdAt": "2024-01-01T00:00:00",
			"updatedAt": "2024-01-01T00:00:00"
		}
	]
	```
	"""
	"""
	獲取所有股票群組
	
	返回所有股票群組的列表，包括每個群組的股票數量。
	
	**響應示例:**
	```json
	[
		{
			"id": "uuid",
			"groupName": "台積電集團",
			"description": "台積電相關股票",
			"stockCount": 5,
			"createdAt": "2024-01-01T00:00:00",
			"updatedAt": "2024-01-01T00:00:00"
		}
	]
	```
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		groups = get_all_stock_groups()
		return groups
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"獲取股票群組列表時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取股票群組列表時發生錯誤: {str(e)}")

# 獲取單個股票群組
@app.get(
	"/api/stock-groups/{group_id}",
	summary="獲取股票群組詳情",
	description="根據群組 ID 獲取股票群組的詳細資訊。",
	tags=["股票群組管理"]
)
async def get_group(group_id: str = Path(..., description="群組 ID")):
	"""
	獲取股票群組詳情
	
	根據群組 ID 獲取群組的詳細資訊。
	
	**路徑參數:**
	- `group_id`: 群組 ID
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		group = get_stock_group_by_id(group_id)
		if group is None:
			raise HTTPException(status_code=404, detail=f"找不到群組 ID: {group_id}")
		
		return group
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"獲取股票群組詳情時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取股票群組詳情時發生錯誤: {str(e)}")

# 更新股票群組
@app.put(
	"/api/stock-groups/{group_id}",
	summary="更新股票群組",
	description="更新股票群組的名稱或描述。",
	tags=["股票群組管理"]
)
async def update_group(group_id: str = Path(..., description="群組 ID"), group_data: StockGroupUpdate = ...):
	"""
	更新股票群組
	
	更新群組的名稱或描述。
	
	**路徑參數:**
	- `group_id`: 群組 ID
	
	**請求體參數:**
	- `groupName`: 群組名稱（選填）
	- `description`: 群組描述（選填）
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		success = update_stock_group(
			group_id,
			group_data.groupName if hasattr(group_data, 'groupName') and group_data.groupName else None,
			group_data.description if hasattr(group_data, 'description') and group_data.description else None
		)
		
		if not success:
			raise HTTPException(status_code=400, detail="更新失敗，可能是群組不存在或群組名稱已存在")
		
		# 返回更新後的群組資訊
		updated_group = get_stock_group_by_id(group_id)
		if updated_group is None:
			raise HTTPException(status_code=404, detail="找不到更新後的群組")
		
		return updated_group
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"更新股票群組時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"更新股票群組時發生錯誤: {str(e)}")

# 刪除股票群組
@app.delete(
	"/api/stock-groups/{group_id}",
	summary="刪除股票群組",
	description="刪除股票群組（會自動移除群組中的所有股票）。",
	tags=["股票群組管理"]
)
async def delete_group(group_id: str = Path(..., description="群組 ID")):
	"""
	刪除股票群組
	
	刪除指定的股票群組，會自動移除群組中的所有股票關聯。
	
	**路徑參數:**
	- `group_id`: 群組 ID
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		success = delete_stock_group(group_id)
		if not success:
			raise HTTPException(status_code=404, detail=f"找不到群組 ID: {group_id}")
		
		return {"message": "群組已成功刪除", "groupId": group_id}
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"刪除股票群組時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"刪除股票群組時發生錯誤: {str(e)}")

# 將股票加入群組
@app.post(
	"/api/stock-groups/{group_id}/stocks",
	summary="將股票加入群組",
	description="將指定的股票加入群組。",
	tags=["股票群組管理"]
)
async def add_stock_to_group_endpoint(
	group_id: str = Path(..., description="群組 ID"),
	request: AddStockToGroupRequest = ...
):
	"""
	將股票加入群組
	
	將指定的股票加入群組。
	
	**路徑參數:**
	- `group_id`: 群組 ID
	
	**請求體參數:**
	- `stockCode`: 股票代號（必填）
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		success = add_stock_to_group(group_id, request.stockCode)
		if not success:
			raise HTTPException(status_code=400, detail="無法將股票加入群組，可能是群組不存在或股票已在群組中")
		
		return {"message": "股票已成功加入群組", "groupId": group_id, "stockCode": request.stockCode}
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"將股票加入群組時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"將股票加入群組時發生錯誤: {str(e)}")

# 將股票從群組中移除
@app.delete(
	"/api/stock-groups/{group_id}/stocks/{stock_code}",
	summary="將股票從群組中移除",
	description="將指定的股票從群組中移除。",
	tags=["股票群組管理"]
)
async def remove_stock_from_group_endpoint(
	group_id: str = Path(..., description="群組 ID"),
	stock_code: str = Path(..., description="股票代號")
):
	"""
	將股票從群組中移除
	
	將指定的股票從群組中移除。
	
	**路徑參數:**
	- `group_id`: 群組 ID
	- `stock_code`: 股票代號
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		success = remove_stock_from_group(group_id, stock_code)
		if not success:
			raise HTTPException(status_code=404, detail="找不到指定的群組或股票關聯")
		
		return {"message": "股票已成功從群組中移除", "groupId": group_id, "stockCode": stock_code}
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"將股票從群組中移除時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"將股票從群組中移除時發生錯誤: {str(e)}")

# 獲取群組中的所有股票
@app.get(
	"/api/stock-groups/{group_id}/stocks",
	summary="獲取群組中的所有股票",
	description="獲取指定群組中的所有股票代號列表。",
	tags=["股票群組管理"]
)
async def get_group_stocks(group_id: str = Path(..., description="群組 ID")):
	"""
	獲取群組中的所有股票
	
	返回指定群組中的所有股票代號列表。
	
	**路徑參數:**
	- `group_id`: 群組 ID
	
	**響應示例:**
	```json
	{
		"groupId": "uuid",
		"stocks": ["2330", "2317", "2454"]
	}
	```
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		stocks = get_stocks_by_group(group_id)
		return {"groupId": group_id, "stocks": stocks}
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"獲取群組股票列表時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取群組股票列表時發生錯誤: {str(e)}")

# 獲取股票所屬的所有群組
@app.get(
	"/api/stocks/{stock_code}/groups",
	summary="獲取股票所屬的群組",
	description="獲取指定股票所屬的所有群組。",
	tags=["股票群組管理"]
)
async def get_stock_groups(stock_code: str = Path(..., description="股票代號")):
	"""
	獲取股票所屬的群組
	
	返回指定股票所屬的所有群組列表。
	
	**路徑參數:**
	- `stock_code`: 股票代號
	
	**響應示例:**
	```json
	[
		{
			"id": "uuid",
			"groupName": "台積電集團",
			"description": "台積電相關股票"
		}
	]
	```
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		groups = get_groups_by_stock(stock_code)
		return groups
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"獲取股票所屬群組時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取股票所屬群組時發生錯誤: {str(e)}")

# 獲取所有股票及其群組對應關係
@app.get(
	"/api/stocks/groups",
	summary="獲取所有股票的群組對應關係",
	description="獲取所有股票及其所屬群組的對應關係。",
	tags=["股票群組管理"]
)
async def get_all_stocks_with_groups():
	"""
	獲取所有股票的群組對應關係
	
	返回所有股票及其所屬群組的對應關係。
	
	**響應示例:**
	```json
	[
		{
			"stockCode": "2330",
			"groupNames": ["台積電集團", "半導體產業"]
		}
	]
	```
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		result = get_stocks_with_groups()
		return result
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"獲取股票群組對應關係時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取股票群組對應關係時發生錯誤: {str(e)}")

# ========== 股票 BOM（物料清單）管理 API ==========

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

# 添加 BOM 項目
@app.post(
	"/api/stocks/{parent_stock_code}/bom",
	summary="添加 BOM 項目",
	description="將子股票添加到父股票的物料清單中。",
	tags=["股票 BOM 管理"]
)
async def add_bom_item_endpoint(
	parent_stock_code: str = Path(..., description="父股票代號"),
	bom_data: BOMItemCreate = ...
):
	"""
	添加 BOM 項目
	
	將子股票添加到父股票的物料清單中，例如：ETF 由哪些股票組成。
	
	**路徑參數:**
	- `parent_stock_code`: 父股票代號（例如：0050）
	
	**請求體參數:**
	- `childStockCode`: 子股票代號（必填）
	- `quantity`: 數量（選填，預設 1.0）
	- `weight`: 權重（選填）
	- `unit`: 單位（選填，例如：股、張）
	- `notes`: 備註（選填）
	
	**響應示例:**
	```json
	{
		"success": true,
		"message": "BOM 項目已成功添加"
	}
	```
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
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
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"添加 BOM 項目時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"添加 BOM 項目時發生錯誤: {str(e)}")

# 獲取股票的 BOM（子股票列表）
@app.get(
	"/api/stocks/{stock_code}/bom",
	summary="獲取股票的 BOM",
	description="獲取指定股票的所有子股票（物料清單）。",
	tags=["股票 BOM 管理"]
)
async def get_stock_bom(stock_code: str = Path(..., description="股票代號")):
	"""
	獲取股票的 BOM
	
	返回指定股票的所有子股票列表，包括數量、權重等資訊。
	
	**路徑參數:**
	- `stock_code`: 股票代號
	
	**響應示例:**
	```json
	[
		{
			"id": "uuid",
			"parentStockCode": "0050",
			"childStockCode": "2330",
			"childStockName": "台積電",
			"quantity": 100.0,
			"weight": 0.25,
			"unit": "股",
			"notes": "主要持股"
		}
	]
	```
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		bom_items = get_bom_by_parent(stock_code)
		return bom_items
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"獲取 BOM 列表時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取 BOM 列表時發生錯誤: {str(e)}")

# 獲取包含指定股票的所有父股票
@app.get(
	"/api/stocks/{stock_code}/bom/parents",
	summary="獲取包含該股票的父股票列表",
	description="獲取所有將指定股票作為子項目的父股票列表。",
	tags=["股票 BOM 管理"]
)
async def get_stock_bom_parents(stock_code: str = Path(..., description="股票代號")):
	"""
	獲取包含該股票的父股票列表
	
	返回所有將指定股票作為子項目的父股票列表。
	
	**路徑參數:**
	- `stock_code`: 股票代號
	
	**響應示例:**
	```json
	[
		{
			"id": "uuid",
			"parentStockCode": "0050",
			"parentStockName": "元大台灣50",
			"childStockCode": "2330",
			"quantity": 100.0,
			"weight": 0.25
		}
	]
	```
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		parents = get_parents_by_child(stock_code)
		return parents
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"獲取父股票列表時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取父股票列表時發生錯誤: {str(e)}")

# 更新 BOM 項目
@app.put(
	"/api/stocks/{parent_stock_code}/bom/{child_stock_code}",
	summary="更新 BOM 項目",
	description="更新指定 BOM 項目的數量、權重等資訊。",
	tags=["股票 BOM 管理"]
)
async def update_bom_item_endpoint(
	parent_stock_code: str = Path(..., description="父股票代號"),
	child_stock_code: str = Path(..., description="子股票代號"),
	bom_data: BOMItemUpdate = ...
):
	"""
	更新 BOM 項目
	
	更新指定 BOM 項目的數量、權重、單位或備註。
	
	**路徑參數:**
	- `parent_stock_code`: 父股票代號
	- `child_stock_code`: 子股票代號
	
	**請求體參數:**
	- `quantity`: 數量（選填）
	- `weight`: 權重（選填）
	- `unit`: 單位（選填）
	- `notes`: 備註（選填）
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
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
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"更新 BOM 項目時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"更新 BOM 項目時發生錯誤: {str(e)}")

# 刪除 BOM 項目
@app.delete(
	"/api/stocks/{parent_stock_code}/bom/{child_stock_code}",
	summary="刪除 BOM 項目",
	description="從父股票的物料清單中移除子股票。",
	tags=["股票 BOM 管理"]
)
async def delete_bom_item_endpoint(
	parent_stock_code: str = Path(..., description="父股票代號"),
	child_stock_code: str = Path(..., description="子股票代號")
):
	"""
	刪除 BOM 項目
	
	從父股票的物料清單中移除指定的子股票。
	
	**路徑參數:**
	- `parent_stock_code`: 父股票代號
	- `child_stock_code`: 子股票代號
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		success = delete_bom_item(parent_stock_code, child_stock_code)
		if not success:
			raise HTTPException(status_code=404, detail="找不到指定的 BOM 項目")
		
		return {"success": True, "message": "BOM 項目已成功刪除"}
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"刪除 BOM 項目時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"刪除 BOM 項目時發生錯誤: {str(e)}")

# 獲取 BOM 樹狀結構
@app.get(
	"/api/stocks/{stock_code}/bom/tree",
	summary="獲取 BOM 樹狀結構",
	description="獲取指定股票的完整 BOM 樹狀結構（遞迴）。",
	tags=["股票 BOM 管理"]
)
async def get_stock_bom_tree(
	stock_code: str = Path(..., description="股票代號"),
	max_depth: int = Query(3, description="最大深度", ge=1, le=10)
):
	"""
	獲取 BOM 樹狀結構
	
	返回指定股票的完整 BOM 樹狀結構，包括所有層級的子股票。
	
	**路徑參數:**
	- `stock_code`: 股票代號
	
	**查詢參數:**
	- `max_depth`: 最大深度（範圍：1-10，預設：3）
	
	**響應示例:**
	```json
	{
		"stockCode": "0050",
		"stockName": "元大台灣50",
		"depth": 0,
		"children": [
			{
				"id": "uuid",
				"parentStockCode": "0050",
				"childStockCode": "2330",
				"childStockName": "台積電",
				"quantity": 100.0,
				"weight": 0.25,
				"children": []
			}
		]
	}
	```
	"""
	try:
		if not DB_AVAILABLE:
			raise HTTPException(status_code=503, detail="資料庫服務未啟用")
		
		tree = get_bom_tree(stock_code, max_depth)
		if tree is None:
			raise HTTPException(status_code=404, detail=f"找不到股票 {stock_code} 的 BOM 樹狀結構")
		
		return tree
	except HTTPException:
		raise
	except Exception as e:
		logger = logging.getLogger(__name__)
		logger.error(f"獲取 BOM 樹狀結構時發生錯誤: {str(e)}")
		raise HTTPException(status_code=500, detail=f"獲取 BOM 樹狀結構時發生錯誤: {str(e)}")

# ========== API 限額和快取統計端點 ==========

@app.get(
	"/api/stats/quota",
	summary="獲取 yfinance API 限額統計",
	description="獲取 yfinance API 的使用情況和限額信息，包括請求次數、成功率、剩餘限額等。",
	tags=["統計"]
)
async def get_api_quota_stats():
	"""
	獲取 yfinance API 限額統計
	
	返回 API 使用情況的詳細統計信息，包括：
	- 總請求數、成功數、失敗數
	- 成功率、平均響應時間
	- 每分鐘/每小時/每天的請求數
	- 限額使用百分比
	- 剩餘限額
	
	**響應示例:**
	```json
	{
		"total_requests": 150,
		"successful_requests": 145,
		"failed_requests": 5,
		"success_rate": 96.7,
		"avg_response_time": 1.234,
		"recent_requests": 5,
		"hourly_requests": 45,
		"daily_requests": 150,
		"rate_limits": {
			"requests_per_minute": 20,
			"requests_per_hour": 200,
			"requests_per_day": 2000
		},
		"usage_percentage": {
			"minute": 25.0,
			"hour": 22.5,
			"day": 7.5
		},
		"remaining_quota": {
			"minute": 15,
			"hour": 155,
			"day": 1850
		}
	}
	```
	"""
	if not CACHE_AVAILABLE:
		raise HTTPException(status_code=503, detail="快取服務未啟用")
	
	stats = quota_tracker.get_stats()
	return stats

@app.get(
	"/api/stats/cache",
	summary="獲取快取統計",
	description="獲取內存快取的統計信息，包括快取鍵數量、快取大小等。",
	tags=["統計"]
)
async def get_cache_stats_endpoint():
	"""
	獲取快取統計信息
	
	返回內存快取的統計信息，包括：
	- 總快取鍵數
	- 有效快取鍵數
	- 過期快取鍵數
	- 快取大小（MB）
	
	**響應示例:**
	```json
	{
		"total_keys": 50,
		"valid_keys": 45,
		"expired_keys": 5,
		"cache_size_mb": 2.5
	}
	```
	"""
	if not CACHE_AVAILABLE:
		raise HTTPException(status_code=503, detail="快取服務未啟用")
	
	stats = get_cache_stats()
	return stats

if __name__ == "__main__":
	import uvicorn
	uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info", reload=True)