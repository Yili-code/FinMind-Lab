import { useState, useEffect } from 'react'
import TradeDetailTable from '../components/Function1/TradeDetailTable'
import DailyTradeTable from '../components/Function1/DailyTradeTable'
import StockChart from '../components/Function1/StockChart'
import { useStock } from '../contexts/StockContext'
import { mockTradeDetails, mockDailyTrades } from '../data/mockData'
import { getIntradayData, getDailyTradeData } from '../services/stockApi'
import type { TradeDetail, DailyTrade } from '../types/stock'
import './Function1Page.css'

function Function1Page() {
  const { selectedStockCode, setSelectedStockCode } = useStock()
  const [tradeDetails, setTradeDetails] = useState<TradeDetail[]>([])
  const [dailyTrades, setDailyTrades] = useState<DailyTrade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useRealData, setUseRealData] = useState(true)
  const [stockCodeInput, setStockCodeInput] = useState('2330,2317')

  // 載入股票數據
  const loadStockData = async (stockCodes: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const allTradeDetails: TradeDetail[] = []
      const allDailyTrades: DailyTrade[] = []

      for (const code of stockCodes) {
        try {
          // 獲取盤中數據
          const intradayResponse = await getIntradayData(code, '1d', '5m')
          const intradayData = intradayResponse.data.map((item, index) => ({
            id: `${code}_intraday_${index}`,
            stockCode: item.stockCode,
            stockName: code, // yfinance 可能沒有中文名稱
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
          allTradeDetails.push(...intradayData)

          // 獲取日交易數據
          const dailyResponse = await getDailyTradeData(code, 5)
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
          allDailyTrades.push(...dailyData)
        } catch (err) {
          console.error(`Error loading data for ${code}:`, err)
          // 繼續處理其他股票
        }
      }

      setTradeDetails(allTradeDetails)
      setDailyTrades(allDailyTrades)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入數據時發生錯誤')
      console.error('Error loading stock data:', err)
      // 如果 API 失敗，使用 mock 數據
      setTradeDetails(mockTradeDetails)
      setDailyTrades(mockDailyTrades)
    } finally {
      setLoading(false)
    }
  }

  // 初始載入
  useEffect(() => {
    if (useRealData) {
      const codes = stockCodeInput.split(',').map(c => c.trim()).filter(c => c)
      if (codes.length > 0) {
        loadStockData(codes)
      }
    } else {
      setTradeDetails(mockTradeDetails)
      setDailyTrades(mockDailyTrades)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useRealData])

  const handleTable1Click = (stockCode: string) => {
    setSelectedStockCode(selectedStockCode === stockCode ? undefined : stockCode)
  }

  const handleTable2Click = (stockCode: string) => {
    setSelectedStockCode(selectedStockCode === stockCode ? undefined : stockCode)
  }

  const handleClearFilter = () => {
    setSelectedStockCode(undefined)
  }

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
            <label>
              <input
                type="checkbox"
                checked={useRealData}
                onChange={(e) => setUseRealData(e.target.checked)}
              />
              使用即時數據 (yfinance)
            </label>
            {useRealData && (
              <div className="stock-code-input">
                <input
                  type="text"
                  value={stockCodeInput}
                  onChange={(e) => setStockCodeInput(e.target.value)}
                  placeholder="輸入股票代號，用逗號分隔 (例如: 2330,2317)"
                  style={{ padding: '0.5rem', marginLeft: '1rem', minWidth: '300px' }}
                />
                <button
                  onClick={() => {
                    const codes = stockCodeInput.split(',').map(c => c.trim()).filter(c => c)
                    if (codes.length > 0) {
                      loadStockData(codes)
                    }
                  }}
                  style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}
                >
                  重新載入
                </button>
              </div>
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
              data={dailyTrades} 
              selectedStockCode={selectedStockCode}
            />
          </div>

          <div className="tables-section">
            <TradeDetailTable
              data={tradeDetails}
              selectedStockCode={selectedStockCode}
              onRowClick={handleTable1Click}
            />

            <DailyTradeTable
              data={dailyTrades}
              selectedStockCode={selectedStockCode}
              onRowClick={handleTable2Click}
            />
          </div>
        </div>

        <div className="function1-info">
          <div className="info-card">
            <h4>Data Source & Scraper</h4>
            <p>{useRealData ? '使用 yfinance 即時數據' : '使用模擬資料 (Mock Data)'}</p>
            <p className="info-note">
              {useRealData 
                ? '數據來源：Yahoo Finance (yfinance) - 即時股價資訊'
                : '可切換到即時數據模式以獲取最新股價'}
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
