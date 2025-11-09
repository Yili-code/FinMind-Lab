// stockApi.ts - 股票數據 API 服務

// 在開發環境使用相對路徑（通過 Vite proxy），生產環境使用環境變數
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000')

export interface StockInfo {
  stockCode: string
  stockName: string
  currentPrice: number
  previousClose: number
  marketCap: number
  volume: number
  averageVolume: number
  peRatio: number
  dividendYield: number
  high52Week: number
  low52Week: number
  open: number
  high: number
  low: number
  change: number
  changePercent: number
}

export interface TradeDetailResponse {
  stockCode: string
  data: Array<{
    stockCode: string
    date: string
    time: string
    price: number
    change: number
    changePercent: number
    lots: number
    period: string
    openPrice: number
    highPrice: number
    lowPrice: number
    totalVolume: number
    estimatedVolume: number
  }>
  count: number
}

export interface DailyTradeResponse {
  stockCode: string
  data: Array<{
    stockCode: string
    stockName: string
    date: string
    closePrice: number
    avgPrice: number
    prevClose: number
    openPrice: number
    highPrice: number
    lowPrice: number
    change: number
    changePercent: number
    totalVolume: number
    prevVolume: number
    innerVolume: number
    outerVolume: number
    foreignInvestor: number
    investmentTrust: number
    dealer: number
    chips: number
    mainBuy: number
    mainSell: number
    monthHigh: number
    monthLow: number
    quarterHigh: number
  }>
  count: number
}

// 獲取股票基本資訊
export async function getStockInfo(stockCode: string): Promise<StockInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stock/info/${stockCode}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`無法獲取股票 ${stockCode} 的資訊: ${errorText}`)
    }
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    throw error
  }
}

// 獲取盤中即時數據（成交明細）
export async function getIntradayData(
  stockCode: string,
  period: string = '1d',
  interval: string = '5m'
): Promise<TradeDetailResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stock/intraday/${stockCode}?period=${period}&interval=${interval}`
    )
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`無法獲取股票 ${stockCode} 的盤中數據: ${errorText}`)
    }
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    throw error
  }
}

// 獲取日交易檔數據
export async function getDailyTradeData(
  stockCode: string,
  days: number = 5
): Promise<DailyTradeResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stock/daily/${stockCode}?days=${days}`
    )
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`無法獲取股票 ${stockCode} 的日交易數據: ${errorText}`)
    }
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    throw error
  }
}

// 批量獲取多個股票資訊
export async function getMultipleStocks(stockCodes: string[]): Promise<StockInfo[]> {
  try {
    const codes = stockCodes.join(',')
    const response = await fetch(`${API_BASE_URL}/api/stock/batch?stock_codes=${codes}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`無法批量獲取股票資訊: ${errorText}`)
    }
    const result = await response.json()
    return result.stocks || []
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    throw error
  }
}

// 測試後端連接
export async function testBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hello`)
    return response.ok
  } catch {
    return false
  }
}

