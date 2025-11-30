# crud.py - 資料庫 CRUD 操作

import logging
from typing import Optional, Dict, List
from datetime import datetime
import uuid
from database import get_db_connection, DB_TYPE
from db_utils import prepare_sql

logger = logging.getLogger(__name__)

# ========== 股票基本檔操作 ==========

def save_stock_basic(stock_data: Dict) -> bool:
    """保存或更新股票基本資訊"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 檢查是否已存在
        cursor.execute(prepare_sql("SELECT id FROM stock_basics WHERE stock_code = ?"), (stock_data.get('stockCode'),))
        existing = cursor.fetchone()
        
        if existing:
            # 更新現有記錄
            cursor.execute(prepare_sql("""
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
            """), (
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
            cursor.execute(prepare_sql("""
                INSERT INTO stock_basics (
                    id, stock_code, stock_name, current_price, previous_close,
                    market_cap, volume, average_volume, pe_ratio, dividend_yield,
                    high_52_week, low_52_week, open_price, high_price, low_price,
                    change, change_percent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """), (
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
        cursor.execute(prepare_sql("""
            SELECT id FROM income_statements 
            WHERE stock_code = ? AND period = ?
        """), (income_data.get('stockCode'), income_data.get('period')))
        existing = cursor.fetchone()
        
        if existing:
            # 更新
            cursor.execute(prepare_sql("""
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
            """), (
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
            cursor.execute(prepare_sql("""
                INSERT INTO income_statements (
                    id, stock_code, stock_name, period, revenue, gross_profit,
                    gross_profit_ratio, operating_expenses, operating_expenses_ratio,
                    operating_income, operating_income_ratio, net_income, other_income
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """), (
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
        
        cursor.execute(prepare_sql("""
            SELECT id FROM balance_sheets 
            WHERE stock_code = ? AND period = ?
        """), (balance_data.get('stockCode'), balance_data.get('period')))
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute(prepare_sql("""
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
            """), (
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
            cursor.execute(prepare_sql("""
                INSERT INTO balance_sheets (
                    id, stock_code, stock_name, period, total_assets, total_assets_ratio,
                    shareholders_equity, shareholders_equity_ratio, current_assets,
                    current_assets_ratio, current_liabilities, current_liabilities_ratio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """), (
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
        
        cursor.execute(prepare_sql("""
            SELECT id FROM cash_flows 
            WHERE stock_code = ? AND period = ?
        """), (cashflow_data.get('stockCode'), cashflow_data.get('period')))
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute(prepare_sql("""
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
            """), (
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
            cursor.execute(prepare_sql("""
                INSERT INTO cash_flows (
                    id, stock_code, stock_name, period, operating_cash_flow,
                    investing_cash_flow, investing_cash_flow_ratio, financing_cash_flow,
                    financing_cash_flow_ratio, free_cash_flow, free_cash_flow_ratio,
                    net_cash_flow, net_cash_flow_ratio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """), (
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
                cursor.execute(prepare_sql("""
                    SELECT id FROM daily_trades 
                    WHERE stock_code = ? AND date = ?
                """), (trade.get('stockCode'), trade.get('date')))
                existing = cursor.fetchone()
                
                if existing:
                    # 更新
                    cursor.execute(prepare_sql("""
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
                    """), (
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
                    cursor.execute(prepare_sql("""
                        INSERT INTO daily_trades (
                            id, stock_code, stock_name, date, close_price, avg_price,
                            prev_close, open_price, high_price, low_price, change,
                            change_percent, total_volume, prev_volume, inner_volume,
                            outer_volume, foreign_investor, investment_trust, dealer,
                            chips, main_buy, main_sell, month_high, month_low, quarter_high
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """), (
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

# ========== 資料庫查詢操作（優先從資料庫讀取） ==========

def get_stock_basic_from_db(stock_code: str) -> Optional[Dict]:
    """從資料庫獲取股票基本資訊"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT * FROM stock_basics 
            WHERE stock_code = ?
            ORDER BY updated_at DESC
            LIMIT 1
        """), (stock_code,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'stockCode': row['stock_code'],
                'stockName': row['stock_name'],
                'currentPrice': row['current_price'],
                'previousClose': row['previous_close'],
                'marketCap': row['market_cap'],
                'volume': row['volume'],
                'averageVolume': row['average_volume'],
                'peRatio': row['pe_ratio'],
                'dividendYield': row['dividend_yield'],
                'high52Week': row['high_52_week'],
                'low52Week': row['low_52_week'],
                'open': row['open_price'],
                'high': row['high_price'],
                'low': row['low_price'],
                'change': row['change'],
                'changePercent': row['change_percent'],
            }
        return None
    except Exception as e:
        logger.error(f"從資料庫獲取股票基本資訊失敗: {str(e)}")
        return None

def get_daily_trades_from_db(stock_code: str, days: int = 5) -> List[Dict]:
    """從資料庫獲取日交易數據"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT * FROM daily_trades 
            WHERE stock_code = ?
            ORDER BY date DESC
            LIMIT ?
        """), (stock_code, days))
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'stockCode': row['stock_code'],
                'stockName': row['stock_name'],
                'date': row['date'],
                'closePrice': row['close_price'],
                'avgPrice': row['avg_price'],
                'prevClose': row['prev_close'],
                'openPrice': row['open_price'],
                'highPrice': row['high_price'],
                'lowPrice': row['low_price'],
                'change': row['change'],
                'changePercent': row['change_percent'],
                'totalVolume': row['total_volume'],
                'prevVolume': row['prev_volume'],
                'innerVolume': row['inner_volume'],
                'outerVolume': row['outer_volume'],
                'foreignInvestor': row['foreign_investor'],
                'investmentTrust': row['investment_trust'],
                'dealer': row['dealer'],
                'chips': row['chips'],
                'mainBuy': row['main_buy'],
                'mainSell': row['main_sell'],
                'monthHigh': row['month_high'],
                'monthLow': row['month_low'],
                'quarterHigh': row['quarter_high'],
            })
        return result
    except Exception as e:
        logger.error(f"從資料庫獲取日交易數據失敗: {str(e)}")
        return []

def get_income_statement_from_db(stock_code: str) -> Optional[Dict]:
    """從資料庫獲取最新損益表"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT * FROM income_statements 
            WHERE stock_code = ?
            ORDER BY period DESC
            LIMIT 1
        """), (stock_code,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row['id'],
                'stockCode': row['stock_code'],
                'stockName': row['stock_name'],
                'period': row['period'],
                'revenue': row['revenue'],
                'grossProfit': row['gross_profit'],
                'grossProfitRatio': row['gross_profit_ratio'],
                'operatingExpenses': row['operating_expenses'],
                'operatingExpensesRatio': row['operating_expenses_ratio'],
                'operatingIncome': row['operating_income'],
                'operatingIncomeRatio': row['operating_income_ratio'],
                'netIncome': row['net_income'],
                'otherIncome': row['other_income'],
            }
        return None
    except Exception as e:
        logger.error(f"從資料庫獲取損益表失敗: {str(e)}")
        return None

def get_balance_sheet_from_db(stock_code: str) -> Optional[Dict]:
    """從資料庫獲取最新資產負債表"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT * FROM balance_sheets 
            WHERE stock_code = ?
            ORDER BY period DESC
            LIMIT 1
        """), (stock_code,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row['id'],
                'stockCode': row['stock_code'],
                'stockName': row['stock_name'],
                'period': row['period'],
                'totalAssets': row['total_assets'],
                'totalAssetsRatio': row['total_assets_ratio'],
                'shareholdersEquity': row['shareholders_equity'],
                'shareholdersEquityRatio': row['shareholders_equity_ratio'],
                'currentAssets': row['current_assets'],
                'currentAssetsRatio': row['current_assets_ratio'],
                'currentLiabilities': row['current_liabilities'],
                'currentLiabilitiesRatio': row['current_liabilities_ratio'],
            }
        return None
    except Exception as e:
        logger.error(f"從資料庫獲取資產負債表失敗: {str(e)}")
        return None

def get_cash_flow_from_db(stock_code: str) -> Optional[Dict]:
    """從資料庫獲取最新現金流量表"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT * FROM cash_flows 
            WHERE stock_code = ?
            ORDER BY period DESC
            LIMIT 1
        """), (stock_code,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row['id'],
                'stockCode': row['stock_code'],
                'stockName': row['stock_name'],
                'period': row['period'],
                'operatingCashFlow': row['operating_cash_flow'],
                'investingCashFlow': row['investing_cash_flow'],
                'investingCashFlowRatio': row['investing_cash_flow_ratio'],
                'financingCashFlow': row['financing_cash_flow'],
                'financingCashFlowRatio': row['financing_cash_flow_ratio'],
                'freeCashFlow': row['free_cash_flow'],
                'freeCashFlowRatio': row['free_cash_flow_ratio'],
                'netCashFlow': row['net_cash_flow'],
                'netCashFlowRatio': row['net_cash_flow_ratio'],
            }
        return None
    except Exception as e:
        logger.error(f"從資料庫獲取現金流量表失敗: {str(e)}")
        return None

# ========== 股票群組操作 ==========

def create_stock_group(group_name: str, description: str = None) -> Optional[Dict]:
    """創建新的股票群組"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 檢查群組名稱是否已存在
        cursor.execute(prepare_sql("SELECT id FROM stock_groups WHERE group_name = ?"), (group_name,))
        existing = cursor.fetchone()
        if existing:
            conn.close()
            return None  # 群組名稱已存在
        
        # 創建新群組
        group_id = str(uuid.uuid4())
        cursor.execute(prepare_sql("""
            INSERT INTO stock_groups (id, group_name, description)
            VALUES (?, ?, ?)
        """), (group_id, group_name, description))
        
        conn.commit()
        conn.close()
        
        logger.info(f"成功創建股票群組: {group_name}")
        return {
            'id': group_id,
            'groupName': group_name,
            'description': description,
            'stockCount': 0
        }
    except Exception as e:
        logger.error(f"創建股票群組失敗: {str(e)}")
        return None

def get_all_stock_groups() -> List[Dict]:
    """獲取所有股票群組及其股票數量"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT 
                g.id,
                g.group_name,
                g.description,
                g.created_at,
                g.updated_at,
                COUNT(m.stock_code) as stock_count
            FROM stock_groups g
            LEFT JOIN stock_group_members m ON g.id = m.group_id
            GROUP BY g.id, g.group_name, g.description, g.created_at, g.updated_at
            ORDER BY g.group_name
        """))
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'id': row['id'],
                'groupName': row['group_name'],
                'description': row['description'],
                'stockCount': row['stock_count'],
                'createdAt': row['created_at'],
                'updatedAt': row['updated_at']
            })
        return result
    except Exception as e:
        logger.error(f"獲取股票群組列表失敗: {str(e)}")
        return []

def get_stock_group_by_id(group_id: str) -> Optional[Dict]:
    """根據 ID 獲取股票群組"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT 
                g.id,
                g.group_name,
                g.description,
                g.created_at,
                g.updated_at,
                COUNT(m.stock_code) as stock_count
            FROM stock_groups g
            LEFT JOIN stock_group_members m ON g.id = m.group_id
            WHERE g.id = ?
            GROUP BY g.id, g.group_name, g.description, g.created_at, g.updated_at
        """), (group_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row['id'],
                'groupName': row['group_name'],
                'description': row['description'],
                'stockCount': row['stock_count'],
                'createdAt': row['created_at'],
                'updatedAt': row['updated_at']
            }
        return None
    except Exception as e:
        logger.error(f"獲取股票群組失敗: {str(e)}")
        return None

