import React from 'react';
import { Zap, Eye, Fingerprint, MessageCircle } from 'lucide-react';

const trustPoints = [
  {
    icon: <Zap className="h-6 w-6 text-blue-600" />,
    title: 'Simple OTC Process',
    desc: 'Bypass complex exchange interfaces. Deal directly with WHALE.'
  },
  {
    icon: <Eye className="h-6 w-6 text-blue-600" />,
    title: 'Transparent Quotes',
    desc: 'Clear, competitive pricing with no hidden spread markups at execution.'
  },
  {
    icon: <Fingerprint className="h-6 w-6 text-blue-600" />,
    title: 'Manual Verification',
    desc: 'Every transaction is manually verified by our team for your security.'
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-blue-600" />,
    title: 'Direct Support',
    desc: 'Speak directly to a human operator via WhatsApp throughout your trade.'
  }
];

export default function TrustSection() {
  return (
    <section className="py-24 bg-white border-t border-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Why Trade With Us</h2>
          <p className="text-lg text-gray-600">A premium experience built on transparency and personal service.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {trustPoints.map((point, index) => (
            <div key={index} className="flex flex-col items-start p-8 bg-white border border-gray-100 rounded-3xl hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="h-12 w-12 bg-blue-50/50 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-blue-100/50 mb-6">
                {point.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">{point.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
