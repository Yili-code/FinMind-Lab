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
  // 構建 URL，確保沒有雙斜杠
  let url: string
  if (API_BASE_URL) {
    // 如果有 API_BASE_URL，確保正確拼接
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    const path = `/api/stock/financial/${stockCode}`
    url = `${base}${path}`
  } else {
    // 開發環境：使用相對路徑，通過 Vite 代理
    url = `/api/stock/financial/${stockCode}`
  }
  
  console.log('========== [階段 2: 前端 API 調用] ==========')
  console.log(`[階段 2] 準備發送 HTTP GET 請求`)
  console.log(`[階段 2] 股票代號: ${stockCode}`)
  console.log(`[階段 2] API_BASE_URL: "${API_BASE_URL}"`)
  console.log(`[階段 2] 完整 URL: "${url}"`)
  console.log(`[階段 2] 環境變數檢查:`)
  console.log(`  - import.meta.env.DEV: ${import.meta.env.DEV}`)
  console.log(`  - import.meta.env.VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL || '(未設置)'}`)
  console.log(`[階段 2] 代理配置檢查:`)
  console.log(`  - 開發環境應使用 Vite 代理 (URL 應以 /api 開頭)`)
  console.log(`  - 如果 URL 不是以 /api 開頭，請檢查 API_BASE_URL 配置`)
  
  try {
    console.log(`[階段 2] 發送 fetch 請求...`)
    const startTime = Date.now()
    
    // 使用 AbortController 設置超時
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超時
    
    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`[階段 2] ❌ 錯誤: 請求超時（超過30秒）`)
        throw new Error(`請求超時：無法在30秒內連接到後端服務器。\n\n請確認：\n1. 後端服務是否正在運行 (http://127.0.0.1:8000)\n2. 網絡連接是否正常\n3. 後端服務是否響應緩慢`)
      }
      
      // 網絡錯誤
      if (fetchError instanceof TypeError) {
        console.error(`[階段 2] ❌ 錯誤: 網絡連接失敗`)
        console.error(`[階段 2] 錯誤詳情:`, fetchError)
        console.error(`[階段 2] 錯誤類型: ${fetchError.constructor.name}`)
        console.error(`[階段 2] 錯誤訊息: ${fetchError.message}`)
        
        // 提供診斷建議
        if (import.meta.env.DEV && !API_BASE_URL) {
          console.error(`[階段 2] 診斷: 開發環境下 API_BASE_URL 為空，應使用 Vite 代理`)
          console.error(`[階段 2] 請確認 vite.config.ts 中的 proxy 配置正確`)
        } else if (API_BASE_URL && !API_BASE_URL.startsWith('http')) {
          console.error(`[階段 2] 診斷: API_BASE_URL 格式不正確: "${API_BASE_URL}"`)
        }
        
        throw new Error(`無法連接到後端服務器。\n\n請確認：\n1. 後端服務是否正在運行 (http://127.0.0.1:8000)\n2. 端口 8000 是否被其他程序占用\n3. 防火牆是否阻止了連接\n\n啟動後端的方法：\n• Windows: 在 backend 目錄執行 start_server.bat\n• Linux/Mac: 在 backend 目錄執行 ./start_server.sh\n• 手動啟動: cd backend && python -m uvicorn main:app --reload --port 8000`)
      }
      
      throw fetchError
    }
    
    const duration = Date.now() - startTime
    console.log(`[階段 2] 收到 HTTP 響應，耗時: ${duration}ms`)
    console.log(`[階段 2] 狀態碼: ${response.status} ${response.statusText}`)
    console.log(`[階段 2] 響應頭:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
        console.error(`[階段 2] ❌ HTTP 錯誤響應`)
        console.error(`[階段 2] 狀態碼: ${response.status} ${response.statusText}`)
        console.error(`[階段 2] 請求 URL: ${url}`)
        console.error(`[階段 2] 錯誤內容: ${errorText.substring(0, 500)}`)
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`
        console.error(`[階段 2] ❌ 無法讀取錯誤響應內容`)
      }
      
      // 根據狀態碼提供更具體的錯誤訊息
      if (response.status === 404) {
        // 404 可能是路徑問題或後端未運行
        console.error(`[階段 2] 404 錯誤診斷:`)
        console.error(`  - 請求 URL: ${url}`)
        console.error(`  - 預期後端路徑: /api/stock/financial/${stockCode}`)
        console.error(`  - 請確認:`)
        console.error(`    1. 後端服務是否正在運行 (http://127.0.0.1:8000)`)
        console.error(`    2. 後端路由是否正確配置`)
        console.error(`    3. Vite 代理是否正常工作`)
        console.error(`  - 測試方法: 在瀏覽器訪問 http://127.0.0.1:8000/api/hello`)
        
        // 嘗試測試後端連接
        const testUrl = API_BASE_URL ? `${API_BASE_URL}/api/hello` : '/api/hello'
        console.log(`[階段 2] 嘗試測試後端連接: ${testUrl}`)
        try {
          const testResponse = await fetch(testUrl, { method: 'GET' })
          if (testResponse.ok) {
            console.log(`[階段 2] ✅ 後端連接正常，問題可能是財務報表端點路徑不正確`)
          } else {
            console.error(`[階段 2] ❌ 後端連接測試失敗: ${testResponse.status}`)
          }
        } catch (testError) {
          console.error(`[階段 2] ❌ 無法連接到後端服務器`)
        }
        
        throw new Error(`無法獲取股票 ${stockCode} 的財務報表數據 (404 未找到)。\n\n可能的原因：\n1. 後端服務未運行 - 請確認後端服務正在運行 (http://127.0.0.1:8000)\n2. 路徑不正確 - 請檢查後端路由配置\n3. 股票代號不存在或該股票沒有可用的財務數據\n4. yfinance 無法獲取該股票的財務報表\n\n診斷信息：\n- 請求 URL: ${url}\n- 錯誤詳情: ${errorText.substring(0, 200)}\n\n請嘗試：\n1. 在瀏覽器訪問 http://127.0.0.1:8000/api/hello 測試後端是否運行\n2. 查看後端日誌獲取詳細錯誤信息`)
      } else if (response.status === 500) {
        throw new Error(`後端服務器錯誤 (500)。\n\n請查看後端日誌獲取詳細錯誤信息。\n\n錯誤詳情: ${errorText.substring(0, 200)}`)
      } else {
        throw new Error(`無法獲取股票 ${stockCode} 的財務報表數據 (${response.status}): ${errorText.substring(0, 200)}`)
      }
    }
    
    console.log(`[階段 2] ✅ HTTP 請求成功`)
    
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
    // 錯誤已在上面處理，這裡只是確保所有錯誤都被正確拋出
    console.error(`[階段 2] 捕獲到錯誤:`, error)
    
    // 如果是我們自己創建的 Error，直接拋出（已經包含詳細訊息）
    if (error instanceof Error) {
      // 檢查是否已經包含詳細的錯誤訊息
      if (error.message.includes('無法連接到後端服務器') || 
          error.message.includes('請求超時') ||
          error.message.includes('無法獲取股票')) {
        throw error
      }
    }
    
    // 處理其他類型的錯誤
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    if (error instanceof SyntaxError) {
      throw new Error(`解析後端返回的 JSON 數據時發生錯誤: ${error.message}`)
    }
    
    // 重新拋出其他錯誤
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
