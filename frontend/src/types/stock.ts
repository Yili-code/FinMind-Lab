// 股票成交明細（Table 1）
export interface TradeDetail {
  id: string
  stockCode: string
  stockName: string
  time: string
  price: number
  volume: number
  amount: number
  buySell: '買' | '賣'
}

// 股票日交易檔（Table 2）
export interface DailyTrade {
  id: string
  stockCode: string
  stockName: string
  date: string
  openPrice: number
  highPrice: number
  lowPrice: number
  closePrice: number
  volume: number
  amount: number
  change: number
  changePercent: number
}

// 股票基本檔（Table 3）
export interface StockBasic {
  id: string
  stockCode: string
  stockName: string
  industry: string
  market: string
  listedDate: string
  capital: number
  address: string
  website: string
  createdAt: string
}

