import React from 'react';
import { MousePointerClick, Calculator, Wallet, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Request a Trade',
    desc: 'Select BUY or SELL and choose your preferred crypto asset.',
    icon: MousePointerClick
  },
  {
    num: '02',
    title: 'Get Your Quote',
    desc: 'Enter the amount to receive a real-time indicative exchange rate.',
    icon: Calculator
  },
  {
    num: '03',
    title: 'Make Payment',
    desc: 'Receive our secure payment instructions and transfer the funds.',
    icon: Wallet
  },
  {
    num: '04',
    title: 'Receive Crypto',
    desc: 'We manually verify the transaction and settle your crypto immediately.',
    icon: CheckCircle2
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold tracking-widest mb-6 uppercase">
            <span>004</span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <span>Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">How We Work</h2>
          <p className="text-lg text-gray-500 leading-relaxed font-medium">
            A proven process designed to make OTC crypto trading straightforward, secure, and incredibly fast.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative flex flex-col items-center w-full">
          {/* Central Line */}
          <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-blue-200 via-gray-200 to-gray-100 hidden md:block" />

          {steps.map((step, index) => {
            const isEven = index % 2 === 1;
            const Icon = step.icon;
            const isFirst = index === 0;

            return (
              <div key={step.num} className={`relative w-full flex flex-col md:flex-row items-center justify-between mb-8 md:mb-4 py-8 px-6 md:px-12 transition-all ${isFirst ? 'bg-gray-50/80 rounded-[40px]' : ''}`}>
                
                {/* Left Side (Desktop) */}
                <div className="hidden md:flex w-1/2 justify-end pr-16">
                  {!isEven ? (
                    <div className="flex items-center space-x-8">
                      <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center shadow-sm border ${isFirst ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
                        <Icon className="w-8 h-8" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-bold text-gray-400">{step.num}</span>
                    </div>
                  ) : (
                    <div className="text-right max-w-xs">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm font-medium">{step.desc}</p>
                    </div>
                  )}
                </div>

                {/* Center Node (Desktop) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center">
                  {isFirst ? (
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_12px_3px_rgba(37,99,235,0.3)]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                    </div>
                  )}
                </div>

                {/* Right Side (Desktop) */}
                <div className="hidden md:flex w-1/2 justify-start pl-16">
                  {isEven ? (
                    <div className="flex items-center space-x-8">
                      <span className="text-sm font-bold text-gray-400">{step.num}</span>
                      <div className="w-20 h-20 rounded-[24px] bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-900">
                        <Icon className="w-8 h-8" strokeWidth={1.5} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-left max-w-xs">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm font-medium">{step.desc}</p>
                    </div>
                  )}
                </div>

                {/* Mobile View */}
                <div className="md:hidden flex flex-col items-center text-center space-y-6 w-full">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-bold text-gray-400">{step.num}</span>
                    <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center shadow-sm border ${isFirst ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
                      <Icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm font-medium">{step.desc}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
