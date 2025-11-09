import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BalanceSheetItem } from '../../types/financial'
import './FinancialForm.css'

interface BalanceSheetFormProps {
  onSubmit: (balance: Omit<BalanceSheetItem, 'id'>) => void
  initialData?: BalanceSheetItem
  onCancel?: () => void
}

function BalanceSheetForm({ onSubmit, initialData, onCancel }: BalanceSheetFormProps) {
  const [formData, setFormData] = useState({
    stockCode: initialData?.stockCode || '',
    period: initialData?.period || '',
    totalAssets: initialData?.totalAssets || 0,
    totalAssetsRatio: initialData?.totalAssetsRatio || 0,
    shareholdersEquity: initialData?.shareholdersEquity || 0,
    shareholdersEquityRatio: initialData?.shareholdersEquityRatio || 0,
    currentAssets: initialData?.currentAssets || 0,
    currentAssetsRatio: initialData?.currentAssetsRatio || 0,
    currentLiabilities: initialData?.currentLiabilities || 0,
    currentLiabilitiesRatio: initialData?.currentLiabilitiesRatio || 0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['totalAssets', 'totalAssetsRatio', 'shareholdersEquity', 'shareholdersEquityRatio',
               'currentAssets', 'currentAssetsRatio', 'currentLiabilities', 'currentLiabilitiesRatio'].includes(name)
        ? parseFloat(value) || 0
        : value
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
    if (!initialData) {
      setFormData({
        stockCode: '',
        period: '',
        totalAssets: 0,
        totalAssetsRatio: 0,
        shareholdersEquity: 0,
        shareholdersEquityRatio: 0,
        currentAssets: 0,
        currentAssetsRatio: 0,
        currentLiabilities: 0,
        currentLiabilitiesRatio: 0
      })
    }
  }

  return (
    <div className="financial-form-container">
      <h3>{initialData ? '編輯資產負債表' : '新增資產負債表'}</h3>
      <form onSubmit={handleSubmit} className="financial-form">
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
              placeholder="例如: 2330"
            />
          </div>
          <div className="form-group">
            <label htmlFor="period">年/季 *</label>
            <input
              type="text"
              id="period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              required
              placeholder="例如: 2024Q3 或 2024"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="totalAssets">總資產 *</label>
            <input
              type="number"
              id="totalAssets"
              name="totalAssets"
              value={formData.totalAssets}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="totalAssetsRatio">總資產比重（%）</label>
            <input
              type="number"
              id="totalAssetsRatio"
              name="totalAssetsRatio"
              value={formData.totalAssetsRatio}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="shareholdersEquity">股東權益 *</label>
            <input
              type="number"
              id="shareholdersEquity"
              name="shareholdersEquity"
              value={formData.shareholdersEquity}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="shareholdersEquityRatio">股東權益比重（%）</label>
            <input
              type="number"
              id="shareholdersEquityRatio"
              name="shareholdersEquityRatio"
              value={formData.shareholdersEquityRatio}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentAssets">流動資產 *</label>
            <input
              type="number"
              id="currentAssets"
              name="currentAssets"
              value={formData.currentAssets}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentAssetsRatio">流動資產比重（%）</label>
            <input
              type="number"
              id="currentAssetsRatio"
              name="currentAssetsRatio"
              value={formData.currentAssetsRatio}
              onChange={handleChange}
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currentLiabilities">流動負債 *</label>
            <input
              type="number"
              id="currentLiabilities"
              name="currentLiabilities"
              value={formData.currentLiabilities}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentLiabilitiesRatio">流動負債比重（%）</label>
            <input
              type="number"
              id="currentLiabilitiesRatio"
              name="currentLiabilitiesRatio"
              value={formData.currentLiabilitiesRatio}
              onChange={handleChange}
              step="0.01"
            />
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

export default BalanceSheetForm

