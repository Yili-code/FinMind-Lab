# crud.py - 資料庫 CRUD 操作

import uuid
from datetime import datetime
from typing import List, Optional
from database import get_db_connection
from models import (
    StockBasicCreate, StockBasic,
    IncomeStatementCreate, IncomeStatement,
    BalanceSheetCreate, BalanceSheet,
    CashFlowCreate, CashFlow
)

# ========== Table 3: 股票基本檔 ==========
def create_stock_basic(stock: StockBasicCreate) -> StockBasic:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    stock_id = f"stock_{uuid.uuid4().hex[:12]}"
    created_at = datetime.now().isoformat()
    
    cursor.execute('''
        INSERT INTO stock_basics (
            id, stock_code, stock_name, category, established_date, listed_date,
            industry, capital, issued_shares, market_value, directors, market,
            group_name, employees, dividend, yield_rate, dividend_per_share,
            closing_price, ex_dividend_date, pe_ratio, equity_ratio,
            industry_change, industry_eps, industry_yield, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        stock_id, stock.stock_code, stock.stock_name, stock.category,
        stock.established_date, stock.listed_date, stock.industry, stock.capital,
        stock.issued_shares, stock.market_value, stock.directors, stock.market,
        stock.group_name, stock.employees, stock.dividend, stock.yield_rate,
        stock.dividend_per_share, stock.closing_price, stock.ex_dividend_date,
        stock.pe_ratio, stock.equity_ratio, stock.industry_change,
        stock.industry_eps, stock.industry_yield, created_at
    ))
    
    conn.commit()
    conn.close()
    
    return get_stock_basic_by_code(stock.stock_code)

def get_all_stock_basics() -> List[StockBasic]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM stock_basics ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_stock_basic_by_code(stock_code: str) -> Optional[StockBasic]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM stock_basics WHERE stock_code = ?', (stock_code,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def update_stock_basic(stock_code: str, updates: dict) -> Optional[StockBasic]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 建立更新語句
    set_clause = ', '.join([f"{key} = ?" for key in updates.keys()])
    values = list(updates.values()) + [stock_code]
    
    cursor.execute(f'UPDATE stock_basics SET {set_clause} WHERE stock_code = ?', values)
    conn.commit()
    conn.close()
    
    return get_stock_basic_by_code(stock_code) if cursor.rowcount > 0 else None

def delete_stock_basic(stock_code: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM stock_basics WHERE stock_code = ?', (stock_code,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    
    return deleted

# ========== Table 4: 損益表 ==========
def create_income_statement(income: IncomeStatementCreate) -> IncomeStatement:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    income_id = f"income_{uuid.uuid4().hex[:12]}"
    
    cursor.execute('''
        INSERT OR REPLACE INTO income_statements (
            id, stock_code, period, revenue, gross_profit, gross_profit_ratio,
            operating_expenses, operating_expenses_ratio, operating_income,
            operating_income_ratio, net_income, other_income
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        income_id, income.stock_code, income.period, income.revenue,
        income.gross_profit, income.gross_profit_ratio, income.operating_expenses,
        income.operating_expenses_ratio, income.operating_income,
        income.operating_income_ratio, income.net_income, income.other_income
    ))
    
    conn.commit()
    conn.close()
    
    return get_income_statement_by_id(income_id)

