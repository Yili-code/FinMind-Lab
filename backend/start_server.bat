@echo off
REM 啟動後端服務器（Windows）
cd /d %~dp0
python -m uvicorn main:app --reload --port 8000 --log-level warning

