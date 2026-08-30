'use client';

import React, { useState, useEffect } from 'react';
import { TransactionType, CryptoAsset, QuoteResponse } from '../types';
import { marketService } from '../services/marketService';
import CustomerDetailsForm from './CustomerDetailsForm';
import { ArrowRight, RefreshCw } from 'lucide-react';

const TetherIcon = () => (
  <div className="w-5 h-5 rounded-full bg-[#26A17B] flex items-center justify-center">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M13.4 9.1v-.8h4.5V4.6H6.1v3.7h4.5v.8c-3.6.3-6.2 1.5-6.2 3 0 1.5 2.6 2.7 6.2 3v4.3h2.8v-4.3c3.6-.3 6.2-1.5 6.2-3 0-1.5-2.6-2.7-6.2-3zm0 4.2v.1c0 1.1-2.2 2-5 2-2.8 0-5-.9-5-2v-.1c1.2.9 3 1.4 5 1.4 2 0 3.8-.5 5-1.4z"/></svg>
  </div>
);

const SolanaIcon = () => (
  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M18.8 4.6 21 7.2H5.2L3 4.6h15.8zM5.2 16.8 3 19.4h15.8l2.2-2.6H5.2zM21 12H5.2L3 9.4h15.8l2.2 2.6z"/></svg>
  </div>
);

