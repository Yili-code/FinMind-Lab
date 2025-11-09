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
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '億'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '萬'
    }
    return num.toLocaleString('zh-TW')
  }

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : ''
    return (
      <span className={change >= 0 ? 'positive' : 'negative'}>
        {sign}{change.toFixed(2)} ({sign}{changePercent.toFixed(2)}%)
      </span>
    )
  }

  return (
    <div className="trade-detail-table-container">
      <h3>Table 1: 股票成交明細</h3>
      <div className="table-wrapper">
        <table className="trade-detail-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('stockCode')}>
                代號 {sortConfig?.key === 'stockCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('date')}>
                日期 {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('price')}>
                成交價 {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('change')}>
                漲跌 {sortConfig?.key === 'change' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('lots')}>
                張數 {sortConfig?.key === 'lots' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('period')}>
                時段 {sortConfig?.key === 'period' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('openPrice')}>
                開盤 {sortConfig?.key === 'openPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('highPrice')}>
                最高 {sortConfig?.key === 'highPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('lowPrice')}>
                最低 {sortConfig?.key === 'lowPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('totalVolume')}>
                總量 {sortConfig?.key === 'totalVolume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('estimatedVolume')}>
                預估量 {sortConfig?.key === 'estimatedVolume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                <td className="stock-code">{item.stockCode}</td>
                <td>{item.date}</td>
                <td className="price">{item.price.toFixed(2)}</td>
                <td className="change">{formatChange(item.change, item.changePercent)}</td>
                <td className="lots">{item.lots.toFixed(1)}</td>
                <td className="period">{item.period}</td>
                <td className="price">{item.openPrice.toFixed(2)}</td>
                <td className="price high">{item.highPrice.toFixed(2)}</td>
                <td className="price low">{item.lowPrice.toFixed(2)}</td>
                <td className="volume">{formatNumber(item.totalVolume)}</td>
                <td className="volume estimated">{formatNumber(item.estimatedVolume)}</td>
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
