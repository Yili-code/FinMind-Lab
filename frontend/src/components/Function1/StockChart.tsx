import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './StockChart.css'

interface MarketIndexData {
  date: string
  indexName: string
  closePrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  change: number
  changePercent: number
  volume: number
}

interface StockChartProps {
  marketIndexData?: MarketIndexData[]
}

function StockChart({ marketIndexData = [] }: StockChartProps) {
  const formatChartData = marketIndexData.map(item => ({
    date: item.date,
    開盤: item.openPrice,
    最高: item.highPrice,
    最低: item.lowPrice,
    收盤: item.closePrice,
    成交量: item.volume / 100000000, // 轉換為億
  }))

  if (formatChartData.length === 0) {
    return (
      <div className="stock-chart-container">
        <h3>大盤走勢圖</h3>
        <div className="chart-loading">載入大盤數據中...</div>
      </div>
    )
  }

  return (
    <div className="stock-chart-container">
      <h3>大盤走勢圖</h3>
      {marketIndexData.length > 0 && (
        <div className="chart-filter-info">
          顯示: {marketIndexData[0]?.indexName || '加權指數'} ({formatChartData.length} 天)
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formatChartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)' }}
            label={{ value: '指數', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)'
            }}
          />
          <Legend 
            wrapperStyle={{ color: 'var(--text-secondary)' }}
          />
          <Line 
            type="monotone" 
            dataKey="開盤" 
            stroke="var(--info)" 
            strokeWidth={2}
            dot={{ r: 3 }}
            name="開盤"
          />
          <Line 
            type="monotone" 
            dataKey="最高" 
            stroke="var(--error)" 
            strokeWidth={2}
            dot={{ r: 3 }}
            name="最高"
          />
          <Line 
            type="monotone" 
            dataKey="最低" 
            stroke="var(--success)" 
            strokeWidth={2}
            dot={{ r: 3 }}
            name="最低"
          />
          <Line 
            type="monotone" 
            dataKey="收盤" 
            stroke="var(--warning)" 
            strokeWidth={2}
            dot={{ r: 3 }}
            name="收盤"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StockChart

