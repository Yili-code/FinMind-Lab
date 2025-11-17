import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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

  // 使用 ref 追蹤載入狀態，避免競態條件
  const isLoadingRef = useRef(false)

  // 載入股票數據 - 優化：並行請求
  const loadStockData = useCallback(async (stockCodes: string[], timeUnit?: TimeUnit, daysParam?: number) => {
    // 如果正在載入，不執行新的請求
    if (isLoadingRef.current) {
      console.log('正在載入中，跳過此次請求')
      return
    }
    
    console.log('開始載入股票數據:', stockCodes, '時間單位:', timeUnit || chartTimeUnit, '天數:', daysParam || days)
    isLoadingRef.current = true
    setLoading(true)
    setError(null)
    
    // 先測試後端連接
    console.log('測試後端連接...')
    const isConnected = await testBackendConnection()
    console.log('後端連接狀態:', isConnected)
    if (!isConnected) {
      setError('無法連接到 InfoHub 後端服務器。\n\n請確認：\n1. 端口 8000 是否被其他專案占用\n2. 後端服務是否正在運行 (http://127.0.0.1:8000)\n\n啟動後端的方法：\n• Windows: 在 backend 目錄執行 start_server.bat\n• Linux/Mac: 在 backend 目錄執行 ./start_server.sh\n• 手動啟動: cd backend && python -m uvicorn main:app --reload --port 8000\n\n如果端口 8000 被占用，請先關閉占用該端口的程序。')
      isLoadingRef.current = false
      setLoading(false)
      setTradeDetails([])
      setDailyTrades([])
      return
    }
    
    try {
      // 使用傳入的 timeUnit 或默認使用 chartTimeUnit
      const currentTimeUnit = timeUnit || chartTimeUnit
      // 使用傳入的 daysParam 或默認使用 days
      const currentDays = daysParam !== undefined ? daysParam : days
      // 根據時間單位決定使用哪種數據獲取方式
      const { interval, period } = getIntervalAndPeriod(currentTimeUnit)
      // 使用盤中數據的時間單位（包括 1mo，因為 yfinance 支持月間隔）
      const useIntraday = ['5m', '15m', '30m', '1h', '1mo'].includes(currentTimeUnit)
      
      // 優化：並行請求所有股票的數據
      const stockDataPromises = stockCodes.map(async (code) => {
        const errors: string[] = []
        
        try {
          let intradayResponse, dailyResponse
          
          if (useIntraday) {
            // 短時間單位和月單位使用盤中數據
            try {
              console.log(`正在獲取股票 ${code} 的盤中數據... (period=${period}, interval=${interval})`)
              intradayResponse = await getIntradayData(code, period, interval)
              console.log(`股票 ${code} 盤中數據獲取成功，數據量:`, intradayResponse.count)
              if (intradayResponse.count === 0) {
                const warning = `股票 ${code} 的盤中數據為空（可能是非交易時間或數據不可用）`
                console.warn(warning)
                errors.push(warning)
              }
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : `獲取股票 ${code} 的盤中數據失敗: ${String(err)}`
              errors.push(errorMsg)
              console.error(`股票 ${code} 盤中數據獲取失敗:`, err)
              if (err instanceof Error) {
                console.error(`錯誤堆棧:`, err.stack)
              }
              intradayResponse = { stockCode: code, data: [], count: 0 }
            }
            
            // 同時獲取日交易數據用於表格顯示（月單位除外）
            if (currentTimeUnit !== '1mo') {
              try {
                console.log(`正在獲取股票 ${code} 的日交易數據... (days=${currentDays})`)
                dailyResponse = await getDailyTradeData(code, currentDays)
                console.log(`股票 ${code} 日交易數據獲取成功，數據量:`, dailyResponse.count)
                
                // 檢查是否有後端返回的警告信息
                if (dailyResponse.warning) {
                  console.warn(`後端警告 (股票 ${code}):`, dailyResponse.warning)
                  errors.push(dailyResponse.warning)
                }
                
                if (dailyResponse.count === 0) {
                  const warning = dailyResponse.warning || `股票 ${code} 的日交易數據為空。可能原因：\n1. yfinance 無法獲取該股票數據（股票代號可能不正確）\n2. 非交易時間（週末或假日）\n3. 後端服務無法連接到 yfinance\n4. 股票可能已下市或暫停交易\n\n建議：\n• 確認股票代號是否正確（例如：2330 代表台積電）\n• 檢查後端日誌查看詳細錯誤\n• 嘗試其他股票代號（例如：2317, 2454）`
                  console.warn(warning)
                  if (!dailyResponse.warning) {
                    errors.push(warning)
                  }
                }
              } catch (err) {
                const errorMsg = err instanceof Error ? err.message : `獲取股票 ${code} 的日交易數據失敗: ${String(err)}`
                errors.push(errorMsg)
                console.error(`股票 ${code} 日交易數據獲取失敗:`, err)
                if (err instanceof Error) {
                  console.error(`錯誤堆棧:`, err.stack)
                }
                dailyResponse = { stockCode: code, data: [], count: 0 }
              }
            } else {
              // 對於月單位，不需要日交易數據
              dailyResponse = { stockCode: code, data: [], count: 0 }
            }
          } else {
            // 長時間單位（1d, 5d, 15d）使用日交易數據
            const daysCount = currentTimeUnit === '1d' ? 100 : currentTimeUnit === '5d' ? 500 : currentTimeUnit === '15d' ? 1500 : 100
            try {
              console.log(`正在獲取股票 ${code} 的日交易數據（${daysCount} 天）...`)
              dailyResponse = await getDailyTradeData(code, daysCount)
              console.log(`股票 ${code} 日交易數據獲取成功，數據量:`, dailyResponse.count)
              
              // 檢查是否有後端返回的警告信息
              if (dailyResponse.warning) {
                console.warn(`後端警告 (股票 ${code}):`, dailyResponse.warning)
                errors.push(dailyResponse.warning)
              }
              
              if (dailyResponse.count === 0) {
                const warning = dailyResponse.warning || `股票 ${code} 的日交易數據為空。可能原因：\n1. yfinance 無法獲取該股票數據（股票代號可能不正確）\n2. 非交易時間（週末或假日）\n3. 後端服務無法連接到 yfinance\n4. 股票可能已下市或暫停交易\n\n建議：\n• 確認股票代號是否正確（例如：2330 代表台積電）\n• 檢查後端日誌查看詳細錯誤\n• 嘗試其他股票代號（例如：2317, 2454）`
                console.warn(warning)
                if (!dailyResponse.warning) {
                  errors.push(warning)
                }
              }
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : `獲取股票 ${code} 的日交易數據失敗: ${String(err)}`
              errors.push(errorMsg)
              console.error(`股票 ${code} 日交易數據獲取失敗:`, err)
              if (err instanceof Error) {
                console.error(`錯誤堆棧:`, err.stack)
              }
              dailyResponse = { stockCode: code, data: [], count: 0 }
            }
            
            // 為了保持數據結構一致，也獲取盤中數據（但可能為空）
            try {
              intradayResponse = await getIntradayData(code, period, interval)
            } catch (err) {
              // 盤中數據失敗不影響整體流程
              intradayResponse = { stockCode: code, data: [], count: 0 }
            }
          }

          const intradayData = (intradayResponse?.data || []).map((item, index) => ({
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

          const dailyData = (dailyResponse?.data || []).map((item, index) => ({
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

          return { 
            intradayData, 
            dailyData, 
            errors,
            stockCode: code,
            hasData: intradayData.length > 0 || dailyData.length > 0
          }
        } catch (err) {
          // 捕獲未預期的錯誤
          const errorMsg = err instanceof Error ? err.message : `處理股票 ${code} 時發生未知錯誤`
          errors.push(errorMsg)
          console.error(`股票 ${code} 處理失敗:`, err)
          return { 
            intradayData: [], 
            dailyData: [], 
            errors,
            stockCode: code,
            hasData: false
          }
        }
      })

      // 等待所有請求完成
      const results = await Promise.all(stockDataPromises)
      
      // 收集所有錯誤信息
      const allErrors: string[] = []
      const failedStocks: string[] = []
      
      results.forEach(result => {
        if (!result.hasData) {
          failedStocks.push(result.stockCode)
        }
        if (result.errors.length > 0) {
          allErrors.push(...result.errors)
        }
      })
      
      // 檢查是否所有請求都失敗
      const allFailed = results.every(r => !r.hasData)
      
      if (allFailed && stockCodes.length > 0) {
        // 構建詳細的錯誤訊息
        let errorMessage = `無法獲取股票 ${stockCodes.join(', ')} 的數據。\n\n`
        
        // 顯示具體錯誤信息
        if (allErrors.length > 0) {
          errorMessage += `錯誤詳情：\n${allErrors.slice(0, 10).map((err, idx) => `${idx + 1}. ${err}`).join('\n')}`
          if (allErrors.length > 10) {
            errorMessage += `\n... 還有 ${allErrors.length - 10} 個錯誤（請查看控制台）`
          }
        } else {
          // 沒有具體錯誤信息，可能是請求沒有發送或後端沒有響應
          errorMessage += `診斷信息：\n`
          errorMessage += `• 沒有捕獲到具體錯誤信息，這通常表示：\n`
          errorMessage += `  - 後端服務可能未運行\n`
          errorMessage += `  - 網絡請求被阻止或超時\n`
          errorMessage += `  - API 端點無法訪問\n\n`
          errorMessage += `請檢查：\n`
          errorMessage += `1. 後端服務是否正在運行？\n`
          errorMessage += `   在瀏覽器訪問: http://127.0.0.1:8000/api/hello\n`
          errorMessage += `   應該看到: {"message": "Successfully connected to the backend!!!"}\n\n`
          errorMessage += `2. 測試股票 API：\n`
          errorMessage += `   訪問: http://127.0.0.1:8000/api/stock/daily/2330?days=5\n`
          errorMessage += `   應該返回 JSON 格式的股票數據\n\n`
          errorMessage += `3. 查看瀏覽器控制台（F12）的 Network 標籤頁\n`
          errorMessage += `   檢查 API 請求是否發送成功\n`
          errorMessage += `   查看請求的狀態碼和響應內容`
        }
        
        errorMessage += `\n\n快速排查步驟：\n`
        errorMessage += `1. 確認後端服務運行：在終端執行 "cd backend && python -m uvicorn main:app --reload --port 8000"\n`
        errorMessage += `2. 檢查端口 8000 是否被占用：netstat -ano | findstr :8000 (Windows) 或 lsof -i :8000 (Mac/Linux)\n`
        errorMessage += `3. 查看瀏覽器控制台（F12）的 Console 和 Network 標籤頁獲取詳細錯誤信息`
        
        console.error('所有股票數據獲取失敗')
        console.error('失敗的股票:', failedStocks)
        console.error('所有錯誤:', allErrors)
        console.error('結果詳情:', results.map(r => ({
          stockCode: r.stockCode,
          hasData: r.hasData,
          intradayCount: r.intradayData.length,
          dailyCount: r.dailyData.length,
          errors: r.errors
        })))
        
        throw new Error(errorMessage)
      } else if (failedStocks.length > 0) {
        // 部分股票失敗，顯示警告但不拋出錯誤
        console.warn(`以下股票無法獲取數據: ${failedStocks.join(', ')}`)
        if (allErrors.length > 0) {
          console.warn('錯誤詳情:', allErrors)
        }
      }
      
      // 根據時間單位決定使用哪種數據
      if (useIntraday) {
        // 短時間單位：使用盤中數據
        const allTradeDetails = results.flatMap(r => r.intradayData)
        const allDailyTrades = results.flatMap(r => r.dailyData)
        setTradeDetails(allTradeDetails)
        setDailyTrades(allDailyTrades)
        console.log(`數據載入完成 - 盤中數據: ${allTradeDetails.length} 筆, 日交易數據: ${allDailyTrades.length} 筆`)
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
        console.log(`數據載入完成 - 日交易數據: ${allDailyTrades.length} 筆`)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '載入數據時發生錯誤')
      setTradeDetails([])
      setDailyTrades([])
    } finally {
      isLoadingRef.current = false
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
      loadStockData(stockCodes, timeUnit, days)
    }
  }, [stockCodes, loadStockData, days])

  // 使用 ref 追蹤是否已執行初始載入
  const initialLoadRef = useRef(false)

  // 初始載入 - 只在組件掛載時執行一次
  useEffect(() => {
    if (initialLoadRef.current) return
    if (stockCodes.length > 0) {
      initialLoadRef.current = true
      loadStockData(stockCodes, chartTimeUnit, days)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 當天數改變時重新載入數據（但保持當前時間單位）
  useEffect(() => {
    // 跳過初始載入（由上面的 useEffect 處理）
    if (!initialLoadRef.current) return
    
    if (stockCodes.length > 0) {
      loadStockData(stockCodes, chartTimeUnit, days)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  // 當時間單位改變時重新載入數據
  useEffect(() => {
    // 跳過初始載入（由上面的 useEffect 處理）
    if (!initialLoadRef.current) return
    
    if (stockCodes.length > 0) {
      loadStockData(stockCodes, chartTimeUnit, days)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartTimeUnit])

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

  const handleLoadData = useCallback(async () => {
    // 如果正在載入，不執行
    if (loading) {
      console.log('正在載入中，跳過此次請求')
      return
    }
    
    // 驗證股票代號
    if (stockCodes.length === 0) {
      setError('請輸入至少一個股票代號')
      return
    }
    
    // 清除之前的錯誤
    setError(null)
    
    // 調用異步載入函數
    try {
      await loadStockData(stockCodes, chartTimeUnit, days)
    } catch (err) {
      // 捕獲同步和異步錯誤
      const errorMessage = err instanceof Error ? err.message : '載入數據時發生未知錯誤'
      setError(errorMessage)
      console.error('載入數據時發生錯誤:', err)
    }
  }, [stockCodes, loadStockData, loading, chartTimeUnit, days])

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
                type="button"
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('載入數據按鈕被點擊，股票代號:', stockCodes)
                  await handleLoadData()
                }}
                disabled={loading}
                style={{ 
                  color: 'white',
                  background: loading ? 'var(--text-secondary)' : 'var(--primary-color)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 1rem', 
                  marginLeft: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? '載入中...' : '載入數據'}
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
