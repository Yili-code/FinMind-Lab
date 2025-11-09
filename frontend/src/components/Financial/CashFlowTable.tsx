import type { CashFlowItem } from '../../types/financial'
import './FinancialTable.css'

interface CashFlowTableProps {
  data: CashFlowItem[]
  selectedStockCode?: string
  onRowClick?: (stockCode: string) => void
}

function CashFlowTable({ data, selectedStockCode, onRowClick }: CashFlowTableProps) {
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

  const formatCashFlow = (num: number) => {
    const formatted = formatNumber(Math.abs(num))
    return num >= 0 ? `+${formatted}` : `-${formatted}`
  }

  return (
    <div className="financial-table-container">
      <h3>Table 6: 現金流量表</h3>
      <div className="table-wrapper">
        <table className="financial-table">
          <thead>
            <tr>
              <th>股票代號</th>
              <th>期間</th>
              <th>營業活動現金流量</th>
              <th>投資活動現金流量</th>
              <th>籌資活動現金流量</th>
              <th>本期現金增加(減少)</th>
              <th>期初現金餘額</th>
              <th>期末現金餘額</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-message">
                  {selectedStockCode ? `無 ${selectedStockCode} 的現金流量表資料` : '尚無資料'}
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
                  <td className={`amount ${item.operatingCashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCashFlow(item.operatingCashFlow)}
                  </td>
                  <td className={`amount ${item.investingCashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCashFlow(item.investingCashFlow)}
                  </td>
                  <td className={`amount ${item.financingCashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCashFlow(item.financingCashFlow)}
                  </td>
                  <td className={`amount ${item.netCashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCashFlow(item.netCashFlow)}
                  </td>
                  <td className="amount">{formatNumber(item.beginningCash)}</td>
                  <td className="amount total">{formatNumber(item.endingCash)}</td>
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

export default CashFlowTable

