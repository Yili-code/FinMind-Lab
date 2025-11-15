import { useState } from 'react'
import type { BalanceSheetItem } from '../../types/financial'
import './FinancialTable.css'

interface BalanceSheetTableProps {
  data: BalanceSheetItem[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
  onEdit?: (balance: BalanceSheetItem) => void
  onDelete?: (id: string) => void
}

function BalanceSheetTable({ data, selectedStockCode, onRowClick, onEdit, onDelete }: BalanceSheetTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof BalanceSheetItem; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: keyof BalanceSheetItem) => {
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
      <h3>股票財務分析 - 資產負債表</h3>
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
              <th onClick={() => handleSort('totalAssets')}>
                總資產 {sortConfig?.key === 'totalAssets' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('totalAssetsRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'totalAssetsRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('shareholdersEquity')}>
                股東權益 {sortConfig?.key === 'shareholdersEquity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('shareholdersEquityRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'shareholdersEquityRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('currentAssets')}>
                流動資產 {sortConfig?.key === 'currentAssets' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('currentAssetsRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'currentAssetsRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('currentLiabilities')}>
                流動負債 {sortConfig?.key === 'currentLiabilities' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('currentLiabilitiesRatio')} style={{ cursor: 'pointer' }}>
                比重 {sortConfig?.key === 'currentLiabilitiesRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              {(onEdit || onDelete) && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={(onEdit || onDelete) ? 11 : 10} className="empty-message">
                  {selectedStockCode ? `無 ${selectedStockCode} 的資產負債表資料` : '尚無資料'}
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
                  <td className="amount total">{formatNumber(item.totalAssets)}</td>
                  <td className="ratio">{formatPercent(item.totalAssetsRatio)}</td>
                  <td className="amount positive">{formatNumber(item.shareholdersEquity)}</td>
                  <td className="ratio">{formatPercent(item.shareholdersEquityRatio)}</td>
                  <td className="amount">{formatNumber(item.currentAssets)}</td>
                  <td className="ratio">{formatPercent(item.currentAssetsRatio)}</td>
                  <td className="amount">{formatNumber(item.currentLiabilities)}</td>
                  <td className="ratio">{formatPercent(item.currentLiabilitiesRatio)}</td>
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

export default BalanceSheetTable
