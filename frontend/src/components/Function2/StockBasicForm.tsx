import { useState } from 'react'
import type { FormEvent } from 'react'
import type { StockBasic } from '../../types/stock'
import './StockBasicForm.css'

interface StockBasicFormProps {
  onSubmit: (stock: Omit<StockBasic, 'id' | 'createdAt'>) => void
  initialData?: StockBasic
  onCancel?: () => void
}

// 股票基本資料表單
function StockBasicForm({ onSubmit, initialData, onCancel }: StockBasicFormProps) {
  const [formData, setFormData] = useState({
    stockCode: initialData?.stockCode || '',
    stockName: initialData?.stockName || '',
    category: initialData?.category || '',
    establishedDate: initialData?.establishedDate || '',
    listedDate: initialData?.listedDate || '',
    industry: initialData?.industry || '',
    capital: initialData?.capital || 0,
    issuedShares: initialData?.issuedShares || 0,
    marketValue: initialData?.marketValue || 0,
    directors: initialData?.directors || '',
    market: initialData?.market || '上市',
    group: initialData?.group || '',
    employees: initialData?.employees || 0,
    dividend: initialData?.dividend || 0,
    yield: initialData?.yield || 0,
    dividendPerShare: initialData?.dividendPerShare || 0,
    closingPrice: initialData?.closingPrice || 0,
    exDividendDate: initialData?.exDividendDate || '',
    peRatio: initialData?.peRatio || 0,
    equityRatio: initialData?.equityRatio || 0,
    industryChange: initialData?.industryChange || 0,
    industryEPS: initialData?.industryEPS || 0,
    industryYield: initialData?.industryYield || 0
  })

  // 處理表單變更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['capital', 'issuedShares', 'marketValue', 'employees', 'dividend', 'yield', 
               'dividendPerShare', 'closingPrice', 'peRatio', 'equityRatio', 'industryChange', 
               'industryEPS', 'industryYield'].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  // 處理表單提交
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
    if (!initialData) {
      // 如果是新增，清空表單
      setFormData({
        stockCode: '',
        stockName: '',
        category: '',
        establishedDate: '',
        listedDate: '',
        industry: '',
        capital: 0,
        issuedShares: 0,
        marketValue: 0,
        directors: '',
        market: '上市',
        group: '',
        employees: 0,
        dividend: 0,
        yield: 0,
        dividendPerShare: 0,
        closingPrice: 0,
        exDividendDate: '',
        peRatio: 0,
        equityRatio: 0,
        industryChange: 0,
        industryEPS: 0,
        industryYield: 0
      })
    }
  }

  // 渲染表單
  return (
    <div className="stock-basic-form-container">
      <h3>{initialData ? '編輯股票基本檔' : '新增股票基本檔'}</h3>
      <form onSubmit={handleSubmit} className="stock-basic-form">
        <div className="form-section">
          <h4>基本資訊</h4>
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
            <div className="form-group">
              <label htmlFor="category">分類</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="例如: 電子零組件"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="establishedDate">成立日期</label>
              <input
                type="date"
                id="establishedDate"
                name="establishedDate"
                value={formData.establishedDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="listedDate">掛牌日期 *</label>
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
              <label htmlFor="industry">產業 *</label>
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
          </div>
        </div>

        <div className="form-section">
          <h4>財務資訊</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="capital">股本（萬元） *</label>
              <input
                type="number"
                id="capital"
                name="capital"
                value={formData.capital}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="issuedShares">發行股數（股）</label>
              <input
                type="number"
                id="issuedShares"
                name="issuedShares"
                value={formData.issuedShares}
                onChange={handleChange}
                min="0"
                placeholder="例如: 25930380000"
              />
            </div>
            <div className="form-group">
              <label htmlFor="marketValue">市值（萬元）</label>
              <input
                type="number"
                id="marketValue"
                name="marketValue"
                value={formData.marketValue}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>其他資訊</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="directors">董監</label>
              <input
                type="text"
                id="directors"
                name="directors"
                value={formData.directors}
                onChange={handleChange}
                placeholder="例如: 張忠謀"
              />
            </div>
            <div className="form-group">
              <label htmlFor="market">市櫃 *</label>
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
            <div className="form-group">
              <label htmlFor="group">集團</label>
              <input
                type="text"
                id="group"
                name="group"
                value={formData.group}
                onChange={handleChange}
                placeholder="例如: 台積電集團"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employees">員工人數（人）</label>
              <input
                type="number"
                id="employees"
                name="employees"
                value={formData.employees}
                onChange={handleChange}
                min="0"
                placeholder="例如: 50000"
              />
            </div>
            <div className="form-group">
              <label htmlFor="dividend">股利（元）</label>
              <input
                type="number"
                id="dividend"
                name="dividend"
                value={formData.dividend}
                onChange={handleChange}
                step="0.01"
                placeholder="例如: 5.5"
              />
            </div>
            <div className="form-group">
              <label htmlFor="yield">殖利（%）</label>
              <input
                type="number"
                id="yield"
                name="yield"
                value={formData.yield}
                onChange={handleChange}
                step="0.01"
                placeholder="例如: 3.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dividendPerShare">股息（元/股）</label>
              <input
                type="number"
                id="dividendPerShare"
                name="dividendPerShare"
                value={formData.dividendPerShare}
                onChange={handleChange}
                step="0.01"
                placeholder="例如: 5.0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="closingPrice">收價（元）</label>
              <input
                type="number"
                id="closingPrice"
                name="closingPrice"
                value={formData.closingPrice}
                onChange={handleChange}
                step="0.01"
                placeholder="例如: 580.0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="exDividendDate">填息日期</label>
              <input
                type="date"
                id="exDividendDate"
                name="exDividendDate"
                value={formData.exDividendDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="peRatio">本益比（倍）</label>
              <input
                type="number"
                id="peRatio"
                name="peRatio"
                value={formData.peRatio}
                onChange={handleChange}
                step="0.01"
                placeholder="例如: 15.5"
              />
            </div>
            <div className="form-group">
              <label htmlFor="equityRatio">股權（%）</label>
              <input
                type="number"
                id="equityRatio"
                name="equityRatio"
                value={formData.equityRatio}
                onChange={handleChange}
                step="0.01"
                placeholder="例如: 45.5"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>同業比較</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="industryChange">同業漲跌（%）</label>
              <input
                type="number"
                id="industryChange"
                name="industryChange"
                value={formData.industryChange}
                onChange={handleChange}
                step="0.01"
                placeholder="例如: 2.5"
              />
            </div>
            <div className="form-group">
              <label htmlFor="industryEPS">同業EPS（元）</label>
              <input
                type="number"
                id="industryEPS"
                name="industryEPS"
                value={formData.industryEPS}
                onChange={handleChange}
                step="0.01"
                placeholder="例如: 8.5"
              />
            </div>
            <div className="form-group">
              <label htmlFor="industryYield">同業殖利（%）</label>
              <input
                type="number"
                id="industryYield"
                name="industryYield"
                value={formData.industryYield}
                onChange={handleChange}
                step="0.01"
                placeholder="例如: 3.2"
              />
            </div>
          </div>
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
