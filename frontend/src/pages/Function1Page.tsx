import { useState, useEffect, useCallback, useMemo } from 'react'
import TradeDetailTable from '../components/Function1/TradeDetailTable'
import DailyTradeTable from '../components/Function1/DailyTradeTable'
import StockChart from '../components/Function1/StockChart'
import { useStock } from '../contexts/StockContext'
import { getIntradayData, getDailyTradeData, getMarketIndexData, testBackendConnection, type MarketIndexResponse } from '../services/stockApi'
import type { TradeDetail, DailyTrade } from '../types/stock'
import './Function1Page.css'

function Function1Page() {
  const { selectedStockCode, setSelectedStockCode } = useStock()
  const [tradeDetails, setTradeDetails] = useState<TradeDetail[]>([])
  const [dailyTrades, setDailyTrades] = useState<DailyTrade[]>([])
  const [marketIndexData, setMarketIndexData] = useState<MarketIndexResponse['data']>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stockCodeInput, setStockCodeInput] = useState('2330,2317')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [days, setDays] = useState<number>(5)

  // 載入股票數據 - 優化：並行請求
  const loadStockData = useCallback(async (stockCodes: string[]) => {
    setLoading(true)
    setError(null)
    
    // 先測試後端連接
    const isConnected = await testBackendConnection()
    if (!isConnected) {
      setError('無法連接到後端服務器。請確認：\n1. 後端服務是否正在運行 (http://localhost:8000)\n2. 運行命令: cd backend && python -m uvicorn main:app --reload --port 8000')
      setLoading(false)
      setTradeDetails([])
      setDailyTrades([])
      setMarketIndexData([])
      return
    }
    
    try {
      // 優化：並行請求所有股票的數據
      const stockDataPromises = stockCodes.map(async (code) => {
        try {
          // 並行獲取盤中數據和日交易數據
          const [intradayResponse, dailyResponse] = await Promise.all([
            getIntradayData(code, '1d', '5m'),
            getDailyTradeData(code, days)
          ])

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
          console.error(`Error loading data for ${code}:`, err)
          return { intradayData: [], dailyData: [] }
        }
      })

      // 等待所有請求完成
      const results = await Promise.all(stockDataPromises)
      const allTradeDetails = results.flatMap(r => r.intradayData)
      const allDailyTrades = results.flatMap(r => r.dailyData)

      setTradeDetails(allTradeDetails)
      setDailyTrades(allDailyTrades)

      // 並行載入大盤指數數據
      try {
        const marketResponse = await getMarketIndexData('^TWII', 5)
        setMarketIndexData(marketResponse.data)
      } catch (err) {
        console.error('Error loading market index data:', err)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入數據時發生錯誤')
      console.error('Error loading stock data:', err)
      setTradeDetails([])
      setDailyTrades([])
      setMarketIndexData([])
    } finally {
      setLoading(false)
    }
  }, [days])

  // 優化：使用 useMemo 計算股票代號列表
  const stockCodes = useMemo(() => {
    return stockCodeInput.split(',').map(c => c.trim()).filter(c => c)
  }, [stockCodeInput])

  // 初始載入
  useEffect(() => {
    if (stockCodes.length > 0) {
      loadStockData(stockCodes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 當天數改變時重新載入數據
  useEffect(() => {
    if (stockCodes.length > 0) {
      loadStockData(stockCodes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, loadStockData, stockCodes])

  // 優化：使用 useCallback 避免不必要的重新渲染
  const handleTable1Click = useCallback((stockCode: string) => {
    setSelectedStockCode(prev => prev === stockCode ? undefined : stockCode)
  }, [setSelectedStockCode])

  const handleTable2Click = useCallback((stockCode: string) => {
    setSelectedStockCode(prev => prev === stockCode ? undefined : stockCode)
  }, [setSelectedStockCode])

  const handleClearFilter = useCallback(() => {
    setSelectedStockCode(undefined)
  }, [setSelectedStockCode])

  const handleLoadData = useCallback(() => {
    if (stockCodes.length > 0) {
      loadStockData(stockCodes)
    }
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
            <div className="error-message" style={{ color: 'var(--error)', padding: '0.5rem' }}>
              {error}
            </div>
          )}
        </div>

        <div className="function1-content">
          <div className="visualization-section">
            <StockChart 
              marketIndexData={marketIndexData}
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
