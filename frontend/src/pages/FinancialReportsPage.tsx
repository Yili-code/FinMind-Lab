import { useState, useEffect } from 'react'
import IncomeStatementTable from '../components/Financial/IncomeStatementTable'
import BalanceSheetTable from '../components/Financial/BalanceSheetTable'
import CashFlowTable from '../components/Financial/CashFlowTable'
import IncomeStatementForm from '../components/Financial/IncomeStatementForm'
import BalanceSheetForm from '../components/Financial/BalanceSheetForm'
import CashFlowForm from '../components/Financial/CashFlowForm'
import { financialStorageService } from '../services/financialStorageService'
import type { IncomeStatementItem, BalanceSheetItem, CashFlowItem } from '../types/financial'
import './FinancialReportsPage.css'

function FinancialReportsPage() {
  const [selectedStockCode, setSelectedStockCode] = useState<string | undefined>(undefined)
  
  const [incomeStatements, setIncomeStatements] = useState<IncomeStatementItem[]>([])
  const [balanceSheets, setBalanceSheets] = useState<BalanceSheetItem[]>([])
  const [cashFlows, setCashFlows] = useState<CashFlowItem[]>([])

  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showBalanceForm, setShowBalanceForm] = useState(false)
  const [showCashFlowForm, setShowCashFlowForm] = useState(false)

  const [editingIncome, setEditingIncome] = useState<IncomeStatementItem | undefined>(undefined)
  const [editingBalance, setEditingBalance] = useState<BalanceSheetItem | undefined>(undefined)
  const [editingCashFlow, setEditingCashFlow] = useState<CashFlowItem | undefined>(undefined)

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = () => {
    setIncomeStatements(financialStorageService.getAllIncomeStatements())
    setBalanceSheets(financialStorageService.getAllBalanceSheets())
    setCashFlows(financialStorageService.getAllCashFlows())
  }

  const handleTableClick = (stockCode: string) => {
    const newCode = selectedStockCode === stockCode ? undefined : stockCode
    setSelectedStockCode(newCode)
  }

  const handleClearFilter = () => {
    setSelectedStockCode(undefined)
  }

  // 損益表處理
  const handleIncomeSubmit = (income: Omit<IncomeStatementItem, 'id'>) => {
    if (editingIncome) {
      financialStorageService.updateIncomeStatement(editingIncome.id, income)
    } else {
      financialStorageService.addIncomeStatement(income)
    }
    loadFinancialData()
    setShowIncomeForm(false)
    setEditingIncome(undefined)
  }

  const handleIncomeEdit = (income: IncomeStatementItem) => {
    setEditingIncome(income)
    setShowIncomeForm(true)
  }

  const handleIncomeDelete = (id: string) => {
    if (window.confirm('確定要刪除此筆損益表資料嗎？')) {
      financialStorageService.deleteIncomeStatement(id)
      loadFinancialData()
    }
  }

  // 資產負債表處理
  const handleBalanceSubmit = (balance: Omit<BalanceSheetItem, 'id'>) => {
    if (editingBalance) {
      financialStorageService.updateBalanceSheet(editingBalance.id, balance)
    } else {
      financialStorageService.addBalanceSheet(balance)
    }
    loadFinancialData()
    setShowBalanceForm(false)
    setEditingBalance(undefined)
  }

  const handleBalanceEdit = (balance: BalanceSheetItem) => {
    setEditingBalance(balance)
    setShowBalanceForm(true)
  }

  const handleBalanceDelete = (id: string) => {
    if (window.confirm('確定要刪除此筆資產負債表資料嗎？')) {
      financialStorageService.deleteBalanceSheet(id)
      loadFinancialData()
    }
  }

  // 現金流量表處理
  const handleCashFlowSubmit = (cashFlow: Omit<CashFlowItem, 'id'>) => {
    if (editingCashFlow) {
      financialStorageService.updateCashFlow(editingCashFlow.id, cashFlow)
    } else {
      financialStorageService.addCashFlow(cashFlow)
    }
    loadFinancialData()
    setShowCashFlowForm(false)
    setEditingCashFlow(undefined)
  }

  const handleCashFlowEdit = (cashFlow: CashFlowItem) => {
    setEditingCashFlow(cashFlow)
    setShowCashFlowForm(true)
  }

  const handleCashFlowDelete = (id: string) => {
    if (window.confirm('確定要刪除此筆現金流量表資料嗎？')) {
      financialStorageService.deleteCashFlow(id)
      loadFinancialData()
    }
  }

  // 取得選中股票的資訊
  const getSelectedStockInfo = () => {
    if (!selectedStockCode) return null
    
    const income = incomeStatements.find(item => item.stockCode === selectedStockCode)
    const balance = balanceSheets.find(item => item.stockCode === selectedStockCode)
    const cashFlow = cashFlows.find(item => item.stockCode === selectedStockCode)
    
    return { income, balance, cashFlow }
  }

  const stockInfo = getSelectedStockInfo()

  return (
    <div className="financial-reports-page">
      <div className="financial-reports-container">
        <div className="financial-reports-header">
          <h1>財務報表</h1>
          <p className="financial-reports-description">
            提供股票財務報表查詢與分析功能 - 所有資料由使用者自行輸入
          </p>
        </div>

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

        <div className="financial-actions">
          <button 
            className="add-btn" 
            onClick={() => {
              setEditingIncome(undefined)
              setShowIncomeForm(true)
            }}
          >
            + 新增損益表
          </button>
          <button 
            className="add-btn" 
            onClick={() => {
              setEditingBalance(undefined)
              setShowBalanceForm(true)
            }}
          >
            + 新增資產負債表
          </button>
          <button 
            className="add-btn" 
            onClick={() => {
              setEditingCashFlow(undefined)
              setShowCashFlowForm(true)
            }}
          >
            + 新增現金流量表
          </button>
        </div>

        {showIncomeForm && (
          <IncomeStatementForm
            onSubmit={handleIncomeSubmit}
            initialData={editingIncome}
            onCancel={() => {
              setShowIncomeForm(false)
              setEditingIncome(undefined)
            }}
          />
        )}

        {showBalanceForm && (
          <BalanceSheetForm
            onSubmit={handleBalanceSubmit}
            initialData={editingBalance}
            onCancel={() => {
              setShowBalanceForm(false)
              setEditingBalance(undefined)
            }}
          />
        )}

        {showCashFlowForm && (
          <CashFlowForm
            onSubmit={handleCashFlowSubmit}
            initialData={editingCashFlow}
            onCancel={() => {
              setShowCashFlowForm(false)
              setEditingCashFlow(undefined)
            }}
          />
        )}

        <div className="reports-tables">
          <IncomeStatementTable
            data={incomeStatements}
            selectedStockCode={selectedStockCode}
            onRowClick={handleTableClick}
            onEdit={handleIncomeEdit}
            onDelete={handleIncomeDelete}
          />

          <BalanceSheetTable
            data={balanceSheets}
            selectedStockCode={selectedStockCode}
            onRowClick={handleTableClick}
            onEdit={handleBalanceEdit}
            onDelete={handleBalanceDelete}
          />

          <CashFlowTable
            data={cashFlows}
            selectedStockCode={selectedStockCode}
            onRowClick={handleTableClick}
            onEdit={handleCashFlowEdit}
            onDelete={handleCashFlowDelete}
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
                  <span className="value">{(stockInfo.income.revenue / 100000000).toFixed(2)} 億</span>
                </div>
                <div className="summary-item">
                  <span>本期淨利:</span>
                  <span className="value positive">{(stockInfo.income.netIncome / 100000000).toFixed(2)} 億</span>
                </div>
                <div className="summary-item">
                  <span>營業利益:</span>
                  <span className="value positive">{(stockInfo.income.operatingIncome / 100000000).toFixed(2)} 億</span>
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
                    <span>流動負債:</span>
                    <span className="value">{(stockInfo.balance.currentLiabilities / 100000000).toFixed(2)} 億</span>
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
                    <span>淨現金流:</span>
                    <span className={`value ${stockInfo.cashFlow.netCashFlow >= 0 ? 'positive' : 'negative'}`}>
                      {(stockInfo.cashFlow.netCashFlow / 100000000).toFixed(2)} 億
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
              💡 點擊任一表格的股票代號，三個表格會同步篩選顯示該股票的財務資料。
              所有資料由使用者自行輸入並儲存於本地資料庫。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialReportsPage
