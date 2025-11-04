
export interface StockInfo {
  c: string;  // 股票代號
  n: string;  // 公司簡稱
  z: string;  // 當盤成交價
  tv: string; // 當盤成交量
  v: string;  // 累積成交量
  o: string;  // 開盤價
  h: string;  // 最高價
  l: string;  // 最低價
  y: string;  // 昨收價
  t: string;  // 最近成交時刻
  d: string;  // 最近交易日期 (YYYYMMDD)
}

export interface TwseApiResponse {
  msgArray: StockInfo[];
  rtcode: string;
  rtmessage: string;
  queryTime: {
    sysDate: string;
    stockInfoItem: number;
    stockInfo: string;
    sessionStr: string;
    sysTime: string;
    showChart: boolean;
    sessionFromTime: number;
    sessionLatestTime: number;
  };
}

// Type for the daily market summary API
export interface AllStocksApiResponse {
  stat: string;
  date: string;
  fields8: string[];
  data8: string[][];
}
