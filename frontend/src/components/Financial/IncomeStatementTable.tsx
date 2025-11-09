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

  const formatPercent = (num: number) => {
    return num.toFixed(2) + '%'
  }

  return (
    <div className="financial-table-container">
      <h3>Table 4: 股票財務分析 - 損益表</h3>
      <div className="table-wrapper">
        <table className="financial-table">
          <thead>
            <tr>
              <th>代號</th>
              <th>年/季</th>
              <th>營業收入</th>
              <th>營業毛利</th>
              <th>比重</th>
              <th>營業費用</th>
              <th>比重</th>
              <th>營業利益</th>
              <th>比重</th>
              <th>稅後淨利</th>
              <th>其他損益</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={11} className="empty-message">
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
                  <td className="amount positive">{formatNumber(item.grossProfit)}</td>
                  <td className="ratio">{formatPercent(item.grossProfitRatio)}</td>
                  <td className="amount">{formatNumber(item.operatingExpenses)}</td>
                  <td className="ratio">{formatPercent(item.operatingExpensesRatio)}</td>
                  <td className="amount positive">{formatNumber(item.operatingIncome)}</td>
                  <td className="ratio">{formatPercent(item.operatingIncomeRatio)}</td>
                  <td className="amount positive">{formatNumber(item.netIncome)}</td>
                  <td className="amount">{formatNumber(item.otherIncome)}</td>
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
