import { useState } from 'react'
import type { CashFlowItem } from '../../types/financial'
import './FinancialTable.css'

interface CashFlowTableProps {
  data: CashFlowItem[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
  onEdit?: (cashFlow: CashFlowItem) => void
  onDelete?: (id: string) => void
}

function CashFlowTable({ data, selectedStockCode, onRowClick, onEdit, onDelete }: CashFlowTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof CashFlowItem; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: keyof CashFlowItem) => {
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

  const formatCashFlow = (num: number) => {
    const formatted = formatNumber(Math.abs(num))
    return num >= 0 ? `+${formatted}` : `-${formatted}`
  }

  const formatPercent = (num: number) => {
    return num.toFixed(1) + '%'
  }

  return (
    <div className="financial-table-container">
      <h3>股票財務分析 - 現金流量表</h3>
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
              <th onClick={() => handleSort('operatingCashFlow')}>
                營業現金 {sortConfig?.key === 'operatingCashFlow' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('investingCashFlow')}>
                投資現金 {sortConfig?.key === 'investingCashFlow' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('investingCashFlowRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'investingCashFlowRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('financingCashFlow')}>
                融資現金 {sortConfig?.key === 'financingCashFlow' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('financingCashFlowRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'financingCashFlowRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('freeCashFlow')}>
                自由現金 {sortConfig?.key === 'freeCashFlow' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('freeCashFlowRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'freeCashFlowRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('netCashFlow')}>
                淨現金流 {sortConfig?.key === 'netCashFlow' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('netCashFlowRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'netCashFlowRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              {(onEdit || onDelete) && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={(onEdit || onDelete) ? 12 : 11} className="empty-message">
                  {selectedStockCode ? `無 ${selectedStockCode} 的現金流量表資料` : '尚無資料'}
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
                  <td className={`amount ${item.operatingCashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCashFlow(item.operatingCashFlow)}
                  </td>
                  <td className={`amount ${item.investingCashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCashFlow(item.investingCashFlow)}
                  </td>
                  <td className="ratio">{formatPercent(item.investingCashFlowRatio)}</td>
                  <td className={`amount ${item.financingCashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCashFlow(item.financingCashFlow)}
                  </td>
                  <td className="ratio">{formatPercent(item.financingCashFlowRatio)}</td>
                  <td className={`amount ${item.freeCashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCashFlow(item.freeCashFlow)}
                  </td>
                  <td className="ratio">{formatPercent(item.freeCashFlowRatio)}</td>
                  <td className={`amount ${item.netCashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCashFlow(item.netCashFlow)}
                  </td>
                  <td className="ratio">{formatPercent(item.netCashFlowRatio)}</td>
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

export default CashFlowTable
