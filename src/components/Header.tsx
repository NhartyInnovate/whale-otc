'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const WHATSAPP_LINK = "https://wa.me/2348085926282";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="absolute top-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="transition-transform group-hover:scale-105">
            <Image 
              src="/whale-logo.png" 
              alt="Whale Logo" 
              width={56} 
              height={40}
              className="object-contain w-auto h-10 mix-blend-multiply"
            />
          </div>
          <span className="text-[26px] font-bold tracking-tight text-gray-900">Whale</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10 text-sm font-semibold text-gray-600">
          <a href="#how-it-works" className="text-gray-900 hover:text-black transition-colors">How We Work</a>
          <a href="#market" className="text-gray-900 hover:text-black transition-colors">Market</a>
        </nav>

        <div className="hidden md:block">
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-gray-100 text-gray-900 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm">
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-gray-600" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 pt-2 pb-6 space-y-4 shadow-lg absolute w-full left-0">
          <a href="#how-it-works" className="block text-gray-900 font-semibold py-2" onClick={toggleMenu}>How We Work</a>
          <a href="#market" className="block text-gray-900 font-semibold py-2" onClick={toggleMenu}>Market</a>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-900 text-center px-5 py-3 rounded-xl font-semibold mt-4" onClick={toggleMenu}>
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
}
