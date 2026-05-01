'use client';

import { useState } from 'react';
import { login, signup } from './actions';
import { Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = isLogin ? await login(formData) : await signup(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col justify-center items-center p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-neutral-950" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">
          {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
        </h2>
        <p className="text-neutral-400 text-center mb-8 text-sm">
          {isLogin
            ? 'Masukkan kredensial Anda untuk mengakses dashboard El Strategis'
            : 'Bergabunglah dan mulai kelola keuangan Anda bersama El Strategis'}
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Nama Lengkap</label>
              <input name="name" type="text" placeholder="Budi Santoso" required={!isLogin}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Email</label>
            <input name="email" type="email" placeholder="anda@contoh.com" required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Kata Sandi</label>
            <input name="password" type="password" placeholder="••••••••" required minLength={6}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-neutral-950 font-semibold rounded-xl px-4 py-3 mt-2 hover:bg-emerald-400 transition-colors disabled:opacity-50">
            {isLoading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-400">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button type="button" onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            {isLogin ? 'Daftar sekarang' : 'Masuk'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
            &larr; Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
