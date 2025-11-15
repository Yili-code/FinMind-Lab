@echo off
chcp 65001 >nul 2>&1
REM 啟動後端服務器（不使用自動重載，避免 Windows multiprocessing 問題）

REM 切換到項目根目錄（從 backend 目錄往上）
cd /d %~dp0\..

echo ========================================
echo 正在啟動後端服務器（無自動重載模式）...
echo ========================================
echo.

REM 進入 backend 目錄
cd .\backend

REM 檢查 Python 是否安裝
py -3 --version >nul 2>&1
if errorlevel 1 (
    python --version >nul 2>&1
    if errorlevel 1 (
        echo [錯誤] 找不到 Python，請確認 Python 已安裝並添加到 PATH
        pause
        exit /b 1
    )
    set PYTHON_CMD=python
) else (
    set PYTHON_CMD=py -3
)

REM 檢查虛擬環境是否存在，如果不存在則創建
if not exist ".venv" (
    echo 正在創建虛擬環境...
    %PYTHON_CMD% -m venv .venv
    if errorlevel 1 (
        echo [錯誤] 虛擬環境創建失敗
        pause
        exit /b 1
    )
    echo 虛擬環境創建完成
)

REM 激活虛擬環境
echo 正在激活虛擬環境...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [錯誤] 虛擬環境激活失敗
    pause
    exit /b 1
)

REM 檢查並安裝依賴
if not exist ".venv\Scripts\uvicorn.exe" (
    echo 正在安裝依賴套件...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [錯誤] 依賴安裝失敗
        pause
        exit /b 1
    )
)

echo.
echo 後端服務器將在 http://localhost:8000 啟動
echo 注意：此模式不使用自動重載，修改代碼後需要手動重啟服務器
echo 按 Ctrl+C 可停止服務器
echo.
echo ========================================
echo.

REM 設置環境變數
set PYTHONUNBUFFERED=1

REM 在新的終端窗口中啟動前端
start "FinMind Lab - Frontend" cmd /k "cd /d %~dp0\..\frontend && npm run dev"

REM 啟動後端服務器（不使用 --reload）
python -m uvicorn main:app --port 8000 --log-level warning

REM 如果服務器異常退出，顯示錯誤訊息
if errorlevel 1 (
    echo.
    echo [錯誤] 服務器啟動失敗
    echo 請檢查上述錯誤訊息
    pause
)

