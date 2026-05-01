'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Loader2, CheckCircle2, LogIn, AlertCircle } from 'lucide-react';
import { submitFeedback, checkUserFeedback } from './page-actions';
import Link from 'next/link';

interface FeedbackButtonProps {
  isLoggedIn: boolean;
}

export default function FeedbackButton({ isLoggedIn }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already_submitted'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const MAX_CHARS = 500;

  const handleOpen = async () => {
    setIsOpen(true);
    if (isLoggedIn && status === 'idle') {
      const { hasSubmitted } = await checkUserFeedback();
      if (hasSubmitted) setStatus('already_submitted');
    }
  };

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
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (status === 'error') setStatus('idle');
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 group"
      >
        <MessageSquare className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
        <span className="font-medium text-sm">Beri Masukan</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-neutral-100">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Saran & Masukan
              </h3>
              <button onClick={handleClose} className="text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest View */}
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
                  <Link href="/login" onClick={handleClose}
                    className="flex-1 text-center py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium transition-colors">
                    Masuk
                  </Link>
                  <Link href="/dashboard" onClick={handleClose}
                    className="flex-1 text-center py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium border border-neutral-700 transition-colors">
                    Daftar
                  </Link>
                </div>
              </div>
            )}

            {/* Already submitted */}
            {isLoggedIn && status === 'already_submitted' && (
              <div className="py-6 text-center flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                </div>
                <h4 className="text-lg font-medium text-white">Sudah Memberi Masukan</h4>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Anda hanya dapat memberikan <strong className="text-amber-400">1 masukan</strong> per akun. Terima kasih atas partisipasi Anda!
                </p>
                <button onClick={handleClose}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium border border-neutral-700 transition-colors">
                  Tutup
                </button>
              </div>
            )}

            {/* Success */}
            {isLoggedIn && status === 'success' && (
              <div className="py-8 text-center flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                <h4 className="text-xl font-medium text-white mb-2">Terima Kasih!</h4>
                <p className="text-neutral-400">Masukan Anda telah berhasil dikirim dan akan ditampilkan di halaman ini.</p>
                <button onClick={handleClose}
                  className="mt-5 px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium transition-colors">
                  Tutup
                </button>
              </div>
            )}

            {/* Form */}
            {isLoggedIn && (status === 'idle' || status === 'loading' || status === 'error') && (
              <form onSubmit={handleSubmit}>
                {/* Peringatan 1 masukan */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-amber-300 text-xs leading-relaxed">
                    Setiap akun hanya dapat memberikan <strong>1 masukan</strong>. Pastikan saran Anda sudah tepat sebelum mengirim.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Bagaimana pengalaman Anda? Ada fitur yang kurang?
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Ketik saran atau masukan Anda di sini..."
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white min-h-[120px] resize-none"
                    disabled={status === 'loading'}
                    required
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${message.length >= MAX_CHARS ? 'text-red-400' : 'text-neutral-600'}`}>
                      {message.length}/{MAX_CHARS}
                    </span>
                  </div>
                </div>

                {status === 'error' && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-red-300 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={handleClose}
                    className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    disabled={status === 'loading'}>
                    Batal
                  </button>
                  <button type="submit"
                    disabled={status === 'loading' || !message.trim()}
                    className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
