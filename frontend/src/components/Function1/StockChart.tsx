import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Customized } from 'recharts'
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
  // 格式化數據：準備K線圖數據
  const formatChartData = marketIndexData.map((item) => {
    // 提取日期（例如：2025-11-10 -> 11/10）
    let dateLabel = item.date
    try {
      const dateObj = new Date(item.date)
      if (!isNaN(dateObj.getTime())) {
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
        const day = dateObj.getDate().toString().padStart(2, '0')
        dateLabel = `${month}/${day}`
      }
    } catch (e) {
      // 如果日期解析失敗，使用原始日期
      dateLabel = item.date
    }
    
    return {
      date: dateLabel,
      open: item.openPrice || 0,
      high: item.highPrice || 0,
      low: item.lowPrice || 0,
      close: item.closePrice || 0,
      成交量: item.volume || 0,
      isUp: (item.closePrice || 0) >= (item.openPrice || 0),
    }
  })
  
  // 計算 Y 軸範圍（用於K線圖）
  const allPrices = formatChartData.flatMap(d => [d.high, d.low]).filter(p => p > 0)
  if (allPrices.length === 0) {
    return (
      <div className="stock-chart-container">
        <h3>大盤走勢圖（日K線）</h3>
        <div className="chart-loading">無大盤數據可顯示</div>
      </div>
    )
  }
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const priceRange = maxPrice - minPrice
  const yAxisMin = Math.floor((minPrice - priceRange * 0.05) / 100) * 100
  const yAxisMax = Math.ceil((maxPrice + priceRange * 0.05) / 100) * 100

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
      <h3>大盤走勢圖（日K線）</h3>
      {marketIndexData.length > 0 && (
        <div className="chart-filter-info">
          顯示: {marketIndexData[0]?.indexName || '加權指數'} ({formatChartData.length} 天)
        </div>
      )}
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart 
          data={formatChartData} 
          margin={{ top: 30, right: 50, left: 20, bottom: 30 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#d0d0d0" 
            horizontal={true}
            vertical={true}
            opacity={0.5}
          />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            height={40}
            axisLine={{ stroke: '#999' }}
            tickLine={{ stroke: '#999' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            domain={[yAxisMin, yAxisMax]}
            tickFormatter={(value) => value.toFixed(2)}
            width={80}
            axisLine={{ stroke: '#999' }}
            tickLine={{ stroke: '#999' }}
            label={{ value: '指數', angle: -90, position: 'insideLeft', fill: '#666' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            width={60}
            axisLine={{ stroke: '#999' }}
            tickLine={{ stroke: '#999' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.98)', 
              border: '1px solid #ccc',
              borderRadius: '6px',
              color: '#333',
              padding: '10px 14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            formatter={(value: number, name: string) => {
              if (name === '開盤' || name === '最高' || name === '最低' || name === '收盤') {
                return [value.toFixed(2), name]
              }
              if (name === '成交量') {
                return [(value / 100000000).toFixed(2) + '億', '成交量']
              }
              return [value, name]
            }}
            labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload
                return (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: '8px' }}>{data.date}</p>
                    <p style={{ color: data.isUp ? '#ef4444' : '#22c55e', margin: '4px 0' }}>
                      開盤: {data.open.toFixed(2)}
                    </p>
                    <p style={{ color: '#333', margin: '4px 0' }}>
                      最高: {data.high.toFixed(2)}
                    </p>
                    <p style={{ color: '#333', margin: '4px 0' }}>
                      最低: {data.low.toFixed(2)}
                    </p>
                    <p style={{ color: data.isUp ? '#ef4444' : '#22c55e', margin: '4px 0' }}>
                      收盤: {data.close.toFixed(2)}
                    </p>
                    <p style={{ color: '#666', margin: '4px 0', marginTop: '8px' }}>
                      成交量: {(data.成交量 / 100000000).toFixed(2)}億
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend 
            wrapperStyle={{ 
              color: '#666', 
              paddingTop: '15px',
              fontSize: '13px'
            }}
          />
          {/* 自定義K線繪製 */}
          <Customized 
            component={(props: any) => {
              const { xAxis, yAxis, data, width } = props
              if (!xAxis || !yAxis || !data) return null
              
              const barWidth = (width / data.length) * 0.6
              
              return (
                <g>
                  {data.map((entry: any, index: number) => {
                    const x = xAxis.scale(entry.date) || 0
                    const openY = yAxis.scale(entry.open) || 0
                    const closeY = yAxis.scale(entry.close) || 0
                    const highY = yAxis.scale(entry.high) || 0
                    const lowY = yAxis.scale(entry.low) || 0
                    
                    const isUp = entry.close >= entry.open
                    const bodyTop = Math.min(openY, closeY)
                    const bodyBottom = Math.max(openY, closeY)
                    const bodyHeight = Math.abs(bodyBottom - bodyTop) || 1
                    const centerX = x - barWidth / 2
                    
                    const candleColor = isUp ? '#ef4444' : '#22c55e'
                    const candleStroke = isUp ? '#dc2626' : '#16a34a'
                    
                    return (
                      <g key={`candle-${index}`}>
                        {/* 影線（最高到最低） */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={candleColor}
                          strokeWidth={1.5}
                        />
                        {/* 實體（開盤到收盤） */}
                        <rect
                          x={centerX}
                          y={bodyTop}
                          width={barWidth}
                          height={bodyHeight}
                          fill={candleColor}
                          stroke={candleStroke}
                          strokeWidth={0.5}
                        />
                      </g>
                    )
                  })}
                </g>
              )
            }}
          />
          {/* 成交量柱狀圖 */}
          <Bar 
            yAxisId="right"
            dataKey="成交量" 
            name="成交量"
            opacity={0.6}
            radius={[2, 2, 0, 0]}
          >
            {formatChartData.map((entry, index) => (
              <Cell 
                key={`volume-cell-${index}`} 
                fill={entry.isUp ? '#ff6b6b' : '#51cf66'} 
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StockChart

