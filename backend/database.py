# database.py - SQLite 資料庫設定與初始化

import sqlite3
import os
from typing import Optional

DATABASE_PATH = "finmind_lab.db"

def get_db_connection():
    """取得資料庫連線"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # 讓查詢結果可以像字典一樣存取
    return conn

def init_database():
    """初始化資料庫，建立所有必要的表格"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table 3: 股票基本檔
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stock_basics (
            id TEXT PRIMARY KEY,
            stock_code TEXT NOT NULL UNIQUE,
            stock_name TEXT NOT NULL,
            category TEXT,
            established_date TEXT,
            listed_date TEXT NOT NULL,
            industry TEXT NOT NULL,
            capital REAL NOT NULL,
            issued_shares REAL,
            market_value REAL,
            directors TEXT,
            market TEXT NOT NULL,
            group_name TEXT,
            employees INTEGER,
            dividend REAL,
            yield_rate REAL,
            dividend_per_share REAL,
            closing_price REAL,
            ex_dividend_date TEXT,
            pe_ratio REAL,
            equity_ratio REAL,
            industry_change REAL,
            industry_eps REAL,
            industry_yield REAL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Table 4: 損益表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS income_statements (
            id TEXT PRIMARY KEY,
            stock_code TEXT NOT NULL,
            period TEXT NOT NULL,
            revenue REAL NOT NULL,
            gross_profit REAL NOT NULL,
            gross_profit_ratio REAL,
            operating_expenses REAL NOT NULL,
            operating_expenses_ratio REAL,
            operating_income REAL NOT NULL,
            operating_income_ratio REAL,
            net_income REAL NOT NULL,
            other_income REAL,
            UNIQUE(stock_code, period)
        )
    ''')
    
    # Table 5: 資產負債表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS balance_sheets (
            id TEXT PRIMARY KEY,
            stock_code TEXT NOT NULL,
            period TEXT NOT NULL,
            total_assets REAL NOT NULL,
            total_assets_ratio REAL,
            shareholders_equity REAL NOT NULL,
            shareholders_equity_ratio REAL,
            current_assets REAL NOT NULL,
            current_assets_ratio REAL,
            current_liabilities REAL NOT NULL,
            current_liabilities_ratio REAL,
            UNIQUE(stock_code, period)
        )
    ''')
    
    # Table 6: 現金流量表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cash_flows (
            id TEXT PRIMARY KEY,
            stock_code TEXT NOT NULL,
            period TEXT NOT NULL,
            operating_cash_flow REAL NOT NULL,
            investing_cash_flow REAL NOT NULL,
            investing_cash_flow_ratio REAL,
            financing_cash_flow REAL NOT NULL,
            financing_cash_flow_ratio REAL,
            free_cash_flow REAL NOT NULL,
            free_cash_flow_ratio REAL,
            net_cash_flow REAL NOT NULL,
            net_cash_flow_ratio REAL,
            UNIQUE(stock_code, period)
        )
    ''')
    
    # 建立索引以提升查詢效能
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_stock_basics_code ON stock_basics(stock_code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_income_stock_code ON income_statements(stock_code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_balance_stock_code ON balance_sheets(stock_code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_cashflow_stock_code ON cash_flows(stock_code)')
    
    conn.commit()
    conn.close()
    print("資料庫初始化完成！")

if __name__ == "__main__":
    init_database()

