import { useState, useMemo, memo, useCallback } from 'react'
import type { TradeDetail } from '../../types/stock'
import './TradeDetailTable.css'

interface TradeDetailTableProps {
  data: TradeDetail[]
  selectedStockCode?: string
  selectedDate?: string
  onRowClick?: (stockCode: string) => void
}

const TradeDetailTable = memo(function TradeDetailTable({ data, selectedStockCode, selectedDate, onRowClick }: TradeDetailTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof TradeDetail; direction: 'asc' | 'desc' } | null>(null)

  // 優化：使用 useCallback 避免不必要的重新渲染
  const handleSort = useCallback((key: keyof TradeDetail) => {
    setSortConfig(prev => {
      if (prev && prev.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return { key, direction: 'asc' }
    })
  }, [])

  // 優化：使用 useMemo 緩存排序和過濾結果
  const filteredData = useMemo(() => {
    let sortedData = [...data]
    
    // 排序
    if (sortConfig) {
      sortedData.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        // 處理 null/undefined 值
        if (aValue === null || aValue === undefined) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        if (bValue === null || bValue === undefined) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (isNaN(aValue) && isNaN(bValue)) return 0
          if (isNaN(aValue)) return sortConfig.direction === 'asc' ? 1 : -1
          if (isNaN(bValue)) return sortConfig.direction === 'asc' ? -1 : 1
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        
        const aStr = String(aValue)
        const bStr = String(bValue)
        return sortConfig.direction === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    }

    // 過濾
    if (selectedStockCode) {
      sortedData = sortedData.filter(item => item.stockCode === selectedStockCode)
    }
    if (selectedDate) {
      const dateStr = selectedDate
      sortedData = sortedData.filter(item => {
        // 如果 item.date 已經是 YYYY-MM-DD 格式，直接比較
        if (item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
          return item.date === dateStr
        }
        // 否則轉換為 YYYY-MM-DD 格式進行比較
        try {
          const itemDate = new Date(item.date)
          if (isNaN(itemDate.getTime())) {
            return false
          }
          const formattedDate = itemDate.toISOString().split('T')[0]
          return formattedDate === dateStr
        } catch {
          return false
        }
      })
    }
    
    return sortedData
  }, [data, sortConfig, selectedStockCode, selectedDate])

  // 判斷無數據的原因
  const getNoDataReason = () => {
    if (data.length === 0) {
      return '目前沒有任何成交明細數據'
    }
    if (selectedStockCode && filteredData.length === 0) {
      if (selectedDate) {
        return `股票代號 ${selectedStockCode} 在 ${selectedDate} 沒有成交明細數據（可能原因：該日期為假日、停牌或無交易）`
      }
      return `股票代號 ${selectedStockCode} 沒有成交明細數據`
    }
    if (selectedDate && filteredData.length === 0) {
      return `日期 ${selectedDate} 沒有成交明細數據（可能原因：該日期為假日、停牌或無交易）`
    }
    return null
  }

  const noDataReason = getNoDataReason()

  const formatNumber = (num: number) => {
    if (num === null || num === undefined || isNaN(num)) {
      return 'N/A'
    }
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1) + '億'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(1) + '萬'
    }
    return num.toLocaleString('zh-TW')
  }

  const formatChange = (change: number, changePercent: number) => {
    if (change === null || change === undefined || isNaN(change)) {
      return <span className="text-muted">N/A</span>
    }
    const sign = change >= 0 ? '+' : ''
    const percentValue = (changePercent === null || changePercent === undefined || isNaN(changePercent)) ? 0 : changePercent
    return (
      <span className={change >= 0 ? 'positive' : 'negative'}>
        {sign}{change.toFixed(1)} ({sign}{percentValue.toFixed(1)}%)
      </span>
    )
  }

  return (
    <div className="trade-detail-table-container">
      <h3>股票成交明細</h3>
      <div className="table-wrapper">
        <table className="trade-detail-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('stockCode')}>
                代號 {sortConfig?.key === 'stockCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('time')}>
                時間 {sortConfig?.key === 'time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>無數據</span>
                    {noDataReason && (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{noDataReason}</span>
                    )}
                  </div>
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
                  <td className="time-cell">
                    {item.time ? (
                      // 檢查時間格式是否完整（包含時:分，可能還有秒）
                      item.time.includes(':') && item.time.split(':').length >= 2
                        ? item.time 
                        : `${item.date} ${item.time}`
                    ) : (
                      item.date
                    )}
                  </td>
                  <td className="price">{item.price?.toFixed(1) ?? 'N/A'}</td>
                  <td className="change">{formatChange(item.change ?? 0, item.changePercent ?? 0)}</td>
                  <td className="lots">{item.lots?.toFixed(1) ?? 'N/A'}</td>
                  <td className="period">{item.period ?? 'N/A'}</td>
                  <td className="price">{item.openPrice?.toFixed(1) ?? 'N/A'}</td>
                  <td className="price high">{item.highPrice?.toFixed(1) ?? 'N/A'}</td>
                  <td className="price low">{item.lowPrice?.toFixed(1) ?? 'N/A'}</td>
                  <td className="volume">{formatNumber(item.totalVolume ?? 0)}</td>
                  <td className="volume estimated">{formatNumber(item.estimatedVolume ?? 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="table-info">
        顯示 {filteredData.length} / {data.length} 筆資料
        {selectedStockCode && <span className="filter-badge">已篩選: {selectedStockCode}</span>}
        {selectedDate && <span className="filter-badge">日期: {selectedDate}</span>}
      </div>
    </div>
  )
})

export default TradeDetailTable
