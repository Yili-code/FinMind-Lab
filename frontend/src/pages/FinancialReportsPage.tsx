import { useState, useEffect } from 'react'
import IncomeStatementTable from '../components/Financial/IncomeStatementTable'
import BalanceSheetTable from '../components/Financial/BalanceSheetTable'
import CashFlowTable from '../components/Financial/CashFlowTable'
import { getFinancialStatements, type FinancialStatementsResponse } from '../services/stockApi'
import type { IncomeStatementItem, BalanceSheetItem, CashFlowItem } from '../types/financial'
import './FinancialReportsPage.css'

interface StockGroup {
  stockCode: string
  stockName: string
  incomeStatement: IncomeStatementItem | null
  balanceSheet: BalanceSheetItem | null
  cashFlow: CashFlowItem | null
}

function FinancialReportsPage() {
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([])
  const [inputStockCode, setInputStockCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStockCode, setSelectedStockCode] = useState<string | undefined>(undefined)

  // 從 localStorage 載入已保存的群組
  useEffect(() => {
    const saved = localStorage.getItem('financialStockGroups')
    if (saved) {
      try {
        setStockGroups(JSON.parse(saved))
      } catch (e) {
        console.error('載入財務報表群組失敗:', e)
      }
    }
  }, [])

  // 保存群組到 localStorage
  const saveGroups = (groups: StockGroup[]) => {
    localStorage.setItem('financialStockGroups', JSON.stringify(groups))
    setStockGroups(groups)
  }

  // 將 API 數據轉換為表格格式
  const convertToIncomeStatement = (data: NonNullable<FinancialStatementsResponse['incomeStatement']>, stockCode: string): IncomeStatementItem => {
    return {
      id: `${stockCode}-${data.period}`,
      stockCode: data.stockCode,
      period: data.period,
      revenue: data.revenue,
      grossProfit: data.grossProfit,
      grossProfitRatio: data.grossProfitRatio,
      operatingExpenses: data.operatingExpenses,
      operatingExpensesRatio: data.operatingExpensesRatio,
      operatingIncome: data.operatingIncome,
      operatingIncomeRatio: data.operatingIncomeRatio,
      netIncome: data.netIncome,
      otherIncome: data.otherIncome || 0,
    }
  }

  const convertToBalanceSheet = (data: NonNullable<FinancialStatementsResponse['balanceSheet']>, stockCode: string): BalanceSheetItem => {
    return {
      id: `${stockCode}-${data.period}`,
      stockCode: data.stockCode,
      period: data.period,
      totalAssets: data.totalAssets,
      totalAssetsRatio: data.totalAssetsRatio,
      shareholdersEquity: data.shareholdersEquity,
      shareholdersEquityRatio: data.shareholdersEquityRatio,
      currentAssets: data.currentAssets,
      currentAssetsRatio: data.currentAssetsRatio,
      currentLiabilities: data.currentLiabilities,
      currentLiabilitiesRatio: data.currentLiabilitiesRatio,
    }
  }

  const convertToCashFlow = (data: NonNullable<FinancialStatementsResponse['cashFlow']>, stockCode: string): CashFlowItem => {
    return {
      id: `${stockCode}-${data.period}`,
      stockCode: data.stockCode,
      period: data.period,
      operatingCashFlow: data.operatingCashFlow,
      investingCashFlow: data.investingCashFlow,
      investingCashFlowRatio: data.investingCashFlowRatio,
      financingCashFlow: data.financingCashFlow,
      financingCashFlowRatio: data.financingCashFlowRatio,
      freeCashFlow: data.freeCashFlow,
      freeCashFlowRatio: data.freeCashFlowRatio,
      netCashFlow: data.netCashFlow,
      netCashFlowRatio: data.netCashFlowRatio,
    }
  }

  // 添加股票到群組
  const handleAddStock = async () => {
    const stockCode = inputStockCode.trim()
    if (!stockCode) {
      setError('請輸入股票編號')
      return
    }

    // 檢查是否已存在
    if (stockGroups.some(g => g.stockCode === stockCode)) {
      setError(`股票 ${stockCode} 已存在於群組中`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`[FinancialReportsPage] 開始獲取股票 ${stockCode} 的財務報表數據`)
      const financialData = await getFinancialStatements(stockCode)
      console.log(`[FinancialReportsPage] 獲取到的財務數據:`, financialData)
      
      if (!financialData.incomeStatement && !financialData.balanceSheet && !financialData.cashFlow) {
        const errorMsg = `無法獲取股票 ${stockCode} 的財務報表數據。\n\n可能的原因：\n1. 該股票代號不存在\n2. yfinance 無法獲取該股票的財務數據\n3. 該股票可能已下市或暫停交易\n\n請嘗試其他股票代號，例如：2330 (台積電)、2317 (鴻海)`
        setError(errorMsg)
        setLoading(false)
        return
      }

      const newGroup: StockGroup = {
        stockCode,
        stockName: financialData.incomeStatement?.stockName || 
                   financialData.balanceSheet?.stockName || 
                   financialData.cashFlow?.stockName || 
                   stockCode,
        incomeStatement: financialData.incomeStatement 
          ? convertToIncomeStatement(financialData.incomeStatement, stockCode)
          : null,
        balanceSheet: financialData.balanceSheet
          ? convertToBalanceSheet(financialData.balanceSheet, stockCode)
          : null,
        cashFlow: financialData.cashFlow
          ? convertToCashFlow(financialData.cashFlow, stockCode)
          : null,
      }

      const updatedGroups = [...stockGroups, newGroup]
      saveGroups(updatedGroups)
      setInputStockCode('')
      console.log(`[FinancialReportsPage] 成功添加股票 ${stockCode} 到群組`)
    } catch (err) {
      console.error(`[FinancialReportsPage] 獲取財務報表數據失敗:`, err)
      const errorMessage = err instanceof Error ? err.message : `獲取股票 ${stockCode} 的財務報表數據失敗`
      
      // 提供更詳細的錯誤訊息
      let detailedError = errorMessage
      if (errorMessage.includes('無法連接到後端服務器')) {
        detailedError = `無法連接到後端服務器。\n\n請確認：\n1. 後端服務是否正在運行 (http://localhost:8000)\n2. 端口 8000 是否被其他程序占用\n\n啟動後端的方法：\n• Windows: 在 backend 目錄執行 start_server.bat\n• Linux/Mac: 在 backend 目錄執行 ./start_server.sh\n• 手動啟動: cd backend && python -m uvicorn main:app --reload --port 8000`
      } else if (errorMessage.includes('404') || errorMessage.includes('無法獲取')) {
        detailedError = `${errorMessage}\n\n可能的原因：\n1. 股票代號不存在或格式錯誤\n2. yfinance 無法獲取該股票的財務數據\n3. 該股票可能已下市或暫停交易\n\n請嘗試其他股票代號，例如：2330 (台積電)、2317 (鴻海)`
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
      const financialData = await getFinancialStatements(stockCode)
      
      const updatedGroups = stockGroups.map(group => {
        if (group.stockCode === stockCode) {
          return {
            ...group,
            incomeStatement: financialData.incomeStatement 
              ? convertToIncomeStatement(financialData.incomeStatement, stockCode)
              : null,
            balanceSheet: financialData.balanceSheet
              ? convertToBalanceSheet(financialData.balanceSheet, stockCode)
              : null,
            cashFlow: financialData.cashFlow
              ? convertToCashFlow(financialData.cashFlow, stockCode)
              : null,
          }
        }
        return group
      })

      saveGroups(updatedGroups)
    } catch (err) {
      setError(err instanceof Error ? err.message : `刷新股票 ${stockCode} 的財務報表數據失敗`)
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
