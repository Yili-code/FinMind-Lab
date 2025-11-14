// stockApi.ts - 股票數據 API 服務

// 在開發環境使用相對路徑（通過 Vite proxy），生產環境使用環境變數
// 如果設置了 VITE_API_BASE_URL，優先使用；否則在開發環境使用空字符串（通過代理），生產環境使用 localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000')

// API_BASE_URL 已配置

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
    
    const data = await response.json()
    if (!data || typeof data !== 'object') {
      throw new Error('後端返回的數據格式不正確')
    }
    
    return data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
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
    
    const data = await response.json()
    if (!data || typeof data !== 'object') {
      throw new Error('後端返回的數據格式不正確')
    }
    
    return data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
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
    
    const data = await response.json()
    if (!data || typeof data !== 'object') {
      throw new Error('後端返回的數據格式不正確')
    }
    
    return data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
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
    if (!result || typeof result !== 'object') {
      throw new Error('後端返回的數據格式不正確')
    }
    
    return result.stocks || []
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
    }
    throw error
  }
}

// 測試後端連接
export async function testBackendConnection(): Promise<boolean> {
  const url = `${API_BASE_URL}/api/hello`
  
  // 先嘗試通過配置的 URL 連接
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    // 檢查是否返回正確的 JSON 響應
    if (response.ok) {
      try {
        const data = await response.json()
        
        // 檢查是否是 FinMind Lab 的後端（返回特定格式）
        const validMessages = [
          'Hello from FastAPI',
          'Successfully connected to the backend!!!'
        ]
        const isValid = data && 
          data.message && 
          typeof data.message === 'string' &&
          validMessages.includes(data.message)
        
        if (isValid) {
          return true
        }
      } catch (parseError) {
        // 靜默處理解析錯誤
      }
    }
  } catch (error) {
    // 靜默處理連接錯誤
  }
  
  return false
}

// 獲取大盤指數數據
export interface MarketIndexResponse {
  indexCode: string
  data: Array<{
    date: string
    indexName: string
    closePrice: number
    openPrice: number
    highPrice: number
    lowPrice: number
    change: number
    changePercent: number
    volume: number
  }>
  count: number
}

export async function getMarketIndexData(
  indexCode: string = '^TWII',
  days: number = 5
): Promise<MarketIndexResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stock/market-index?index_code=${indexCode}&days=${days}`
    )
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`無法獲取大盤指數數據: ${errorText}`)
    }
    
    const data = await response.json()
    if (!data || typeof data !== 'object') {
      throw new Error('後端返回的數據格式不正確')
    }
    
    return data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
    }
    throw error
  }
}

// 財務報表數據接口
export interface FinancialStatementsResponse {
  incomeStatement: {
    stockCode: string
    stockName: string
    period: string
    revenue: number
    grossProfit: number
    grossProfitRatio: number
    operatingExpenses: number
    operatingExpensesRatio: number
    operatingIncome: number
    operatingIncomeRatio: number
    netIncome: number
    otherIncome: number
  } | null
  balanceSheet: {
    stockCode: string
    stockName: string
    period: string
    totalAssets: number
    totalAssetsRatio: number
    shareholdersEquity: number
    shareholdersEquityRatio: number
    currentAssets: number
    currentAssetsRatio: number
    currentLiabilities: number
    currentLiabilitiesRatio: number
  } | null
  cashFlow: {
    stockCode: string
    stockName: string
    period: string
    operatingCashFlow: number
    investingCashFlow: number
    investingCashFlowRatio: number
    financingCashFlow: number
    financingCashFlowRatio: number
    freeCashFlow: number
    freeCashFlowRatio: number
    netCashFlow: number
    netCashFlowRatio: number
  } | null
}

// 獲取財務報表數據
export async function getFinancialStatements(stockCode: string): Promise<FinancialStatementsResponse> {
  const url = `${API_BASE_URL}/api/stock/financial/${stockCode}`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(`無法獲取股票 ${stockCode} 的財務報表數據 (${response.status}): ${errorText}`)
    }
    
    // 檢查響應內容類型
    const contentType = response.headers.get('content-type')
    
    // 先讀取響應文本（只能讀取一次）
    const text = await response.text()
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`後端返回了非 JSON 格式的數據: ${text.substring(0, 100)}`)
    }
    
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }
    
    // 驗證數據結構
    if (!data || (typeof data !== 'object') || Array.isArray(data)) {
      throw new Error('後端返回的數據格式不正確')
    }
    
    // 類型守衛：驗證是否為 FinancialStatementsResponse
    const typedData = data as FinancialStatementsResponse
    
    // 確保至少有一個報表數據存在
    if (!typedData.incomeStatement && !typedData.balanceSheet && !typedData.cashFlow) {
      throw new Error(`股票 ${stockCode} 的財務報表數據為空，可能是該股票沒有可用的財務數據`)
    }
    
    return typedData
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
    }
    // 重新拋出其他錯誤（包括我們自己創建的 Error）
    throw error
  }
}

// 生成 K 線圖
export interface ChartResponse {
  stockCode: string
  stockName: string
  image: string  // base64 編碼的圖片
  dataCount: number
}

export async function generateStockChart(
  stockCode: string,
  period: string = '1d',
  interval: string = '1d',
  days: number = 100
): Promise<ChartResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stock/chart/${stockCode}?period=${period}&interval=${interval}&days=${days}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`無法生成股票 ${stockCode} 的圖表: ${errorText}`)
    }
    
    const data = await response.json()
    if (!data || typeof data !== 'object') {
      throw new Error('後端返回的數據格式不正確')
    }
    
    return data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://localhost:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
    }
    throw error
  }
}
