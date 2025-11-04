from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Data Scraper API")


app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/api/hello")
def read_root():
	return {"message": "Hello from FastAPI"}


# 以 `uvicorn backend.main:app --reload --port 8000` 啟動