def update_stock_group(group_id: str, group_name: str = None, description: str = None) -> bool:
    """更新股票群組資訊"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 如果更新群組名稱，檢查是否與其他群組重複
        if group_name:
            cursor.execute(prepare_sql("SELECT id FROM stock_groups WHERE group_name = ? AND id != ?"), (group_name, group_id))
            existing = cursor.fetchone()
            if existing:
                conn.close()
                return False  # 群組名稱已存在
        
        # 構建更新語句
        updates = []
        params = []
        
        if group_name:
            updates.append("group_name = ?")
            params.append(group_name)
        
        if description is not None:
            updates.append("description = ?")
            params.append(description)
        
        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(group_id)
            
            cursor.execute(prepare_sql(f"""
                UPDATE stock_groups 
                SET {', '.join(updates)}
                WHERE id = ?
            """), params)
            
            conn.commit()
            conn.close()
            logger.info(f"成功更新股票群組: {group_id}")
            return True
        else:
            conn.close()
            return False
    except Exception as e:
        logger.error(f"更新股票群組失敗: {str(e)}")
        return False

def delete_stock_group(group_id: str) -> bool:
    """刪除股票群組（會自動刪除相關的群組成員記錄）"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("DELETE FROM stock_groups WHERE id = ?"), (group_id,))
        
        conn.commit()
        conn.close()
        logger.info(f"成功刪除股票群組: {group_id}")
        return True
    except Exception as e:
        logger.error(f"刪除股票群組失敗: {str(e)}")
        return False

