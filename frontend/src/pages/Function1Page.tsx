import { useState, useEffect, useCallback, useMemo } from 'react'
import TradeDetailTable from '../components/Function1/TradeDetailTable'
import DailyTradeTable from '../components/Function1/DailyTradeTable'
import StockChartMatplotlib from '../components/Function1/StockChartMatplotlib'
import type { TimeUnit } from '../components/Function1/StockChart'
import { useStock } from '../contexts/StockContext'
import { getIntradayData, getDailyTradeData, testBackendConnection } from '../services/stockApi'
import type { TradeDetail, DailyTrade } from '../types/stock'
import './Function1Page.css'

function Function1Page() {
  const { selectedStockCode, setSelectedStockCode } = useStock()
  const [tradeDetails, setTradeDetails] = useState<TradeDetail[]>([])
  const [dailyTrades, setDailyTrades] = useState<DailyTrade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stockCodeInput, setStockCodeInput] = useState('2330,2317')
  
  // 獲取今天的日期（YYYY-MM-DD 格式）
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate())
  const [days, setDays] = useState<number>(5)
  const [chartTimeUnit, setChartTimeUnit] = useState<TimeUnit>('1d')

  // 根據時間單位獲取對應的 interval 和 period
  const getIntervalAndPeriod = (timeUnit: TimeUnit) => {
    const timeUnitMap: Record<TimeUnit, { interval: string; period: string }> = {
      '5m': { interval: '5m', period: '5d' },
      '15m': { interval: '15m', period: '15d' },
      '30m': { interval: '30m', period: '30d' },
      '1h': { interval: '1h', period: '5d' },
      '1d': { interval: '1d', period: '100d' },
      '5d': { interval: '5d', period: '500d' },
      '15d': { interval: '15d', period: '1500d' },
      '1mo': { interval: '1mo', period: '100mo' },
    }
    return timeUnitMap[timeUnit]
  }

  // 載入股票數據 - 優化：並行請求
  const loadStockData = useCallback(async (stockCodes: string[], timeUnit?: TimeUnit) => {
    setLoading(true)
    setError(null)
    
    // 先測試後端連接
    const isConnected = await testBackendConnection()
    if (!isConnected) {
      setError('無法連接到 FinMind Lab 後端服務器。\n\n請確認：\n1. 端口 8000 是否被其他專案占用\n2. 後端服務是否正在運行\n\n啟動後端的方法：\n• Windows: 在 backend 目錄執行 start_server.bat\n• Linux/Mac: 在 backend 目錄執行 ./start_server.sh\n• 手動啟動: cd backend && python -m uvicorn main:app --reload --port 8000\n\n如果端口 8000 被占用，請先關閉占用該端口的程序。')
      setLoading(false)
      setTradeDetails([])
      setDailyTrades([])
      return
    }
    
    try {
      // 使用傳入的 timeUnit 或默認使用 chartTimeUnit
      const currentTimeUnit = timeUnit || chartTimeUnit
      // 根據時間單位決定使用哪種數據獲取方式
      const { interval, period } = getIntervalAndPeriod(currentTimeUnit)
      // 使用盤中數據的時間單位（包括 1mo，因為 yfinance 支持月間隔）
      const useIntraday = ['5m', '15m', '30m', '1h', '1mo'].includes(currentTimeUnit)
      
      // 優化：並行請求所有股票的數據
      const stockDataPromises = stockCodes.map(async (code) => {
        try {
          let intradayResponse, dailyResponse
          
          if (useIntraday) {
            // 短時間單位和月單位使用盤中數據
            intradayResponse = await getIntradayData(code, period, interval)
            // 同時獲取日交易數據用於表格顯示（月單位除外）
            if (currentTimeUnit !== '1mo') {
              dailyResponse = await getDailyTradeData(code, days)
            } else {
              // 對於月單位，不需要日交易數據
              dailyResponse = { stockCode: code, data: [], count: 0 }
            }
          } else {
            // 長時間單位（1d, 5d, 15d）使用日交易數據
            const daysCount = currentTimeUnit === '1d' ? 100 : currentTimeUnit === '5d' ? 500 : currentTimeUnit === '15d' ? 1500 : 100
            dailyResponse = await getDailyTradeData(code, daysCount)
            // 為了保持數據結構一致，也獲取盤中數據（但可能為空）
            intradayResponse = await getIntradayData(code, period, interval).catch(() => ({ stockCode: code, data: [], count: 0 }))
          }

          const intradayData = intradayResponse.data.map((item, index) => ({
            id: `${code}_intraday_${index}`,
            stockCode: item.stockCode,
            stockName: code,
            date: item.date,
            time: item.time,
            price: item.price,
            change: item.change,
            changePercent: item.changePercent,
            lots: item.lots,
            period: item.period,
            openPrice: item.openPrice,
            highPrice: item.highPrice,
            lowPrice: item.lowPrice,
            totalVolume: item.totalVolume,
            estimatedVolume: item.estimatedVolume,
          }))

          const dailyData = dailyResponse.data.map((item, index) => ({
            id: `${code}_daily_${index}`,
            stockCode: item.stockCode,
            stockName: item.stockName,
            date: item.date,
            closePrice: item.closePrice,
            avgPrice: item.avgPrice,
            prevClose: item.prevClose,
            openPrice: item.openPrice,
            highPrice: item.highPrice,
            lowPrice: item.lowPrice,
            change: item.change,
            changePercent: item.changePercent,
            totalVolume: item.totalVolume,
            prevVolume: item.prevVolume,
            innerVolume: item.innerVolume,
            outerVolume: item.outerVolume,
            foreignInvestor: item.foreignInvestor,
            investmentTrust: item.investmentTrust,
            dealer: item.dealer,
            chips: item.chips,
            mainBuy: item.mainBuy,
            mainSell: item.mainSell,
            monthHigh: item.monthHigh,
            monthLow: item.monthLow,
            quarterHigh: item.quarterHigh,
          }))

          return { intradayData, dailyData }
        } catch (err) {
          // 靜默處理錯誤，返回空數據
          return { intradayData: [], dailyData: [] }
        }
      })

      // 等待所有請求完成
      const results = await Promise.all(stockDataPromises)
      
      // 根據時間單位決定使用哪種數據
      if (useIntraday) {
        // 短時間單位：使用盤中數據
        const allTradeDetails = results.flatMap(r => r.intradayData)
        const allDailyTrades = results.flatMap(r => r.dailyData)
        setTradeDetails(allTradeDetails)
        setDailyTrades(allDailyTrades)
      } else {
        // 長時間單位：將日交易數據轉換為 TradeDetail 格式供圖表使用
        const allDailyTrades = results.flatMap(r => r.dailyData)
        const allTradeDetails = allDailyTrades.map((item, index) => ({
          id: `${item.stockCode}_chart_${index}`,
          stockCode: item.stockCode,
          stockName: item.stockName,
          date: item.date,
          time: '', // 日交易數據沒有時間
          price: item.closePrice, // 使用收盤價作為價格
          change: item.change,
          changePercent: item.changePercent,
          lots: 0,
          period: '',
          openPrice: item.openPrice,
          highPrice: item.highPrice,
          lowPrice: item.lowPrice,
          totalVolume: item.totalVolume,
          estimatedVolume: item.totalVolume,
        }))
        setTradeDetails(allTradeDetails)
        setDailyTrades(allDailyTrades)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '載入數據時發生錯誤')
      setTradeDetails([])
      setDailyTrades([])
    } finally {
      setLoading(false)
    }
  }, [days, chartTimeUnit])

  // 優化：使用 useMemo 計算股票代號列表
  const stockCodes = useMemo(() => {
    return stockCodeInput.split(',').map(c => c.trim()).filter(c => c)
  }, [stockCodeInput])

  // 處理時間單位改變
  const handleTimeUnitChange = useCallback((timeUnit: TimeUnit) => {
    setChartTimeUnit(timeUnit)
    // 重新載入數據
    if (stockCodes.length > 0) {
      loadStockData(stockCodes, timeUnit)
    }
  }, [stockCodes, loadStockData])

  // 初始載入
  useEffect(() => {
    if (stockCodes.length > 0) {
      loadStockData(stockCodes, chartTimeUnit)
    }
    // 只在組件掛載時執行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 當天數改變時重新載入數據（但保持當前時間單位）
  useEffect(() => {
    if (stockCodes.length > 0) {
      loadStockData(stockCodes, chartTimeUnit)
    }
  }, [days, loadStockData, stockCodes, chartTimeUnit])

  // 優化：使用 useCallback 避免不必要的重新渲染
  const handleTable1Click = useCallback((stockCode: string) => {
    setSelectedStockCode(selectedStockCode === stockCode ? undefined : stockCode)
  }, [selectedStockCode, setSelectedStockCode])

  const handleTable2Click = useCallback((stockCode: string) => {
    setSelectedStockCode(selectedStockCode === stockCode ? undefined : stockCode)
  }, [selectedStockCode, setSelectedStockCode])

  const handleClearFilter = useCallback(() => {
    setSelectedStockCode(undefined)
  }, [setSelectedStockCode])

  const handleLoadData = useCallback(() => {
    if (stockCodes.length === 0) {
      setError('請輸入至少一個股票代號')
      return
    }
    loadStockData(stockCodes)
  }, [stockCodes, loadStockData])

  return (
    <div className="function1-page">
      <div className="function1-container">
        <div className="function1-header">
          <h1>Data Integration</h1>
          <p className="function1-description">
            資料整合與分析平台 - 提供股票成交明細與日交易檔的整合查詢與視覺化分析
          </p>
        </div>

        <div className="function1-controls">
          <div className="data-source-control">
            <div className="stock-code-input">
              <label htmlFor="stock-code-input" style={{ marginRight: '0.5rem', color: 'var(--text-primary)' }}>
                股票代號：
              </label>
              <input
                id="stock-code-input"
                type="text"
                value={stockCodeInput}
                onChange={(e) => setStockCodeInput(e.target.value)}
                placeholder="輸入股票代號，用逗號分隔 (例如: 2330,2317)"
                style={{ padding: '0.5rem', minWidth: '300px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLoadData()
                  }
                }}
              />
              <button
                onClick={handleLoadData}
                style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}
              >
                載入數據
              </button>
            </div>
          </div>
          <div className="date-filter-control">
            <label htmlFor="days-input" style={{ marginRight: '0.5rem', color: 'var(--text-primary)' }}>
              天數設定：
            </label>
            <input
              id="days-input"
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 5
                setDays(Math.max(1, Math.min(30, value)))
              }}
              style={{
                padding: '0.5rem',
                width: '80px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
            <label htmlFor="date-filter" style={{ marginLeft: '1rem', marginRight: '0.5rem', color: 'var(--text-primary)' }}>
              選擇日期：
            </label>
            <input
              id="date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                style={{
                  padding: '0.5rem 1rem',
                  marginLeft: '0.5rem',
                  background: 'rgba(255, 51, 102, 0.2)',
                  color: 'var(--error)',
                  border: '1px solid var(--error)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                清除日期
              </button>
            )}
          </div>
          {selectedStockCode && (
            <div className="filter-control">
              <span className="filter-label">已篩選股票:</span>
              <span className="filter-value">{selectedStockCode}</span>
              <button className="clear-filter-btn" onClick={handleClearFilter}>
                清除篩選
              </button>
            </div>
          )}
          {loading && (
            <div className="loading-indicator">
              <span>載入中...</span>
            </div>
          )}
          {error && (
            <div className="error-message">
              <strong>錯誤：</strong>
              {error.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
        </div>

        <div className="function1-content">
          <div className="visualization-section">
            <StockChartMatplotlib 
              selectedStockCode={selectedStockCode}
              onTimeUnitChange={handleTimeUnitChange}
            />
          </div>

          <div className="tables-section">
            <TradeDetailTable
              data={tradeDetails}
              selectedStockCode={selectedStockCode}
              selectedDate={selectedDate}
              onRowClick={handleTable1Click}
            />

            <DailyTradeTable
              data={dailyTrades}
              selectedStockCode={selectedStockCode}
              selectedDate={selectedDate}
              onRowClick={handleTable2Click}
              onDataUpdate={useCallback((updatedData: DailyTrade[]) => {
                setDailyTrades(updatedData)
              }, [])}
            />
          </div>
        </div>

        <div className="function1-info">
          <div className="info-card">
            <h4>Data Source & Scraper</h4>
            <p>使用 yfinance 即時數據</p>
            <p className="info-note">
              數據來源：Yahoo Finance (yfinance) - 即時股價資訊與大盤指數數據
            </p>
          </div>
          <div className="info-card">
            <h4>Data Cleaner & Analyzer</h4>
            <p>資料已進行基本清理與格式化</p>
            <p className="info-note">未來將加入進階分析功能</p>
          </div>
          <div className="info-card">
            <h4>表格連動功能</h4>
            <p>點擊 Table 1 或 Table 2 的任一列，可篩選兩個表格的資料</p>
            <p className="info-note">圖表也會同步更新顯示選中的股票</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Function1Page
