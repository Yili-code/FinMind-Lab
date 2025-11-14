import { useState, useEffect } from 'react'
import { generateStockChart, type ChartResponse } from '../../services/stockApi'
import type { TimeUnit } from './StockChart'
import './StockChart.css'

interface TimeUnitOption {
  value: TimeUnit
  label: string
  period: string
}

const TIME_UNIT_OPTIONS: TimeUnitOption[] = [
  { value: '5m', label: '5分鐘', period: '5d' },
  { value: '15m', label: '15分鐘', period: '15d' },
  { value: '30m', label: '30分鐘', period: '30d' },
  { value: '1h', label: '1小時', period: '5d' },
  { value: '1d', label: '1天', period: '100d' },
  { value: '5d', label: '5天', period: '500d' },
  { value: '15d', label: '15天', period: '1500d' },
  { value: '1mo', label: '1個月', period: '100mo' },
]

interface StockChartMatplotlibProps {
  selectedStockCode?: string
  onTimeUnitChange?: (timeUnit: TimeUnit) => void
}

function StockChartMatplotlib({ 
  selectedStockCode,
  onTimeUnitChange 
}: StockChartMatplotlibProps) {
  const [selectedTimeUnit, setSelectedTimeUnit] = useState<TimeUnit>('1d')
  const [chartImage, setChartImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartInfo, setChartInfo] = useState<ChartResponse | null>(null)

  // 根據時間單位獲取對應的 period 和 interval
  const getChartParams = (timeUnit: TimeUnit) => {
    const option = TIME_UNIT_OPTIONS.find(opt => opt.value === timeUnit)
    if (!option) {
      return { period: '1d', interval: '1d', days: 100 }
    }

    const intervalMap: Record<TimeUnit, string> = {
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '1d': '1d',
      '5d': '5d',
      '15d': '15d',
      '1mo': '1mo',
    }

    const daysMap: Record<TimeUnit, number> = {
      '5m': 5,
      '15m': 15,
      '30m': 30,
      '1h': 5,
      '1d': 100,
      '5d': 500,
      '15d': 1500,
      '1mo': 100,
    }

    return {
      period: option.period,
      interval: intervalMap[timeUnit],
      days: daysMap[timeUnit],
    }
  }

  // 載入圖表
  const loadChart = async (stockCode: string, timeUnit: TimeUnit) => {
    if (!stockCode) {
      setChartImage(null)
      setChartInfo(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { period, interval, days } = getChartParams(timeUnit)
      const response = await generateStockChart(stockCode, period, interval, days)
      setChartImage(response.image)
      setChartInfo(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入圖表時發生錯誤')
      setChartImage(null)
      setChartInfo(null)
    } finally {
      setLoading(false)
    }
  }

  // 當股票代號或時間單位改變時，重新載入圖表
  useEffect(() => {
    if (selectedStockCode) {
      loadChart(selectedStockCode, selectedTimeUnit)
    } else {
      setChartImage(null)
      setChartInfo(null)
    }
  }, [selectedStockCode, selectedTimeUnit])

  // 處理時間單位改變
  const handleTimeUnitChange = (timeUnit: TimeUnit) => {
    setSelectedTimeUnit(timeUnit)
    if (onTimeUnitChange) {
      onTimeUnitChange(timeUnit)
    }
    if (selectedStockCode) {
      loadChart(selectedStockCode, timeUnit)
    }
  }

  if (!selectedStockCode) {
    return (
      <div className="stock-chart-container">
        <h3>股票走勢圖（K線）</h3>
        <div className="chart-loading">
          請選擇股票以顯示圖表
        </div>
      </div>
    )
  }

  return (
    <div className="stock-chart-container">
      <div className="chart-header">
        <h3>
          {chartInfo 
            ? `股票走勢圖（${chartInfo.stockCode} - ${chartInfo.stockName}）`
            : `股票走勢圖（${selectedStockCode}）`}
        </h3>
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
      
      {chartInfo && (
        <div className="chart-filter-info">
          顯示: {chartInfo.stockCode} ({chartInfo.dataCount} 個數據點)
        </div>
      )}

      {loading && (
        <div className="chart-loading">
          載入圖表中...
        </div>
      )}

      {error && (
        <div className="error-message">
          <strong>錯誤：</strong>
          {error}
        </div>
      )}

      {chartImage && !loading && (
        <div className="chart-image-container">
          <img 
            src={chartImage} 
            alt={`${selectedStockCode} K線圖`}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '600px',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default StockChartMatplotlib