def add_stock_to_group(group_id: str, stock_code: str) -> bool:
    """將股票加入群組"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 檢查群組是否存在
        cursor.execute(prepare_sql("SELECT id FROM stock_groups WHERE id = ?"), (group_id,))
        if not cursor.fetchone():
            conn.close()
            return False  # 群組不存在
        
        # 檢查是否已存在
        cursor.execute(prepare_sql("SELECT id FROM stock_group_members WHERE group_id = ? AND stock_code = ?"), (group_id, stock_code))
        if cursor.fetchone():
            conn.close()
            return True  # 已經存在，視為成功
        
        # 新增成員
        member_id = str(uuid.uuid4())
        cursor.execute(prepare_sql("""
            INSERT INTO stock_group_members (id, group_id, stock_code)
            VALUES (?, ?, ?)
        """), (member_id, group_id, stock_code))
        
        conn.commit()
        conn.close()
        logger.info(f"成功將股票 {stock_code} 加入群組 {group_id}")
        return True
    except Exception as e:
        logger.error(f"將股票加入群組失敗: {str(e)}")
        return False

def remove_stock_from_group(group_id: str, stock_code: str) -> bool:
    """將股票從群組中移除"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("DELETE FROM stock_group_members WHERE group_id = ? AND stock_code = ?"), (group_id, stock_code))
        
        conn.commit()
        conn.close()
        logger.info(f"成功將股票 {stock_code} 從群組 {group_id} 移除")
        return True
    except Exception as e:
        logger.error(f"將股票從群組移除失敗: {str(e)}")
        return False

