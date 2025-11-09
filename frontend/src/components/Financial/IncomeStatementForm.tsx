import { useState } from 'react'
import type { FormEvent } from 'react'
import type { IncomeStatementItem } from '../../types/financial'
import './FinancialForm.css'

interface IncomeStatementFormProps {
  onSubmit: (income: Omit<IncomeStatementItem, 'id'>) => void
  initialData?: IncomeStatementItem
  onCancel?: () => void
}

function IncomeStatementForm({ onSubmit, initialData, onCancel }: IncomeStatementFormProps) {
  const [formData, setFormData] = useState({
    stockCode: initialData?.stockCode || '',
    period: initialData?.period || '',
    revenue: initialData?.revenue || 0,
    grossProfit: initialData?.grossProfit || 0,
    grossProfitRatio: initialData?.grossProfitRatio || 0,
    operatingExpenses: initialData?.operatingExpenses || 0,
    operatingExpensesRatio: initialData?.operatingExpensesRatio || 0,
    operatingIncome: initialData?.operatingIncome || 0,
    operatingIncomeRatio: initialData?.operatingIncomeRatio || 0,
    netIncome: initialData?.netIncome || 0,
    otherIncome: initialData?.otherIncome || 0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['revenue', 'grossProfit', 'grossProfitRatio', 'operatingExpenses', 
               'operatingExpensesRatio', 'operatingIncome', 'operatingIncomeRatio', 
               'netIncome', 'otherIncome'].includes(name)
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
        revenue: 0,
        grossProfit: 0,
        grossProfitRatio: 0,
        operatingExpenses: 0,
        operatingExpensesRatio: 0,
        operatingIncome: 0,
        operatingIncomeRatio: 0,
        netIncome: 0,
        otherIncome: 0
      })
    }
  }

  return (
    <div className="financial-form-container">
      <h3>{initialData ? '編輯損益表' : '新增損益表'}</h3>
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
            <label htmlFor="revenue">營業收入 *</label>
            <input
              type="number"
              id="revenue"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="grossProfit">營業毛利 *</label>
            <input
              type="number"
              id="grossProfit"
              name="grossProfit"
              value={formData.grossProfit}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="grossProfitRatio">營業毛利比重（%）</label>
            <input
              type="number"
              id="grossProfitRatio"
              name="grossProfitRatio"
              value={formData.grossProfitRatio}
              onChange={handleChange}
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="operatingExpenses">營業費用 *</label>
            <input
              type="number"
              id="operatingExpenses"
              name="operatingExpenses"
              value={formData.operatingExpenses}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="operatingExpensesRatio">營業費用比重（%）</label>
            <input
              type="number"
              id="operatingExpensesRatio"
              name="operatingExpensesRatio"
              value={formData.operatingExpensesRatio}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="operatingIncome">營業利益 *</label>
            <input
              type="number"
              id="operatingIncome"
              name="operatingIncome"
              value={formData.operatingIncome}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="operatingIncomeRatio">營業利益比重（%）</label>
            <input
              type="number"
              id="operatingIncomeRatio"
              name="operatingIncomeRatio"
              value={formData.operatingIncomeRatio}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="netIncome">稅後淨利 *</label>
            <input
              type="number"
              id="netIncome"
              name="netIncome"
              value={formData.netIncome}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="otherIncome">其他損益</label>
            <input
              type="number"
              id="otherIncome"
              name="otherIncome"
              value={formData.otherIncome}
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

export default IncomeStatementForm

