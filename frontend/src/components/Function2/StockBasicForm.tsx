import { useState } from 'react'
import type { FormEvent } from 'react'
import type { StockBasic } from '../../types/stock'
import './StockBasicForm.css'

interface StockBasicFormProps {
  onSubmit: (stock: Omit<StockBasic, 'id' | 'createdAt'>) => void
  initialData?: StockBasic
  onCancel?: () => void
}

function StockBasicForm({ onSubmit, initialData, onCancel }: StockBasicFormProps) {
  const [formData, setFormData] = useState({
    stockCode: initialData?.stockCode || '',
    stockName: initialData?.stockName || '',
    industry: initialData?.industry || '',
    market: initialData?.market || '上市',
    listedDate: initialData?.listedDate || '',
    capital: initialData?.capital || 0,
    address: initialData?.address || '',
    website: initialData?.website || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capital' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
    if (!initialData) {
      // 如果是新增，清空表單
      setFormData({
        stockCode: '',
        stockName: '',
        industry: '',
        market: '上市',
        listedDate: '',
        capital: 0,
        address: '',
        website: ''
      })
    }
  }

  return (
    <div className="stock-basic-form-container">
      <h3>{initialData ? '編輯股票基本檔' : '新增股票基本檔'}</h3>
      <form onSubmit={handleSubmit} className="stock-basic-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="stockCode">股票代號 *</label>
            <input
              type="text"
              id="stockCode"
              name="stockCode"
              value={formData.stockCode}
              onChange={handleChange}
              required
              disabled={!!initialData}
              placeholder="例如: 2330"
            />
          </div>
          <div className="form-group">
            <label htmlFor="stockName">股票名稱 *</label>
            <input
              type="text"
              id="stockName"
              name="stockName"
              value={formData.stockName}
              onChange={handleChange}
              required
              placeholder="例如: 台積電"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="industry">產業別 *</label>
            <input
              type="text"
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              placeholder="例如: 半導體"
            />
          </div>
          <div className="form-group">
            <label htmlFor="market">市場別 *</label>
            <select
              id="market"
              name="market"
              value={formData.market}
              onChange={handleChange}
              required
            >
              <option value="上市">上市</option>
              <option value="上櫃">上櫃</option>
              <option value="興櫃">興櫃</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="listedDate">上市日期 *</label>
            <input
              type="date"
              id="listedDate"
              name="listedDate"
              value={formData.listedDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="capital">資本額（萬元） *</label>
            <input
              type="number"
              id="capital"
              name="capital"
              value={formData.capital}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="例如: 259303800"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">公司地址</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="例如: 新竹市東區力行六路8號"
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">公司網站</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="例如: https://www.tsmc.com"
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="cancel-btn">
              取消
            </button>
          )}
          <button type="submit" className="submit-btn">
            {initialData ? '更新' : '新增'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StockBasicForm

