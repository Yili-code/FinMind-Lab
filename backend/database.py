# database.py - SQLite 資料庫連接和初始化

import sqlite3
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# 資料庫文件路徑
DB_PATH = Path(__file__).parent / "infohub.db"

def get_db_connection() -> sqlite3.Connection:
    """獲取資料庫連接"""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row  # 使用 Row 工廠，可以通過列名訪問
    return conn

def init_database():
    """初始化資料庫，創建所有必要的表格"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 創建股票基本檔表格
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stock_basics (
                id TEXT PRIMARY KEY,
                stock_code TEXT UNIQUE NOT NULL,
                stock_name TEXT,
                current_price REAL,
                previous_close REAL,
                market_cap REAL,
                volume INTEGER,
                average_volume INTEGER,
                pe_ratio REAL,
                dividend_yield REAL,
                high_52_week REAL,
                low_52_week REAL,
                open_price REAL,
                high_price REAL,
                low_price REAL,
                change REAL,
                change_percent REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 創建損益表表格
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS income_statements (
                id TEXT PRIMARY KEY,
                stock_code TEXT NOT NULL,
                stock_name TEXT,
                period TEXT NOT NULL,
                revenue REAL,
                gross_profit REAL,
                gross_profit_ratio REAL,
                operating_expenses REAL,
                operating_expenses_ratio REAL,
                operating_income REAL,
                operating_income_ratio REAL,
                net_income REAL,
                other_income REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(stock_code, period)
            )
        """)
        
        # 創建資產負債表表格
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS balance_sheets (
                id TEXT PRIMARY KEY,
                stock_code TEXT NOT NULL,
                stock_name TEXT,
                period TEXT NOT NULL,
                total_assets REAL,
                total_assets_ratio REAL,
                shareholders_equity REAL,
                shareholders_equity_ratio REAL,
                current_assets REAL,
                current_assets_ratio REAL,
                current_liabilities REAL,
                current_liabilities_ratio REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(stock_code, period)
            )
        """)
        
        # 創建現金流量表表格
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cash_flows (
                id TEXT PRIMARY KEY,
                stock_code TEXT NOT NULL,
                stock_name TEXT,
                period TEXT NOT NULL,
                operating_cash_flow REAL,
                investing_cash_flow REAL,
                investing_cash_flow_ratio REAL,
                financing_cash_flow REAL,
                financing_cash_flow_ratio REAL,
                free_cash_flow REAL,
                free_cash_flow_ratio REAL,
                net_cash_flow REAL,
                net_cash_flow_ratio REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(stock_code, period)
            )
        """)
        
        # 創建日交易數據表格
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_trades (
                id TEXT PRIMARY KEY,
                stock_code TEXT NOT NULL,
                stock_name TEXT,
                date TEXT NOT NULL,
                close_price REAL,
                avg_price REAL,
                prev_close REAL,
                open_price REAL,
                high_price REAL,
                low_price REAL,
                change REAL,
                change_percent REAL,
                total_volume INTEGER,
                prev_volume INTEGER,
                inner_volume INTEGER,
                outer_volume INTEGER,
                foreign_investor INTEGER,
                investment_trust INTEGER,
                dealer INTEGER,
                chips INTEGER,
                main_buy INTEGER,
                main_sell INTEGER,
                month_high REAL,
                month_low REAL,
                quarter_high REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(stock_code, date)
            )
        """)
        
        # 創建索引
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_stock_basics_code 
            ON stock_basics(stock_code)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_income_stock_code 
            ON income_statements(stock_code)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_balance_stock_code 
            ON balance_sheets(stock_code)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_cashflow_stock_code 
            ON cash_flows(stock_code)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_daily_trades_stock_code 
            ON daily_trades(stock_code)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_daily_trades_date 
            ON daily_trades(date)
        """)
        
        conn.commit()
        logger.info("資料庫初始化成功")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"資料庫初始化失敗: {str(e)}")
        raise
    finally:
        conn.close()

# 應用啟動時自動初始化資料庫
if __name__ == "__main__":
    init_database()
    print("資料庫初始化完成！")

