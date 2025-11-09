# models.py - Pydantic 資料模型

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Table 3: 股票基本檔
class StockBasicBase(BaseModel):
    stock_code: str
    stock_name: str
    category: Optional[str] = None
    established_date: Optional[str] = None
    listed_date: str
    industry: str
    capital: float
    issued_shares: Optional[float] = None
    market_value: Optional[float] = None
    directors: Optional[str] = None
    market: str
    group_name: Optional[str] = None
    employees: Optional[int] = None
    dividend: Optional[float] = None
    yield_rate: Optional[float] = None
    dividend_per_share: Optional[float] = None
    closing_price: Optional[float] = None
    ex_dividend_date: Optional[str] = None
    pe_ratio: Optional[float] = None
    equity_ratio: Optional[float] = None
    industry_change: Optional[float] = None
    industry_eps: Optional[float] = None
    industry_yield: Optional[float] = None

class StockBasicCreate(StockBasicBase):
    pass

class StockBasic(StockBasicBase):
    id: str
    created_at: str
    
    class Config:
        from_attributes = True

# Table 4: 損益表
class IncomeStatementBase(BaseModel):
    stock_code: str
    period: str
    revenue: float
    gross_profit: float
    gross_profit_ratio: Optional[float] = None
    operating_expenses: float
    operating_expenses_ratio: Optional[float] = None
    operating_income: float
    operating_income_ratio: Optional[float] = None
    net_income: float
    other_income: Optional[float] = None

class IncomeStatementCreate(IncomeStatementBase):
    pass

class IncomeStatement(IncomeStatementBase):
    id: str
    
    class Config:
        from_attributes = True

# Table 5: 資產負債表
class BalanceSheetBase(BaseModel):
    stock_code: str
    period: str
    total_assets: float
    total_assets_ratio: Optional[float] = None
    shareholders_equity: float
    shareholders_equity_ratio: Optional[float] = None
    current_assets: float
    current_assets_ratio: Optional[float] = None
    current_liabilities: float
    current_liabilities_ratio: Optional[float] = None

class BalanceSheetCreate(BalanceSheetBase):
    pass

class BalanceSheet(BalanceSheetBase):
    id: str
    
    class Config:
        from_attributes = True

# Table 6: 現金流量表
class CashFlowBase(BaseModel):
    stock_code: str
    period: str
    operating_cash_flow: float
    investing_cash_flow: float
    investing_cash_flow_ratio: Optional[float] = None
    financing_cash_flow: float
    financing_cash_flow_ratio: Optional[float] = None
    free_cash_flow: float
    free_cash_flow_ratio: Optional[float] = None
    net_cash_flow: float
    net_cash_flow_ratio: Optional[float] = None

class CashFlowCreate(CashFlowBase):
    pass

class CashFlow(CashFlowBase):
    id: str
    
    class Config:
        from_attributes = True

