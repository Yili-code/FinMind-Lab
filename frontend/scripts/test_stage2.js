// 簡易 Stage 2 測試腳本
// 用途：呼叫後端 /api/stock/financial/:stockCode，並套用與 FinancialReportsPage 相同的轉換/驗證邏輯

const STOCK_CODE = process.argv[2] || '2330'
const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8000'

function isNumber(v) {
  return typeof v === 'number' && !Number.isNaN(v)
}

function validateBalanceSheetData(data) {
  const errors = []
  if (!data.stockCode) errors.push('stockCode 為空')
  if (!data.period) errors.push('period 為空')
  if (data.totalAssets === undefined || data.totalAssets === null || isNaN(Number(data.totalAssets))) {
    errors.push('totalAssets 無效')
  }
  if (data.shareholdersEquity === undefined || data.shareholdersEquity === null || isNaN(Number(data.shareholdersEquity))) {
    errors.push('shareholdersEquity 無效')
  }
  if (data.currentAssets === undefined || data.currentAssets === null || isNaN(Number(data.currentAssets))) {
    errors.push('currentAssets 無效')
  }
  if (data.currentLiabilities === undefined || data.currentLiabilities === null || isNaN(Number(data.currentLiabilities))) {
    errors.push('currentLiabilities 無效')
  }
  return { valid: errors.length === 0, errors }
}

function convertToBalanceSheet(data, stockCode) {
  if (!data) return null
  try {
    if (!data.id || !data.period || data.totalAssets === undefined) {
      console.warn('[轉換失敗] 欄位缺失', data)
      return null
    }
    const result = {
      id: String(data.id),
      stockCode: data.stockCode || stockCode,
      period: data.period,
      totalAssets: Number(data.totalAssets) || 0,
      totalAssetsRatio: Number(data.totalAssetsRatio) || 0,
      shareholdersEquity: Number(data.shareholdersEquity) || 0,
      shareholdersEquityRatio: Number(data.shareholdersEquityRatio) || 0,
      currentAssets: Number(data.currentAssets) || 0,
      currentAssetsRatio: Number(data.currentAssetsRatio) || 0,
      currentLiabilities: Number(data.currentLiabilities) || 0,
      currentLiabilitiesRatio: Number(data.currentLiabilitiesRatio) || 0,
    }
    const validation = validateBalanceSheetData(result)
    if (!validation.valid) {
      console.warn('[驗證失敗]', validation.errors)
      return null
    }
    return result
  } catch (e) {
    console.error('[轉換例外]', e)
    return null
  }
}

async function main() {
  const url = `${API_BASE}/api/stock/financial/${STOCK_CODE}`
  console.log('Fetching:', url)
  try {
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      console.error('HTTP error', res.status, await res.text())
      process.exit(2)
    }
    const data = await res.json()
    console.log('Backend returned keys:', Object.keys(data))
    const balance = data.balanceSheet
    if (!balance) {
      console.error('balanceSheet 為 null')
      process.exit(3)
    }

    const converted = convertToBalanceSheet(balance, STOCK_CODE)
    if (!converted) {
      console.error('轉換失敗或驗證失敗')
      process.exit(4)
    }

    console.log('轉換並驗證成功:')
    console.log(JSON.stringify(converted, null, 2))
    process.exit(0)
  } catch (e) {
    console.error('Fetch failed:', e)
    process.exit(1)
  }
}

main()
