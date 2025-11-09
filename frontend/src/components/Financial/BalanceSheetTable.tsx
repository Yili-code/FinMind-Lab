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

  return (
    <div className="financial-table-container">
      <h3>Table 5: 資產負債表</h3>
      <div className="table-wrapper">
        <table className="financial-table">
          <thead>
            <tr>
              <th>股票代號</th>
              <th>期間</th>
              <th>流動資產</th>
              <th>非流動資產</th>
              <th>資產總計</th>
              <th>流動負債</th>
              <th>非流動負債</th>
              <th>負債總計</th>
              <th>股東權益</th>
              <th>負債及股東權益總計</th>
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
                  <td className="amount">{formatNumber(item.currentAssets)}</td>
                  <td className="amount">{formatNumber(item.nonCurrentAssets)}</td>
                  <td className="amount total">{formatNumber(item.totalAssets)}</td>
                  <td className="amount">{formatNumber(item.currentLiabilities)}</td>
                  <td className="amount">{formatNumber(item.nonCurrentLiabilities)}</td>
                  <td className="amount">{formatNumber(item.totalLiabilities)}</td>
                  <td className="amount positive">{formatNumber(item.shareholdersEquity)}</td>
                  <td className="amount total">{formatNumber(item.totalLiabilitiesAndEquity)}</td>
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

