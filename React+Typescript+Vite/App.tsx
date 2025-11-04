import React, { useState, useCallback } from 'react';
import type { StockInfo } from './types';
import { fetchStockData } from './services/twseService';
import SearchForm from './components/SearchForm';
import StockCard from './components/StockCard';

const SpinnerIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} animate-spin`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.695v-2.695A8.25 8.25 0 0 0 8.25 4.505v2.695m-4.993 0h4.992" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const App: React.FC = () => {
  const [stockData, setStockData] = useState<StockInfo | null>(null);
  const [watchlist, setWatchlist] = useState<StockInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<boolean>(true);

  const handleSearch = useCallback(async (stockCode: string) => {
    setIsLoading(true);
    setError(null);
    setStockData(null);
    setInitialState(false);
    try {
      const response = await fetchStockData(stockCode);
      if (response.msgArray && response.msgArray.length > 0) {
        setStockData(response.msgArray[0]);
      } else {
        setError(`查無此股票代號: ${stockCode}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('發生未知錯誤');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToWatchlist = useCallback((stockToAdd: StockInfo) => {
    if (watchlist.length >= 10) {
      setError("觀察名單已滿 (最多10支)。");
      return;
    }
    if (watchlist.some(stock => stock.c === stockToAdd.c)) {
      setError(`${stockToAdd.n} (${stockToAdd.c}) 已在觀察名單中。`);
      return;
    }
    setWatchlist(prev => [...prev, stockToAdd]);
    setError(null); // Clear previous errors on successful add
  }, [watchlist]);

  const removeFromWatchlist = (stockCode: string) => {
    setWatchlist(prev => prev.filter(stock => stock.c !== stockCode));
  };

  const convertWatchlistToCsv = (data: StockInfo[]): string => {
    if (!data || data.length === 0) return "";
  
    const escapeCell = (cell: string): string => {
      const cleanedCell = (cell || "").trim();
      if (/[",\n]/.test(cleanedCell)) {
        return `"${cleanedCell.replace(/"/g, '""')}"`;
      }
      return cleanedCell;
    };

    const formatNumber = (value: string): string => {
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      return num.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr: string): string => {
      if (dateStr.length === 8) {
        return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      }
      return dateStr;
    };

    const formatVolume = (value: string): string => {
      const num = parseInt(value);
      if (isNaN(num)) return value;
      return num.toLocaleString('zh-TW');
    };

    // 生成標題和元資料
    const now = new Date();
    const generateTime = now.toLocaleString('zh-TW', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    const metadata = [
      '台股即時資訊 - 觀察名單報表',
      `生成時間: ${generateTime}`,
      `股票數量: ${data.length} 支`,
      ''
    ];

    // 計算統計資訊
    const prices = data.map(s => parseFloat(s.z)).filter(p => !isNaN(p));
    const volumes = data.map(s => parseInt(s.v)).filter(v => !isNaN(v));
    const avgPrice = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const totalVolume = volumes.reduce((a, b) => a + b, 0);
    
    const stats = [];
    if (prices.length > 0) {
      stats.push(`平均成交價: ${avgPrice.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      stats.push(`總成交量: ${totalVolume.toLocaleString('zh-TW')}`);
    }
    if (stats.length > 0) {
      stats.push('');
    }

    // 表頭
    const headers = [
      "序號", "股票代號", "公司簡稱", "成交價", "漲跌", "漲跌幅", 
      "開盤價", "最高價", "最低價", "昨收價", "累積成交量", "最近成交時刻", "交易日期"
    ];
  
    const headerRow = headers.map(escapeCell).join(',');
  
    // 資料行
    const rows = data.map((stock, index) => {
      const price = parseFloat(stock.z);
      const yesterdayPrice = parseFloat(stock.y);
      const change = isNaN(price) || isNaN(yesterdayPrice) ? 0 : price - yesterdayPrice;
      const changePercent = yesterdayPrice !== 0 && !isNaN(yesterdayPrice)
        ? ((change / yesterdayPrice) * 100)
        : 0;
      const changeStr = change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
      const changePercentStr = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
      
      return [
        (index + 1).toString(),           // 序號
        stock.c,                           // 股票代號
        stock.n,                           // 公司簡稱
        formatNumber(stock.z),             // 成交價（格式化）
        changeStr,                         // 漲跌金額
        changePercentStr,                  // 漲跌幅百分比
        formatNumber(stock.o),             // 開盤價
        formatNumber(stock.h),             // 最高價
        formatNumber(stock.l),             // 最低價
        formatNumber(stock.y),             // 昨收價
        formatVolume(stock.v),             // 累積成交量（格式化）
        stock.t,                           // 最近成交時刻
        formatDate(stock.d)                // 交易日期（格式化）
      ].map(escapeCell).join(',');
    });
  
    // 組合所有內容
    const content = [
      ...metadata.map(line => escapeCell(line)),
      ...(stats.length > 0 ? stats.map(line => escapeCell(line)) : []),
      headerRow,
      ...rows
    ].join('\n');

    return content;
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob(["\uFEFF" + content], { type: mimeType }); // \uFEFF for BOM to support Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWatchlistCsv = useCallback(async () => {
    if (watchlist.length === 0) {
      setError("觀察名單是空的，請先新增股票。");
      return;
    }
    setIsDownloading(true);
    setError(null);
    try {
      // Use Promise.allSettled to fetch all stocks in parallel, even if some fail
      const results = await Promise.allSettled(
        watchlist.map(stock => fetchStockData(stock.c))
      );
      
      const successfulFetches: StockInfo[] = results
        .filter(result => result.status === 'fulfilled' && result.value.msgArray.length > 0)
        .map(result => (result as PromiseFulfilledResult<any>).value.msgArray[0]);

      if (successfulFetches.length === 0) {
        throw new Error("無法獲取觀察名單中任何股票的資料，請稍後再試。");
      }

      if (successfulFetches.length < watchlist.length) {
        setError(`部分資料下載失敗，已成功下載 ${successfulFetches.length} 支股票的資料。`);
      }

      const csvContent = convertWatchlistToCsv(successfulFetches);
      const today = new Date().toISOString().slice(0, 10);
      downloadFile(csvContent, `watchlist_realtime_${today}.csv`, 'text/csv;charset=utf-8;');

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('下載過程中發生未知錯誤');
      }
    } finally {
      setIsDownloading(false);
    }
  }, [watchlist]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-cyan-400">
          <SpinnerIcon className="w-12 h-12" />
          <p className="mt-4 text-lg">查詢中...</p>
        </div>
      );
    }
    if (error && !stockData) { // Only show general error if there's no stock data displayed
      return (
        <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
          <h3 className="text-xl text-red-400">發生錯誤</h3>
          <p className="text-red-300 mt-2">{error}</p>
        </div>
      );
    }
    if (stockData) {
      const isInWatchlist = watchlist.some(s => s.c === stockData.c);
      return <StockCard 
                data={stockData} 
                onAddToWatchlist={addToWatchlist}
                isInWatchlist={isInWatchlist}
                isWatchlistFull={watchlist.length >= 10}
             />;
    }
    if(initialState) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-gray-300">歡迎使用台股即時資訊查詢</h2>
                <p className="text-gray-400 mt-2">請在上方輸入框中輸入股票代號開始查詢。</p>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-8">
       <div className="w-full max-w-4xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            台股即時資訊查詢
          </h1>
          <p className="text-gray-400 mt-2">建立您的觀察名單並下載即時資料</p>
        </header>
        
        <main className="w-full flex flex-col items-center space-y-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading || isDownloading} />

          <div className="w-full max-w-2xl mx-auto space-y-4 border-t border-b border-gray-800 py-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xl font-bold text-gray-300">
                我的觀察名單 ({watchlist.length} / 10)
              </h3>
              <button
                onClick={handleDownloadWatchlistCsv}
                disabled={isLoading || isDownloading || watchlist.length === 0}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 text-sm"
              >
                {isDownloading ? (
                  <>
                    <SpinnerIcon className="w-5 h-5 mr-2" />
                    <span>下載中...</span>
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    <span>下載名單 (CSV)</span>
                  </>
                )}
              </button>
            </div>
            {watchlist.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-2">
                    {watchlist.map(stock => (
                    <div key={stock.c} className="flex items-center bg-cyan-800/50 text-cyan-200 text-sm font-medium pl-3 pr-1 py-1 rounded-full animate-fade-in">
                        <span>{stock.n} ({stock.c})</span>
                        <button 
                        onClick={() => removeFromWatchlist(stock.c)} 
                        className="ml-2 w-5 h-5 flex items-center justify-center text-lg bg-cyan-700/50 hover:bg-cyan-600/50 rounded-full focus:outline-none"
                        aria-label={`移除 ${stock.n}`}
                        >
                        &times;
                        </button>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500 px-2">
                    觀察名單是空的。搜尋股票後點擊「新增」即可加入。
                </div>
            )}
          </div>
          
          <div className="w-full max-w-2xl">
            {/* Show add-to-watchlist specific errors here */}
            {error && (stockData || isDownloading || watchlist.length === 0) && (
                <div className="mb-4 text-center p-3 bg-yellow-900/20 border border-yellow-500 rounded-lg text-yellow-300">
                    {error}
                </div>
            )}
            {renderContent()}
          </div>
        </main>

        <footer className="text-center mt-12 py-4 border-t border-gray-800">
            <p className="text-sm text-gray-500">
                注意：由於 TWSE API 的 CORS 限制，此應用程式透過公開代理伺服器獲取即時資料。
            </p>
            <p className="text-xs text-gray-600 mt-1">
                此代理僅供展示，在正式環境中建議自建後端代理以確保穩定性。
            </p>
        </footer>
       </div>
    </div>
  );
};

export default App;
