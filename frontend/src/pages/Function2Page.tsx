import { useState, useEffect } from 'react'
import StockBasicForm from '../components/Function2/StockBasicForm'
import StockBasicTable from '../components/Function2/StockBasicTable'
import { storageService } from '../services/storageService'
import type { StockBasic } from '../types/stock'
import './Function2Page.css'

function Function2Page() {
  const [stocks, setStocks] = useState<StockBasic[]>([])
  const [editingStock, setEditingStock] = useState<StockBasic | undefined>(undefined)
  const [showForm, setShowForm] = useState(false)
  const [selectedStockCode, setSelectedStockCode] = useState<string | undefined>(undefined)

  useEffect(() => {
    loadStocks()
  }, [])

  const loadStocks = () => {
    const allStocks = storageService.getAll()
    setStocks(allStocks)
  }

  const handleSubmit = (stockData: Omit<StockBasic, 'id' | 'createdAt'>) => {
    if (editingStock) {
      // 更新
      const updated = storageService.update(editingStock.stockCode, stockData)
      if (updated) {
        loadStocks()
        setEditingStock(undefined)
        setShowForm(false)
      }
    } else {
      // 新增
      const existing = storageService.getByStockCode(stockData.stockCode)
      if (existing) {
        alert(`股票代號 ${stockData.stockCode} 已存在！`)
        return
      }
      storageService.add(stockData)
      loadStocks()
      setShowForm(false)
    }
  }

  const handleEdit = (stock: StockBasic) => {
    setEditingStock(stock)
    setShowForm(true)
  }

  const handleDelete = (stockCode: string) => {
    storageService.delete(stockCode)
    loadStocks()
    if (selectedStockCode === stockCode) {
      setSelectedStockCode(undefined)
    }
  }

  const handleRowClick = (stockCode: string) => {
    setSelectedStockCode(selectedStockCode === stockCode ? undefined : stockCode)
  }

  const handleCancel = () => {
    setEditingStock(undefined)
    setShowForm(false)
  }

  return (
    <div className="function2-page">
      <div className="function2-container">
        <div className="function2-header">
          <h1>Response Dashboard</h1>
          <p className="function2-description">
            股票基本檔管理與財務報表查詢 - 管理股票基本資訊
          </p>
        </div>

        <div className="function2-controls">
          {!showForm && (
            <button className="add-btn" onClick={() => setShowForm(true)}>
              + 新增股票基本檔
            </button>
          )}
          {selectedStockCode && (
            <div className="filter-control">
              <span className="filter-label">已選中股票:</span>
              <span className="filter-value">{selectedStockCode}</span>
              <button className="clear-filter-btn" onClick={() => setSelectedStockCode(undefined)}>
                清除選中
              </button>
            </div>
          )}
        </div>

        {showForm && (
          <StockBasicForm
            onSubmit={handleSubmit}
            initialData={editingStock}
            onCancel={handleCancel}
          />
        )}

        <div className="function2-content">
          <StockBasicTable
            data={stocks}
            selectedStockCode={selectedStockCode}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <div className="function2-info">
          <div className="info-card">
            <h4>資料儲存</h4>
            <p>目前使用 localStorage 模擬 SQLite 資料庫</p>
            <p className="info-note">未來將整合實際的 SQLite 資料庫</p>
          </div>
          <div className="info-card">
            <h4>股票篩選</h4>
            <p>點擊表格中的股票可以篩選顯示該股票的資料</p>
            <p className="info-note">點擊「清除選中」按鈕可取消篩選</p>
          </div>
          <div className="info-card">
            <h4>財務報表</h4>
            <p>財務報表功能（T4, T5, T6）正在開發中</p>
            <p className="info-note">將提供資產負債表、損益表、現金流量表等報表</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Function2Page
