import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import type { DailyTrade } from '../../types/stock'
import './DailyTradeTable.css'

interface DailyTradeTableProps {
  data: DailyTrade[]
  selectedStockCode?: string
  selectedDate?: string
  onRowClick?: (stockCode: string) => void
  onDataUpdate?: (data: DailyTrade[]) => void
}

const DailyTradeTable = memo(function DailyTradeTable({ data, selectedStockCode, selectedDate, onRowClick, onDataUpdate }: DailyTradeTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof DailyTrade; direction: 'asc' | 'desc' } | null>(null)
  const [editableData, setEditableData] = useState<DailyTrade[]>(data)
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof DailyTrade } | null>(null)

  // 從 localStorage 載入使用者輸入的尾量數據
  useEffect(() => {
    const saved = localStorage.getItem('dailyTradeUserInputs')
    if (saved) {
      try {
        const userInputs = JSON.parse(saved)
        const updated = data.map(item => {
          const key = `${item.stockCode}_${item.date}`
          if (userInputs[key]) {
            return { ...item, ...userInputs[key] }
          }
          return item
        })
        setEditableData(updated)
        if (onDataUpdate) {
          onDataUpdate(updated)
        }
      } catch (e) {
        console.error('載入使用者輸入數據失敗:', e)
        setEditableData(data)
      }
    } else {
      setEditableData(data)
    }
  }, [data, onDataUpdate])

  // 保存使用者輸入的尾量數據
  const saveUserInput = (id: string, stockCode: string, date: string, field: keyof DailyTrade, value: number) => {
    const key = `${stockCode}_${date}`
    const saved = localStorage.getItem('dailyTradeUserInputs')
    const userInputs = saved ? JSON.parse(saved) : {}
    
    if (!userInputs[key]) {
      userInputs[key] = {}
    }
    userInputs[key][field] = value
    
    localStorage.setItem('dailyTradeUserInputs', JSON.stringify(userInputs))
    
    // 更新本地狀態
    const updated = editableData.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    setEditableData(updated)
    if (onDataUpdate) {
      onDataUpdate(updated)
    }
  }

  // 處理可編輯欄位的點擊
  const handleCellClick = (id: string, field: keyof DailyTrade) => {
    // 只有尾量相關欄位可編輯
    const editableFields: (keyof DailyTrade)[] = [
      'innerVolume', 'outerVolume', 'foreignInvestor', 
      'investmentTrust', 'dealer', 'chips', 'mainBuy', 'mainSell'
    ]
    if (editableFields.includes(field)) {
      setEditingCell({ id, field })
    }
  }

  // 處理輸入完成
  const handleCellBlur = (id: string, stockCode: string, date: string, field: keyof DailyTrade, value: string) => {
    const numValue = parseFloat(value) || 0
    saveUserInput(id, stockCode, date, field, numValue)
    setEditingCell(null)
  }

  const handleSort = (key: keyof DailyTrade) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // 根據股票代號和日期過濾數據（使用可編輯數據）
  const sortedEditableData = [...editableData].sort((a, b) => {
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

  let filteredData = sortedEditableData
  if (selectedStockCode) {
    filteredData = filteredData.filter(item => item.stockCode === selectedStockCode)
  }
  if (selectedDate) {
    const dateStr = selectedDate // YYYY-MM-DD 格式
    filteredData = filteredData.filter(item => {
      // 將 item.date 轉換為 YYYY-MM-DD 格式進行比較
      const itemDate = new Date(item.date).toISOString().split('T')[0]
      return itemDate === dateStr
    })
  }

  // 判斷無數據的原因
  const getNoDataReason = () => {
    if (editableData.length === 0) {
      return '目前沒有任何日交易檔數據'
    }
    if (selectedStockCode && filteredData.length === 0) {
      if (selectedDate) {
        return `股票代號 ${selectedStockCode} 在 ${selectedDate} 沒有日交易檔數據（可能原因：該日期為假日、停牌或無交易）`
      }
      return `股票代號 ${selectedStockCode} 沒有日交易檔數據`
    }
    if (selectedDate && filteredData.length === 0) {
      return `日期 ${selectedDate} 沒有日交易檔數據（可能原因：該日期為假日、停牌或無交易）`
    }
    return null
  }

  const noDataReason = getNoDataReason()

  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1) + '億'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(1) + '萬'
    }
    return num.toLocaleString('zh-TW')
  }

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : ''
    return (
      <span className={change >= 0 ? 'positive' : 'negative'}>
        {sign}{change.toFixed(1)} ({sign}{changePercent.toFixed(1)}%)
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
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={23} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
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
                  <td>{item.stockName}</td>
                  <td>{item.date}</td>
                  <td className="price close">{item.closePrice.toFixed(1)}</td>
                  <td className="price">{item.avgPrice.toFixed(1)}</td>
                  <td className="price">{item.prevClose.toFixed(1)}</td>
                  <td className="price">{item.openPrice.toFixed(1)}</td>
                  <td className="price high">{item.highPrice.toFixed(1)}</td>
                  <td className="price low">{item.lowPrice.toFixed(1)}</td>
                  <td className="change">{formatChange(item.change, item.changePercent)}</td>
                  <td className="volume">{formatNumber(item.totalVolume)}</td>
                  <td className="volume">{formatNumber(item.prevVolume)}</td>
                  <td 
                    className="volume editable"
                    onClick={() => handleCellClick(item.id, 'innerVolume')}
                    title="點擊編輯"
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'innerVolume' ? (
                      <input
                        type="number"
                        defaultValue={item.innerVolume}
                        onBlur={(e) => handleCellBlur(item.id, item.stockCode, item.date, 'innerVolume', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '2px',
                          border: '1px solid var(--primary-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          textAlign: 'right'
                        }}
                      />
                    ) : (
                      formatNumber(item.innerVolume)
                    )}
                  </td>
                  <td 
                    className="volume editable"
                    onClick={() => handleCellClick(item.id, 'outerVolume')}
                    title="點擊編輯"
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'outerVolume' ? (
                      <input
                        type="number"
                        defaultValue={item.outerVolume}
                        onBlur={(e) => handleCellBlur(item.id, item.stockCode, item.date, 'outerVolume', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '2px',
                          border: '1px solid var(--primary-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          textAlign: 'right'
                        }}
                      />
                    ) : (
                      formatNumber(item.outerVolume)
                    )}
                  </td>
                  <td 
                    className="volume investor editable"
                    onClick={() => handleCellClick(item.id, 'foreignInvestor')}
                    title="點擊編輯"
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'foreignInvestor' ? (
                      <input
                        type="number"
                        defaultValue={item.foreignInvestor}
                        onBlur={(e) => handleCellBlur(item.id, item.stockCode, item.date, 'foreignInvestor', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '2px',
                          border: '1px solid var(--primary-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          textAlign: 'right'
                        }}
                      />
                    ) : (
                      formatNumber(item.foreignInvestor)
                    )}
                  </td>
                  <td 
                    className="volume investor editable"
                    onClick={() => handleCellClick(item.id, 'investmentTrust')}
                    title="點擊編輯"
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'investmentTrust' ? (
                      <input
                        type="number"
                        defaultValue={item.investmentTrust}
                        onBlur={(e) => handleCellBlur(item.id, item.stockCode, item.date, 'investmentTrust', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '2px',
                          border: '1px solid var(--primary-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          textAlign: 'right'
                        }}
                      />
                    ) : (
                      formatNumber(item.investmentTrust)
                    )}
                  </td>
                  <td 
                    className="volume investor editable"
                    onClick={() => handleCellClick(item.id, 'dealer')}
                    title="點擊編輯"
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'dealer' ? (
                      <input
                        type="number"
                        defaultValue={item.dealer}
                        onBlur={(e) => handleCellBlur(item.id, item.stockCode, item.date, 'dealer', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '2px',
                          border: '1px solid var(--primary-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          textAlign: 'right'
                        }}
                      />
                    ) : (
                      formatNumber(item.dealer)
                    )}
                  </td>
                  <td 
                    className="volume chips editable"
                    onClick={() => handleCellClick(item.id, 'chips')}
                    title="點擊編輯"
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'chips' ? (
                      <input
                        type="number"
                        defaultValue={item.chips}
                        onBlur={(e) => handleCellBlur(item.id, item.stockCode, item.date, 'chips', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '2px',
                          border: '1px solid var(--primary-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          textAlign: 'right'
                        }}
                      />
                    ) : (
                      formatNumber(item.chips)
                    )}
                  </td>
                  <td 
                    className="volume buy editable"
                    onClick={() => handleCellClick(item.id, 'mainBuy')}
                    title="點擊編輯"
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'mainBuy' ? (
                      <input
                        type="number"
                        defaultValue={item.mainBuy}
                        onBlur={(e) => handleCellBlur(item.id, item.stockCode, item.date, 'mainBuy', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '2px',
                          border: '1px solid var(--primary-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          textAlign: 'right'
                        }}
                      />
                    ) : (
                      formatNumber(item.mainBuy)
                    )}
                  </td>
                  <td 
                    className="volume sell editable"
                    onClick={() => handleCellClick(item.id, 'mainSell')}
                    title="點擊編輯"
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'mainSell' ? (
                      <input
                        type="number"
                        defaultValue={item.mainSell}
                        onBlur={(e) => handleCellBlur(item.id, item.stockCode, item.date, 'mainSell', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '2px',
                          border: '1px solid var(--primary-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          textAlign: 'right'
                        }}
                      />
                    ) : (
                      formatNumber(item.mainSell)
                    )}
                  </td>
                  <td className="price high">{item.monthHigh.toFixed(1)}</td>
                  <td className="price low">{item.monthLow.toFixed(1)}</td>
                  <td className="price high">{item.quarterHigh.toFixed(1)}</td>
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

export default DailyTradeTable
