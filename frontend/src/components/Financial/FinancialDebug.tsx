import { useState } from 'react'
import { getFinancialStatements } from '../../services/stockApi'
import type { BalanceSheetItem } from '../../types/financial'

/**
 * 診斷組件：用於調試數據集成問題
 */
function FinancialDebug() {
  const [stockCode, setStockCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [convertedData, setConvertedData] = useState<BalanceSheetItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    if (!stockCode.trim()) {
      setError('請輸入股票代號')
      return
    }

    setLoading(true)
    setError(null)
    setApiResponse(null)
    setConvertedData(null)

    try {
      // 1. 獲取 API 原始響應
      console.log(`[診斷] 開始獲取股票 ${stockCode} 的財務報表數據...`)
      const response = await getFinancialStatements(stockCode)
      console.log('[診斷] API 原始響應:', response)
      setApiResponse(response)

      // 2. 嘗試轉換資產負債表數據
      if (response.balanceSheet) {
        const converted: BalanceSheetItem = {
          id: `${stockCode}-${response.balanceSheet.period}`,
          stockCode: response.balanceSheet.stockCode,
          period: response.balanceSheet.period,
          totalAssets: response.balanceSheet.totalAssets,
          totalAssetsRatio: response.balanceSheet.totalAssetsRatio,
          shareholdersEquity: response.balanceSheet.shareholdersEquity,
          shareholdersEquityRatio: response.balanceSheet.shareholdersEquityRatio,
          currentAssets: response.balanceSheet.currentAssets,
          currentAssetsRatio: response.balanceSheet.currentAssetsRatio,
          currentLiabilities: response.balanceSheet.currentLiabilities,
          currentLiabilitiesRatio: response.balanceSheet.currentLiabilitiesRatio,
        }
        console.log('[診斷] 轉換後的數據:', converted)
        setConvertedData(converted)

        // 3. 驗證數據字段
        const issues: string[] = []
        if (!converted.stockCode) issues.push('❌ stockCode 為空')
        if (!converted.period) issues.push('❌ period 為空')
        if (converted.totalAssets === 0) issues.push('⚠️ totalAssets 為 0')
        if (converted.totalAssets === undefined) issues.push('❌ totalAssets 未定義')
        
        if (issues.length > 0) {
          console.warn('[診斷] 發現問題:', issues)
          setError(`數據轉換發現問題:\n${issues.join('\n')}`)
        } else {
          setError(null)
        }
      } else {
        setError('API 未返回資產負債表數據')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[診斷] 錯誤:', errorMsg)
      setError(`獲取數據失敗: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f5f5f5' }}>
      <h2>🔧 財務數據集成診斷工具</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={stockCode}
          onChange={(e) => setStockCode(e.target.value)}
          placeholder="輸入股票代號 (例如: 2330)"
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
          disabled={loading}
        />
        <button
          onClick={handleTest}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '測試中...' : '測試數據'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '15px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}>
          {error}
        </div>
      )}

      {apiResponse && (
        <div style={{ marginBottom: '15px' }}>
          <h3>📥 API 原始響應</h3>
          <pre style={{
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px',
            border: '1px solid #ddd',
          }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}

      {convertedData && (
        <div style={{ marginBottom: '15px' }}>
          <h3>✅ 轉換後的 BalanceSheetItem</h3>
          <pre style={{
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px',
            border: '1px solid #ddd',
          }}>
            {JSON.stringify(convertedData, null, 2)}
          </pre>
          
          <h4>字段驗證結果：</h4>
          <ul style={{ fontSize: '14px' }}>
            <li>
              id: <code>{convertedData.id}</code> 
              <span style={{ marginLeft: '10px', color: convertedData.id ? 'green' : 'red' }}>
                {convertedData.id ? '✓' : '✗'}
              </span>
            </li>
            <li>
              stockCode: <code>{convertedData.stockCode}</code> 
              <span style={{ marginLeft: '10px', color: convertedData.stockCode ? 'green' : 'red' }}>
                {convertedData.stockCode ? '✓' : '✗'}
              </span>
            </li>
            <li>
              period: <code>{convertedData.period}</code> 
              <span style={{ marginLeft: '10px', color: convertedData.period ? 'green' : 'red' }}>
                {convertedData.period ? '✓' : '✗'}
              </span>
            </li>
            <li>
              totalAssets: <code>{convertedData.totalAssets}</code> 
              <span style={{ marginLeft: '10px', color: convertedData.totalAssets > 0 ? 'green' : 'red' }}>
                {convertedData.totalAssets > 0 ? '✓' : '✗'}
              </span>
            </li>
            <li>
              shareholdersEquity: <code>{convertedData.shareholdersEquity}</code> 
              <span style={{ marginLeft: '10px', color: convertedData.shareholdersEquity > 0 ? 'green' : 'red' }}>
                {convertedData.shareholdersEquity > 0 ? '✓' : '✗'}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default FinancialDebug
