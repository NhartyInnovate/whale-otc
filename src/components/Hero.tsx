'use client';

import React, { useState, useEffect } from 'react';
import TradeWidget from './TradeWidget';
import { Shield, CheckCircle, Headphones } from 'lucide-react';

export default function Hero() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const str1 = "Buy & Sell Crypto.";
    const str2 = "Simply.";
    let i = 0;
    
    const t1 = setInterval(() => {
      setText1(str1.slice(0, i + 1));
      i++;
      if (i >= str1.length) {
        clearInterval(t1);
        let j = 0;
        const t2 = setInterval(() => {
          setText2(str2.slice(0, j + 1));
          j++;
          if (j >= str2.length) {
            clearInterval(t2);
            setTimeout(() => setShowCursor(false), 3000);
          }
        }, 80);
      }
    }, 60);

    return () => clearInterval(t1);
  }, []);

  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6 overflow-hidden min-h-[900px]">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-[#fbfcfd]" />
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white pointer-events-none" />
      
      {/* Decorative Whale background */}
      <div className="absolute left-[-5%] bottom-[-5%] w-[65%] max-w-[900px] aspect-[4/3] pointer-events-none z-0">
        <div 
          className="w-full h-full bg-[url('https://images.unsplash.com/photo-1568430462989-44163eb1752f?q=80&w=2946&auto=format&fit=crop')] bg-no-repeat bg-contain bg-left-bottom animate-whale"
          style={{
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%), linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 90%), linear-gradient(to top, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 90%)',
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
            opacity: 0.85,
            mixBlendMode: 'multiply'
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        <div className="flex-1 text-center lg:text-left space-y-10 z-10 w-full">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.05] min-h-[120px] lg:min-h-[160px] flex flex-col justify-end lg:justify-start">
              <span>{text1}</span>
              <span className="text-black">
                {text2}
                <span className={`text-black font-light ${showCursor ? 'animate-pulse' : 'opacity-0'} ml-1`}>|</span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium animate-slide-up-delay-1">
              Fast, secure and straightforward OTC trading for USDT and SOL. Clear rates. Direct support.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-slide-up-delay-2">
            <a href="#trade" className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all shadow-md hover:shadow-lg text-center flex justify-center items-center space-x-2">
              <span>Start a Trade</span>
              <span aria-hidden="true">→</span>
            </a>
            <a href="#market" className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all text-center">
              View Live Market
            </a>
          </div>

          <div className="pt-8 border-t border-gray-200/60 hidden sm:flex justify-center lg:justify-start gap-8 animate-slide-up-delay-2">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm"><Shield className="w-5 h-5 text-black"/></div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Transparent Rates</p>
                <p className="text-xs text-gray-500">No hidden fees</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm"><CheckCircle className="w-5 h-5 text-black"/></div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Manual Verification</p>
                <p className="text-xs text-gray-500">We verify every trade</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm"><Headphones className="w-5 h-5 text-black"/></div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Direct Support</p>
                <p className="text-xs text-gray-500">Real human support</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg relative z-20 animate-slide-up-delay-1" id="trade">
          <TradeWidget />
        </div>

      </div>
    </section>
  );
}
