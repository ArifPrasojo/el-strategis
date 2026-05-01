'use client';

import { useState } from 'react';
import { deleteAccount, updateAccount } from './actions';
import { Trash2, Wallet, Loader2, Edit3, X, Check } from 'lucide-react';
import { Account } from '@prisma/client';

export default function AccountList({ accounts }: { accounts: Account[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini? Semua transaksi terkait juga akan dihapus.')) return;
    setDeletingId(id);
    const formData = new FormData();
    formData.append('id', id);
    await deleteAccount(formData);
    setDeletingId(null);
  };

  const startEdit = (account: Account) => {
    setEditingId(account.id);
    setEditName(account.name);
    setEditBalance(account.balance.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditBalance('');
  };

  const handleUpdate = async (id: string) => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', editName);
    formData.append('balance', editBalance);
    await updateAccount(formData);
    setIsUpdating(false);
    setEditingId(null);
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
          {editingId === account.id ? (
            <div className="w-full flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 space-y-2 w-full">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Nama Akun"
                />
                <input
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Saldo"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleUpdate(account.id)} disabled={isUpdating} className="p-3 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors">
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                </button>
                <button onClick={cancelEdit} disabled={isUpdating} className="p-3 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <>
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
              
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <div className="text-2xl font-bold text-emerald-400">{fmt(account.balance)}</div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(account)} className="p-3 text-neutral-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors" title="Edit Akun">
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(account.id)} disabled={deletingId === account.id} className="p-3 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50" title="Hapus Akun">
                    {deletingId === account.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
