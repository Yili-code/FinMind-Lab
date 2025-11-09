import type { BalanceSheetItem } from '../../types/financial'
import './FinancialTable.css'

interface BalanceSheetTableProps {
  data: BalanceSheetItem[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
}

function BalanceSheetTable({ data, selectedStockCode, onRowClick }: BalanceSheetTableProps) {
  const filteredData = selectedStockCode
    ? data.filter(item => item.stockCode === selectedStockCode)
    : data

  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '億'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '萬'
    }
    return num.toLocaleString('zh-TW')
  }

  const formatPercent = (num: number) => {
    return num.toFixed(2) + '%'
  }

  return (
    <div className="financial-table-container">
      <h3>Table 5: 股票財務分析 - 資產負債表</h3>
      <div className="table-wrapper">
        <table className="financial-table">
          <thead>
            <tr>
              <th>代號</th>
              <th>年/季</th>
              <th>總資產</th>
              <th>比重</th>
              <th>股東權益</th>
              <th>比重</th>
              <th>流動資產</th>
              <th>比重</th>
              <th>流動負債</th>
              <th>比重</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-message">
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
