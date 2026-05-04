'use client';

import { useState } from 'react';
import { ScanLine, X, BotOff } from 'lucide-react';

export default function ReceiptScanner() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:text-violet-300 transition-all text-sm font-medium"
      >
        <ScanLine className="w-4 h-4" />
        Scan Resi
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl relative text-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-4 mt-2">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                <BotOff className="w-8 h-8 text-neutral-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                <p className="text-sm text-neutral-400 leading-relaxed italic">
                  "Coming Soon ya ges ya"
                </p>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
