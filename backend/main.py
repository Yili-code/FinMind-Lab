# main.py 是後端主程式，負責提供 API 給前端存取

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime
import json
import os

app = FastAPI(title="FinMind Lab API")

# 允許前端存取後端 API: 加入 CORS 中介層設定
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173"],
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