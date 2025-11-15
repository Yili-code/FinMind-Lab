import { useState, useEffect } from 'react'
import IncomeStatementTable from '../components/Financial/IncomeStatementTable'
import BalanceSheetTable from '../components/Financial/BalanceSheetTable'
import CashFlowTable from '../components/Financial/CashFlowTable'
import { getFinancialStatements, type FinancialStatementsResponse } from '../services/stockApi'
import type { IncomeStatementItem, BalanceSheetItem, CashFlowItem } from '../types/financial'
import './FinancialReportsPage.css'

// 股票群組
interface StockGroup {
  stockCode: string
  stockName: string
  incomeStatement: IncomeStatementItem | null
  balanceSheet: BalanceSheetItem | null
  cashFlow: CashFlowItem | null
}

// 財務報表頁面
function FinancialReportsPage() {
  // 狀態管理
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([])
  const [inputStockCode, setInputStockCode] = useState('')
  const [loading, setLoading] = useState(false)  // 加載狀態
  const [error, setError] = useState<string | null>(null)  // 錯誤訊息
  const [selectedStockCode, setSelectedStockCode] = useState<string | undefined>(undefined)  // 選中的股票代號

  // 從 localStorage 載入已保存的群組
  useEffect(() => {
    const saved = localStorage.getItem('financialStockGroups')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // 驗證解析結果是否為數組
        if (Array.isArray(parsed)) {
          setStockGroups(parsed as StockGroup[])
        }
      } catch (e) {
        // 靜默處理載入錯誤
      }
    }
  }, [])

  // 保存群組到 localStorage
  const saveGroups = (groups: StockGroup[]) => {
    localStorage.setItem('financialStockGroups', JSON.stringify(groups))
    setStockGroups(groups)
  }

  // 驗證轉換後的數據是否有效
  const validateBalanceSheetData = (data: BalanceSheetItem): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!data.stockCode) errors.push('stockCode（股票代號）為空')
    if (!data.period) errors.push('period（期間）為空')
    if (data.totalAssets === undefined || data.totalAssets === null || isNaN(data.totalAssets)) {
      errors.push('totalAssets（總資產）無效或為空')
    }
    if (data.shareholdersEquity === undefined || data.shareholdersEquity === null || isNaN(data.shareholdersEquity)) {
      errors.push('shareholdersEquity（股東權益）無效或為空')
    }
    if (data.currentAssets === undefined || data.currentAssets === null || isNaN(data.currentAssets)) {
      errors.push('currentAssets（流動資產）無效或為空')
    }
    if (data.currentLiabilities === undefined || data.currentLiabilities === null || isNaN(data.currentLiabilities)) {
      errors.push('currentLiabilities（流動負債）無效或為空')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 簡化的轉換函數：後端已返回包含 id 的完整數據，只需類型轉換和驗證
  const convertToIncomeStatement = (data: NonNullable<FinancialStatementsResponse['incomeStatement']>, stockCode: string): IncomeStatementItem | null => {
    try {
      // 驗證必需的字段
      if (!data.id || !data.period) {
        console.warn('[轉換失敗] 損益表數據缺少必需字段', data)
        return null
      }

      // 後端已返回完整數據，直接使用（確保類型正確）
      const result: IncomeStatementItem = {
        id: data.id,
        stockCode: data.stockCode || stockCode,
        period: data.period,
        revenue: Number(data.revenue) || 0,
        grossProfit: Number(data.grossProfit) || 0,
        grossProfitRatio: Number(data.grossProfitRatio) || 0,
        operatingExpenses: Number(data.operatingExpenses) || 0,
        operatingExpensesRatio: Number(data.operatingExpensesRatio) || 0,
        operatingIncome: Number(data.operatingIncome) || 0,
        operatingIncomeRatio: Number(data.operatingIncomeRatio) || 0,
        netIncome: Number(data.netIncome) || 0,
        otherIncome: Number(data.otherIncome) || 0,
      }

      return result
    } catch (err) {
      console.error('[轉換錯誤] 損益表數據轉換失敗:', err, data)
      return null
    }
  }

  // 簡化的轉換函數：後端已返回包含 id 的完整數據
  const convertToBalanceSheet = (data: NonNullable<FinancialStatementsResponse['balanceSheet']>, stockCode: string): BalanceSheetItem | null => {
    try {
      // 驗證必需的字段
      if (!data.id || !data.period || data.totalAssets === undefined) {
        console.warn('[轉換失敗] 資產負債表數據缺少必需字段', data)
        return null
      }

      // 後端已返回完整數據，直接使用
      const result: BalanceSheetItem = {
        id: data.id,
        stockCode: data.stockCode || stockCode,
        period: data.period,
        totalAssets: Number(data.totalAssets) || 0,
        totalAssetsRatio: Number(data.totalAssetsRatio) || 0,
        shareholdersEquity: Number(data.shareholdersEquity) || 0,
        shareholdersEquityRatio: Number(data.shareholdersEquityRatio) || 0,
        currentAssets: Number(data.currentAssets) || 0,
        currentAssetsRatio: Number(data.currentAssetsRatio) || 0,
        currentLiabilities: Number(data.currentLiabilities) || 0,
        currentLiabilitiesRatio: Number(data.currentLiabilitiesRatio) || 0,
      }

      // 驗證轉換後的數據
      const validation = validateBalanceSheetData(result)
      if (!validation.valid) {
        console.warn('[驗證失敗] 資產負債表數據驗證失敗:', validation.errors)
        return null
      }

      return result
    } catch (err) {
      console.error('[轉換錯誤] 資產負債表數據轉換失敗:', err, data)
      return null
    }
  }

  // 簡化的轉換函數：後端已返回包含 id 的完整數據
  const convertToCashFlow = (data: NonNullable<FinancialStatementsResponse['cashFlow']>, stockCode: string): CashFlowItem | null => {
    try {
      // 驗證必需的字段
      if (!data.id || !data.period) {
        console.warn('[轉換失敗] 現金流量表數據缺少必需字段', data)
        return null
      }

      // 後端已返回完整數據，直接使用
      const result: CashFlowItem = {
        id: data.id,
        stockCode: data.stockCode || stockCode,
        period: data.period,
        operatingCashFlow: Number(data.operatingCashFlow) || 0,
        investingCashFlow: Number(data.investingCashFlow) || 0,
        investingCashFlowRatio: Number(data.investingCashFlowRatio) || 0,
        financingCashFlow: Number(data.financingCashFlow) || 0,
        financingCashFlowRatio: Number(data.financingCashFlowRatio) || 0,
        freeCashFlow: Number(data.freeCashFlow) || 0,
        freeCashFlowRatio: Number(data.freeCashFlowRatio) || 0,
        netCashFlow: Number(data.netCashFlow) || 0,
        netCashFlowRatio: Number(data.netCashFlowRatio) || 0,
      }

      return result
    } catch (err) {
      console.error('[轉換錯誤] 現金流量表數據轉換失敗:', err, data)
      return null
    }
  }

  // 添加股票到群組
  const handleAddStock = async () => {
    // ========== 階段 1: 前端輸入驗證 ==========
    console.log('========== [階段 1: 前端輸入驗證] ==========')
    const stockCode = inputStockCode.trim().toUpperCase()
    console.log(`[階段 1] 輸入的股票代號: "${inputStockCode}" -> 處理後: "${stockCode}"`)
    
    if (!stockCode) {
      console.error('[階段 1] 錯誤: 股票代號為空')
      setError('請輸入股票編號')
      return
    }

    // 檢查是否已存在
    if (stockGroups.some(g => g.stockCode === stockCode)) {
      console.error(`[階段 1] 錯誤: 股票 ${stockCode} 已存在於群組中`)
      setError(`股票 ${stockCode} 已存在於群組中`)
      return
    }

    console.log(`[階段 1] 輸入驗證通過，股票代號: ${stockCode}`)
    setLoading(true)
    setError(null)

    try {
      // ========== 階段 2: 前端 API 調用 ==========
      console.log('========== [階段 2: 前端 API 調用] ==========')
      console.log(`[階段 2] 開始發送 HTTP 請求到: /api/stock/financial/${stockCode}`)
      const financialData = await getFinancialStatements(stockCode)
      console.log(`[階段 2] API 調用成功，收到響應數據:`, financialData)
      
      // ========== 階段 7: 前端數據處理和轉換 ==========
      console.log('========== [階段 7: 前端數據處理和轉換] ==========')
      console.log(`[階段 7] 檢查返回的數據結構:`)
      console.log(`  - incomeStatement: ${financialData.incomeStatement ? '有數據' : 'null'}`)
      console.log(`  - balanceSheet: ${financialData.balanceSheet ? '有數據' : 'null'}`)
      console.log(`  - cashFlow: ${financialData.cashFlow ? '有數據' : 'null'}`)
      
      if (!financialData.incomeStatement && !financialData.balanceSheet && !financialData.cashFlow) {
        console.error('[階段 7] ❌ 錯誤: 所有財務報表數據都為空')
        const errorMsg = `無法獲取股票 ${stockCode} 的財務報表數據。\n\n可能的原因：\n1. 該股票代號不存在\n2. yfinance 無法獲取該股票的財務數據\n3. 該股票可能已下市或暫停交易\n\n請嘗試其他股票代號，例如：2330 (台積電)、2317 (鴻海)`
        setError(errorMsg)
        setLoading(false)
        return
      }

      // 轉換數據
      console.log(`[階段 7] 開始轉換數據格式...`)
      const incomeStatement = financialData.incomeStatement 
        ? convertToIncomeStatement(financialData.incomeStatement, stockCode)
        : null
      console.log(`[階段 7] 損益表轉換: ${incomeStatement ? '成功' : '失敗'}`)
      
      const balanceSheet = financialData.balanceSheet
        ? convertToBalanceSheet(financialData.balanceSheet, stockCode)
        : null
      console.log(`[階段 7] 資產負債表轉換: ${balanceSheet ? '成功' : '失敗'}`)
      
      const cashFlow = financialData.cashFlow
        ? convertToCashFlow(financialData.cashFlow, stockCode)
        : null
      console.log(`[階段 7] 現金流量表轉換: ${cashFlow ? '成功' : '失敗'}`)

      // 檢查是否至少轉換了一個報表
      if (!incomeStatement && !balanceSheet && !cashFlow) {
        console.error('[階段 7] ❌ 錯誤: 所有數據轉換都失敗')
        const errorMsg = `股票 ${stockCode} 的財務報表數據格式無效，無法轉換。\n\n請檢查後端日誌獲取詳細信息。`
        setError(errorMsg)
        setLoading(false)
        return
      }

      // ========== 階段 8: 前端輸出顯示 ==========
      console.log('========== [階段 8: 前端輸出顯示] ==========')
      // 創建新群組
      const newGroup: StockGroup = {
        stockCode,
        stockName: financialData.incomeStatement?.stockName || 
                   financialData.balanceSheet?.stockName || 
                   financialData.cashFlow?.stockName || 
                   stockCode,
        incomeStatement,
        balanceSheet,
        cashFlow,
      }

      console.log(`[階段 8] 創建新群組:`, newGroup)

      const updatedGroups = [...stockGroups, newGroup]
      saveGroups(updatedGroups)
      setInputStockCode('')
      console.log(`[階段 8] ✅ 股票 ${stockCode} 已成功添加到群組並顯示在界面上`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `獲取股票 ${stockCode} 的財務報表數據失敗`
      console.error(`[錯誤] ${errorMessage}`, err)
      
      // 提供更詳細的錯誤訊息
      let detailedError = errorMessage
      if (errorMessage.includes('無法連接到後端服務器')) {
        detailedError = `無法連接到後端服務器。\n\n請確認：\n1. 後端服務是否正在運行 (http://127.0.0.1:8000)\n2. 端口 8000 是否被其他程序占用\n\n啟動後端的方法：\n• Windows: 在 backend 目錄執行 start_server.bat\n• Linux/Mac: 在 backend 目錄執行 ./start_server.sh\n• 手動啟動: cd backend && python -m uvicorn main:app --reload --port 8000`
      } else if (errorMessage.includes('404') || errorMessage.includes('無法獲取')) {
        detailedError = `${errorMessage}\n\n重要提示：\n⚠️ yfinance 對台股財務報表的支持可能有限\n\n可能的原因：\n1. yfinance 對台股 (.TW) 財務報表數據支持不完整\n2. Yahoo Finance 數據源可能沒有該股票的財務報表數據\n3. 股票代號不存在或格式錯誤\n4. 該股票可能已下市或暫停交易\n\n建議：\n• 請查看後端日誌獲取詳細錯誤信息\n• 嘗試使用美股代號測試（例如：AAPL, MSFT）\n• 如果確實需要台股財務數據，可能需要使用其他數據源\n\n請嘗試其他股票代號，例如：\n• 美股：AAPL (蘋果), MSFT (微軟), TSLA (特斯拉)\n• 台股：2330 (台積電), 2317 (鴻海) - 但可能無法獲取財務報表`
      }
      
      setError(detailedError)
    } finally {
      setLoading(false)
    }
  }

  // 從群組中移除股票
  const handleRemoveStock = (stockCode: string) => {
    if (window.confirm(`確定要移除股票 ${stockCode} 嗎？`)) {
      const updatedGroups = stockGroups.filter(g => g.stockCode !== stockCode)
      saveGroups(updatedGroups)
      if (selectedStockCode === stockCode) {
        setSelectedStockCode(undefined)
      }
    }
  }

  // 刷新股票數據
  const handleRefreshStock = async (stockCode: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`[刷新] 開始刷新股票 ${stockCode} 的財務報表數據...`)
      const financialData = await getFinancialStatements(stockCode)
      console.log(`[刷新] 獲取成功，響應數據:`, financialData)
      
      const updatedGroups = stockGroups.map(group => {
        if (group.stockCode === stockCode) {
          const incomeStatement = financialData.incomeStatement 
            ? convertToIncomeStatement(financialData.incomeStatement, stockCode)
            : null
          
          const balanceSheet = financialData.balanceSheet
            ? convertToBalanceSheet(financialData.balanceSheet, stockCode)
            : null
          
          const cashFlow = financialData.cashFlow
            ? convertToCashFlow(financialData.cashFlow, stockCode)
            : null

          return {
            ...group,
            incomeStatement,
            balanceSheet,
            cashFlow,
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      console.log(`[刷新成功] 股票 ${stockCode} 已成功刷新`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `刷新股票 ${stockCode} 的財務報表數據失敗`
      console.error(`[刷新錯誤] ${errorMsg}`, err)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // 處理表格行點擊
  const handleTableClick = (stockCode: string) => {
    const newCode = selectedStockCode === stockCode ? undefined : stockCode
    setSelectedStockCode(newCode)
  }

  const handleClearFilter = () => {
    setSelectedStockCode(undefined)
  }

  // 獲取所有表格數據
  const getAllIncomeStatements = (): IncomeStatementItem[] => {
    return stockGroups
      .map(g => g.incomeStatement)
      .filter((item): item is IncomeStatementItem => item !== null)
  }

  const getAllBalanceSheets = (): BalanceSheetItem[] => {
    return stockGroups
      .map(g => g.balanceSheet)
      .filter((item): item is BalanceSheetItem => item !== null)
  }

  const getAllCashFlows = (): CashFlowItem[] => {
    return stockGroups
      .map(g => g.cashFlow)
      .filter((item): item is CashFlowItem => item !== null)
  }

  // 取得選中股票的資訊
  const getSelectedStockInfo = () => {
    if (!selectedStockCode) return null
    
    const group = stockGroups.find(g => g.stockCode === selectedStockCode)
    if (!group) return null
    
    return {
      income: group.incomeStatement,
      balance: group.balanceSheet,
      cashFlow: group.cashFlow,
    }
  }

  const stockInfo = getSelectedStockInfo()

  return (
    <div className="financial-reports-page">
      <div className="financial-reports-container">
        <div className="financial-reports-header">
          <h1>Financial Reports</h1>
          <p className="financial-reports-description">
            使用 yfinance 獲取股票財務報表數據 - 輸入股票編號即可加入群組進行分析
          </p>
        </div>

        {/* 股票輸入區域 */}
        <div className="stock-input-section">
          <div className="input-group">
            <input
              type="text"
              className="stock-input"
              placeholder="輸入股票編號（例如：2330）"
              value={inputStockCode}
              onChange={(e) => setInputStockCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddStock()
                }
              }}
              disabled={loading}
            />
            <button
              className="add-stock-btn"
              onClick={handleAddStock}
              disabled={loading || !inputStockCode.trim()}
            >
              {loading ? '載入中...' : '+ 加入群組'}
            </button>
          </div>
          {error && (
            <div className="error-message">
              {error.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
        </div>

        {/* 股票群組列表 */}
        {stockGroups.length > 0 && (
          <div className="stock-groups-section">
            <h3>股票群組</h3>
            <div className="stock-groups-list">
              {stockGroups.map(group => (
                <div key={group.stockCode} className="stock-group-item">
                  <div className="group-info">
                    <span className="stock-code">{group.stockCode}</span>
                    <span className="stock-name">{group.stockName}</span>
                  </div>
                  <div className="group-actions">
                    <button
                      className="refresh-btn"
                      onClick={() => handleRefreshStock(group.stockCode)}
                      disabled={loading}
                    >
                      刷新
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveStock(group.stockCode)}
                      disabled={loading}
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedStockCode && stockInfo && (
          <div className="financial-reports-controls">
            <div className="filter-control">
              <span className="filter-label">已選中股票:</span>
              <span className="filter-value">{selectedStockCode}</span>
              {stockInfo.income && (
                <span className="stock-period">期間: {stockInfo.income.period}</span>
              )}
              <button className="clear-filter-btn" onClick={handleClearFilter}>
                清除選中
              </button>
            </div>
          </div>
        )}

        <div className="reports-tables">
          <IncomeStatementTable
            data={getAllIncomeStatements()}
            selectedStockCode={selectedStockCode}
            onRowClick={handleTableClick}
          />

          <BalanceSheetTable
            data={getAllBalanceSheets()}
            selectedStockCode={selectedStockCode}
            onRowClick={handleTableClick}
          />

          <CashFlowTable
            data={getAllCashFlows()}
            selectedStockCode={selectedStockCode}
            onRowClick={handleTableClick}
          />
        </div>

        {selectedStockCode && stockInfo && stockInfo.income && (
          <div className="financial-summary">
            <h3>財務摘要 - {selectedStockCode}</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <h4>損益表摘要</h4>
                <div className="summary-item">
                  <span>營業收入:</span>
                  <span className="value">{(stockInfo.income.revenue / 100000000).toFixed(1)} 億</span>
                </div>
                <div className="summary-item">
                  <span>本期淨利:</span>
                  <span className="value positive">{(stockInfo.income.netIncome / 100000000).toFixed(1)} 億</span>
                </div>
                <div className="summary-item">
                  <span>營業利益:</span>
                  <span className="value positive">{(stockInfo.income.operatingIncome / 100000000).toFixed(1)} 億</span>
                </div>
              </div>

              {stockInfo.balance && (
                <div className="summary-card">
                  <h4>資產負債表摘要</h4>
                  <div className="summary-item">
                    <span>資產總計:</span>
                    <span className="value">{(stockInfo.balance.totalAssets / 100000000).toFixed(1)} 億</span>
                  </div>
                  <div className="summary-item">
                    <span>流動負債:</span>
                    <span className="value">{(stockInfo.balance.currentLiabilities / 100000000).toFixed(1)} 億</span>
                  </div>
                  <div className="summary-item">
                    <span>股東權益:</span>
                    <span className="value positive">{(stockInfo.balance.shareholdersEquity / 100000000).toFixed(1)} 億</span>
                  </div>
                </div>
              )}

              {stockInfo.cashFlow && (
                <div className="summary-card">
                  <h4>現金流量表摘要</h4>
                  <div className="summary-item">
                    <span>營業活動現金流量:</span>
                    <span className={`value ${stockInfo.cashFlow.operatingCashFlow >= 0 ? 'positive' : 'negative'}`}>
                      {(stockInfo.cashFlow.operatingCashFlow / 100000000).toFixed(1)} 億
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>淨現金流:</span>
                    <span className={`value ${stockInfo.cashFlow.netCashFlow >= 0 ? 'positive' : 'negative'}`}>
                      {(stockInfo.cashFlow.netCashFlow / 100000000).toFixed(1)} 億
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="financial-reports-info">
          <div className="info-card">
            <h4>功能說明</h4>
            <p>財務報表功能提供完整的財務數據分析：</p>
            <ul>
              <li><strong>損益表 (Table 4):</strong> 顯示公司經營成果，包括收入、成本、利潤等</li>
              <li><strong>資產負債表 (Table 5):</strong> 顯示公司財務狀況，包括資產、負債、股東權益</li>
              <li><strong>現金流量表 (Table 6):</strong> 顯示公司現金流動情況</li>
            </ul>
            <p className="info-note">
              <strong>提示：</strong> 輸入股票編號後，系統會自動從 yfinance 獲取財務報表數據並加入群組。
              點擊任一表格的股票代號，三個表格會同步篩選顯示該股票的財務資料。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialReportsPage
