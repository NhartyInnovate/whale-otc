import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_LINK = "https://wa.me/2348085926282";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-20 pb-10" id="contact">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-12 lg:col-span-6 pr-0 lg:pr-12">
            <div className="flex items-center space-x-3 mb-5">
              <Image 
                src="/whale-logo-white.png" 
                alt="Whale Logo" 
                width={40} 
                height={40} 
                className="mix-blend-screen object-contain w-auto h-8 opacity-90"
              />
              <span className="text-2xl font-bold tracking-tight text-white">WHALE</span>
            </div>
            <p className="max-w-sm text-base leading-relaxed mb-8 text-gray-400">
              Private, premium OTC trading for USDT and SOL.
            </p>
            <div>
              <p className="text-gray-500 font-bold mb-3 tracking-widest uppercase text-[10px]">Supported Assets</p>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-gray-900/80 rounded-lg border border-gray-800 text-xs font-semibold text-gray-300">USDT</span>
                <span className="px-3 py-1.5 bg-gray-900/80 rounded-lg border border-gray-800 text-xs font-semibold text-gray-300">SOL</span>
                <span className="px-3 py-1.5 bg-gray-900/80 rounded-lg border border-gray-800 text-xs font-semibold text-gray-300">NGN</span>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="col-span-1 md:col-span-6 lg:col-span-3">
            <h4 className="text-white font-bold mb-5 tracking-widest uppercase text-[10px]">Trade</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How We Work</a>
              </li>
              <li>
                <a href="#market" className="text-gray-400 hover:text-white transition-colors">Market</a>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-6 lg:col-span-3">
            <h4 className="text-white font-bold mb-5 tracking-widest uppercase text-[10px]">Support</h4>
            <div className="mt-2">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-gray-950 px-5 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all w-full sm:w-auto shadow-sm">
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

        </div>

        {/* Trust & Disclaimer Section */}
        <div className="border-t border-gray-800/60 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="text-xs font-medium text-gray-500 order-2 md:order-1">
            &copy; {new Date().getFullYear()} WHALE. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-500 max-w-xl text-left md:text-right leading-relaxed order-1 md:order-2">
            Cryptocurrency trading involves significant risk. WHALE acts as an OTC trading facilitator and does not provide financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
