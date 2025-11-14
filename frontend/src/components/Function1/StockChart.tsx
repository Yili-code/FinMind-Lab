import { useState, useMemo } from 'react'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Customized } from 'recharts'
import './StockChart.css'
import type { TradeDetail } from '../../types/stock'

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

// 時間單位選項
export type TimeUnit = '5m' | '15m' | '30m' | '1h' | '1d' | '5d' | '15d' | '1mo'

interface TimeUnitOption {
  value: TimeUnit
  label: string
  period: string // yfinance period 參數
}

const TIME_UNIT_OPTIONS: TimeUnitOption[] = [
  { value: '5m', label: '5分鐘', period: '5d' },      // 100個5分鐘 = 500分鐘 ≈ 3.5天
  { value: '15m', label: '15分鐘', period: '15d' },   // 100個15分鐘 = 1500分鐘 ≈ 10.4天
  { value: '30m', label: '30分鐘', period: '30d' },    // 100個30分鐘 = 3000分鐘 ≈ 20.8天
  { value: '1h', label: '1小時', period: '5d' },        // 100個1小時 = 100小時 ≈ 4.2天
  { value: '1d', label: '1天', period: '100d' },       // 100天
  { value: '5d', label: '5天', period: '500d' },       // 500天
  { value: '15d', label: '15天', period: '1500d' },    // 1500天
  { value: '1mo', label: '1個月', period: '100mo' },   // 100個月
]

interface StockChartProps {
  marketIndexData?: MarketIndexData[]
  stockData?: TradeDetail[] // 股票數據
  selectedStockCode?: string // 選中的股票代號
  onTimeUnitChange?: (timeUnit: TimeUnit, period: string) => void // 時間單位改變回調
}

interface ChartDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  成交量: number
  isUp: boolean
}

interface CustomizedComponentProps {
  xAxis?: {
    scale: (value: string) => number | undefined
  }
  yAxis?: {
    scale: (value: number) => number | undefined
  }
  data?: ChartDataPoint[]
  width?: number
}

