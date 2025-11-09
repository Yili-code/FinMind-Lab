import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CashFlowItem } from '../../types/financial'
import './FinancialForm.css'

interface CashFlowFormProps {
  onSubmit: (cashFlow: Omit<CashFlowItem, 'id'>) => void
  initialData?: CashFlowItem
  onCancel?: () => void
}

function CashFlowForm({ onSubmit, initialData, onCancel }: CashFlowFormProps) {
  const [formData, setFormData] = useState({
    stockCode: initialData?.stockCode || '',
    period: initialData?.period || '',
    operatingCashFlow: initialData?.operatingCashFlow || 0,
    investingCashFlow: initialData?.investingCashFlow || 0,
    investingCashFlowRatio: initialData?.investingCashFlowRatio || 0,
    financingCashFlow: initialData?.financingCashFlow || 0,
    financingCashFlowRatio: initialData?.financingCashFlowRatio || 0,
    freeCashFlow: initialData?.freeCashFlow || 0,
    freeCashFlowRatio: initialData?.freeCashFlowRatio || 0,
    netCashFlow: initialData?.netCashFlow || 0,
    netCashFlowRatio: initialData?.netCashFlowRatio || 0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['operatingCashFlow', 'investingCashFlow', 'investingCashFlowRatio',
               'financingCashFlow', 'financingCashFlowRatio', 'freeCashFlow',
               'freeCashFlowRatio', 'netCashFlow', 'netCashFlowRatio'].includes(name)
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
        operatingCashFlow: 0,
        investingCashFlow: 0,
        investingCashFlowRatio: 0,
        financingCashFlow: 0,
        financingCashFlowRatio: 0,
        freeCashFlow: 0,
        freeCashFlowRatio: 0,
        netCashFlow: 0,
        netCashFlowRatio: 0
      })
    }
  }

  return (
    <div className="financial-form-container">
      <h3>{initialData ? '編輯現金流量表' : '新增現金流量表'}</h3>
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
            <label htmlFor="operatingCashFlow">營業現金 *</label>
            <input
              type="number"
              id="operatingCashFlow"
              name="operatingCashFlow"
              value={formData.operatingCashFlow}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="investingCashFlow">投資現金 *</label>
            <input
              type="number"
              id="investingCashFlow"
              name="investingCashFlow"
              value={formData.investingCashFlow}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="investingCashFlowRatio">投資現金比重（%）</label>
            <input
              type="number"
              id="investingCashFlowRatio"
              name="investingCashFlowRatio"
              value={formData.investingCashFlowRatio}
              onChange={handleChange}
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="financingCashFlow">融資現金 *</label>
            <input
              type="number"
              id="financingCashFlow"
              name="financingCashFlow"
              value={formData.financingCashFlow}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="financingCashFlowRatio">融資現金比重（%）</label>
            <input
              type="number"
              id="financingCashFlowRatio"
              name="financingCashFlowRatio"
              value={formData.financingCashFlowRatio}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="freeCashFlow">自由現金 *</label>
            <input
              type="number"
              id="freeCashFlow"
              name="freeCashFlow"
              value={formData.freeCashFlow}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="freeCashFlowRatio">自由現金比重（%）</label>
            <input
              type="number"
              id="freeCashFlowRatio"
              name="freeCashFlowRatio"
              value={formData.freeCashFlowRatio}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="netCashFlow">淨現金流 *</label>
            <input
              type="number"
              id="netCashFlow"
              name="netCashFlow"
              value={formData.netCashFlow}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="netCashFlowRatio">淨現金流比重（%）</label>
            <input
              type="number"
              id="netCashFlowRatio"
              name="netCashFlowRatio"
              value={formData.netCashFlowRatio}
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

export default CashFlowForm

