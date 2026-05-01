'use client';

import { useState } from 'react';
import { deleteAccount } from './actions';
import { Trash2, Wallet, Loader2 } from 'lucide-react';
import { Account } from '@prisma/client';

export default function AccountList({ accounts }: { accounts: Account[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini? Semua transaksi terkait juga akan dihapus.')) return;
    setDeletingId(id);
    const formData = new FormData();
    formData.append('id', id);
    await deleteAccount(formData);
    setDeletingId(null);
  };

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  if (accounts.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-neutral-500" />
        </div>
        <h3 className="text-xl font-medium text-neutral-300 mb-2">Belum ada akun</h3>
        <p className="text-neutral-500">Buat akun pertama Anda untuk mulai melacak keuangan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <div key={account.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-emerald-500/30 transition-colors group">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{account.name}</h3>
              <p className="text-neutral-400 text-sm" suppressHydrationWarning>
                Dibuat pada {new Date(account.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
            <div className="text-2xl font-bold text-emerald-400">{fmt(account.balance)}</div>
            <button onClick={() => handleDelete(account.id)} disabled={deletingId === account.id}
              className="p-3 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50" title="Hapus Akun">
              {deletingId === account.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
