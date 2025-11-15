// stockApi.ts - 股票數據 API 服務

// 在開發環境使用相對路徑（通過 Vite proxy），生產環境使用環境變數
// 如果設置了 VITE_API_BASE_URL，優先使用；否則在開發環境使用空字符串（通過代理），生產環境使用 http://127.0.0.1:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://127.0.0.1:8000')

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
  warning?: string  // 可選的警告信息
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
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
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
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
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
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
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
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
    }
    throw error
  }
}

/**
 * 測試後端連接
 * 
 * 功能說明：
 * 1. 發送 GET 請求到後端的 /api/hello 端點
 * 2. 設置 10 秒超時，避免長時間等待
 * 3. 驗證響應格式和內容，確保是正確的後端服務
 * 4. 返回連接狀態（true/false）
 * 
 * 優化點：
 * - 使用 AbortController 實現超時控制
 * - 驗證響應格式和消息內容
 * - 安全的錯誤處理，不會拋出異常
 * - 支持可配置的超時時間
 * 
 * @param timeoutMs - 超時時間（毫秒），預設 5000ms
 * @returns Promise<boolean> - 連接成功返回 true，否則返回 false
 */
export async function testBackendConnection(timeoutMs: number = 10000): Promise<boolean> {
  const url = `${API_BASE_URL}/api/hello`
  
  // 預期的後端響應消息列表
  const validMessages = [
    'Hello from FastAPI',
    'Successfully connected to the backend!!!'
  ] as const
  
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  try {
    // 創建 AbortController 用於取消請求
    const controller = new AbortController()
    
    // 設置超時，確保在指定時間後取消請求
    timeoutId = setTimeout(() => {
      controller.abort()
    }, timeoutMs)
    
    // 發送請求
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
      // 添加 cache 控制，確保每次都是新請求
      cache: 'no-store'
    })
    
    // 清除超時計時器（請求已完成）
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    
    // 檢查 HTTP 狀態碼
    if (!response.ok) {
      // HTTP 錯誤（4xx, 5xx），但至少能連接到服務器
      return false
    }
    
    // 檢查 Content-Type 是否為 JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return false
    }
    
    // 解析 JSON 響應
    let data: unknown
    try {
      data = await response.json()
    } catch (parseError) {
      // JSON 解析失敗
      return false
    }
    
    // 類型守衛：驗證響應格式
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return false
    }
    
    // 驗證消息字段
    const responseData = data as { message?: unknown }
    if (!responseData.message || typeof responseData.message !== 'string') {
      return false
    }
    
    // 檢查消息是否匹配預期的後端響應
    const isValidMessage = validMessages.includes(
      responseData.message as typeof validMessages[number]
    )
    
    return isValidMessage
    
  } catch (error) {
    // 清除超時計時器（如果還未清除）
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // 處理各種錯誤情況
    if (error instanceof Error) {
      // AbortError 表示請求被取消（超時）
      if (error.name === 'AbortError') {
        // 超時錯誤，後端可能無響應或響應太慢
        return false
      }
      
      // 網絡錯誤（無法連接到服務器）
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return false
      }
    }
    
    // 其他未知錯誤
    return false
  }
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
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
    }
    throw error
  }
}

// 財務報表數據接口（後端已包含 id 字段）
export interface FinancialStatementsResponse {
  incomeStatement: {
    id: string
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
    id: string
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
    id: string
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
  // ========== 階段 2: 前端 API 調用 ==========
  const url = `${API_BASE_URL}/api/stock/financial/${stockCode}`
  console.log(`[階段 2] 準備發送 HTTP GET 請求`)
  console.log(`[階段 2] URL: ${url}`)
  console.log(`[階段 2] API_BASE_URL: ${API_BASE_URL}`)
  
  try {
    console.log(`[階段 2] 發送 fetch 請求...`)
    const response = await fetch(url)
    console.log(`[階段 2] 收到 HTTP 響應，狀態碼: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
        console.error(`[階段 2] ❌ HTTP 錯誤響應內容: ${errorText.substring(0, 200)}`)
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(`無法獲取股票 ${stockCode} 的財務報表數據 (${response.status}): ${errorText}`)
    }
    
    // ========== 階段 6: 前端接收 JSON 響應 ==========
    console.log('========== [階段 6: 前端接收 JSON 響應] ==========')
    // 檢查響應內容類型
    const contentType = response.headers.get('content-type')
    console.log(`[階段 6] Content-Type: ${contentType}`)
    
    // 先讀取響應文本（只能讀取一次）
    const text = await response.text()
    console.log(`[階段 6] 響應文本長度: ${text.length} 字符`)
    console.log(`[階段 6] 響應文本預覽: ${text.substring(0, 200)}...`)
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[階段 6] ❌ 錯誤: Content-Type 不是 application/json`)
      throw new Error(`後端返回了非 JSON 格式的數據: ${text.substring(0, 100)}`)
    }
    
    let data: unknown
    try {
      console.log(`[階段 6] 開始解析 JSON...`)
      data = JSON.parse(text)
      console.log(`[階段 6] ✅ JSON 解析成功`)
    } catch (parseError) {
      console.error(`[階段 6] ❌ JSON 解析失敗:`, parseError)
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }
    
    // 驗證數據結構
    if (!data || (typeof data !== 'object') || Array.isArray(data)) {
      console.error(`[階段 6] ❌ 錯誤: 數據格式不正確，類型: ${typeof data}, 是數組: ${Array.isArray(data)}`)
      throw new Error('後端返回的數據格式不正確')
    }
    
    // 類型守衛：驗證是否為 FinancialStatementsResponse
    const typedData = data as FinancialStatementsResponse
    console.log(`[階段 6] ✅ 數據結構驗證通過`)
    console.log(`[階段 6] 返回的數據:`, typedData)
    
    // 確保至少有一個報表數據存在
    if (!typedData.incomeStatement && !typedData.balanceSheet && !typedData.cashFlow) {
      console.error(`[階段 6] ❌ 錯誤: 所有財務報表數據都為空`)
      throw new Error(`股票 ${stockCode} 的財務報表數據為空，可能是該股票沒有可用的財務數據`)
    }
    
    console.log(`[階段 6] ✅ 成功接收並驗證 JSON 數據`)
    return typedData
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
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
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
    }
    throw error
  }
}
