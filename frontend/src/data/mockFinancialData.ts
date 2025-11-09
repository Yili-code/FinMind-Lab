import type { IncomeStatementItem, BalanceSheetItem, CashFlowItem } from '../types/financial'

// Mock 損益表資料（Table 4）
export const mockIncomeStatements: IncomeStatementItem[] = [
  {
    id: '1',
    stockCode: '2330',
    period: '2024Q3',
    revenue: 546732000000,
    grossProfit: 273366000000,
    grossProfitRatio: 50.0,
    operatingExpenses: 54673000000,
    operatingExpensesRatio: 10.0,
    operatingIncome: 218693000000,
    operatingIncomeRatio: 40.0,
    netIncome: 190536255000,
    otherIncome: 10934600000
  },
  {
    id: '2',
    stockCode: '2317',
    period: '2024Q3',
    revenue: 1542000000000,
    grossProfit: 154200000000,
    grossProfitRatio: 10.0,
    operatingExpenses: 77100000000,
    operatingExpensesRatio: 5.0,
    operatingIncome: 77100000000,
    operatingIncomeRatio: 5.0,
    netIncome: 72088500000,
    otherIncome: 15420000000
  },
  {
    id: '3',
    stockCode: '2454',
    period: '2024Q3',
    revenue: 128500000000,
    grossProfit: 51500000000,
    grossProfitRatio: 40.0,
    operatingExpenses: 12850000000,
    operatingExpensesRatio: 10.0,
    operatingIncome: 38650000000,
    operatingIncomeRatio: 30.0,
    netIncome: 33944750000,
    otherIncome: 2570000000
  }
]

// Mock 資產負債表資料（Table 5）
export const mockBalanceSheets: BalanceSheetItem[] = [
  {
    id: '1',
    stockCode: '2330',
    period: '2024Q3',
    totalAssets: 3750000000000,
    totalAssetsRatio: 100.0,
    shareholdersEquity: 2500000000000,
    shareholdersEquityRatio: 66.67,
    currentAssets: 1250000000000,
    currentAssetsRatio: 33.33,
    currentLiabilities: 500000000000,
    currentLiabilitiesRatio: 13.33
  },
  {
    id: '2',
    stockCode: '2317',
    period: '2024Q3',
    totalAssets: 3000000000000,
    totalAssetsRatio: 100.0,
    shareholdersEquity: 1000000000000,
    shareholdersEquityRatio: 33.33,
    currentAssets: 1800000000000,
    currentAssetsRatio: 60.0,
    currentLiabilities: 1500000000000,
    currentLiabilitiesRatio: 50.0
  },
  {
    id: '3',
    stockCode: '2454',
    period: '2024Q3',
    totalAssets: 150000000000,
    totalAssetsRatio: 100.0,
    shareholdersEquity: 85000000000,
    shareholdersEquityRatio: 56.67,
    currentAssets: 85000000000,
    currentAssetsRatio: 56.67,
    currentLiabilities: 45000000000,
    currentLiabilitiesRatio: 30.0
  }
]

// Mock 現金流量表資料（Table 6）
export const mockCashFlows: CashFlowItem[] = [
  {
    id: '1',
    stockCode: '2330',
    period: '2024Q3',
    operatingCashFlow: 220000000000,
    investingCashFlow: -150000000000,
    investingCashFlowRatio: -68.18,
    financingCashFlow: -50000000000,
    financingCashFlowRatio: -22.73,
    freeCashFlow: 70000000000,
    freeCashFlowRatio: 31.82,
    netCashFlow: 20000000000,
    netCashFlowRatio: 9.09
  },
  {
    id: '2',
    stockCode: '2317',
    period: '2024Q3',
    operatingCashFlow: 85000000000,
    investingCashFlow: -60000000000,
    investingCashFlowRatio: -70.59,
    financingCashFlow: -20000000000,
    financingCashFlowRatio: -23.53,
    freeCashFlow: 25000000000,
    freeCashFlowRatio: 29.41,
    netCashFlow: 5000000000,
    netCashFlowRatio: 5.88
  },
  {
    id: '3',
    stockCode: '2454',
    period: '2024Q3',
    operatingCashFlow: 40000000000,
    investingCashFlow: -25000000000,
    investingCashFlowRatio: -62.5,
    financingCashFlow: -10000000000,
    financingCashFlowRatio: -25.0,
    freeCashFlow: 15000000000,
    freeCashFlowRatio: 37.5,
    netCashFlow: 5000000000,
    netCashFlowRatio: 12.5
  }
]
