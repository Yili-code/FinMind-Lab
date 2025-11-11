// 資料格式化工具函數

export const formatNumber = (num: number): string => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '億'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '萬'
  }
  return num.toLocaleString('zh-TW')
}

export const formatCurrency = (num: number): string => {
  return formatNumber(num) + '元'
}

export const formatPercent = (num: number, decimals: number = 1): string => {
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(decimals)}%`
}

export const formatPrice = (price: number, decimals: number = 1): string => {
  return price.toFixed(decimals)
}

// 表格排序工具函數
export const sortData = <T>(
  data: T[],
  sortConfig: { key: keyof T; direction: 'asc' | 'desc' } | null
): T[] => {
  if (!sortConfig) return data

  return [...data].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    const aStr = String(aValue)
    const bStr = String(bValue)
    return sortConfig.direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })
}

// 表格過濾工具函數
export const filterByStockCode = <T extends { stockCode: string }>(
  data: T[],
  stockCode?: string
): T[] => {
  if (!stockCode) return data
  return data.filter(item => item.stockCode === stockCode)
}

