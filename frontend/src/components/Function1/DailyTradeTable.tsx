import { useState } from 'react'
import type { DailyTrade } from '../../types/stock'
import './DailyTradeTable.css'

interface DailyTradeTableProps {
  data: DailyTrade[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
}

function DailyTradeTable({ data, selectedStockCode, onRowClick }: DailyTradeTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof DailyTrade; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: keyof DailyTrade) => {
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
    <div className="daily-trade-table-container">
      <h3>Table 2: 股票日交易檔</h3>
      <div className="table-wrapper">
        <table className="daily-trade-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('stockCode')}>
                代號 {sortConfig?.key === 'stockCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('stockName')}>
                名稱 {sortConfig?.key === 'stockName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('date')}>
                日期 {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('closePrice')}>
                成交 {sortConfig?.key === 'closePrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('avgPrice')}>
                均價 {sortConfig?.key === 'avgPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('prevClose')}>
                昨收 {sortConfig?.key === 'prevClose' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
              <th onClick={() => handleSort('change')}>
                漲跌 {sortConfig?.key === 'change' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('totalVolume')}>
                總量 {sortConfig?.key === 'totalVolume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('prevVolume')}>
                昨量 {sortConfig?.key === 'prevVolume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('innerVolume')}>
                內盤 {sortConfig?.key === 'innerVolume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('outerVolume')}>
                外盤 {sortConfig?.key === 'outerVolume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('foreignInvestor')}>
                外資 {sortConfig?.key === 'foreignInvestor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('investmentTrust')}>
                投信 {sortConfig?.key === 'investmentTrust' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('dealer')}>
                自營商 {sortConfig?.key === 'dealer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('chips')}>
                籌碼 {sortConfig?.key === 'chips' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('mainBuy')}>
                主買 {sortConfig?.key === 'mainBuy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('mainSell')}>
                主賣 {sortConfig?.key === 'mainSell' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('monthHigh')}>
                月高 {sortConfig?.key === 'monthHigh' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('monthLow')}>
                月低 {sortConfig?.key === 'monthLow' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('quarterHigh')}>
                季高 {sortConfig?.key === 'quarterHigh' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                <td>{item.stockName}</td>
                <td>{item.date}</td>
                <td className="price close">{item.closePrice.toFixed(2)}</td>
                <td className="price">{item.avgPrice.toFixed(2)}</td>
                <td className="price">{item.prevClose.toFixed(2)}</td>
                <td className="price">{item.openPrice.toFixed(2)}</td>
                <td className="price high">{item.highPrice.toFixed(2)}</td>
                <td className="price low">{item.lowPrice.toFixed(2)}</td>
                <td className="change">{formatChange(item.change, item.changePercent)}</td>
                <td className="volume">{formatNumber(item.totalVolume)}</td>
                <td className="volume">{formatNumber(item.prevVolume)}</td>
                <td className="volume">{formatNumber(item.innerVolume)}</td>
                <td className="volume">{formatNumber(item.outerVolume)}</td>
                <td className="volume investor">{formatNumber(item.foreignInvestor)}</td>
                <td className="volume investor">{formatNumber(item.investmentTrust)}</td>
                <td className="volume investor">{formatNumber(item.dealer)}</td>
                <td className="volume chips">{formatNumber(item.chips)}</td>
                <td className="volume buy">{formatNumber(item.mainBuy)}</td>
                <td className="volume sell">{formatNumber(item.mainSell)}</td>
                <td className="price high">{item.monthHigh.toFixed(2)}</td>
                <td className="price low">{item.monthLow.toFixed(2)}</td>
                <td className="price high">{item.quarterHigh.toFixed(2)}</td>
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

export default DailyTradeTable
