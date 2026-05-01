'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Loader2, CheckCircle2, LogIn } from 'lucide-react';
import { submitFeedback } from './page-actions';
import Link from 'next/link';

interface FeedbackButtonProps {
  isLoggedIn: boolean;
}

export default function FeedbackButton({ isLoggedIn }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    const result = await submitFeedback(message);

    if (result.error) {
      setStatus('error');
      setErrorMessage(result.error);
    } else {
      setStatus('success');
      setMessage('');
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => setStatus('idle'), 300);
      }, 2000);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 group"
      >
        <MessageSquare className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
        <span className="font-medium text-sm">Beri Masukan</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-neutral-100">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Saran & Masukan
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest View - Not logged in */}
            {!isLoggedIn && (
              <div className="py-6 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">Login untuk Memberi Masukan</h4>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Masukan Anda sangat berharga bagi kami! Silakan login atau daftar terlebih dahulu agar kami tahu siapa Anda.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium border border-neutral-700 transition-colors"
                  >
                    Daftar
                  </Link>
                </div>
              </div>
            )}

            {/* Logged in - success state */}
            {isLoggedIn && status === 'success' && (
              <div className="py-8 text-center flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                <h4 className="text-xl font-medium text-white mb-2">Terima Kasih!</h4>
                <p className="text-neutral-400">Masukan Anda telah berhasil dikirim dan akan sangat membantu kami.</p>
              </div>
            )}

            {/* Logged in - form state */}
            {isLoggedIn && status !== 'success' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Bagaimana pengalaman Anda? Ada fitur yang kurang?
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ketik saran atau masukan Anda di sini..."
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white min-h-[120px] resize-none"
                    disabled={status === 'loading'}
                    required
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-sm mb-4 px-2">{errorMessage}</p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    disabled={status === 'loading'}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'loading' || !message.trim()}
                    className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Kirim
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
