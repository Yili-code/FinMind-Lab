import { useState } from 'react'
import type { StockBasic } from '../../types/stock'
import type { StockGroup, StockGroupMapping } from '../../services/stockGroupApi'
import './StockBasicTable.css'

interface StockBasicTableProps {
  data: StockBasic[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
  onEdit?: (stock: StockBasic) => void
  onDelete?: (stockCode: string) => void
  stockGroups?: StockGroupMapping[]
  allGroups?: StockGroup[]
  onAddToGroup?: (stockCode: string, groupId: string) => void
  onRemoveFromGroup?: (stockCode: string, groupId: string) => void
}

function StockBasicTable({
  data,
  selectedStockCode,
  onRowClick,
  onEdit,
  onDelete,
  stockGroups = [],
  allGroups = [],
  onAddToGroup,
  onRemoveFromGroup
}: StockBasicTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockBasic; direction: 'asc' | 'desc' } | null>(null)
  const [showGroupMenu, setShowGroupMenu] = useState<string | null>(null)

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
      return (num / 100000000).toFixed(1) + '億'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(1) + '萬'
    }
    return num.toLocaleString('zh-TW')
  }

  const formatPercent = (num: number) => {
    return num.toFixed(1) + '%'
  }

  const getStockGroups = (stockCode: string): string[] => {
    const mapping = stockGroups.find(m => m.stockCode === stockCode)
    return mapping?.groupNames || []
  }

  const handleAddToGroup = (stockCode: string, groupId: string) => {
    onAddToGroup?.(stockCode, groupId)
    setShowGroupMenu(null)
  }

  const handleRemoveFromGroup = (stockCode: string, groupId: string) => {
    onRemoveFromGroup?.(stockCode, groupId)
    setShowGroupMenu(null)
  }

  return (
    <div className="stock-basic-table-container">
      <h3>股票基本檔</h3>
      <div className="table-wrapper">
        <table className="stock-basic-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('stockCode')}>
                代號 {sortConfig?.key === 'stockCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('stockName')}>
                名稱 {sortConfig?.key === 'stockName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('category')}>
                分類 {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('establishedDate')}>
                成立 {sortConfig?.key === 'establishedDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('listedDate')}>
                掛牌 {sortConfig?.key === 'listedDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('industry')}>
                產業 {sortConfig?.key === 'industry' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('capital')}>
                股本 {sortConfig?.key === 'capital' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('issuedShares')}>
                發行 {sortConfig?.key === 'issuedShares' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('marketValue')}>
                市值 {sortConfig?.key === 'marketValue' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('directors')}>
                董監 {sortConfig?.key === 'directors' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('market')}>
                市櫃 {sortConfig?.key === 'market' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('group')}>
                群組 {sortConfig?.key === 'group' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('employees')}>
                人數 {sortConfig?.key === 'employees' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('dividend')}>
                股利 {sortConfig?.key === 'dividend' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('yield')}>
                殖利 {sortConfig?.key === 'yield' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('dividendPerShare')}>
                股息 {sortConfig?.key === 'dividendPerShare' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('closingPrice')}>
                收價 {sortConfig?.key === 'closingPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('exDividendDate')}>
                填息 {sortConfig?.key === 'exDividendDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('peRatio')}>
                本益 {sortConfig?.key === 'peRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('equityRatio')}>
                股權 {sortConfig?.key === 'equityRatio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('industryChange')}>
                同業漲跌 {sortConfig?.key === 'industryChange' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('industryEPS')}>
                同業EPS {sortConfig?.key === 'industryEPS' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('industryYield')}>
                同業殖利 {sortConfig?.key === 'industryYield' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={24} className="empty-message">
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
                  <td>{item.category || '-'}</td>
                  <td>{item.establishedDate || '-'}</td>
                  <td>{item.listedDate || '-'}</td>
                  <td>{item.industry || '-'}</td>
                  <td className="capital">{formatNumber(item.capital || 0)}</td>
                  <td className="volume">{formatNumber(item.issuedShares || 0)}</td>
                  <td className="volume">{formatNumber(item.marketValue || 0)}</td>
                  <td>{item.directors || '-'}</td>
                  <td>{item.market || '-'}</td>
                  <td className="group-cell">
                    <div className="group-tags">
                      {getStockGroups(item.stockCode).length > 0 ? (
                        getStockGroups(item.stockCode).map((groupName, idx) => {
                          const group = allGroups.find(g => g.groupName === groupName)
                          return (
                            <span key={idx} className="group-tag">
                              {groupName}
                              {onRemoveFromGroup && group && (
                                <button
                                  className="remove-group-btn"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveFromGroup(item.stockCode, group.id)
                                  }}
                                  title="移除群組"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          )
                        })
                      ) : (
                        <span className="no-group">-</span>
                      )}
                    </div>
                  </td>
                  <td className="volume">{item.employees ? formatNumber(item.employees) : '-'}</td>
                  <td className="price">{item.dividend ? item.dividend.toFixed(1) : '-'}</td>
                  <td className="yield">{item.yield ? formatPercent(item.yield) : '-'}</td>
                  <td className="price">{item.dividendPerShare ? item.dividendPerShare.toFixed(1) : '-'}</td>
                  <td className="price">{item.closingPrice ? item.closingPrice.toFixed(1) : '-'}</td>
                  <td>{item.exDividendDate || '-'}</td>
                  <td className="pe">{item.peRatio ? item.peRatio.toFixed(1) : '-'}</td>
                  <td className="yield">{item.equityRatio ? formatPercent(item.equityRatio) : '-'}</td>
                  <td className={item.industryChange && item.industryChange >= 0 ? 'positive' : 'negative'}>
                    {item.industryChange ? (item.industryChange >= 0 ? '+' : '') + item.industryChange.toFixed(1) : '-'}
                  </td>
                  <td className="eps">{item.industryEPS ? item.industryEPS.toFixed(1) : '-'}</td>
                  <td className="yield">{item.industryYield ? formatPercent(item.industryYield) : '-'}</td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      {onEdit && (
                        <button 
                          className="edit-btn" 
                          onClick={() => onEdit(item)}
                          title="編輯"
                        >
                          編輯
                        </button>
                      )}
                      {onAddToGroup && allGroups.length > 0 && (
                        <div className="group-menu-container">
                          <button
                            className="group-btn"
                            onClick={() => setShowGroupMenu(showGroupMenu === item.stockCode ? null : item.stockCode)}
                            title="管理群組"
                          >
                            群組
                          </button>
                          {showGroupMenu === item.stockCode && (
                            <div className="group-menu">
                              <div className="group-menu-header">選擇群組</div>
                              {allGroups.map(group => {
                                const isInGroup = getStockGroups(item.stockCode).includes(group.groupName)
                                return (
                                  <div key={group.id} className="group-menu-item">
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={isInGroup}
                                        onChange={() => {
                                          if (isInGroup) {
                                            handleRemoveFromGroup(item.stockCode, group.id)
                                          } else {
                                            handleAddToGroup(item.stockCode, group.id)
                                          }
                                        }}
                                      />
                                      <span>{group.groupName}</span>
                                      {group.description && (
                                        <span className="group-menu-desc">{group.description}</span>
                                      )}
                                    </label>
                                  </div>
                                )
                              })}
                              {allGroups.length === 0 && (
                                <div className="group-menu-empty">尚無群組，請先創建群組</div>
                              )}
                            </div>
                          )}
                        </div>
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
                    </div>
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
