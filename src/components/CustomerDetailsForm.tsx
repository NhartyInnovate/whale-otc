'use client';

import React, { useState } from 'react';
import { TransactionType, CryptoAsset, QuoteResponse } from '../types';
import { ArrowLeft, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  type: TransactionType;
  asset: CryptoAsset;
  quote: QuoteResponse | null;
  inputCurrency: 'fiat' | 'crypto';
  onBack: () => void;
}

export default function CustomerDetailsForm({ type, asset, quote, inputCurrency, onBack }: Props) {
  const [success, setSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [idempotencyKey] = useState(() => uuidv4());
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      fullName: '',
      phone: '',
      email: '',
      walletAddress: '',
      walletNetwork: asset === 'USDT' ? 'TRC20' : 'Solana',
      bankName: '',
      accountNumber: '',
      accountName: '',
    };
    
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('whaleCustomerData');
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaultData, ...parsed };
        }
      } catch {
        // ignore error
      }
    }
    return defaultData;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;
    
    setSubmitting(true);
    setError('');

    try {
      // Prepare request payload
      const payload = {
        side: type.toLowerCase(),
        asset: asset,
        amount: quote.inputAmount,
        amountCurrency: inputCurrency,
        quoteGeneratedAt: quote.generatedAt,
        idempotencyKey,
        customer: {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        },
        delivery: type === 'BUY' ? {
          walletAddress: formData.walletAddress,
          network: formData.walletNetwork,
        } : undefined,
        payout: type === 'SELL' ? {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        } : undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit order');
      }

      // Save valid data back to local storage
      try {
        localStorage.setItem('whaleCustomerData', JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          walletAddress: formData.walletAddress,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        }));
      } catch {
        // Ignore local storage errors
      }

      setOrderRef(data.orderReference);
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'We couldn\'t create your order right now. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    const whaleWalletAddress = asset === 'USDT' 
      ? 'YOUR_USDT_TRC20_WALLET_ADDRESS' 
      : 'YOUR_SOLANA_WALLET_ADDRESS';
      
    const whaleNetwork = asset === 'USDT' ? 'TRC20' : 'Solana';

    return (
      <div className="p-6 md:p-10 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Order Received</h3>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Order Reference: <span className="text-gray-900 ml-1">{orderRef}</span>
          </p>
          <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase tracking-wider mb-6">
            Status: Pending
          </div>
          
          {type === 'BUY' && quote ? (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
              <p className="text-gray-900 font-medium text-sm mb-4">
                Please transfer exactly <span className="font-bold text-lg">₦{(inputCurrency === 'fiat' ? quote.inputAmount : quote.fiatAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> to the following account:
              </p>
              
              <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Bank Name</div>
                  <div className="font-medium text-gray-900">Opay</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Account Name</div>
                  <div className="font-medium text-gray-900">Nathaniel Majin Katugwa</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Account Number</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="font-bold text-xl tracking-wider text-black">6542851303</div>
                    <button 
                      onClick={() => handleCopyText('6542851303')}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-black flex items-center gap-1 ml-2"
                      title="Copy Account Number"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      <span className="text-xs font-semibold">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-4 text-center">
                Once you make the transfer, our operators will verify it and release the {asset} to your wallet.
              </p>
            </div>
          ) : quote ? (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
              <p className="text-gray-900 font-medium text-sm mb-4">
                Please transfer exactly <span className="font-bold text-lg">{(inputCurrency === 'crypto' ? quote.inputAmount : quote.cryptoAmount).toLocaleString()} {asset}</span> to the following wallet address:
              </p>
              
              <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Network</div>
                  <div className="font-medium text-gray-900">{whaleNetwork}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Wallet Address ({asset})</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="font-bold text-sm tracking-wider text-black break-all">{whaleWalletAddress}</div>
                    <button 
                      onClick={() => handleCopyText(whaleWalletAddress)}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-black flex items-center shrink-0"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      <span className="text-xs font-semibold ml-1">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-4 text-center">
                Once you make the transfer, our operators will verify it and transfer the NGN to your bank account.
              </p>
            </div>
          ) : null}
        </div>
        
        <div className="pt-2">
          <button
            onClick={() => window.location.reload()}
            className="text-gray-500 font-medium hover:text-gray-900 transition-colors"
          >
            Start a new trade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center mb-8 relative">
        <button onClick={onBack} className="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-colors group disabled:opacity-50" disabled={submitting}>
          <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-gray-700" />
        </button>
        <h3 className="text-xl font-semibold text-gray-900 w-full text-center">Your Details</h3>
      </div>

      <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-5 mb-8 text-center">
        <div className="text-sm text-gray-500 mb-1">Requesting to {type.toLowerCase()}</div>
        <div className="text-2xl font-bold tracking-tight text-gray-900">
          {quote ? (type === 'BUY' ? quote.estimatedReceive.toFixed(2) : quote.cryptoAmount) : ''} <span className="text-lg font-medium text-gray-500">{asset}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            required
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
            placeholder="John Doe"
            disabled={submitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
              placeholder="+234..."
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (Optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
              placeholder="john@example.com"
              disabled={submitting}
            />
          </div>
        </div>

        {type === 'BUY' && (
          <div className="space-y-5 pt-4">
            <h4 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Delivery Wallet</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Network</label>
              <select
                name="walletNetwork"
                value={formData.walletNetwork}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-gray-900"
                disabled={submitting}
              >
                {asset === 'USDT' ? (
                  <>
                    <option value="TRC20">Tron (TRC20)</option>
                    <option value="ERC20">Ethereum (ERC20)</option>
                    <option value="BEP20">BNB Smart Chain (BEP20)</option>
                  </>
                ) : (
                  <option value="Solana">Solana</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Receiving {asset} Address</label>
              <input
                required
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all font-mono text-sm placeholder:text-gray-400"
                placeholder={`Your ${asset} address`}
                disabled={submitting}
              />
            </div>
          </div>
        )}

        {type === 'SELL' && (
          <div className="space-y-5 pt-4">
            <h4 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Bank Details for Payout</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
              <input
                required
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
                <input
                  required
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Name</label>
                <input
                  required
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-8 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed text-lg flex justify-center items-center gap-2"
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
