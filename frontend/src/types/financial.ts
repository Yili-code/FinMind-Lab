// 損益表項目（Table 4）
export interface IncomeStatementItem {
  id: string
  stockCode: string
  period: string // 年/季，例如 "2024Q3" 或 "2024"
  revenue: number // 營業收入
  grossProfit: number // 營業毛利
  grossProfitRatio: number // 營業毛利比重
  operatingExpenses: number // 營業費用
  operatingExpensesRatio: number // 營業費用比重
  operatingIncome: number // 營業利益
  operatingIncomeRatio: number // 營業利益比重
  netIncome: number // 稅後淨利
  otherIncome: number // 其他損益
}

// 資產負債表項目（Table 5）
export interface BalanceSheetItem {
  id: string
  stockCode: string
  period: string // 年/季
  totalAssets: number // 總資產
  totalAssetsRatio: number // 總資產比重
  shareholdersEquity: number // 股東權益
  shareholdersEquityRatio: number // 股東權益比重
  currentAssets: number // 流動資產
  currentAssetsRatio: number // 流動資產比重
  currentLiabilities: number // 流動負債
  currentLiabilitiesRatio: number // 流動負債比重
}

// 現金流量表項目（Table 6）
export interface CashFlowItem {
  id: string
  stockCode: string
  period: string // 年/季
  operatingCashFlow: number // 營業現金
  investingCashFlow: number // 投資現金
  investingCashFlowRatio: number // 投資現金比重
  financingCashFlow: number // 融資現金
  financingCashFlowRatio: number // 融資現金比重
  freeCashFlow: number // 自由現金
  freeCashFlowRatio: number // 自由現金比重
  netCashFlow: number // 淨現金流
  netCashFlowRatio: number // 淨現金流比重
}

