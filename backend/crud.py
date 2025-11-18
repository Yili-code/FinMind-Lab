# crud.py - 資料庫 CRUD 操作

import sqlite3
import logging
from typing import Optional, Dict, List
from datetime import datetime
import uuid
from database import get_db_connection

logger = logging.getLogger(__name__)

# ========== 股票基本檔操作 ==========

def save_stock_basic(stock_data: Dict) -> bool:
    """保存或更新股票基本資訊"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 檢查是否已存在
        cursor.execute("SELECT id FROM stock_basics WHERE stock_code = ?", (stock_data.get('stockCode'),))
        existing = cursor.fetchone()
        
        if existing:
            # 更新現有記錄
            cursor.execute("""
                UPDATE stock_basics SET
                    stock_name = ?,
                    current_price = ?,
                    previous_close = ?,
                    market_cap = ?,
                    volume = ?,
                    average_volume = ?,
                    pe_ratio = ?,
                    dividend_yield = ?,
                    high_52_week = ?,
                    low_52_week = ?,
                    open_price = ?,
                    high_price = ?,
                    low_price = ?,
                    change = ?,
                    change_percent = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE stock_code = ?
            """, (
                stock_data.get('stockName'),
                stock_data.get('currentPrice'),
                stock_data.get('previousClose'),
                stock_data.get('marketCap'),
                stock_data.get('volume'),
                stock_data.get('averageVolume'),
                stock_data.get('peRatio'),
                stock_data.get('dividendYield'),
                stock_data.get('high52Week'),
                stock_data.get('low52Week'),
                stock_data.get('open'),
                stock_data.get('high'),
                stock_data.get('low'),
                stock_data.get('change'),
                stock_data.get('changePercent'),
                stock_data.get('stockCode')
            ))
        else:
            # 插入新記錄
            record_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO stock_basics (
                    id, stock_code, stock_name, current_price, previous_close,
                    market_cap, volume, average_volume, pe_ratio, dividend_yield,
                    high_52_week, low_52_week, open_price, high_price, low_price,
                    change, change_percent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                record_id,
                stock_data.get('stockCode'),
                stock_data.get('stockName'),
                stock_data.get('currentPrice'),
                stock_data.get('previousClose'),
                stock_data.get('marketCap'),
                stock_data.get('volume'),
                stock_data.get('averageVolume'),
                stock_data.get('peRatio'),
                stock_data.get('dividendYield'),
                stock_data.get('high52Week'),
                stock_data.get('low52Week'),
                stock_data.get('open'),
                stock_data.get('high'),
                stock_data.get('low'),
                stock_data.get('change'),
                stock_data.get('changePercent')
            ))
        
        conn.commit()
        conn.close()
        logger.debug(f"成功保存股票基本資訊: {stock_data.get('stockCode')}")
        return True
        
    except Exception as e:
        logger.error(f"保存股票基本資訊失敗: {str(e)}")
        return False

# ========== 財務報表操作 ==========

def save_income_statement(income_data: Dict) -> bool:
    """保存或更新損益表數據"""
    if not income_data:
        return False
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 檢查是否已存在
        cursor.execute("""
            SELECT id FROM income_statements 
            WHERE stock_code = ? AND period = ?
        """, (income_data.get('stockCode'), income_data.get('period')))
        existing = cursor.fetchone()
        
        if existing:
            # 更新
            cursor.execute("""
                UPDATE income_statements SET
                    stock_name = ?,
                    revenue = ?,
                    gross_profit = ?,
                    gross_profit_ratio = ?,
                    operating_expenses = ?,
                    operating_expenses_ratio = ?,
                    operating_income = ?,
                    operating_income_ratio = ?,
                    net_income = ?,
                    other_income = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE stock_code = ? AND period = ?
            """, (
                income_data.get('stockName'),
                income_data.get('revenue'),
                income_data.get('grossProfit'),
                income_data.get('grossProfitRatio'),
                income_data.get('operatingExpenses'),
                income_data.get('operatingExpensesRatio'),
                income_data.get('operatingIncome'),
                income_data.get('operatingIncomeRatio'),
                income_data.get('netIncome'),
                income_data.get('otherIncome'),
                income_data.get('stockCode'),
                income_data.get('period')
            ))
        else:
            # 插入
            record_id = income_data.get('id') or str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO income_statements (
                    id, stock_code, stock_name, period, revenue, gross_profit,
                    gross_profit_ratio, operating_expenses, operating_expenses_ratio,
                    operating_income, operating_income_ratio, net_income, other_income
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                record_id,
                income_data.get('stockCode'),
                income_data.get('stockName'),
                income_data.get('period'),
                income_data.get('revenue'),
                income_data.get('grossProfit'),
                income_data.get('grossProfitRatio'),
                income_data.get('operatingExpenses'),
                income_data.get('operatingExpensesRatio'),
                income_data.get('operatingIncome'),
                income_data.get('operatingIncomeRatio'),
                income_data.get('netIncome'),
                income_data.get('otherIncome')
            ))
        
        conn.commit()
        conn.close()
        logger.debug(f"成功保存損益表: {income_data.get('stockCode')} - {income_data.get('period')}")
        return True
        
    except Exception as e:
        logger.error(f"保存損益表失敗: {str(e)}")
        return False

def save_balance_sheet(balance_data: Dict) -> bool:
    """保存或更新資產負債表數據"""
    if not balance_data:
        return False
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM balance_sheets 
            WHERE stock_code = ? AND period = ?
        """, (balance_data.get('stockCode'), balance_data.get('period')))
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute("""
                UPDATE balance_sheets SET
                    stock_name = ?,
                    total_assets = ?,
                    total_assets_ratio = ?,
                    shareholders_equity = ?,
                    shareholders_equity_ratio = ?,
                    current_assets = ?,
                    current_assets_ratio = ?,
                    current_liabilities = ?,
                    current_liabilities_ratio = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE stock_code = ? AND period = ?
            """, (
                balance_data.get('stockName'),
                balance_data.get('totalAssets'),
                balance_data.get('totalAssetsRatio'),
                balance_data.get('shareholdersEquity'),
                balance_data.get('shareholdersEquityRatio'),
                balance_data.get('currentAssets'),
                balance_data.get('currentAssetsRatio'),
                balance_data.get('currentLiabilities'),
                balance_data.get('currentLiabilitiesRatio'),
                balance_data.get('stockCode'),
                balance_data.get('period')
            ))
        else:
            record_id = balance_data.get('id') or str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO balance_sheets (
                    id, stock_code, stock_name, period, total_assets, total_assets_ratio,
                    shareholders_equity, shareholders_equity_ratio, current_assets,
                    current_assets_ratio, current_liabilities, current_liabilities_ratio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                record_id,
                balance_data.get('stockCode'),
                balance_data.get('stockName'),
                balance_data.get('period'),
                balance_data.get('totalAssets'),
                balance_data.get('totalAssetsRatio'),
                balance_data.get('shareholdersEquity'),
                balance_data.get('shareholdersEquityRatio'),
                balance_data.get('currentAssets'),
                balance_data.get('currentAssetsRatio'),
                balance_data.get('currentLiabilities'),
                balance_data.get('currentLiabilitiesRatio')
            ))
        
        conn.commit()
        conn.close()
        logger.debug(f"成功保存資產負債表: {balance_data.get('stockCode')} - {balance_data.get('period')}")
        return True
        
    except Exception as e:
        logger.error(f"保存資產負債表失敗: {str(e)}")
        return False

