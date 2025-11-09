import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { DailyTrade } from '../../types/stock'
import './StockChart.css'

interface StockChartProps {
  data: DailyTrade[]
  selectedStockCode?: string
}

function StockChart({ data, selectedStockCode }: StockChartProps) {
  const chartData = selectedStockCode
    ? data.filter(item => item.stockCode === selectedStockCode)
    : data

  const formatChartData = chartData.map(item => ({
    name: item.stockName,
    date: item.date,
    開盤: item.openPrice,
    最高: item.highPrice,
    最低: item.lowPrice,
    收盤: item.closePrice,
    成交量: item.volume / 10000, // 轉換為萬股
  }))

  return (
    <div className="stock-chart-container">
      <h3>價格走勢圖</h3>
      {selectedStockCode && (
        <div className="chart-filter-info">
          顯示: {chartData[0]?.stockName} ({selectedStockCode})
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formatChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="name" 
            stroke="#888"
            tick={{ fill: '#888' }}
          />
          <YAxis 
            stroke="#888"
            tick={{ fill: '#888' }}
            label={{ value: '價格', angle: -90, position: 'insideLeft', fill: '#888' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#fff'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#888' }}
          />
          <Line 
            type="monotone" 
            dataKey="開盤" 
            stroke="#2196f3" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="最高" 
            stroke="#f44336" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="最低" 
            stroke="#4caf50" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="收盤" 
            stroke="#ff9800" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StockChart

