'use client';

import { useState } from 'react';
import { deleteTransaction, updateTransaction } from './actions';
import { Trash2, ArrowLeftRight, Loader2, ArrowUpRight, ArrowDownRight, Edit3, X, Check } from 'lucide-react';
import { Transaction, Category, Account, Wishlist } from '@prisma/client';

type TransactionWithRelations = Transaction & { category: Category | null; account: Account; };

export default function TransactionList({ transactions, accounts, categories, wishlist = [] }: { transactions: TransactionWithRelations[], accounts: Account[], categories: Category[], wishlist?: Wishlist[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit states
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('EXPENSE');
  const [editDate, setEditDate] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAccount, setEditAccount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editWishlist, setEditWishlist] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini? Saldo akun akan dikembalikan ke semula.')) return;
    setDeletingId(id);
    const formData = new FormData();
    formData.append('id', id);
    await deleteTransaction(formData);
    setDeletingId(null);
  };

  const startEdit = (tx: TransactionWithRelations) => {
    setEditingId(tx.id);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditDate(new Date(tx.date).toISOString().split('T')[0]);
    setEditDesc(tx.description || '');
    setEditAccount(tx.accountId);
    setEditCategory(tx.categoryId || '');
    setEditWishlist(tx.wishlistId || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: string) => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('id', id);
    formData.append('amount', editAmount);
    formData.append('type', editType);
    formData.append('date', editDate);
    formData.append('description', editDesc);
    formData.append('accountId', editAccount);
    if (editCategory) formData.append('categoryId', editCategory);
    if (editWishlist) formData.append('wishlistId', editWishlist);
    
    await updateTransaction(formData);
    setIsUpdating(false);
    setEditingId(null);
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

  const filteredCategories = categories.filter(c => c.type === editType);

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isIncome = tx.type === 'INCOME';
        return (
          <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-blue-500/30 transition-colors">
            {editingId === tx.id ? (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <select value={editType} onChange={(e) => { setEditType(e.target.value); setEditCategory(''); }} className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="EXPENSE">Pengeluaran</option>
                    <option value="INCOME">Pemasukan</option>
                  </select>
                  <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="Jumlah" className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Keterangan" className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select value={editAccount} onChange={(e) => setEditAccount(e.target.value)} className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">-- Pilih Akun --</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">-- Tanpa Kategori --</option>
                    {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <select value={editWishlist} onChange={(e) => setEditWishlist(e.target.value)} className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500">
                    <option value="">-- Tanpa Wishlist --</option>
                    {wishlist.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleUpdate(tx.id)} disabled={isUpdating} className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl transition-colors flex items-center justify-center w-12">
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  </button>
                  <button onClick={cancelEdit} disabled={isUpdating} className="p-2.5 bg-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center w-12">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(tx)} className="p-2.5 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tx.id)} disabled={deletingId === tx.id}
                      className="p-2.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50" title="Hapus">
                      {deletingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
