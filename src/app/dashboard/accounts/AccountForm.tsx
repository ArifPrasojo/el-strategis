'use client';

import { useState } from 'react';
import { createAccount } from './actions';
import { Wallet, Plus, Loader2 } from 'lucide-react';

export default function AccountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState('');

  const formatRupiah = (value: string | number) => {
    if (!value) return '';
    const numberString = value.toString().replace(/\D/g, '');
    if (!numberString) return '';
    return new Intl.NumberFormat('id-ID').format(Number(numberString));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('balance', balance);
    const result = await createAccount(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      (e.target as HTMLFormElement).reset();
      setBalance('');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-emerald-500" />
        </div>
        <h2 className="text-xl font-semibold">Tambah Akun Baru</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Nama Akun</label>
          <input name="name" type="text" placeholder="Contoh: BCA, OVO, Uang Tunai" required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Saldo Awal</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-sm text-neutral-500 font-medium">Rp</span>
            <input name="balance" type="text" inputMode="numeric" placeholder="0"
              value={balance ? formatRupiah(balance) : ''}
              onChange={(e) => setBalance(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
          </div>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-neutral-950 font-semibold rounded-xl px-4 py-3 hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {isLoading ? 'Menyimpan...' : 'Buat Akun'}
        </button>
      </form>
    </div>
  );
}
