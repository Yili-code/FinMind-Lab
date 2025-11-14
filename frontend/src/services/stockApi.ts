// stockApi.ts - 股票數據 API 服務

// 在開發環境使用相對路徑（通過 Vite proxy），生產環境使用環境變數
// 如果設置了 VITE_API_BASE_URL，優先使用；否則在開發環境使用空字符串（通過代理），生產環境使用 localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000')

// 導出 API_BASE_URL 以便調試
if (import.meta.env.DEV) {
  console.log('[API] API 配置:', {
    API_BASE_URL,
    DEV: import.meta.env.DEV,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '(未設置)',
    '使用代理': !import.meta.env.VITE_API_BASE_URL && import.meta.env.DEV
  })
}

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
  const directUrl = 'http://localhost:8000/api/hello'
  
  console.log(`[API] ========== 後端連接測試 ==========`)
  console.log(`[API] 測試 URL (通過代理): ${url}`)
  console.log(`[API] 直接 URL: ${directUrl}`)
  console.log(`[API] API_BASE_URL: "${API_BASE_URL}"`)
  console.log(`[API] 開發模式: ${import.meta.env.DEV}`)
  console.log(`[API] 環境變數 VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL || '(未設置)'}`)
  console.log(`[API] 使用 Vite 代理: ${!import.meta.env.VITE_API_BASE_URL && import.meta.env.DEV}`)
  
  // 先嘗試通過配置的 URL 連接
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })
    const duration = Date.now() - startTime
    
    clearTimeout(timeoutId)
    
    console.log(`[API] 響應時間: ${duration}ms`)
    console.log(`[API] 響應狀態: ${response.status} ${response.statusText}`)
    
    // 檢查是否返回正確的 JSON 響應
    if (response.ok) {
      try {
        const data = await response.json()
        console.log(`[API] 響應數據:`, data)
        // 檢查是否是 FinMind Lab 的後端（返回特定格式）
        const isValid = data && (data.message === 'Hello from FastAPI' || data.message === 'Successfully connected to the backend!!!' || data.message)
        if (isValid) {
          console.log(`[API] ✅ 後端連接成功！`)
          console.log(`[API] ========================================`)
          return true
        } else {
          console.warn(`[API] ⚠️ 後端響應格式不正確:`, data)
        }
      } catch (parseError) {
        console.error(`[API] ❌ JSON 解析失敗:`, parseError)
      }
    } else {
      console.error(`[API] ❌ HTTP 錯誤: ${response.status} ${response.statusText}`)
      const errorText = await response.text().catch(() => '無法讀取錯誤訊息')
      console.error(`[API] 錯誤內容:`, errorText)
    }
  } catch (error) {
    // 連接失敗或超時
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error(`[API] ❌ 後端連接超時（5秒）- URL: ${url}`)
        console.error(`[API]`)
        console.error(`[API] 🔍 診斷步驟：`)
        console.error(`[API] 1. 檢查後端是否運行: 在瀏覽器訪問 ${directUrl}`)
        console.error(`[API] 2. 如果直接 URL 可以訪問，可能是 Vite 代理配置問題`)
        console.error(`[API] 3. 嘗試重啟前端開發服務器 (npm run dev)`)
        console.error(`[API] 4. 檢查 Vite 配置中的 proxy 設置`)
        console.error(`[API]`)
        console.error(`[API] 💡 解決方案：`)
        console.error(`[API]   • 確認後端正在運行: cd backend && python -m uvicorn main:app --reload --port 8000`)
        console.error(`[API]   • 重啟前端服務器`)
        console.error(`[API]   • 清除瀏覽器緩存並刷新頁面`)
        console.error(`[API]   • 如果問題持續，嘗試直接設置 VITE_API_BASE_URL=http://localhost:8000`)
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error(`[API] ❌ 網絡連接失敗 - URL: ${url}`)
        console.error(`[API] 錯誤訊息: ${error.message}`)
        console.error(`[API]`)
        console.error(`[API] 💡 這通常表示：`)
        console.error(`[API]   1. 後端服務沒有運行`)
        console.error(`[API]   2. Vite 代理沒有正常工作`)
        console.error(`[API]   3. 瀏覽器阻止了連接`)
        console.error(`[API]`)
        console.error(`[API] 🔧 請嘗試：`)
        console.error(`[API]   • 在瀏覽器直接訪問: ${directUrl}`)
        console.error(`[API]   • 如果直接訪問成功，重啟前端開發服務器`)
      } else {
        console.error(`[API] ❌ 後端連接測試失敗:`, error)
        console.error(`[API] 錯誤類型: ${error.constructor.name}`)
        console.error(`[API] 錯誤訊息: ${error.message}`)
      }
    } else {
      console.error(`[API] ❌ 未知錯誤:`, error)
    }
  }
  
  console.log(`[API] ========================================`)
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
  console.log(`[API] 請求財務報表數據: ${url}`)
  
  try {
    const response = await fetch(url)
    
    console.log(`[API] 響應狀態: ${response.status} ${response.statusText}`)
    console.log(`[API] 響應頭部:`, {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length')
    })
    
    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
        console.error(`[API] 錯誤響應內容:`, errorText)
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(`無法獲取股票 ${stockCode} 的財務報表數據 (${response.status}): ${errorText}`)
    }
    
    // 檢查響應內容類型
    const contentType = response.headers.get('content-type')
    console.log(`[API] Content-Type: ${contentType}`)
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error(`[API] 非 JSON 響應:`, text.substring(0, 200))
      throw new Error(`後端返回了非 JSON 格式的數據: ${text.substring(0, 100)}`)
    }
    
    let data: any
    try {
      const text = await response.text()
      console.log(`[API] 響應文本長度: ${text.length} 字符`)
      console.log(`[API] 響應文本預覽:`, text.substring(0, 500))
      
      data = JSON.parse(text)
      console.log(`[API] 解析後的數據:`, data)
    } catch (parseError) {
      console.error(`[API] JSON 解析錯誤:`, parseError)
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }
    
    // 驗證數據結構
    if (!data || (typeof data !== 'object')) {
      console.error(`[API] 數據格式錯誤:`, data)
      throw new Error('後端返回的數據格式不正確')
    }
    
    // 確保至少有一個報表數據存在
    if (!data.incomeStatement && !data.balanceSheet && !data.cashFlow) {
      console.warn(`[API] 所有報表數據為空:`, data)
      throw new Error(`股票 ${stockCode} 的財務報表數據為空，可能是該股票沒有可用的財務數據`)
    }
    
    console.log(`[API] 成功獲取財務報表數據:`, {
      hasIncomeStatement: !!data.incomeStatement,
      hasBalanceSheet: !!data.balanceSheet,
      hasCashFlow: !!data.cashFlow
    })
    
    return data
  } catch (error) {
    console.error(`[API] 獲取財務報表數據失敗:`, error)
    
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