def get_stocks_by_group(group_id: str) -> List[str]:
    """獲取群組中的所有股票代號"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT stock_code 
            FROM stock_group_members 
            WHERE group_id = ?
            ORDER BY stock_code
        """), (group_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [row['stock_code'] for row in rows]
    except Exception as e:
        logger.error(f"獲取群組股票列表失敗: {str(e)}")
        return []

def get_groups_by_stock(stock_code: str) -> List[Dict]:
    """獲取股票所屬的所有群組"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT 
                g.id,
                g.group_name,
                g.description
            FROM stock_groups g
            INNER JOIN stock_group_members m ON g.id = m.group_id
            WHERE m.stock_code = ?
            ORDER BY g.group_name
        """), (stock_code,))
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'id': row['id'],
                'groupName': row['group_name'],
                'description': row['description']
            })
        return result
    except Exception as e:
        logger.error(f"獲取股票所屬群組失敗: {str(e)}")
        return []

def get_stocks_with_groups() -> List[Dict]:
    """獲取所有股票及其所屬的群組"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 根據資料庫類型選擇合適的聚合函數
        from database import DB_TYPE
        if DB_TYPE == 'postgresql':
            # PostgreSQL 使用 STRING_AGG
            cursor.execute(prepare_sql("""
                SELECT 
                    m.stock_code,
                    STRING_AGG(g.group_name, ', ') as group_names
                FROM stock_group_members m
                INNER JOIN stock_groups g ON m.group_id = g.id
                GROUP BY m.stock_code
            """))
        else:
            # SQLite 使用 GROUP_CONCAT
            cursor.execute(prepare_sql("""
                SELECT 
                    m.stock_code,
                    GROUP_CONCAT(g.group_name, ', ') as group_names
                FROM stock_group_members m
                INNER JOIN stock_groups g ON m.group_id = g.id
                GROUP BY m.stock_code
            """))
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'stockCode': row['stock_code'],
                'groupNames': row['group_names'].split(', ') if row['group_names'] else []
            })
        return result
    except Exception as e:
        logger.error(f"獲取股票群組對應關係失敗: {str(e)}")
        return []

# ========== 股票 BOM（物料清單）操作 ==========

def add_bom_item(parent_stock_code: str, child_stock_code: str, quantity: float = 1.0, weight: float = None, unit: str = None, notes: str = None) -> bool:
    """添加 BOM 項目（將子股票添加到父股票的物料清單）"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 檢查是否已存在
        cursor.execute(prepare_sql("""
            SELECT id FROM stock_bom 
            WHERE parent_stock_code = ? AND child_stock_code = ?
        """), (parent_stock_code, child_stock_code))
        existing = cursor.fetchone()
        
        if existing:
            # 更新現有記錄
            cursor.execute(prepare_sql("""
                UPDATE stock_bom SET
                    quantity = ?,
                    weight = ?,
                    unit = ?,
                    notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE parent_stock_code = ? AND child_stock_code = ?
            """), (quantity, weight, unit, notes, parent_stock_code, child_stock_code))
        else:
            # 插入新記錄
            bom_id = str(uuid.uuid4())
            cursor.execute(prepare_sql("""
                INSERT INTO stock_bom (
                    id, parent_stock_code, child_stock_code, quantity, weight, unit, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """), (bom_id, parent_stock_code, child_stock_code, quantity, weight, unit, notes))
        
        conn.commit()
        conn.close()
        logger.info(f"成功添加 BOM 項目: {parent_stock_code} -> {child_stock_code}")
        return True
    except Exception as e:
        logger.error(f"添加 BOM 項目失敗: {str(e)}")
        return False

