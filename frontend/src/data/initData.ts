import { storageService } from '../services/storageService'
import { financialStorageService } from '../services/financialStorageService'
import type { StockBasic } from '../types/stock'
import type { IncomeStatementItem, BalanceSheetItem, CashFlowItem } from '../types/financial'

// 初始化資料 - 為每個 Table 生成兩組資料
export function initializeData() {
  // 檢查是否已經初始化過
  const initialized = localStorage.getItem('finmind_data_initialized')
  if (initialized === 'true') {
    return // 已經初始化過，不再重複
  }

  // ========== Table 3: 股票基本檔 ==========
  const stockBasics: Omit<StockBasic, 'id' | 'createdAt'>[] = [
    {
      stockCode: '2330',
      stockName: '台積電',
      category: '電子零組件',
      establishedDate: '1987-02-21',
      listedDate: '1994-09-05',
      industry: '半導體',
      capital: 2593038000000, // 股本（元）
      issuedShares: 25930380000, // 發行股數
      marketValue: 15000000000000, // 市值（元）
      directors: '劉德音',
      market: '上市',
      group: '台積電集團',
      employees: 65000,
      dividend: 11.0, // 股利
      yield: 1.9, // 殖利率
      dividendPerShare: 11.0, // 股息
      closingPrice: 580, // 收價
      exDividendDate: '2024-06-13', // 填息日期
      peRatio: 18.5, // 本益比
      equityRatio: 85.2, // 股權比率
      industryChange: 0.52, // 同業漲跌
      industryEPS: 32.5, // 同業EPS
      industryYield: 2.1 // 同業殖利
    },
    {
      stockCode: '2317',
      stockName: '鴻海',
      category: '電子零組件',
      establishedDate: '1974-02-20',
      listedDate: '1991-06-18',
      industry: '電子製造',
      capital: 1386280000000, // 股本（元）
      issuedShares: 13862800000, // 發行股數
      marketValue: 1450000000000, // 市值（元）
      directors: '劉揚偉',
      market: '上市',
      group: '鴻海集團',
      employees: 1200000,
      dividend: 5.3, // 股利
      yield: 5.0, // 殖利率
      dividendPerShare: 5.3, // 股息
      closingPrice: 105.5, // 收價
      exDividendDate: '2024-07-04', // 填息日期
      peRatio: 12.8, // 本益比
      equityRatio: 72.5, // 股權比率
      industryChange: 0.96, // 同業漲跌
      industryEPS: 8.2, // 同業EPS
      industryYield: 4.8 // 同業殖利
    }
  ]

  // 添加 Table 3 資料
  stockBasics.forEach(stock => {
    storageService.add(stock)
  })

  // ========== Table 4: 損益表 ==========
  const incomeStatements: Omit<IncomeStatementItem, 'id'>[] = [
    {
      stockCode: '2330',
      period: '2024Q3',
      revenue: 546732000000, // 營業收入（元）
      grossProfit: 280000000000, // 營業毛利
      grossProfitRatio: 51.2, // 營業毛利比重
      operatingExpenses: 45000000000, // 營業費用
      operatingExpensesRatio: 8.2, // 營業費用比重
      operatingIncome: 235000000000, // 營業利益
      operatingIncomeRatio: 43.0, // 營業利益比重
      netIncome: 211500000000, // 稅後淨利
      otherIncome: 3500000000 // 其他損益
    },
    {
      stockCode: '2317',
      period: '2024Q3',
      revenue: 154320000000, // 營業收入（元）
      grossProfit: 8500000000, // 營業毛利
      grossProfitRatio: 5.5, // 營業毛利比重
      operatingExpenses: 3200000000, // 營業費用
      operatingExpensesRatio: 2.1, // 營業費用比重
      operatingIncome: 5300000000, // 營業利益
      operatingIncomeRatio: 3.4, // 營業利益比重
      netIncome: 4200000000, // 稅後淨利
      otherIncome: 150000000 // 其他損益
    }
  ]

  // 添加 Table 4 資料
  incomeStatements.forEach(income => {
    financialStorageService.addIncomeStatement(income)
  })

  // ========== Table 5: 資產負債表 ==========
  const balanceSheets: Omit<BalanceSheetItem, 'id'>[] = [
    {
      stockCode: '2330',
      period: '2024Q3',
      totalAssets: 3500000000000, // 總資產（元）
      totalAssetsRatio: 100.0, // 總資產比重
      shareholdersEquity: 2980000000000, // 股東權益
      shareholdersEquityRatio: 85.1, // 股東權益比重
      currentAssets: 1200000000000, // 流動資產
      currentAssetsRatio: 34.3, // 流動資產比重
      currentLiabilities: 350000000000, // 流動負債
      currentLiabilitiesRatio: 10.0 // 流動負債比重
    },
    {
      stockCode: '2317',
      period: '2024Q3',
      totalAssets: 850000000000, // 總資產（元）
      totalAssetsRatio: 100.0, // 總資產比重
      shareholdersEquity: 620000000000, // 股東權益
      shareholdersEquityRatio: 72.9, // 股東權益比重
      currentAssets: 450000000000, // 流動資產
      currentAssetsRatio: 52.9, // 流動資產比重
      currentLiabilities: 180000000000, // 流動負債
      currentLiabilitiesRatio: 21.2 // 流動負債比重
    }
  ]

  // 添加 Table 5 資料
  balanceSheets.forEach(balance => {
    financialStorageService.addBalanceSheet(balance)
  })

  // ========== Table 6: 現金流量表 ==========
  const cashFlows: Omit<CashFlowItem, 'id'>[] = [
    {
      stockCode: '2330',
      period: '2024Q3',
      operatingCashFlow: 280000000000, // 營業現金（元）
      investingCashFlow: -150000000000, // 投資現金
      investingCashFlowRatio: -42.9, // 投資現金比重
      financingCashFlow: -80000000000, // 融資現金
      financingCashFlowRatio: -22.9, // 融資現金比重
      freeCashFlow: 130000000000, // 自由現金
      freeCashFlowRatio: 37.1, // 自由現金比重
      netCashFlow: 50000000000, // 淨現金流
      netCashFlowRatio: 17.9 // 淨現金流比重
    },
    {
      stockCode: '2317',
      period: '2024Q3',
      operatingCashFlow: 12000000000, // 營業現金（元）
      investingCashFlow: -5000000000, // 投資現金
      investingCashFlowRatio: -41.7, // 投資現金比重
      financingCashFlow: -3000000000, // 融資現金
      financingCashFlowRatio: -25.0, // 融資現金比重
      freeCashFlow: 7000000000, // 自由現金
      freeCashFlowRatio: 58.3, // 自由現金比重
      netCashFlow: 4000000000, // 淨現金流
      netCashFlowRatio: 33.3 // 淨現金流比重
    }
  ]

  // 添加 Table 6 資料
  cashFlows.forEach(cashFlow => {
    financialStorageService.addCashFlow(cashFlow)
  })

  // 標記為已初始化
  localStorage.setItem('finmind_data_initialized', 'true')
  console.log('✅ 資料初始化完成：已為每個 Table 生成兩組資料')
}

