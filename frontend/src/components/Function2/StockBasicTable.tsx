import { useState } from 'react'
import type { StockBasic } from '../../types/stock'
import './StockBasicTable.css'

interface StockBasicTableProps {
  data: StockBasic[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
  onEdit?: (stock: StockBasic) => void
  onDelete?: (stockCode: string) => void
}

function StockBasicTable({ data, selectedStockCode, onRowClick, onEdit, onDelete }: StockBasicTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockBasic; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: keyof StockBasic) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    const aStr = String(aValue)
    const bStr = String(bValue)
    return sortConfig.direction === 'asc' 
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })

  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '億'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '萬'
    }
    return num.toLocaleString('zh-TW')
  }

  return (
    <div className="stock-basic-table-container">
      <h3>Table 3: 股票基本檔</h3>
      <div className="table-wrapper">
        <table className="stock-basic-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('stockCode')}>
                股票代號 {sortConfig?.key === 'stockCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('stockName')}>
                股票名稱 {sortConfig?.key === 'stockName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('industry')}>
                產業別 {sortConfig?.key === 'industry' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('market')}>
                市場別 {sortConfig?.key === 'market' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('listedDate')}>
                上市日期 {sortConfig?.key === 'listedDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('capital')}>
                資本額 {sortConfig?.key === 'capital' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-message">
                  尚無資料，請新增股票基本檔
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr
                  key={item.id}
                  className={selectedStockCode && item.stockCode === selectedStockCode ? 'selected' : ''}
                  onClick={() => onRowClick?.(item.stockCode)}
                >
                  <td className="stock-code">{item.stockCode}</td>
                  <td>{item.stockName}</td>
                  <td>{item.industry}</td>
                  <td>{item.market}</td>
                  <td>{item.listedDate}</td>
                  <td className="capital">{formatNumber(item.capital)}</td>
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
                        onClick={() => {
                          if (window.confirm(`確定要刪除 ${item.stockName} (${item.stockCode}) 嗎？`)) {
                            onDelete(item.stockCode)
                          }
                        }}
                        title="刪除"
                      >
                        刪除
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="table-info">
        共 {sortedData.length} 筆資料
        {selectedStockCode && <span className="filter-badge">已選中: {selectedStockCode}</span>}
      </div>
    </div>
  )
}

export default StockBasicTable

