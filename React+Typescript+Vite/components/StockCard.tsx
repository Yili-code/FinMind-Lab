import React from 'react';
import type { StockInfo } from '../types';

interface StockCardProps {
  data: StockInfo;
  onAddToWatchlist: (stock: StockInfo) => void;
  isInWatchlist: boolean;
  isWatchlistFull: boolean;
}

const UpArrowIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.03 9.83a.75.75 0 0 1-1.06-1.06l5.5-5.5a.75.75 0 0 1 1.06 0l5.5 5.5a.75.75 0 1 1-1.06 1.06L10.75 5.612V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
    </svg>
);

const DownArrowIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l4.22-4.22a.75.75 0 1 1 1.06 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-5.5-5.5a.75.75 0 1 1 1.06-1.06L9.25 14.388V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
    </svg>
);

const DashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143Z" clipRule="evenodd" />
    </svg>
);


const StockCard: React.FC<StockCardProps> = ({ data, onAddToWatchlist, isInWatchlist, isWatchlistFull }) => {
  const price = parseFloat(data.z);
  const yesterdayPrice = parseFloat(data.y);
  
  const change = price - yesterdayPrice;
  const changePercent = yesterdayPrice !== 0 ? (change / yesterdayPrice) * 100 : 0;

  const isUp = change > 0;
  const isDown = change < 0;
  
  const colorClass = isUp ? 'text-red-400' : isDown ? 'text-green-400' : 'text-gray-400';
  const bgColorClass = isUp ? 'bg-red-500/10' : isDown ? 'bg-green-500/10' : 'bg-gray-500/10';

  const formatNumber = (value: string | number) => {
    return parseFloat(value as string).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const DataPill: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className={`flex justify-between items-baseline p-3 bg-gray-800/50 rounded-lg ${className}`}>
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-mono font-semibold text-gray-200">{value}</span>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-bold text-white">{data.n}</h2>
          <p className="text-lg text-gray-400 font-mono">{data.c}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
            <button
                onClick={() => onAddToWatchlist(data)}
                disabled={isInWatchlist || isWatchlistFull}
                className="flex items-center px-4 py-2 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label={isInWatchlist ? "已在觀察名單" : "新增至觀察名單"}
                >
                {isInWatchlist ? <CheckIcon className="mr-2" /> : <PlusIcon className="mr-2" />}
                <span>{isInWatchlist ? '已新增' : '新增'}</span>
            </button>
            <div className={`px-4 py-2 rounded-lg font-bold flex items-center space-x-2 ${bgColorClass} ${colorClass}`}>
                {isUp && <UpArrowIcon />}
                {isDown && <DownArrowIcon />}
                {!isUp && !isDown && <DashIcon />}
                <span>{change > 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)</span>
            </div>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-6xl font-bold font-mono text-center" >
          <span className={colorClass}>{formatNumber(price)}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-lg">
        <DataPill label="開盤" value={formatNumber(data.o)} />
        <DataPill label="最高" value={formatNumber(data.h)} />
        <DataPill label="最低" value={formatNumber(data.l)} />
        <DataPill label="昨收" value={formatNumber(data.y)} />
        <DataPill label="成交量" value={parseInt(data.v).toLocaleString()} />
        <DataPill label="更新時間" value={data.t} />
      </div>
      <div className="text-center mt-6 text-xs text-gray-500">
        資料更新時間: {data.d.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')} {data.t}
      </div>
    </div>
  );
};

export default StockCard;