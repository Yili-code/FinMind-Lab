import type { IncomeStatementItem, BalanceSheetItem, CashFlowItem } from '../types/financial'

// Mock 損益表資料（Table 4）
export const mockIncomeStatements: IncomeStatementItem[] = [
  {
    id: '1',
    stockCode: '2330',
    period: '2024Q3',
    revenue: 546732000000,
    costOfGoodsSold: 273366000000,
    grossProfit: 273366000000,
    operatingExpenses: 54673000000,
    operatingIncome: 218693000000,
    nonOperatingIncome: 10934600000,
    nonOperatingExpenses: 5467300000,
    incomeBeforeTax: 224160300000,
    incomeTax: 33624045000,
    netIncome: 190536255000,
    eps: 7.35
  },
  {
    id: '2',
    stockCode: '2317',
    period: '2024Q3',
    revenue: 1542000000000,
    costOfGoodsSold: 1387800000000,
    grossProfit: 154200000000,
    operatingExpenses: 77100000000,
    operatingIncome: 77100000000,
    nonOperatingIncome: 15420000000,
    nonOperatingExpenses: 7710000000,
    incomeBeforeTax: 84810000000,
    incomeTax: 12721500000,
    netIncome: 72088500000,
    eps: 5.21
  },
  {
    id: '3',
    stockCode: '2454',
    period: '2024Q3',
    revenue: 128500000000,
    costOfGoodsSold: 77000000000,
    grossProfit: 51500000000,
    operatingExpenses: 12850000000,
    operatingIncome: 38650000000,
    nonOperatingIncome: 2570000000,
    nonOperatingExpenses: 1285000000,
    incomeBeforeTax: 39935000000,
    incomeTax: 5990250000,
    netIncome: 33944750000,
    eps: 21.35
  }
]

// Mock 資產負債表資料（Table 5）
export const mockBalanceSheets: BalanceSheetItem[] = [
  {
    id: '1',
    stockCode: '2330',
    period: '2024Q3',
    currentAssets: 1250000000000,
    nonCurrentAssets: 2500000000000,
    totalAssets: 3750000000000,
    currentLiabilities: 500000000000,
    nonCurrentLiabilities: 750000000000,
    totalLiabilities: 1250000000000,
    shareholdersEquity: 2500000000000,
    totalLiabilitiesAndEquity: 3750000000000
  },
  {
    id: '2',
    stockCode: '2317',
    period: '2024Q3',
    currentAssets: 1800000000000,
    nonCurrentAssets: 1200000000000,
    totalAssets: 3000000000000,
    currentLiabilities: 1500000000000,
    nonCurrentLiabilities: 500000000000,
    totalLiabilities: 2000000000000,
    shareholdersEquity: 1000000000000,
    totalLiabilitiesAndEquity: 3000000000000
  },
  {
    id: '3',
    stockCode: '2454',
    period: '2024Q3',
    currentAssets: 85000000000,
    nonCurrentAssets: 65000000000,
    totalAssets: 150000000000,
    currentLiabilities: 45000000000,
    nonCurrentLiabilities: 20000000000,
    totalLiabilities: 65000000000,
    shareholdersEquity: 85000000000,
    totalLiabilitiesAndEquity: 150000000000
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
    financingCashFlow: -50000000000,
    netCashFlow: 20000000000,
    beginningCash: 800000000000,
    endingCash: 820000000000
  },
  {
    id: '2',
    stockCode: '2317',
    period: '2024Q3',
    operatingCashFlow: 85000000000,
    investingCashFlow: -60000000000,
    financingCashFlow: -20000000000,
    netCashFlow: 5000000000,
    beginningCash: 300000000000,
    endingCash: 305000000000
  },
  {
    id: '3',
    stockCode: '2454',
    period: '2024Q3',
    operatingCashFlow: 40000000000,
    investingCashFlow: -25000000000,
    financingCashFlow: -10000000000,
    netCashFlow: 5000000000,
    beginningCash: 120000000000,
    endingCash: 125000000000
  }
]

