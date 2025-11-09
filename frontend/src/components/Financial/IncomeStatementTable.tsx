import type { IncomeStatementItem } from '../../types/financial'
import './FinancialTable.css'

interface IncomeStatementTableProps {
  data: IncomeStatementItem[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
}

function IncomeStatementTable({ data, selectedStockCode, onRowClick }: IncomeStatementTableProps) {
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
      <h3>Table 4: 損益表</h3>
      <div className="table-wrapper">
        <table className="financial-table">
          <thead>
            <tr>
              <th>股票代號</th>
              <th>期間</th>
              <th>營業收入</th>
              <th>營業成本</th>
              <th>營業毛利</th>
              <th>營業費用</th>
              <th>營業利益</th>
              <th>稅前淨利</th>
              <th>本期淨利</th>
              <th>每股盈餘</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-message">
                  {selectedStockCode ? `無 ${selectedStockCode} 的損益表資料` : '尚無資料'}
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
                  <td className="amount">{formatNumber(item.revenue)}</td>
                  <td className="amount">{formatNumber(item.costOfGoodsSold)}</td>
                  <td className="amount positive">{formatNumber(item.grossProfit)}</td>
                  <td className="amount">{formatNumber(item.operatingExpenses)}</td>
                  <td className="amount positive">{formatNumber(item.operatingIncome)}</td>
                  <td className="amount positive">{formatNumber(item.incomeBeforeTax)}</td>
                  <td className="amount positive">{formatNumber(item.netIncome)}</td>
                  <td className="eps">{item.eps.toFixed(2)}</td>
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

export default IncomeStatementTable

