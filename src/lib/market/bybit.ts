import { NormalizedMarketData } from './types';

const BYBIT_API_URL = 'https://api.bybit.com/v5/market/tickers';

interface BybitTickerResult {
  symbol: string;
  lastPrice: string;
  bid1Price: string;
  ask1Price: string;
  price24hPcnt: string;
}

interface BybitResponse {
  retCode: number;
  retMsg: string;
  result: {
    category: string;
    list: BybitTickerResult[];
  };
  time: number;
}

async function fetchBinanceFallback(symbols: string[]) {
  try {
    console.warn('Attempting Binance fallback for crypto prices...');
    const results = [];
    for (const symbol of symbols) {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, {
        next: { revalidate: 15 }
      });
      if (!response.ok) continue;
      const data = await response.json();
      results.push({
        symbol: data.symbol,
        baseAsset: data.symbol.replace('USDT', ''),
        quoteAsset: 'USDT',
        price: parseFloat(data.lastPrice),
        bidPrice: parseFloat(data.bidPrice),
        askPrice: parseFloat(data.askPrice),
        change24h: parseFloat(data.priceChangePercent),
        timestamp: data.closeTime,
      });
    }
    return results;
  } catch (error) {
    console.error('Binance fallback also failed:', error);
    throw new Error('All market data providers are currently unavailable.');
  }
}

export async function fetchBybitTickers(symbols: string[]): Promise<NormalizedMarketData[]> {
  if (!symbols || symbols.length === 0) return [];
  
  try {
    // Bybit V5 /v5/market/tickers does not support comma-separated symbols.
    // For a small number of symbols, fetching individually via Promise.all is efficient.
    const fetchPromises = symbols.map(async (symbol) => {
      const url = `${BYBIT_API_URL}?category=spot&symbol=${symbol}`;
      
      const response = await fetch(url, {
        next: { revalidate: 10 },
      });

      if (!response.ok) {
        throw new Error(`Bybit API responded with status: ${response.status} for ${symbol}`);
      }

      const data = (await response.json()) as BybitResponse;

      if (data.retCode !== 0) {
        throw new Error(`Bybit API error for ${symbol}: ${data.retMsg}`);
      }

      if (!data.result.list || data.result.list.length === 0) {
        throw new Error(`No market data found for ${symbol}`);
      }

      const ticker = data.result.list[0];
      const baseAsset = ticker.symbol.replace('USDT', '');
      const quoteAsset = 'USDT';

      return {
        symbol: ticker.symbol,
        baseAsset,
        quoteAsset,
        price: parseFloat(ticker.lastPrice),
        bidPrice: parseFloat(ticker.bid1Price),
        askPrice: parseFloat(ticker.ask1Price),
        change24h: parseFloat(ticker.price24hPcnt) * 100,
        timestamp: data.time,
      } as NormalizedMarketData;
    });

    return await Promise.all(fetchPromises);
  } catch (error) {
    console.error('Bybit fetch failed:', error);
    return await fetchBinanceFallback(symbols);
  }
}
