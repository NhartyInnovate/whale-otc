'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { NormalizedMarketData } from '@/lib/market/types';

export default function MarketSection() {
  const [markets, setMarkets] = useState<NormalizedMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdated) {
      const t = setTimeout(() => setTimeAgo(''), 0);
      return () => clearTimeout(t);
    }
    
    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
      if (seconds < 10) setTimeAgo('Updated just now');
      else if (seconds < 60) setTimeAgo(`Updated ${seconds}s ago`);
      else {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`Updated ${minutes}m ago`);
      }
    };

    const immediate = setTimeout(updateTimeAgo, 0);
    const timer = setInterval(updateTimeAgo, 5000);
    
    return () => {
      clearTimeout(immediate);
      clearInterval(timer);
    };
  }, [lastUpdated]);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setError(null);
        const res = await fetch('/api/market');
        const json = await res.json();
        
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch market data');
        }
        
        setMarkets(json.data);
        if (json.data.length > 0) {
          setLastUpdated(json.data[0].timestamp);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Market data unavailable';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="market" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Market Overview</h2>
            <div className="flex items-center space-x-4">
              <p className="text-gray-600 text-lg">Indicative rates for reference.</p>
              {lastUpdated && !error && timeAgo && (
                <div className="hidden sm:flex items-center text-xs font-medium text-gray-400">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {timeAgo}
                </div>
              )}
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">
            <Activity className="h-4 w-4 text-gray-400" />
            Live Spot Data
          </div>
        </div>

        {error ? (
          <div className="w-full bg-red-50 border border-red-100 text-red-600 rounded-xl p-6 text-center">
            <p className="font-semibold">{error}</p>
            <p className="text-sm mt-1 text-red-500">Please try again later. WHALE is still operational.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              // Skeletons
              [...Array(4)].map((_, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-6 animate-pulse bg-gray-50/50">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))
            ) : (
              markets.map((market) => {
                const isPositive = market.change24h >= 0;
                const assetDisplay = `${market.baseAsset}/${market.quoteAsset}`;
                return (
                  <div key={market.symbol} className="group border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                      {isPositive ? <TrendingUp className="h-16 w-16 text-green-600" /> : <TrendingDown className="h-16 w-16 text-red-600" />}
                    </div>
                    <div className="text-sm font-semibold text-gray-500 mb-3 tracking-wide">{assetDisplay}</div>
                    <div className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                      {market.quoteAsset === 'NGN' ? '₦' : '$'}
                      {market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: market.price < 10 ? 4 : 2 })}
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {isPositive ? <TrendingUp className="h-3.5 w-3.5 mr-1" /> : <TrendingDown className="h-3.5 w-3.5 mr-1" />}
                      {Math.abs(market.change24h).toFixed(2)}%
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
