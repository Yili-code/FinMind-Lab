import { useState } from 'react'
import type { IncomeStatementItem } from '../../types/financial'
import './FinancialTable.css'

interface IncomeStatementTableProps {
  data: IncomeStatementItem[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
  onEdit?: (income: IncomeStatementItem) => void
  onDelete?: (id: string) => void
}

function IncomeStatementTable({ data, selectedStockCode, onRowClick, onEdit, onDelete }: IncomeStatementTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof IncomeStatementItem; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: keyof IncomeStatementItem) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  let filteredData = selectedStockCode
    ? data.filter(item => item.stockCode === selectedStockCode)
    : data

  // 排序數據
  if (sortConfig) {
    filteredData = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      const aStr = String(aValue)
      const bStr = String(bValue)
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1) + '億'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(1) + '萬'
    }
    return num.toLocaleString('zh-TW')
  }

  const formatPercent = (num: number) => {
    return num.toFixed(1) + '%'
  }

  return (
    <div className="financial-table-container">
      <h3>股票財務分析 - 損益表</h3>
      <div className="table-wrapper">
        <table className="financial-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('stockCode')}>
                代號 {sortConfig?.key === 'stockCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('period')}>
                年/季 {sortConfig?.key === 'period' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('revenue')}>
                營業收入 {sortConfig?.key === 'revenue' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('grossProfit')}>
                營業毛利 {sortConfig?.key === 'grossProfit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('grossProfitRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'grossProfitRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('operatingExpenses')}>
                營業費用 {sortConfig?.key === 'operatingExpenses' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('operatingExpensesRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'operatingExpensesRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('operatingIncome')}>
                營業利益 {sortConfig?.key === 'operatingIncome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('operatingIncomeRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'operatingIncomeRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('netIncome')}>
                稅後淨利 {sortConfig?.key === 'netIncome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('otherIncome')}>
                其他損益 {sortConfig?.key === 'otherIncome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              {(onEdit || onDelete) && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={(onEdit || onDelete) ? 12 : 11} className="empty-message">
                  {selectedStockCode ? `無 ${selectedStockCode} 的損益表資料` : '尚無資料'}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className={selectedStockCode && item.stockCode === selectedStockCode ? 'selected' : ''}
                  onClick={() => onRowClick?.(item.stockCode)}
                >
                  <td className="stock-code">{item.stockCode}</td>
                  <td>{item.period}</td>
                  <td className="amount">{formatNumber(item.revenue)}</td>
                  <td className="amount positive">{formatNumber(item.grossProfit)}</td>
                  <td className="ratio">{formatPercent(item.grossProfitRatio)}</td>
                  <td className="amount">{formatNumber(item.operatingExpenses)}</td>
                  <td className="ratio">{formatPercent(item.operatingExpensesRatio)}</td>
                  <td className="amount positive">{formatNumber(item.operatingIncome)}</td>
                  <td className="ratio">{formatPercent(item.operatingIncomeRatio)}</td>
                  <td className="amount positive">{formatNumber(item.netIncome)}</td>
                  <td className="amount">{formatNumber(item.otherIncome)}</td>
                  {(onEdit || onDelete) && (
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      {onEdit && (
                        <button 
                          className="edit-btn" 
                          onClick={() => onEdit(item)}
                          title="編輯"
                        >
                          編輯
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          className="delete-btn" 
                          onClick={() => onDelete(item.id)}
                          title="刪除"
                        >
                          刪除
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="table-info">
        顯示 {filteredData.length} / {data.length} 筆資料
        {selectedStockCode && <span className="filter-badge">已選中: {selectedStockCode}</span>}
      </div>
    </div>
  )
}

export default IncomeStatementTable
