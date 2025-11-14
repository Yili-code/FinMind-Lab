# main.py 是後端主程式，負責提供 API 給前端存取

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from pydantic import BaseModel, EmailStr
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
        get_financial_statements
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
            get_financial_statements
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
            get_financial_statements
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
				<p><strong>API 基礎 URL:</strong> http://127.0.0.1:8000</p>
				<p>使用 Swagger UI 來探索所有可用的 API 端點</p>
			</div>
		</div>
	</body>
	</html>
	"""
	return HTMLResponse(content=html_content)

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

# 獲取股票基本資訊
@app.get("/api/stock/info/{stock_code}")
async def get_stock_information(stock_code: str):
	try:
		info = get_stock_info(stock_code)
		if info is None:
			raise HTTPException(status_code=404, detail=f"無法獲取股票 {stock_code} 的資訊")
		return info
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"獲取股票資訊時發生錯誤: {str(e)}")

# 獲取股票盤中即時數據（成交明細）
@app.get("/api/stock/intraday/{stock_code}")
async def get_stock_intraday(
	stock_code: str,
	period: str = Query("1d", description="時間週期: 1d, 5d, 1mo 等"),
	interval: str = Query("1m", description="時間間隔: 1m, 5m, 15m, 1h, 1d 等")
):
	try:
		data = get_intraday_data(stock_code, period=period, interval=interval)
		return {
			"stockCode": stock_code,
			"data": data,
			"count": len(data)
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"獲取盤中數據時發生錯誤: {str(e)}")

# 獲取股票日交易檔數據
@app.get("/api/stock/daily/{stock_code}")
async def get_stock_daily(
	stock_code: str,
	days: int = Query(5, description="獲取最近幾天的數據", ge=1, le=2000)
):
	try:
		import logging
		logger = logging.getLogger(__name__)
		logger.info(f"API 請求: 獲取股票 {stock_code} 的日交易數據，天數: {days}")
		
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
@app.get("/api/stock/batch")
async def get_multiple_stocks(
	stock_codes: str = Query(..., description="股票代號，用逗號分隔，例如: 2330,2317")
):
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

# 獲取大盤指數數據
@app.get("/api/stock/market-index")
async def get_market_index(
	index_code: str = Query("^TWII", description="指數代號，預設為 ^TWII (加權指數)"),
	days: int = Query(5, description="獲取最近幾天的數據", ge=1, le=30)
):
	try:
		data = get_market_index_data(index_code, days=days)
		return {
			"indexCode": index_code,
			"data": data,
			"count": len(data)
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"獲取大盤指數數據時發生錯誤: {str(e)}")

# 獲取股票財務報表數據（損益表、資產負債表、現金流量表）
@app.get("/api/stock/financial/{stock_code}")
async def get_stock_financial(stock_code: str):
	try:
		import logging
		logger = logging.getLogger(__name__)
		logger.info(f"[API] 收到獲取股票 {stock_code} 財務報表數據的請求")
		
		data = get_financial_statements(stock_code)
		if data is None:
			error_msg = f"無法獲取股票 {stock_code} 的財務報表數據。可能原因：1) yfinance 對台股財務報表支持有限 2) 該股票沒有可用的財務數據 3) 數據格式不匹配。請查看後端日誌獲取詳細信息。"
			logger.warning(f"[API] {error_msg}")
			raise HTTPException(status_code=404, detail=error_msg)
		
		logger.info(f"[API] 成功返回股票 {stock_code} 的財務報表數據")
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
@app.post("/api/stock/chart/{stock_code}")
async def generate_stock_chart(
	stock_code: str,
	period: str = Query("1d", description="時間週期: 1d, 5d, 1mo 等"),
	interval: str = Query("1d", description="時間間隔: 1m, 5m, 15m, 1h, 1d 等"),
	days: int = Query(100, description="獲取最近幾天的數據（用於日交易數據）", ge=1, le=2000)
):
	"""
	生成股票 K 線圖
	
	根據 interval 參數決定使用盤中數據還是日交易數據
	"""
	try:
		# 判斷使用哪種數據源
		use_intraday = interval in ['5m', '15m', '30m', '1h', '1mo']
		
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
		
		return JSONResponse(content={
			"stockCode": stock_code,
			"stockName": stock_name,
			"image": f"data:image/png;base64,{img_base64}",
			"dataCount": len(chart_data)
		})
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"生成圖表時發生錯誤: {str(e)}")

if __name__ == "__main__":
	import uvicorn
	uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info", reload=True)