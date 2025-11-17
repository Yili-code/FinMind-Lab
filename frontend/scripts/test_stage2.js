// 簡易 Stage 2 測試腳本
// 用途：呼叫後端 /api/stock/financial/:stockCode，並套用與 FinancialReportsPage 相同的轉換/驗證邏輯
// 
// 注意：yfinance 對台股財務報表的支持有限，建議使用美股代號測試（例如：AAPL, MSFT, TSLA）

const STOCK_CODE = process.argv[2] || '2330'
const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8000'

// 檢查是否為台股代號（4位數字）
const isTaiwanStock = /^\d{4}$/.test(STOCK_CODE)
if (isTaiwanStock) {
  console.warn('⚠️  警告：檢測到台股代號，yfinance 對台股財務報表的支持可能有限')
  console.warn('   建議使用美股代號測試（例如：AAPL, MSFT, TSLA）')
  console.warn('   如果測試失敗，很可能是因為 yfinance 無法獲取該台股的財務報表數據\n')
}

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
    console.log('Response structure:')
    console.log('  - incomeStatement:', data.incomeStatement ? '有數據' : 'null')
    console.log('  - balanceSheet:', data.balanceSheet ? '有數據' : 'null')
    console.log('  - cashFlow:', data.cashFlow ? '有數據' : 'null')
    
    const balance = data.balanceSheet
    if (!balance) {
      console.error('\n❌ balanceSheet 為 null')
      if (isTaiwanStock) {
        console.error('\n可能原因：')
        console.error('1. yfinance 對台股財務報表支持有限')
        console.error('2. 該台股在 yfinance 中沒有可用的資產負債表數據')
        console.error('3. Yahoo Finance 數據源可能沒有該股票的財務報表')
        console.error('\n建議：')
        console.error('- 嘗試使用美股代號測試（例如：node test_stage2.js AAPL）')
        console.error('- 查看後端日誌獲取詳細錯誤信息')
        console.error('- 如果確實需要台股財務數據，可能需要使用其他數據源（如 FinMind）')
      } else {
        console.error('\n可能原因：')
        console.error('1. 該股票沒有可用的財務報表數據')
        console.error('2. 股票代號不存在或格式錯誤')
        console.error('3. 後端無法從 yfinance 獲取數據')
        console.error('\n建議：')
        console.error('- 確認股票代號正確')
        console.error('- 查看後端日誌獲取詳細錯誤信息')
        console.error('- 嘗試其他股票代號')
      }
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