def get_all_income_statements() -> List[IncomeStatement]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM income_statements ORDER BY stock_code, period DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_income_statements_by_stock_code(stock_code: str) -> List[IncomeStatement]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM income_statements WHERE stock_code = ? ORDER BY period DESC', (stock_code,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_income_statement_by_id(income_id: str) -> Optional[IncomeStatement]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM income_statements WHERE id = ?', (income_id,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def update_income_statement(income_id: str, updates: dict) -> Optional[IncomeStatement]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    set_clause = ', '.join([f"{key} = ?" for key in updates.keys()])
    values = list(updates.values()) + [income_id]
    
    cursor.execute(f'UPDATE income_statements SET {set_clause} WHERE id = ?', values)
    conn.commit()
    conn.close()
    
    return get_income_statement_by_id(income_id) if cursor.rowcount > 0 else None

def delete_income_statement(income_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM income_statements WHERE id = ?', (income_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    
    return deleted

# ========== Table 5: 資產負債表 ==========
def create_balance_sheet(balance: BalanceSheetCreate) -> BalanceSheet:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    balance_id = f"balance_{uuid.uuid4().hex[:12]}"
    
    cursor.execute('''
        INSERT OR REPLACE INTO balance_sheets (
            id, stock_code, period, total_assets, total_assets_ratio,
            shareholders_equity, shareholders_equity_ratio, current_assets,
            current_assets_ratio, current_liabilities, current_liabilities_ratio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        balance_id, balance.stock_code, balance.period, balance.total_assets,
        balance.total_assets_ratio, balance.shareholders_equity,
        balance.shareholders_equity_ratio, balance.current_assets,
        balance.current_assets_ratio, balance.current_liabilities,
        balance.current_liabilities_ratio
    ))
    
    conn.commit()
    conn.close()
    
    return get_balance_sheet_by_id(balance_id)

def get_all_balance_sheets() -> List[BalanceSheet]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM balance_sheets ORDER BY stock_code, period DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_balance_sheets_by_stock_code(stock_code: str) -> List[BalanceSheet]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM balance_sheets WHERE stock_code = ? ORDER BY period DESC', (stock_code,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_balance_sheet_by_id(balance_id: str) -> Optional[BalanceSheet]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM balance_sheets WHERE id = ?', (balance_id,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def update_balance_sheet(balance_id: str, updates: dict) -> Optional[BalanceSheet]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    set_clause = ', '.join([f"{key} = ?" for key in updates.keys()])
    values = list(updates.values()) + [balance_id]
    
    cursor.execute(f'UPDATE balance_sheets SET {set_clause} WHERE id = ?', values)
    conn.commit()
    conn.close()
    
    return get_balance_sheet_by_id(balance_id) if cursor.rowcount > 0 else None

def delete_balance_sheet(balance_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM balance_sheets WHERE id = ?', (balance_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    
    return deleted

# ========== Table 6: 現金流量表 ==========
def create_cash_flow(cash_flow: CashFlowCreate) -> CashFlow:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cash_flow_id = f"cashflow_{uuid.uuid4().hex[:12]}"
    
    cursor.execute('''
        INSERT OR REPLACE INTO cash_flows (
            id, stock_code, period, operating_cash_flow, investing_cash_flow,
            investing_cash_flow_ratio, financing_cash_flow, financing_cash_flow_ratio,
            free_cash_flow, free_cash_flow_ratio, net_cash_flow, net_cash_flow_ratio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        cash_flow_id, cash_flow.stock_code, cash_flow.period,
        cash_flow.operating_cash_flow, cash_flow.investing_cash_flow,
        cash_flow.investing_cash_flow_ratio, cash_flow.financing_cash_flow,
        cash_flow.financing_cash_flow_ratio, cash_flow.free_cash_flow,
        cash_flow.free_cash_flow_ratio, cash_flow.net_cash_flow,
        cash_flow.net_cash_flow_ratio
    ))
    
    conn.commit()
    conn.close()
    
    return get_cash_flow_by_id(cash_flow_id)

def get_all_cash_flows() -> List[CashFlow]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM cash_flows ORDER BY stock_code, period DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_cash_flows_by_stock_code(stock_code: str) -> List[CashFlow]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM cash_flows WHERE stock_code = ? ORDER BY period DESC', (stock_code,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_cash_flow_by_id(cash_flow_id: str) -> Optional[CashFlow]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM cash_flows WHERE id = ?', (cash_flow_id,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def update_cash_flow(cash_flow_id: str, updates: dict) -> Optional[CashFlow]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    set_clause = ', '.join([f"{key} = ?" for key in updates.keys()])
    values = list(updates.values()) + [cash_flow_id]
    
    cursor.execute(f'UPDATE cash_flows SET {set_clause} WHERE id = ?', values)
    conn.commit()
    conn.close()
    
    return get_cash_flow_by_id(cash_flow_id) if cursor.rowcount > 0 else None

def delete_cash_flow(cash_flow_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM cash_flows WHERE id = ?', (cash_flow_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    
    return deleted

