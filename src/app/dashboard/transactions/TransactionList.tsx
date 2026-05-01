'use client';

import { useState } from 'react';
import { deleteTransaction } from './actions';
import { Trash2, ArrowLeftRight, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction, Category, Account } from '@prisma/client';

type TransactionWithRelations = Transaction & { category: Category | null; account: Account; };

export default function TransactionList({ transactions }: { transactions: TransactionWithRelations[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini? Saldo akun akan dikembalikan ke semula.')) return;
    setDeletingId(id);
    const formData = new FormData();
    formData.append('id', id);
    await deleteTransaction(formData);
    setDeletingId(null);
  };

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  if (transactions.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
          <ArrowLeftRight className="w-8 h-8 text-neutral-500" />
        </div>
        <h3 className="text-xl font-medium text-neutral-300 mb-2">Belum ada transaksi</h3>
        <p className="text-neutral-500">Catat pemasukan atau pengeluaran pertama Anda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isIncome = tx.type === 'INCOME';
        return (
          <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-3 sm:mb-0">
              <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-neutral-200 truncate">{tx.description || tx.category?.name || 'Tanpa Kategori'}</h3>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-800">{tx.account.name}</span>
                  {tx.category && <span>• {tx.category.name}</span>}
                  <span suppressHydrationWarning>• {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className={`text-lg font-bold ${isIncome ? 'text-emerald-400' : 'text-neutral-200'}`}>
                {isIncome ? '+' : '-'}{fmt(tx.amount)}
              </div>
              <button onClick={() => handleDelete(tx.id)} disabled={deletingId === tx.id}
                className="p-2.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50" title="Hapus">
                {deletingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
