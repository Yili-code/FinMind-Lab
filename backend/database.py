# database.py - 資料庫連接和初始化（支援 PostgreSQL 和 SQLite）

import logging
import os
from typing import Optional, Union
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

logger = logging.getLogger(__name__)

# 資料庫類型（從環境變數讀取，預設為 postgresql）
DB_TYPE = os.getenv('DB_TYPE', 'postgresql').lower()

# PostgreSQL 連接配置
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'finfo')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

# SQLite 配置（作為備選）
SQLITE_DB_PATH = os.getenv('SQLITE_DB_PATH', 'finfo.db')

def get_param_placeholder():
    """獲取資料庫參數佔位符
    PostgreSQL 使用 %s，SQLite 使用 ?
    """
    return '%s' if DB_TYPE == 'postgresql' else '?'

def get_db_connection():
    """獲取資料庫連接（支援 PostgreSQL 和 SQLite）"""
    if DB_TYPE == 'postgresql':
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD
            )
            # 使用 RealDictCursor 來實現類似 sqlite3.Row 的功能
            conn.cursor_factory = RealDictCursor
            return conn
        except ImportError:
            logger.error("psycopg2 未安裝，請執行: pip install psycopg2-binary")
            raise
        except Exception as e:
            logger.error(f"PostgreSQL 連接失敗: {str(e)}")
            raise
    else:
        # 使用 SQLite 作為備選
        import sqlite3
        from pathlib import Path
        
        db_path = Path(__file__).parent / SQLITE_DB_PATH
        conn = sqlite3.connect(str(db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

def init_database():
    """初始化資料庫，創建所有必要的表格（支援 PostgreSQL 和 SQLite）"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 根據資料庫類型選擇合適的 SQL 語法
        if DB_TYPE == 'postgresql':
            # PostgreSQL 語法
            timestamp_default = "DEFAULT CURRENT_TIMESTAMP"
            text_type = "TEXT"  # 使用 TEXT 而不是 VARCHAR(255) 以支持更長的字符串
            real_type = "NUMERIC"
            integer_type = "BIGINT"
        else:
            # SQLite 語法
            timestamp_default = "DEFAULT CURRENT_TIMESTAMP"
            text_type = "TEXT"
            real_type = "REAL"
            integer_type = "INTEGER"
        
        # 創建股票基本檔表格
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS stock_basics (
                id {text_type} PRIMARY KEY,
                stock_code {text_type} UNIQUE NOT NULL,
                stock_name {text_type},
                current_price {real_type},
                previous_close {real_type},
                market_cap {real_type},
                volume {integer_type},
                average_volume {integer_type},
                pe_ratio {real_type},
                dividend_yield {real_type},
                high_52_week {real_type},
                low_52_week {real_type},
                open_price {real_type},
                high_price {real_type},
                low_price {real_type},
                change {real_type},
                change_percent {real_type},
                created_at TIMESTAMP {timestamp_default},
                updated_at TIMESTAMP {timestamp_default}
            )
        """)
        
        # 創建損益表表格
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS income_statements (
                id {text_type} PRIMARY KEY,
                stock_code {text_type} NOT NULL,
                stock_name {text_type},
                period {text_type} NOT NULL,
                revenue {real_type},
                gross_profit {real_type},
                gross_profit_ratio {real_type},
                operating_expenses {real_type},
                operating_expenses_ratio {real_type},
                operating_income {real_type},
                operating_income_ratio {real_type},
                net_income {real_type},
                other_income {real_type},
                created_at TIMESTAMP {timestamp_default},
                updated_at TIMESTAMP {timestamp_default},
                UNIQUE(stock_code, period)
            )
        """)
        
        # 創建資產負債表表格
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS balance_sheets (
                id {text_type} PRIMARY KEY,
                stock_code {text_type} NOT NULL,
                stock_name {text_type},
                period {text_type} NOT NULL,
                total_assets {real_type},
                total_assets_ratio {real_type},
                shareholders_equity {real_type},
                shareholders_equity_ratio {real_type},
                current_assets {real_type},
                current_assets_ratio {real_type},
                current_liabilities {real_type},
                current_liabilities_ratio {real_type},
                created_at TIMESTAMP {timestamp_default},
                updated_at TIMESTAMP {timestamp_default},
                UNIQUE(stock_code, period)
            )
        """)
        
        # 創建現金流量表表格
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS cash_flows (
                id {text_type} PRIMARY KEY,
                stock_code {text_type} NOT NULL,
                stock_name {text_type},
                period {text_type} NOT NULL,
                operating_cash_flow {real_type},
                investing_cash_flow {real_type},
                investing_cash_flow_ratio {real_type},
                financing_cash_flow {real_type},
                financing_cash_flow_ratio {real_type},
                free_cash_flow {real_type},
                free_cash_flow_ratio {real_type},
                net_cash_flow {real_type},
                net_cash_flow_ratio {real_type},
                created_at TIMESTAMP {timestamp_default},
                updated_at TIMESTAMP {timestamp_default},
                UNIQUE(stock_code, period)
            )
        """)
        
        # 創建日交易數據表格
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS daily_trades (
                id {text_type} PRIMARY KEY,
                stock_code {text_type} NOT NULL,
                stock_name {text_type},
                date {text_type} NOT NULL,
                close_price {real_type},
                avg_price {real_type},
                prev_close {real_type},
                open_price {real_type},
                high_price {real_type},
                low_price {real_type},
                change {real_type},
                change_percent {real_type},
                total_volume {integer_type},
                prev_volume {integer_type},
                inner_volume {integer_type},
                outer_volume {integer_type},
                foreign_investor {integer_type},
                investment_trust {integer_type},
                dealer {integer_type},
                chips {integer_type},
                main_buy {integer_type},
                main_sell {integer_type},
                month_high {real_type},
                month_low {real_type},
                quarter_high {real_type},
                created_at TIMESTAMP {timestamp_default},
                UNIQUE(stock_code, date)
            )
        """)
        
        # 創建股票群組表格
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS stock_groups (
                id {text_type} PRIMARY KEY,
                group_name {text_type} UNIQUE NOT NULL,
                description {text_type},
                created_at TIMESTAMP {timestamp_default},
                updated_at TIMESTAMP {timestamp_default}
            )
        """)
        
        # 創建股票群組成員表格（股票與群組的關聯）
        if DB_TYPE == 'postgresql':
            # PostgreSQL 需要明確啟用外鍵約束
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS stock_group_members (
                    id {text_type} PRIMARY KEY,
                    group_id {text_type} NOT NULL,
                    stock_code {text_type} NOT NULL,
                    created_at TIMESTAMP {timestamp_default},
                    FOREIGN KEY (group_id) REFERENCES stock_groups(id) ON DELETE CASCADE,
                    UNIQUE(group_id, stock_code)
                )
            """)
        else:
            # SQLite 外鍵需要啟用
            cursor.execute("PRAGMA foreign_keys = ON")
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS stock_group_members (
                    id {text_type} PRIMARY KEY,
                    group_id {text_type} NOT NULL,
                    stock_code {text_type} NOT NULL,
                    created_at TIMESTAMP {timestamp_default},
                    FOREIGN KEY (group_id) REFERENCES stock_groups(id) ON DELETE CASCADE,
                    UNIQUE(group_id, stock_code)
                )
            """)
        
        # 創建股票 BOM（物料清單）表格
        # BOM 表示一個股票由哪些子股票組成，以及各自的數量/權重
        if DB_TYPE == 'postgresql':
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS stock_bom (
                    id {text_type} PRIMARY KEY,
                    parent_stock_code {text_type} NOT NULL,
                    child_stock_code {text_type} NOT NULL,
                    quantity {real_type} DEFAULT 1.0,
                    weight {real_type},
                    unit {text_type},
                    notes {text_type},
                    created_at TIMESTAMP {timestamp_default},
                    updated_at TIMESTAMP {timestamp_default},
                    FOREIGN KEY (parent_stock_code) REFERENCES stock_basics(stock_code) ON DELETE CASCADE,
                    FOREIGN KEY (child_stock_code) REFERENCES stock_basics(stock_code) ON DELETE CASCADE,
                    UNIQUE(parent_stock_code, child_stock_code)
                )
            """)
        else:
            cursor.execute("PRAGMA foreign_keys = ON")
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS stock_bom (
                    id {text_type} PRIMARY KEY,
                    parent_stock_code {text_type} NOT NULL,
                    child_stock_code {text_type} NOT NULL,
                    quantity {real_type} DEFAULT 1.0,
                    weight {real_type},
                    unit {text_type},
                    notes {text_type},
                    created_at TIMESTAMP {timestamp_default},
                    updated_at TIMESTAMP {timestamp_default},
                    FOREIGN KEY (parent_stock_code) REFERENCES stock_basics(stock_code) ON DELETE CASCADE,
                    FOREIGN KEY (child_stock_code) REFERENCES stock_basics(stock_code) ON DELETE CASCADE,
                    UNIQUE(parent_stock_code, child_stock_code)
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
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_stock_groups_name 
            ON stock_groups(group_name)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_stock_group_members_group_id 
            ON stock_group_members(group_id)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_stock_group_members_stock_code 
            ON stock_group_members(stock_code)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_stock_bom_parent 
            ON stock_bom(parent_stock_code)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_stock_bom_child 
            ON stock_bom(child_stock_code)
        """)
        
        conn.commit()
        logger.info(f"資料庫初始化成功（使用 {DB_TYPE.upper()}）")
        
    except Exception as e:
        try:
            conn.rollback()
        except:
            pass
        logger.error(f"資料庫初始化失敗: {str(e)}")
        raise
    finally:
        try:
            conn.close()
        except:
            pass

def test_db_connection() -> bool:
    """測試資料庫連接是否正常"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"資料庫連接測試失敗: {str(e)}")
        return False

# 應用啟動時自動初始化資料庫
if __name__ == "__main__":
    init_database()
    print("資料庫初始化完成！")

