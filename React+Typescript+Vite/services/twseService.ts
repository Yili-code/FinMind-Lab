import type { TwseApiResponse, AllStocksApiResponse } from '../types';

/**
 * NOTE: The official TWSE API (https://mis.twse.com.tw/stock/api/getStockInfo.jsp)
 * does not support Cross-Origin Resource Sharing (CORS) for direct browser requests.
 * This means it cannot be called directly from a web application.
 *
 * To bypass this limitation for this demonstration, we are using a public CORS proxy
 * (`api.allorigins.win`). This is a workaround and may have reliability or rate-limiting
 * issues.
 *
 * In a production environment, the recommended approach is to create your own backend
 * server that acts as a proxy to the TWSE API.
 */
export const fetchStockData = async (stockCode: string): Promise<TwseApiResponse> => {
  // We assume the stock is listed on the Taiwan Stock Exchange (TSE).
  // For Over-The-Counter (OTC) stocks, the prefix would be 'otc_'.
  const marketAndCode = `tse_${stockCode}.tw`;
  const twseApiUrl = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${marketAndCode}`;

  // Use a CORS proxy to bypass browser restrictions.
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(twseApiUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.statusText} (${response.status})`);
    }

    const data: TwseApiResponse = await response.json();

    // The TWSE API returns rtcode '0000' and an empty msgArray for invalid stock codes.
    if (data.rtcode !== '0000' || !data.msgArray || data.msgArray.length === 0) {
      throw new Error(`查無此股票代號: ${stockCode}`);
    }

    return data;
  } catch (error) {
    console.error('擷取股票資料時發生錯誤:', error);
    if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('資料擷取失敗。這可能是因為所使用的公開代理伺服器暫時無法連線或請求頻繁。請稍後再試。');
        }
        // Re-throw other specific error messages to be displayed in the UI.
        throw new Error(error.message);
    }
    // Provide a generic error message for unexpected errors.
    throw new Error('擷取股票資料時發生未知錯誤，請檢查網路連線或稍後再試。');
  }
};

/**
 * Fetches the daily closing data for all stocks from the TWSE.
 */
export const fetchAllStockData = async (): Promise<AllStocksApiResponse> => {
    const timestamp = new Date().getTime();
    const twseApiUrl = `https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&type=ALLBUT0999&_=${timestamp}`;

    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(twseApiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`全部股票資料 API 請求失敗: ${response.statusText} (${response.status})`);
        }

        const data: AllStocksApiResponse = await response.json();

        if (data.stat !== 'OK') {
            throw new Error('無法從 TWSE API 獲取有效的全部股票資料。');
        }

        return data;
    } catch (error) {
        console.error('擷取全部股票資料時發生錯誤:', error);
        if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('資料擷取失敗。這可能是因為所使用的公開代理伺服器暫時無法連線或請求頻繁。請稍後再試。');
            }
            throw new Error(error.message);
        }
        throw new Error('擷取全部股票資料時發生未知錯誤，請檢查網路連線或稍後再試。');
    }
};