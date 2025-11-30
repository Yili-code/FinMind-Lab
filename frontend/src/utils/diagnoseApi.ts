// API 診斷工具
// 用於診斷前端與後端的連接問題

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://127.0.0.1:8000')

export interface DiagnosisResult {
  success: boolean
  message: string
  details?: any
}

/**
 * 診斷 API 連接問題
 */
export async function diagnoseApiConnection(): Promise<DiagnosisResult[]> {
  const results: DiagnosisResult[] = []
  
  // 1. 檢查環境變數
  results.push({
    success: true,
    message: '環境變數檢查',
    details: {
      DEV: import.meta.env.DEV,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '(未設置)',
      API_BASE_URL: API_BASE_URL || '(空 - 使用 Vite 代理)',
    }
  })
  
  // 2. 測試後端連接 (/api/hello)
  const helloUrl = API_BASE_URL ? `${API_BASE_URL}/api/hello` : '/api/hello'
  try {
    console.log(`[診斷] 測試後端連接: ${helloUrl}`)
    const response = await fetch(helloUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })
    
    if (response.ok) {
      const data = await response.json()
      results.push({
        success: true,
        message: '後端連接正常',
        details: {
          url: helloUrl,
          status: response.status,
          response: data,
        }
      })
    } else {
      results.push({
        success: false,
        message: `後端連接失敗 (${response.status})`,
        details: {
          url: helloUrl,
          status: response.status,
          statusText: response.statusText,
        }
      })
    }
  } catch (error) {
    results.push({
      success: false,
      message: '無法連接到後端服務器',
      details: {
        url: helloUrl,
        error: error instanceof Error ? error.message : String(error),
      }
    })
  }
  
  // 3. 測試財務報表端點 (使用測試股票代號)
  const testStockCode = 'AAPL' // 使用美股，因為更可靠
  const financialUrl = API_BASE_URL 
    ? `${API_BASE_URL}/api/stock/financial/${testStockCode}`
    : `/api/stock/financial/${testStockCode}`
  
  try {
    console.log(`[診斷] 測試財務報表端點: ${financialUrl}`)
    const response = await fetch(financialUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })
    
    if (response.ok) {
      results.push({
        success: true,
        message: '財務報表端點正常',
        details: {
          url: financialUrl,
          status: response.status,
        }
      })
    } else {
      const errorText = await response.text().catch(() => '無法讀取錯誤內容')
      results.push({
        success: false,
        message: `財務報表端點失敗 (${response.status})`,
        details: {
          url: financialUrl,
          status: response.status,
          error: errorText.substring(0, 200),
        }
      })
    }
  } catch (error) {
    results.push({
      success: false,
      message: '財務報表端點請求失敗',
      details: {
        url: financialUrl,
        error: error instanceof Error ? error.message : String(error),
      }
    })
  }
  
  return results
}

/**
 * 在控制台輸出診斷結果
 */
export function printDiagnosisResults(results: DiagnosisResult[]) {
  console.log('========== API 連接診斷結果 ==========')
  results.forEach((result, index) => {
    const icon = result.success ? '[成功]' : '[失敗]'
    console.log(`${icon} [${index + 1}] ${result.message}`)
    if (result.details) {
      console.log('   詳情:', result.details)
    }
  })
  console.log('========================================')
}