def save_cash_flow(cashflow_data: Dict) -> bool:
    """保存或更新現金流量表數據"""
    if not cashflow_data:
        return False
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM cash_flows 
            WHERE stock_code = ? AND period = ?
        """, (cashflow_data.get('stockCode'), cashflow_data.get('period')))
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute("""
                UPDATE cash_flows SET
                    stock_name = ?,
                    operating_cash_flow = ?,
                    investing_cash_flow = ?,
                    investing_cash_flow_ratio = ?,
                    financing_cash_flow = ?,
                    financing_cash_flow_ratio = ?,
                    free_cash_flow = ?,
                    free_cash_flow_ratio = ?,
                    net_cash_flow = ?,
                    net_cash_flow_ratio = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE stock_code = ? AND period = ?
            """, (
                cashflow_data.get('stockName'),
                cashflow_data.get('operatingCashFlow'),
                cashflow_data.get('investingCashFlow'),
                cashflow_data.get('investingCashFlowRatio'),
                cashflow_data.get('financingCashFlow'),
                cashflow_data.get('financingCashFlowRatio'),
                cashflow_data.get('freeCashFlow'),
                cashflow_data.get('freeCashFlowRatio'),
                cashflow_data.get('netCashFlow'),
                cashflow_data.get('netCashFlowRatio'),
                cashflow_data.get('stockCode'),
                cashflow_data.get('period')
            ))
        else:
            record_id = cashflow_data.get('id') or str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO cash_flows (
                    id, stock_code, stock_name, period, operating_cash_flow,
                    investing_cash_flow, investing_cash_flow_ratio, financing_cash_flow,
                    financing_cash_flow_ratio, free_cash_flow, free_cash_flow_ratio,
                    net_cash_flow, net_cash_flow_ratio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                record_id,
                cashflow_data.get('stockCode'),
                cashflow_data.get('stockName'),
                cashflow_data.get('period'),
                cashflow_data.get('operatingCashFlow'),
                cashflow_data.get('investingCashFlow'),
                cashflow_data.get('investingCashFlowRatio'),
                cashflow_data.get('financingCashFlow'),
                cashflow_data.get('financingCashFlowRatio'),
                cashflow_data.get('freeCashFlow'),
                cashflow_data.get('freeCashFlowRatio'),
                cashflow_data.get('netCashFlow'),
                cashflow_data.get('netCashFlowRatio')
            ))
        
        conn.commit()
        conn.close()
        logger.debug(f"成功保存現金流量表: {cashflow_data.get('stockCode')} - {cashflow_data.get('period')}")
        return True
        
    except Exception as e:
        logger.error(f"保存現金流量表失敗: {str(e)}")
        return False

# ========== 日交易數據操作 ==========

def save_daily_trades(stock_code: str, daily_trades: List[Dict]) -> int:
    """批量保存日交易數據，返回成功保存的數量"""
    if not daily_trades:
        return 0
    
    saved_count = 0
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for trade in daily_trades:
            try:
                # 檢查是否已存在
                cursor.execute("""
                    SELECT id FROM daily_trades 
                    WHERE stock_code = ? AND date = ?
                """, (trade.get('stockCode'), trade.get('date')))
                existing = cursor.fetchone()
                
                if existing:
                    # 更新
                    cursor.execute("""
                        UPDATE daily_trades SET
                            stock_name = ?,
                            close_price = ?,
                            avg_price = ?,
                            prev_close = ?,
                            open_price = ?,
                            high_price = ?,
                            low_price = ?,
                            change = ?,
                            change_percent = ?,
                            total_volume = ?,
                            prev_volume = ?,
                            inner_volume = ?,
                            outer_volume = ?,
                            foreign_investor = ?,
                            investment_trust = ?,
                            dealer = ?,
                            chips = ?,
                            main_buy = ?,
                            main_sell = ?,
                            month_high = ?,
                            month_low = ?,
                            quarter_high = ?
                        WHERE stock_code = ? AND date = ?
                    """, (
                        trade.get('stockName'),
                        trade.get('closePrice'),
                        trade.get('avgPrice'),
                        trade.get('prevClose'),
                        trade.get('openPrice'),
                        trade.get('highPrice'),
                        trade.get('lowPrice'),
                        trade.get('change'),
                        trade.get('changePercent'),
                        trade.get('totalVolume'),
                        trade.get('prevVolume'),
                        trade.get('innerVolume'),
                        trade.get('outerVolume'),
                        trade.get('foreignInvestor'),
                        trade.get('investmentTrust'),
                        trade.get('dealer'),
                        trade.get('chips'),
                        trade.get('mainBuy'),
                        trade.get('mainSell'),
                        trade.get('monthHigh'),
                        trade.get('monthLow'),
                        trade.get('quarterHigh'),
                        trade.get('stockCode'),
                        trade.get('date')
                    ))
                else:
                    # 插入
                    record_id = str(uuid.uuid4())
                    cursor.execute("""
                        INSERT INTO daily_trades (
                            id, stock_code, stock_name, date, close_price, avg_price,
                            prev_close, open_price, high_price, low_price, change,
                            change_percent, total_volume, prev_volume, inner_volume,
                            outer_volume, foreign_investor, investment_trust, dealer,
                            chips, main_buy, main_sell, month_high, month_low, quarter_high
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        record_id,
                        trade.get('stockCode'),
                        trade.get('stockName'),
                        trade.get('date'),
                        trade.get('closePrice'),
                        trade.get('avgPrice'),
                        trade.get('prevClose'),
                        trade.get('openPrice'),
                        trade.get('highPrice'),
                        trade.get('lowPrice'),
                        trade.get('change'),
                        trade.get('changePercent'),
                        trade.get('totalVolume'),
                        trade.get('prevVolume'),
                        trade.get('innerVolume'),
                        trade.get('outerVolume'),
                        trade.get('foreignInvestor'),
                        trade.get('investmentTrust'),
                        trade.get('dealer'),
                        trade.get('chips'),
                        trade.get('mainBuy'),
                        trade.get('mainSell'),
                        trade.get('monthHigh'),
                        trade.get('monthLow'),
                        trade.get('quarterHigh')
                    ))
                
                saved_count += 1
                
            except Exception as e:
                logger.warning(f"保存單筆日交易數據失敗: {str(e)}")
                continue
        
        conn.commit()
        conn.close()
        logger.info(f"成功保存 {saved_count}/{len(daily_trades)} 筆日交易數據: {stock_code}")
        return saved_count
        
    except Exception as e:
        logger.error(f"批量保存日交易數據失敗: {str(e)}")
        return saved_count