def get_bom_by_parent(parent_stock_code: str) -> List[Dict]:
    """獲取父股票的所有 BOM 項目（子股票列表）"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT 
                b.id,
                b.parent_stock_code,
                b.child_stock_code,
                b.quantity,
                b.weight,
                b.unit,
                b.notes,
                b.created_at,
                b.updated_at,
                s.stock_name as child_stock_name
            FROM stock_bom b
            LEFT JOIN stock_basics s ON b.child_stock_code = s.stock_code
            WHERE b.parent_stock_code = ?
            ORDER BY b.child_stock_code
        """), (parent_stock_code,))
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'id': row['id'],
                'parentStockCode': row['parent_stock_code'],
                'childStockCode': row['child_stock_code'],
                'childStockName': row['child_stock_name'],
                'quantity': row['quantity'],
                'weight': row['weight'],
                'unit': row['unit'],
                'notes': row['notes'],
                'createdAt': row['created_at'],
                'updatedAt': row['updated_at']
            })
        return result
    except Exception as e:
        logger.error(f"獲取 BOM 列表失敗: {str(e)}")
        return []

def get_parents_by_child(child_stock_code: str) -> List[Dict]:
    """獲取包含指定子股票的所有父股票"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            SELECT 
                b.id,
                b.parent_stock_code,
                b.child_stock_code,
                b.quantity,
                b.weight,
                b.unit,
                b.notes,
                b.created_at,
                b.updated_at,
                s.stock_name as parent_stock_name
            FROM stock_bom b
            LEFT JOIN stock_basics s ON b.parent_stock_code = s.stock_code
            WHERE b.child_stock_code = ?
            ORDER BY b.parent_stock_code
        """), (child_stock_code,))
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'id': row['id'],
                'parentStockCode': row['parent_stock_code'],
                'parentStockName': row['parent_stock_name'],
                'childStockCode': row['child_stock_code'],
                'quantity': row['quantity'],
                'weight': row['weight'],
                'unit': row['unit'],
                'notes': row['notes'],
                'createdAt': row['created_at'],
                'updatedAt': row['updated_at']
            })
        return result
    except Exception as e:
        logger.error(f"獲取父股票列表失敗: {str(e)}")
        return []

