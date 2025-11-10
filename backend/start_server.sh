#!/bin/bash
# 啟動後端服務器（Linux/Mac）
cd "$(dirname "$0")"
python -m uvicorn main:app --reload --port 8000 --log-level warning