export default function TradeWidget() {
  const [type, setType] = useState<TransactionType>('BUY');
  const [asset, setAsset] = useState<CryptoAsset>('USDT');
  const [inputCurrency, setInputCurrency] = useState<'fiat' | 'crypto'>('fiat');
  const [amount, setAmount] = useState<string>('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'TRADE' | 'DETAILS'>('TRADE');
  const [error, setError] = useState('');

  const handleTypeChange = (newType: TransactionType) => {
    if (type === newType) return;
    setType(newType);
    setInputCurrency(newType === 'BUY' ? 'fiat' : 'crypto');
    setAmount('');
    setQuote(null);
    setError('');
  };

  const handleCurrencyToggle = (newCurrency: 'fiat' | 'crypto') => {
    if (newCurrency === inputCurrency) return;
    
    if (quote && amount && parseFloat(amount) > 0) {
      if (newCurrency === 'fiat') {
        setAmount(quote.fiatAmount.toFixed(2));
      } else {
        setAmount(quote.cryptoAmount.toString());
      }
    }
    setInputCurrency(newCurrency);
    setQuote(null); // Clear stale quote to prevent UI flashing incorrect output
  };

  useEffect(() => {
    if (step !== 'TRADE') return;

    let active = true;
    
    const fetchQuote = async () => {
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setQuote(null);
        setError('');
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const res = await marketService.getQuote({ type, asset, amount, inputCurrency });
        if (active) setQuote(res);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote. Please try again.';
        if (active) setError(errorMessage);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchQuote, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [type, asset, amount, step, inputCurrency]);

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setStep('DETAILS');
  };

  const handleBack = () => {
    setStep('TRADE');
  };

  if (step === 'DETAILS') {
    return (
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative z-20">
        <CustomerDetailsForm 
          type={type} 
          asset={asset} 
          quote={quote} 
          inputCurrency={inputCurrency}
          onBack={handleBack} 
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 p-6 sm:p-8 relative z-20 transition-all duration-300">
      
      {/* Segmented Control */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-xl relative mb-8">
        <div 
          className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm border border-gray-200/50 transition-all duration-300 ease-out ${type === 'BUY' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
        />
        <button
          onClick={() => handleTypeChange('BUY')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors relative z-10 ${
            type === 'BUY' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => handleTypeChange('SELL')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors relative z-10 ${
            type === 'SELL' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-6">
        {/* Asset Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Asset</label>
          <div className="flex space-x-3">
            <button
              onClick={() => setAsset('USDT')}
              className={`flex-1 py-3.5 px-4 rounded-xl border transition-all duration-200 ${
                asset === 'USDT' 
                ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                : 'border-gray-200 bg-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              } font-semibold flex items-center justify-center space-x-2`}
            >
              <TetherIcon />
              <span>USDT</span>
            </button>
            <button
              onClick={() => setAsset('SOL')}
              className={`flex-1 py-3.5 px-4 rounded-xl border transition-all duration-200 ${
                asset === 'SOL' 
                ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                : 'border-gray-200 bg-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              } font-semibold flex items-center justify-center space-x-2`}
            >
              <SolanaIcon />
              <span>SOL</span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-end mb-2 ml-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {type === 'BUY' && inputCurrency === 'fiat' ? 'I want to spend' : ''}
              {type === 'BUY' && inputCurrency === 'crypto' ? 'I want to receive' : ''}
              {type === 'SELL' && inputCurrency === 'fiat' ? 'I want to receive' : ''}
              {type === 'SELL' && inputCurrency === 'crypto' ? 'I want to sell' : ''}
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => handleCurrencyToggle('crypto')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${inputCurrency === 'crypto' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {asset}
              </button>
              <button 
                onClick={() => handleCurrencyToggle('fiat')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${inputCurrency === 'fiat' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                NGN ₦
              </button>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 z-10">
               {inputCurrency === 'fiat' ? (
                 <span className="flex items-center gap-2 font-bold text-gray-900">
                   <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs">₦</div>
                   NGN
                 </span>
               ) : (
                 <span className="flex items-center gap-2 font-bold text-gray-900">
                   {asset === 'USDT' ? <TetherIcon /> : <SolanaIcon />}
                   {asset}
                 </span>
               )}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-right text-4xl font-bold text-gray-900 bg-white border-b-2 border-gray-100 rounded-none py-4 pl-28 pr-2 focus:border-black transition-all outline-none placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Quote Summary Box */}
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-semibold text-gray-500">Exchange Rate</span>
            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
              {loading ? (
                <span className="text-gray-400">Loading...</span>
              ) : quote ? (
                `₦${quote.rate.toLocaleString()} / ${asset}`
              ) : (
                '---'
              )}
              <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? 'animate-spin text-black' : ''}`} />
            </div>
          </div>
          
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {type === 'BUY' && inputCurrency === 'fiat' ? 'You receive (Estimated)' : ''}
            {type === 'BUY' && inputCurrency === 'crypto' ? 'You pay (Estimated)' : ''}
            {type === 'SELL' && inputCurrency === 'fiat' ? 'You sell (Estimated)' : ''}
            {type === 'SELL' && inputCurrency === 'crypto' ? 'You receive (Estimated)' : ''}
          </label>
          <div className="flex items-center gap-3">
            {inputCurrency === 'fiat' ? (
              asset === 'USDT' ? <TetherIcon /> : <SolanaIcon />
            ) : (
              <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">₦</div>
            )}
            <div className={`text-4xl sm:text-5xl font-bold tracking-tight transition-opacity duration-300 ${loading ? 'opacity-30' : 'opacity-100'} text-black`}>
              {quote ? (
                inputCurrency === 'fiat' ? quote.estimatedReceive.toFixed(2) : `₦${quote.estimatedReceive.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
              ) : (
                '0.00'
              )}
            </div>
            <div className="text-2xl font-bold text-gray-400 mt-1">
              {inputCurrency === 'fiat' ? asset : ''}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center font-medium uppercase tracking-widest">
           Indicative rate • Final rate confirmed at execution
        </div>

        {error && <p className="text-red-600 text-sm font-medium px-4 py-2 bg-red-50 rounded-lg text-center border border-red-100">{error}</p>}

        <button
          onClick={handleContinue}
          disabled={!amount || parseFloat(amount) <= 0 || loading}
          className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all text-base tracking-wide"
        >
          <span>Continue to {type === 'BUY' ? 'Buy' : 'Sell'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
