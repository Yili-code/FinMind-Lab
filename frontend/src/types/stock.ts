// 股票成交明細（Table 1）
export interface TradeDetail {
  id: string
  stockCode: string
  stockName: string
  date: string // 日期
  time: string // 時間
  price: number // 成交價
  change: number // 漲跌
  changePercent: number // 漲跌幅
  lots: number // 張數（1張=1000股）
  period: string // 時段（早盤、午盤等）
  openPrice: number // 開盤
  highPrice: number // 最高
  lowPrice: number // 最低
  totalVolume: number // 總量
  estimatedVolume: number // 預估量
}

// 股票日交易檔（Table 2）
export interface DailyTrade {
  id: string
  stockCode: string
  stockName: string
  date: string
  closePrice: number // 成交（收盤價）
  avgPrice: number // 均價
  prevClose: number // 昨收
  openPrice: number // 開盤
  highPrice: number // 最高
  lowPrice: number // 最低
  change: number // 漲跌
  changePercent: number // 漲跌幅
  totalVolume: number // 總量
  prevVolume: number // 昨量
  innerVolume: number // 內盤
  outerVolume: number // 外盤
  foreignInvestor: number // 外資
  investmentTrust: number // 投信
  dealer: number // 自營商
  chips: number // 籌碼
  mainBuy: number // 主買
  mainSell: number // 主賣
  monthHigh: number // 月高
  monthLow: number // 月低
  quarterHigh: number // 季高
}

// 股票基本檔（Table 3）
export interface StockBasic {
  id: string
  stockCode: string
  stockName: string
  category: string // 分類
  establishedDate: string // 成立
  listedDate: string // 掛牌
  industry: string // 產業
  capital: number // 股本
  issuedShares: number // 發行
  marketValue: number // 市值
  directors: string // 董監
  market: string // 市櫃（上市/上櫃）
  group: string // 集團
  employees: number // 人數
  dividend: number // 股利
  yield: number // 殖利
  dividendPerShare: number // 股息
  closingPrice: number // 收價
  exDividendDate: string // 填息
  peRatio: number // 本益
  equityRatio: number // 股權
  industryChange: number // 同業漲跌
  industryEPS: number // 同業EPS
  industryYield: number // 同業殖利
  createdAt: string
}

