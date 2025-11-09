// 損益表項目（Table 4）
export interface IncomeStatementItem {
  id: string
  stockCode: string
  period: string // 期間，例如 "2024Q3"
  revenue: number // 營業收入
  costOfGoodsSold: number // 營業成本
  grossProfit: number // 營業毛利
  operatingExpenses: number // 營業費用
  operatingIncome: number // 營業利益
  nonOperatingIncome: number // 營業外收入
  nonOperatingExpenses: number // 營業外支出
  incomeBeforeTax: number // 稅前淨利
  incomeTax: number // 所得稅
  netIncome: number // 本期淨利
  eps: number // 每股盈餘
}

// 資產負債表項目（Table 5）
export interface BalanceSheetItem {
  id: string
  stockCode: string
  period: string // 期間
  // 資產
  currentAssets: number // 流動資產
  nonCurrentAssets: number // 非流動資產
  totalAssets: number // 資產總計
  // 負債
  currentLiabilities: number // 流動負債
  nonCurrentLiabilities: number // 非流動負債
  totalLiabilities: number // 負債總計
  // 股東權益
  shareholdersEquity: number // 股東權益
  totalLiabilitiesAndEquity: number // 負債及股東權益總計
}

// 現金流量表項目（Table 6）
export interface CashFlowItem {
  id: string
  stockCode: string
  period: string // 期間
  // 營業活動
  operatingCashFlow: number // 營業活動現金流量
  // 投資活動
  investingCashFlow: number // 投資活動現金流量
  // 籌資活動
  financingCashFlow: number // 籌資活動現金流量
  // 現金變動
  netCashFlow: number // 本期現金及約當現金增加（減少）
  beginningCash: number // 期初現金及約當現金餘額
  endingCash: number // 期末現金及約當現金餘額
}

