import { useState } from 'react'
import type { TradeDetail } from '../../types/stock'
import './TradeDetailTable.css'

interface TradeDetailTableProps {
  data: TradeDetail[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
}

function TradeDetailTable({ data, selectedStockCode, onRowClick }: TradeDetailTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof TradeDetail; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: keyof TradeDetail) => {
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

  const filteredData = selectedStockCode 
    ? sortedData.filter(item => item.stockCode === selectedStockCode)
    : sortedData

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW')
  }

  return (
    <div className="trade-detail-table-container">
      <h3>Table 1: 股票成交明細</h3>
      <div className="table-wrapper">
        <table className="trade-detail-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('stockCode')}>
                股票代號 {sortConfig?.key === 'stockCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('stockName')}>
                股票名稱 {sortConfig?.key === 'stockName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('time')}>
                時間 {sortConfig?.key === 'time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('price')}>
                成交價 {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('volume')}>
                成交量 {sortConfig?.key === 'volume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('amount')}>
                成交金額 {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('buySell')}>
                買賣 {sortConfig?.key === 'buySell' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr
                key={item.id}
                className={selectedStockCode && item.stockCode === selectedStockCode ? 'selected' : ''}
                onClick={() => onRowClick?.(item.stockCode)}
              >
                <td>{item.stockCode}</td>
                <td>{item.stockName}</td>
                <td>{item.time}</td>
                <td className="price">{item.price.toFixed(2)}</td>
                <td className="volume">{formatNumber(item.volume)}</td>
                <td className="amount">{formatNumber(item.amount)}</td>
                <td className={item.buySell === '買' ? 'buy' : 'sell'}>{item.buySell}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-info">
        顯示 {filteredData.length} / {data.length} 筆資料
        {selectedStockCode && <span className="filter-badge">已篩選: {selectedStockCode}</span>}
      </div>
    </div>
  )
}

export default TradeDetailTable

