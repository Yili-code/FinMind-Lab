import type { StockBasic } from '../types/stock'

const STORAGE_KEY = 'finfo_stock_basics'

// 模擬 SQLite 資料儲存介面（使用 localStorage）
export const storageService = {
  // 取得所有股票基本檔
  getAll(): StockBasic[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      return []
    }
  },

  // 根據股票代號查詢
  getByStockCode(stockCode: string): StockBasic | undefined {
    const all = this.getAll()
    return all.find(item => item.stockCode === stockCode)
  },

  // 新增股票基本檔
  add(stock: Omit<StockBasic, 'id' | 'createdAt'>): StockBasic {
    const all = this.getAll()
    const newStock: StockBasic = {
      ...stock,
      id: `stock_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString()
    }
    all.push(newStock)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return newStock
  },

  // 更新股票基本檔
  update(stockCode: string, updates: Partial<StockBasic>): StockBasic | null {
    const all = this.getAll()
    const index = all.findIndex(item => item.stockCode === stockCode)
    if (index === -1) return null

    all[index] = { ...all[index], ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return all[index]
  },

  // 刪除股票基本檔
  delete(stockCode: string): boolean {
    const all = this.getAll()
    const filtered = all.filter(item => item.stockCode !== stockCode)
    if (filtered.length === all.length) return false

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  },

  // 清空所有資料
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

