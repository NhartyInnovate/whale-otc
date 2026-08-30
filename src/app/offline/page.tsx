import React from 'react';
import Image from 'next/image';

export default function Offline() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <Image 
          src="/whale-logo-white.png" 
          alt="WHALE" 
          width={80} 
          height={80} 
          className="mix-blend-screen object-contain w-auto h-20 opacity-90 mx-auto"
        />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">You&apos;re offline</h1>
      <p className="text-gray-400 text-lg max-w-md">
        Please reconnect to the internet to continue using WHALE.
      </p>
    </div>
  );
}
