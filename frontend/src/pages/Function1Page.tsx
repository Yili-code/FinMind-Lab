import { useState } from 'react'
import TradeDetailTable from '../components/Function1/TradeDetailTable'
import DailyTradeTable from '../components/Function1/DailyTradeTable'
import StockChart from '../components/Function1/StockChart'
import { mockTradeDetails, mockDailyTrades } from '../data/mockData'
import './Function1Page.css'

function Function1Page() {
  const [selectedStockCode, setSelectedStockCode] = useState<string | undefined>(undefined)

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
          <h1>Function 1: Data Integration</h1>
          <p className="function1-description">
            資料整合與分析平台 - 提供股票成交明細與日交易檔的整合查詢與視覺化分析
          </p>
        </div>

        <div className="function1-controls">
          {selectedStockCode && (
            <div className="filter-control">
              <span className="filter-label">已篩選股票:</span>
              <span className="filter-value">{selectedStockCode}</span>
              <button className="clear-filter-btn" onClick={handleClearFilter}>
                清除篩選
              </button>
            </div>
          )}
        </div>

        <div className="function1-content">
          <div className="visualization-section">
            <StockChart 
              data={mockDailyTrades} 
              selectedStockCode={selectedStockCode}
            />
          </div>

          <div className="tables-section">
            <TradeDetailTable
              data={mockTradeDetails}
              selectedStockCode={selectedStockCode}
              onRowClick={handleTable1Click}
            />

            <DailyTradeTable
              data={mockDailyTrades}
              selectedStockCode={selectedStockCode}
              onRowClick={handleTable2Click}
            />
          </div>
        </div>

        <div className="function1-info">
          <div className="info-card">
            <h4>Data Source & Scraper</h4>
            <p>目前使用模擬資料 (Mock Data)</p>
            <p className="info-note">未來將整合實際資料來源與爬蟲模組</p>
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