def update_bom_item(bom_id: str, quantity: float = None, weight: float = None, unit: str = None, notes: str = None) -> bool:
    """更新 BOM 項目"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if quantity is not None:
            updates.append("quantity = ?")
            params.append(quantity)
        
        if weight is not None:
            updates.append("weight = ?")
            params.append(weight)
        
        if unit is not None:
            updates.append("unit = ?")
            params.append(unit)
        
        if notes is not None:
            updates.append("notes = ?")
            params.append(notes)
        
        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(bom_id)
            
            cursor.execute(prepare_sql(f"""
                UPDATE stock_bom 
                SET {', '.join(updates)}
                WHERE id = ?
            """), params)
            
            conn.commit()
            conn.close()
            logger.info(f"成功更新 BOM 項目: {bom_id}")
            return True
        else:
            conn.close()
            return False
    except Exception as e:
        logger.error(f"更新 BOM 項目失敗: {str(e)}")
        return False

def delete_bom_item(parent_stock_code: str, child_stock_code: str) -> bool:
    """刪除 BOM 項目"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(prepare_sql("""
            DELETE FROM stock_bom 
            WHERE parent_stock_code = ? AND child_stock_code = ?
        """), (parent_stock_code, child_stock_code))
        
        conn.commit()
        conn.close()
        logger.info(f"成功刪除 BOM 項目: {parent_stock_code} -> {child_stock_code}")
        return True
    except Exception as e:
        logger.error(f"刪除 BOM 項目失敗: {str(e)}")
        return False

def get_bom_tree(parent_stock_code: str, max_depth: int = 3, current_depth: int = 0) -> Dict:
    """獲取完整的 BOM 樹狀結構（遞迴）"""
    if current_depth >= max_depth:
        return None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 獲取父股票資訊
        cursor.execute(prepare_sql("""
            SELECT stock_code, stock_name 
            FROM stock_basics 
            WHERE stock_code = ?
        """), (parent_stock_code,))
        parent_info = cursor.fetchone()
        
        if not parent_info:
            conn.close()
            return None
        
        # 獲取直接子項目
        bom_items = get_bom_by_parent(parent_stock_code)
        
        # 遞迴獲取子項目的 BOM
        children = []
        for item in bom_items:
            child_tree = get_bom_tree(item['childStockCode'], max_depth, current_depth + 1)
            children.append({
                **item,
                'children': child_tree['children'] if child_tree else []
            })
        
        conn.close()
        
        return {
            'stockCode': parent_stock_code,
            'stockName': parent_info['stock_name'],
            'children': children,
            'depth': current_depth
        }
    except Exception as e:
        logger.error(f"獲取 BOM 樹狀結構失敗: {str(e)}")
        return None

