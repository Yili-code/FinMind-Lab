# check_backend.py - 檢查後端是否可以正常啟動

import sys
import os

print("後端啟動診斷工具")
print("=" * 16)

# 1. 檢查 Python 版本
print("\n1. 檢查 Python 版本...")
print(f"   Python 版本: {sys.version}")

# 2. 檢查當前目錄
print("\n2. 檢查當前目錄...")
print(f"   當前目錄: {os.getcwd()}")

# 3. 檢查必要的模組
print("\n3. 檢查必要的模組...")
required_modules = [
    'fastapi',
    'uvicorn',
    'yfinance',
    'pandas',
    'pydantic'
]

missing_modules = []
for module in required_modules:
    try:
        __import__(module)
        print(f"   {module}  ✓")
    except ImportError:
        print(f"   ✗ {module}")
        missing_modules.append(module)

if missing_modules:
    print(f"\n   缺少模組: {', '.join(missing_modules)}")
    print("   請運行: pip install -r requirements.txt")

# 4. 檢查模組導入
print("\n4. 檢查模組導入...")
try:
    from services.yfinance_service import (
        get_stock_info,
        get_intraday_data,
        get_daily_trade_data,
        get_market_index_data
    )
    print("   services.yfinance_service  ✓")
except ImportError as e:
    print(f"   services.yfinance_service  ✗: {e}")
    try:
        from backend.services.yfinance_service import (
            get_stock_info,
            get_intraday_data,
            get_daily_trade_data,
            get_market_index_data
        )
        print("   backend.services.yfinance_service  ✓")
    except ImportError as e2:
        print(f"   backend.services.yfinance_service  ✗: {e2}")

# 5. 檢查 main.py 導入
print("\n5. 檢查 main.py 導入...")
try:
    import main
    print("   main.py  ✓")
    print(f"   FastAPI app: {main.app}")
except Exception as e:
    print(f"   main.py  ✗: {e}")
    import traceback
    traceback.print_exc()

# 6. 檢查端口是否被占用
print("\n6. 檢查端口 8000...")
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
result = sock.connect_ex(('127.0.0.1', 8000))
sock.close()

if result == 0:
    print("   ⚠ 端口 8000 已被占用")
    print("   請關閉占用該端口的程序，或使用其他端口")
else:
    print("   端口 8000  ✓")

# 7. 檢查文件結構
print("\n7. 檢查文件結構...")
required_files = [
    'main.py',
    'services/__init__.py',
    'services/yfinance_service.py'
]

for file in required_files:
    if os.path.exists(file):
        print(f"   {file}  ✓")
    else:
        print(f"   {file}  ✗")

print("\n" + "=" * 5)
print("DONE!")
print("=" * 5)

if not missing_modules:
    print("\nSuggested command:")
    print("  python -m uvicorn main:app --reload --port 8000 --log-level warning")
else:
    print("\nPlease install the missing modules:")
    print("  pip install -r requirements.txt")

