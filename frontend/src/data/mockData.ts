import type { TradeDetail, DailyTrade } from '../types/stock'

// Mock 股票成交明細數據（Table 1）
export const mockTradeDetails: TradeDetail[] = [
  { id: '1', stockCode: '2330', stockName: '台積電', time: '09:00:15', price: 580, volume: 1000, amount: 580000, buySell: '買' },
  { id: '2', stockCode: '2330', stockName: '台積電', time: '09:00:23', price: 580.5, volume: 500, amount: 290250, buySell: '賣' },
  { id: '3', stockCode: '2317', stockName: '鴻海', time: '09:01:10', price: 105, volume: 2000, amount: 210000, buySell: '買' },
  { id: '4', stockCode: '2330', stockName: '台積電', time: '09:01:45', price: 581, volume: 800, amount: 464800, buySell: '買' },
  { id: '5', stockCode: '2454', stockName: '聯發科', time: '09:02:30', price: 920, volume: 300, amount: 276000, buySell: '買' },
  { id: '6', stockCode: '2317', stockName: '鴻海', time: '09:03:15', price: 105.5, volume: 1500, amount: 158250, buySell: '賣' },
  { id: '7', stockCode: '2330', stockName: '台積電', time: '09:04:00', price: 579.5, volume: 1200, amount: 695400, buySell: '賣' },
  { id: '8', stockCode: '2454', stockName: '聯發科', time: '09:05:20', price: 921, volume: 400, amount: 368400, buySell: '買' },
  { id: '9', stockCode: '2308', stockName: '台達電', time: '09:06:10', price: 285, volume: 600, amount: 171000, buySell: '買' },
  { id: '10', stockCode: '2330', stockName: '台積電', time: '09:07:05', price: 580, volume: 900, amount: 522000, buySell: '買' },
]

// Mock 股票日交易檔數據（Table 2）
export const mockDailyTrades: DailyTrade[] = [
  {
    id: '1',
    stockCode: '2330',
    stockName: '台積電',
    date: '2024-11-09',
    openPrice: 579,
    highPrice: 585,
    lowPrice: 578,
    closePrice: 582,
    volume: 25000000,
    amount: 14550000000,
    change: 3,
    changePercent: 0.52
  },
  {
    id: '2',
    stockCode: '2317',
    stockName: '鴻海',
    date: '2024-11-09',
    openPrice: 104.5,
    highPrice: 106,
    lowPrice: 104,
    closePrice: 105.5,
    volume: 15000000,
    amount: 1582500000,
    change: 1,
    changePercent: 0.96
  },
  {
    id: '3',
    stockCode: '2454',
    stockName: '聯發科',
    date: '2024-11-09',
    openPrice: 918,
    highPrice: 925,
    lowPrice: 915,
    closePrice: 920,
    volume: 5000000,
    amount: 4600000000,
    change: 2,
    changePercent: 0.22
  },
  {
    id: '4',
    stockCode: '2308',
    stockName: '台達電',
    date: '2024-11-09',
    openPrice: 283,
    highPrice: 287,
    lowPrice: 282,
    closePrice: 285,
    volume: 8000000,
    amount: 2280000000,
    change: 2,
    changePercent: 0.71
  },
  {
    id: '5',
    stockCode: '2412',
    stockName: '中華電',
    date: '2024-11-09',
    openPrice: 125,
    highPrice: 126,
    lowPrice: 124.5,
    closePrice: 125.5,
    volume: 3000000,
    amount: 376500000,
    change: 0.5,
    changePercent: 0.4
  },
]