function StockChart({ 
  marketIndexData = [], 
  stockData = [],
  selectedStockCode,
  onTimeUnitChange 
}: StockChartProps) {
  const [selectedTimeUnit, setSelectedTimeUnit] = useState<TimeUnit>('1d')
  
  // 當時間單位改變時，通知父組件
  const handleTimeUnitChange = (timeUnit: TimeUnit) => {
    setSelectedTimeUnit(timeUnit)
    const option = TIME_UNIT_OPTIONS.find(opt => opt.value === timeUnit)
    if (option && onTimeUnitChange) {
      onTimeUnitChange(timeUnit, option.period)
    }
  }
  
  // 根據是否有股票數據來決定顯示哪種數據
  const hasStockData = stockData.length > 0 && selectedStockCode
  
  // 優化：使用 useMemo 緩存格式化數據
  const formatChartData = useMemo(() => {
    if (hasStockData) {
      // 格式化股票數據
      return stockData
        .filter(item => !selectedStockCode || item.stockCode === selectedStockCode)
        .slice(0, 100) // 只取前100個數據點
        .map((item) => {
          // 根據時間單位格式化日期時間標籤
          let dateLabel = item.date
          if (item.time) {
            try {
              const dateTime = new Date(`${item.date} ${item.time}`)
              if (!isNaN(dateTime.getTime())) {
                if (selectedTimeUnit === '5m' || selectedTimeUnit === '15m' || selectedTimeUnit === '30m' || selectedTimeUnit === '1h') {
                  // 短時間單位顯示日期和時間
                  const month = (dateTime.getMonth() + 1).toString().padStart(2, '0')
                  const day = dateTime.getDate().toString().padStart(2, '0')
                  const hours = dateTime.getHours().toString().padStart(2, '0')
                  const minutes = dateTime.getMinutes().toString().padStart(2, '0')
                  dateLabel = `${month}/${day} ${hours}:${minutes}`
                } else {
                  // 長時間單位只顯示日期
                  const month = (dateTime.getMonth() + 1).toString().padStart(2, '0')
                  const day = dateTime.getDate().toString().padStart(2, '0')
                  dateLabel = `${month}/${day}`
                }
              }
            } catch (e) {
              dateLabel = item.date
            }
          } else {
            try {
              const dateObj = new Date(item.date)
              if (!isNaN(dateObj.getTime())) {
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
                const day = dateObj.getDate().toString().padStart(2, '0')
                dateLabel = `${month}/${day}`
              }
            } catch (e) {
              dateLabel = item.date
            }
          }
          
          return {
            date: dateLabel,
            open: item.openPrice || 0,
            high: item.highPrice || 0,
            low: item.lowPrice || 0,
            close: item.price || 0, // 使用成交價作為收盤價
            成交量: item.totalVolume || item.estimatedVolume || 0,
            isUp: (item.price || 0) >= (item.openPrice || 0),
          }
        })
    } else {
      // 格式化大盤指數數據
      return marketIndexData.map((item) => {
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
    }
  }, [hasStockData, stockData, marketIndexData, selectedStockCode, selectedTimeUnit])
  
  // 優化：使用 useMemo 緩存 Y 軸範圍計算
  const { yAxisMin, yAxisMax, hasData } = useMemo(() => {
    const allPrices = formatChartData.flatMap(d => [d.high, d.low]).filter(p => p > 0)
    if (allPrices.length === 0) {
      return { yAxisMin: 0, yAxisMax: 0, hasData: false }
    }
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    const priceRange = maxPrice - minPrice
    return {
      yAxisMin: Math.floor((minPrice - priceRange * 0.05) / 100) * 100,
      yAxisMax: Math.ceil((maxPrice + priceRange * 0.05) / 100) * 100,
      hasData: true
    }
  }, [formatChartData])

  if (!hasData || formatChartData.length === 0) {
    return (
      <div className="stock-chart-container">
        <h3>{hasStockData ? '股票走勢圖（K線）' : '大盤走勢圖（日K線）'}</h3>
        <div className="chart-loading">
          {formatChartData.length === 0 ? (hasStockData ? '載入股票數據中...' : '載入大盤數據中...') : '無數據可顯示'}
        </div>
      </div>
    )
  }

  return (
    <div className="stock-chart-container">
      <div className="chart-header">
        <h3>{hasStockData ? `股票走勢圖（${selectedStockCode}）` : '大盤走勢圖（日K線）'}</h3>
        <div className="time-unit-selector">
          <label htmlFor="time-unit-select" style={{ marginRight: '0.5rem', color: 'var(--text-primary)' }}>
            時間單位：
          </label>
          <select
            id="time-unit-select"
            value={selectedTimeUnit}
            onChange={(e) => handleTimeUnitChange(e.target.value as TimeUnit)}
            className="time-unit-select"
          >
            {TIME_UNIT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {(marketIndexData.length > 0 || hasStockData) && (
        <div className="chart-filter-info">
          顯示: {hasStockData 
            ? `${selectedStockCode} (${formatChartData.length} 個數據點)` 
            : `${marketIndexData[0]?.indexName || '加權指數'} (${formatChartData.length} 天)`}
        </div>
      )}
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart 
          data={formatChartData} 
          margin={{ top: 30, right: 50, left: 20, bottom: 30 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(77, 208, 225, 0.15)" 
            horizontal={true}
            vertical={true}
            opacity={0.5}
          />
          <XAxis 
            dataKey="date" 
            stroke="#E0E8FF"
            tick={{ fill: '#E0E8FF', fontSize: 12 }}
            height={40}
            axisLine={{ stroke: 'rgba(77, 208, 225, 0.3)' }}
            tickLine={{ stroke: 'rgba(77, 208, 225, 0.3)' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#E0E8FF"
            tick={{ fill: '#E0E8FF', fontSize: 12 }}
            domain={[yAxisMin, yAxisMax]}
            tickFormatter={(value) => value.toFixed(1)}
            width={80}
            axisLine={{ stroke: 'rgba(77, 208, 225, 0.3)' }}
            tickLine={{ stroke: 'rgba(77, 208, 225, 0.3)' }}
            label={{ value: '指數', angle: -90, position: 'insideLeft', fill: '#E0E8FF' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#E0E8FF"
            tick={{ fill: '#E0E8FF', fontSize: 12 }}
            width={60}
            axisLine={{ stroke: 'rgba(77, 208, 225, 0.3)' }}
            tickLine={{ stroke: 'rgba(77, 208, 225, 0.3)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(10, 15, 36, 0.95)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(77, 208, 225, 0.3)',
              borderRadius: '6px',
              color: '#E0E8FF',
              padding: '10px 14px',
              boxShadow: '0 0 15px rgba(77, 208, 225, 0.2)'
            }}
            formatter={(value: number, name: string) => {
              if (name === '開盤' || name === '最高' || name === '最低' || name === '收盤') {
                return [value.toFixed(1), name]
              }
              if (name === '成交量') {
                return [(value / 100000000).toFixed(1) + '億', '成交量']
              }
              return [value, name]
            }}
            labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload
                return (
                  <div style={{
                    backgroundColor: 'rgba(10, 15, 36, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(77, 208, 225, 0.3)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    boxShadow: '0 0 15px rgba(77, 208, 225, 0.2)'
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: '8px', color: '#E0E8FF' }}>{data.date}</p>
                    <p style={{ color: data.isUp ? '#FF3366' : '#00FF88', margin: '4px 0' }}>
                      開盤: {data.open.toFixed(1)}
                    </p>
                    <p style={{ color: '#E0E8FF', margin: '4px 0' }}>
                      最高: {data.high.toFixed(1)}
                    </p>
                    <p style={{ color: '#E0E8FF', margin: '4px 0' }}>
                      最低: {data.low.toFixed(1)}
                    </p>
                    <p style={{ color: data.isUp ? '#FF3366' : '#00FF88', margin: '4px 0' }}>
                      收盤: {data.close.toFixed(1)}
                    </p>
                    <p style={{ color: 'rgba(224, 232, 255, 0.8)', margin: '4px 0', marginTop: '8px' }}>
                      成交量: {(data.成交量 / 100000000).toFixed(1)}億
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend 
            wrapperStyle={{ 
              color: '#E0E8FF', 
              paddingTop: '15px',
              fontSize: '13px'
            }}
          />
          {/* 自定義K線繪製 */}
          <Customized 
            component={(props: any) => {
              const { xAxis, yAxis, data, width } = props as CustomizedComponentProps
              if (!xAxis || !yAxis || !data || !width) return null
              
              const barWidth = (width / data.length) * 0.6
              
              return (
                <g>
                  {data.map((entry: ChartDataPoint, index: number) => {
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

