import { useState } from 'react'
import IncomeStatementTable from '../components/Financial/IncomeStatementTable'
import BalanceSheetTable from '../components/Financial/BalanceSheetTable'
import CashFlowTable from '../components/Financial/CashFlowTable'
import { useStock } from '../contexts/StockContext'
import { mockIncomeStatements, mockBalanceSheets, mockCashFlows } from '../data/mockFinancialData'
import './FinancialReportsPage.css'

function FinancialReportsPage() {
  const { selectedStockCode, setSelectedStockCode } = useStock()
  const [localSelectedStock, setLocalSelectedStock] = useState<string | undefined>(undefined)

  // 使用 StockContext 的選中股票，如果沒有則使用本地選中
  const activeStockCode = selectedStockCode || localSelectedStock

  const handleTableClick = (stockCode: string) => {
    const newCode = activeStockCode === stockCode ? undefined : stockCode
    setLocalSelectedStock(newCode)
    // 同時更新 StockContext，這樣可以與 Table 3 連動
    setSelectedStockCode(newCode)
  }

  const handleClearFilter = () => {
    setLocalSelectedStock(undefined)
    setSelectedStockCode(undefined)
  }

  // 取得選中股票的資訊
  const getSelectedStockInfo = () => {
    if (!activeStockCode) return null
    
    const income = mockIncomeStatements.find(item => item.stockCode === activeStockCode)
    const balance = mockBalanceSheets.find(item => item.stockCode === activeStockCode)
    const cashFlow = mockCashFlows.find(item => item.stockCode === activeStockCode)
    
    return { income, balance, cashFlow }
  }

  const stockInfo = getSelectedStockInfo()

  return (
    <div className="financial-reports-page">
      <div className="financial-reports-container">
        <div className="financial-reports-header">
          <h1>財務報表</h1>
          <p className="financial-reports-description">
            提供股票財務報表查詢與分析功能 - 與 Table 3 連動查詢
          </p>
        </div>

        {activeStockCode && stockInfo && (
          <div className="financial-reports-controls">
            <div className="filter-control">
              <span className="filter-label">已選中股票:</span>
              <span className="filter-value">{activeStockCode}</span>
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
            data={mockIncomeStatements}
            selectedStockCode={activeStockCode}
            onRowClick={handleTableClick}
          />

          <BalanceSheetTable
            data={mockBalanceSheets}
            selectedStockCode={activeStockCode}
            onRowClick={handleTableClick}
          />

          <CashFlowTable
            data={mockCashFlows}
            selectedStockCode={activeStockCode}
            onRowClick={handleTableClick}
          />
        </div>

        {activeStockCode && stockInfo && stockInfo.income && (
          <div className="financial-summary">
            <h3>財務摘要 - {activeStockCode}</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <h4>損益表摘要</h4>
                <div className="summary-item">
                  <span>營業收入:</span>
                  <span className="value">{(stockInfo.income.revenue / 100000000).toFixed(2)} 億</span>
                </div>
                <div className="summary-item">
                  <span>本期淨利:</span>
                  <span className="value positive">{(stockInfo.income.netIncome / 100000000).toFixed(2)} 億</span>
                </div>
                <div className="summary-item">
                  <span>每股盈餘:</span>
                  <span className="value eps">{stockInfo.income.eps.toFixed(2)}</span>
                </div>
              </div>

              {stockInfo.balance && (
                <div className="summary-card">
                  <h4>資產負債表摘要</h4>
                  <div className="summary-item">
                    <span>資產總計:</span>
                    <span className="value">{(stockInfo.balance.totalAssets / 100000000).toFixed(2)} 億</span>
                  </div>
                  <div className="summary-item">
                    <span>負債總計:</span>
                    <span className="value">{(stockInfo.balance.totalLiabilities / 100000000).toFixed(2)} 億</span>
                  </div>
                  <div className="summary-item">
                    <span>股東權益:</span>
                    <span className="value positive">{(stockInfo.balance.shareholdersEquity / 100000000).toFixed(2)} 億</span>
                  </div>
                </div>
              )}

              {stockInfo.cashFlow && (
                <div className="summary-card">
                  <h4>現金流量表摘要</h4>
                  <div className="summary-item">
                    <span>營業活動現金流量:</span>
                    <span className={`value ${stockInfo.cashFlow.operatingCashFlow >= 0 ? 'positive' : 'negative'}`}>
                      {(stockInfo.cashFlow.operatingCashFlow / 100000000).toFixed(2)} 億
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>期末現金餘額:</span>
                    <span className="value">{(stockInfo.cashFlow.endingCash / 100000000).toFixed(2)} 億</span>
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
              💡 點擊任一表格的股票代號，三個表格會同步篩選顯示該股票的財務資料。
              在 Function 2 的 Table 3 選中股票後，此頁面會自動顯示該股票的財務報表。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialReportsPage
