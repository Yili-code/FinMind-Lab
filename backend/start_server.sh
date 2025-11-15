#!/bin/bash
# 啟動後端和前端服務器（Linux/Mac）

# 切換到項目根目錄（從 backend 目錄往上）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "========================================"
echo "正在啟動後端服務器..."
echo "========================================"
echo ""

# 進入 backend 目錄
cd backend

# 檢查 Python 是否安裝
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
else
    echo "[錯誤] 找不到 Python，請確認 Python 已安裝並添加到 PATH"
    exit 1
fi

# 檢查虛擬環境是否存在，如果不存在則創建
if [ ! -d ".venv" ]; then
    echo "正在創建虛擬環境..."
    $PYTHON_CMD -m venv .venv
    if [ $? -ne 0 ]; then
        echo "[錯誤] 虛擬環境創建失敗"
        exit 1
    fi
    echo "虛擬環境創建完成"
fi

# 激活虛擬環境
echo "正在激活虛擬環境..."
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo "[錯誤] 虛擬環境激活失敗"
    exit 1
fi

# 檢查並安裝依賴
if [ ! -f ".venv/bin/uvicorn" ]; then
    echo "正在安裝依賴套件..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[錯誤] 依賴安裝失敗"
        exit 1
    fi
fi

echo ""
echo "後端服務器將在 http://127.0.0.1:8000 啟動"
echo "按 Ctrl+C 可停止服務器"
echo ""
echo "========================================"
echo ""

# 在新的終端窗口中啟動前端
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# 檢測操作系統並使用適當的命令打開新終端
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd '$FRONTEND_DIR' && npm run dev\""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd '$FRONTEND_DIR' && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd '$FRONTEND_DIR' && npm run dev" &
    elif command -v konsole &> /dev/null; then
        konsole -e bash -c "cd '$FRONTEND_DIR' && npm run dev; exec bash" &
    else
        echo "[警告] 無法找到合適的終端應用程式，前端將在後台運行"
        (cd "$FRONTEND_DIR" && npm run dev) &
    fi
else
    echo "[警告] 未知的操作系統，前端將在後台運行"
    (cd "$FRONTEND_DIR" && npm run dev) &
fi

# 啟動後端服務器
python -m uvicorn main:app --reload --port 8000 --log-level warning

# 如果服務器異常退出，顯示錯誤訊息
if [ $? -ne 0 ]; then
    echo ""
    echo "[錯誤] 服務器啟動失敗"
    echo "請檢查上述錯誤訊息"
    exit 1
fi

