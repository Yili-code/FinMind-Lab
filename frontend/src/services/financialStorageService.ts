import type { IncomeStatementItem, BalanceSheetItem, CashFlowItem } from '../types/financial'

const INCOME_STORAGE_KEY = 'finfo_income_statements'
const BALANCE_STORAGE_KEY = 'finfo_balance_sheets'
const CASHFLOW_STORAGE_KEY = 'finfo_cash_flows'

// 模擬 SQLite 資料儲存介面（使用 localStorage） - 財務報表
export const financialStorageService = {
  // ========== 損益表 (Table 4) ==========
  getAllIncomeStatements(): IncomeStatementItem[] {
    try {
      const data = localStorage.getItem(INCOME_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      return []
    }
  },

  getIncomeStatementsByStockCode(stockCode: string): IncomeStatementItem[] {
    const all = this.getAllIncomeStatements()
    return all.filter(item => item.stockCode === stockCode)
  },

  addIncomeStatement(income: Omit<IncomeStatementItem, 'id'>): IncomeStatementItem {
    const all = this.getAllIncomeStatements()
    const newIncome: IncomeStatementItem = {
      ...income,
      id: `income_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    }
    all.push(newIncome)
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(all))
    return newIncome
  },

  updateIncomeStatement(id: string, updates: Partial<IncomeStatementItem>): IncomeStatementItem | null {
    const all = this.getAllIncomeStatements()
    const index = all.findIndex(item => item.id === id)
    if (index === -1) return null

    all[index] = { ...all[index], ...updates }
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(all))
    return all[index]
  },

  deleteIncomeStatement(id: string): boolean {
    const all = this.getAllIncomeStatements()
    const filtered = all.filter(item => item.id !== id)
    if (filtered.length === all.length) return false

    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(filtered))
    return true
  },

  // ========== 資產負債表 (Table 5) ==========
  getAllBalanceSheets(): BalanceSheetItem[] {
    try {
      const data = localStorage.getItem(BALANCE_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      return []
    }
  },

  getBalanceSheetsByStockCode(stockCode: string): BalanceSheetItem[] {
    const all = this.getAllBalanceSheets()
    return all.filter(item => item.stockCode === stockCode)
  },

  addBalanceSheet(balance: Omit<BalanceSheetItem, 'id'>): BalanceSheetItem {
    const all = this.getAllBalanceSheets()
    const newBalance: BalanceSheetItem = {
      ...balance,
      id: `balance_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    }
    all.push(newBalance)
    localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(all))
    return newBalance
  },

  updateBalanceSheet(id: string, updates: Partial<BalanceSheetItem>): BalanceSheetItem | null {
    const all = this.getAllBalanceSheets()
    const index = all.findIndex(item => item.id === id)
    if (index === -1) return null

    all[index] = { ...all[index], ...updates }
    localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(all))
    return all[index]
  },

  deleteBalanceSheet(id: string): boolean {
    const all = this.getAllBalanceSheets()
    const filtered = all.filter(item => item.id !== id)
    if (filtered.length === all.length) return false

    localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(filtered))
    return true
  },

  // ========== 現金流量表 (Table 6) ==========
  getAllCashFlows(): CashFlowItem[] {
    try {
      const data = localStorage.getItem(CASHFLOW_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      return []
    }
  },

  getCashFlowsByStockCode(stockCode: string): CashFlowItem[] {
    const all = this.getAllCashFlows()
    return all.filter(item => item.stockCode === stockCode)
  },

  addCashFlow(cashFlow: Omit<CashFlowItem, 'id'>): CashFlowItem {
    const all = this.getAllCashFlows()
    const newCashFlow: CashFlowItem = {
      ...cashFlow,
      id: `cashflow_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    }
    all.push(newCashFlow)
    localStorage.setItem(CASHFLOW_STORAGE_KEY, JSON.stringify(all))
    return newCashFlow
  },

  updateCashFlow(id: string, updates: Partial<CashFlowItem>): CashFlowItem | null {
    const all = this.getAllCashFlows()
    const index = all.findIndex(item => item.id === id)
    if (index === -1) return null

    all[index] = { ...all[index], ...updates }
    localStorage.setItem(CASHFLOW_STORAGE_KEY, JSON.stringify(all))
    return all[index]
  },

  deleteCashFlow(id: string): boolean {
    const all = this.getAllCashFlows()
    const filtered = all.filter(item => item.id !== id)
    if (filtered.length === all.length) return false

    localStorage.setItem(CASHFLOW_STORAGE_KEY, JSON.stringify(filtered))
    return true
  }
}

