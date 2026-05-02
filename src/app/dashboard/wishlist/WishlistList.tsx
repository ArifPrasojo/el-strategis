'use client';

import { useState } from 'react';
import { deleteWishlistItem, updateWishlistItem } from './actions';
import { Trash2, Heart, Loader2, CheckCircle, Edit3, X, Check, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Wishlist, Transaction, Account, Category } from '@prisma/client';

type WishlistWithTransactions = Wishlist & {
  transactions: (Transaction & { account: Account; category: Category | null })[];
};

export default function WishlistList({ wishlist }: { wishlist: WishlistWithTransactions[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [detailItem, setDetailItem] = useState<WishlistWithTransactions | null>(null);

  const formatRupiah = (value: string | number) => {
    if (!value) return '';
    const numberString = value.toString().replace(/\D/g, '');
    if (!numberString) return '';
    return new Intl.NumberFormat('id-ID').format(Number(numberString));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus item wishlist ini?')) return;
    setDeletingId(id);
    const formData = new FormData();
    formData.append('id', id);
    await deleteWishlistItem(formData);
    setDeletingId(null);
  };

  const startEdit = (item: WishlistWithTransactions) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditTargetAmount(item.targetAmount.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditTargetAmount('');
  };

  const handleUpdate = async (id: string) => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', editName);
    formData.append('targetAmount', editTargetAmount);
    await updateWishlistItem(formData);
    setIsUpdating(false);
    setEditingId(null);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  if (wishlist.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-neutral-500" />
        </div>
        <h3 className="text-xl font-medium text-neutral-300 mb-2">Wishlist masih kosong</h3>
        <p className="text-neutral-500">Mulai catat barang impian Anda dan pantau tabungannya.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishlist.map((item) => {
          const percentage = Math.min((item.savedAmount / item.targetAmount) * 100, 100);
          const isComplete = percentage >= 100;

          return (
            <div key={item.id} className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-pink-500/30 transition-colors">
              {editingId === item.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                      placeholder="Nama Wishlist"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-neutral-500 font-medium">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editTargetAmount ? formatRupiah(editTargetAmount) : ''}
                        onChange={(e) => setEditTargetAmount(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                        placeholder="Target Harga"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(item.id)}
                      disabled={isUpdating}
                      className="p-2.5 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 rounded-xl transition-colors flex-1 flex justify-center items-center"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isUpdating}
                      className="p-2.5 bg-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex-1 flex justify-center items-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-emerald-500/10 text-emerald-500' : 'bg-pink-500/10 text-pink-500'}`}>
                        {isComplete ? <CheckCircle className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-200">{item.name}</h3>
                        <p className="text-xs text-neutral-500">Target: {fmt(item.targetAmount)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="p-2 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Lihat Transaksi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 text-neutral-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Hapus"
                      >
                        {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-pink-500'} rounded-full transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-500">Tabungan (Otomatis)</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-neutral-100">{fmt(item.savedAmount)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${isComplete ? 'text-emerald-400' : 'text-pink-400'}`}>
                        {percentage.toFixed(0)}%
                      </p>
                      {!isComplete && (
                        <p className="text-[10px] text-neutral-500 italic">Sisa {fmt(item.targetAmount - item.savedAmount)}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Transaction Detail Modal */}
      {detailItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setDetailItem(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 text-center rounded-t-2xl ${detailItem.savedAmount >= detailItem.targetAmount ? 'bg-emerald-500/10' : 'bg-pink-500/10'}`}>
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${detailItem.savedAmount >= detailItem.targetAmount ? 'bg-emerald-500/20 text-emerald-400' : 'bg-pink-500/20 text-pink-400'}`}>
                {detailItem.savedAmount >= detailItem.targetAmount ? <CheckCircle className="w-8 h-8" /> : <Heart className="w-8 h-8" />}
              </div>
              <h2 className="text-xl font-bold text-neutral-200">{detailItem.name}</h2>
              <p className="text-neutral-400 text-sm mt-1">
                Terkumpul {fmt(detailItem.savedAmount)} dari {fmt(detailItem.targetAmount)}
              </p>
              {/* Progress bar in modal */}
              <div className="mt-4 h-2 w-full bg-neutral-800/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${detailItem.savedAmount >= detailItem.targetAmount ? 'bg-emerald-500' : 'bg-pink-500'} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min((detailItem.savedAmount / detailItem.targetAmount) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Transaction list */}
            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                Riwayat Transaksi ({detailItem.transactions.length})
              </h3>

              {detailItem.transactions.length > 0 ? (
                <div className="space-y-3">
                  {detailItem.transactions.map((tx) => (
                    <div key={tx.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {tx.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-200 truncate">
                            {tx.description || tx.category?.name || 'Tanpa Kategori'}
                          </p>
                          <p className="text-xs text-neutral-500" suppressHydrationWarning>
                            {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {tx.account.name}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-bold shrink-0 ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-neutral-200'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-neutral-500 text-sm">
                  <Heart className="w-10 h-10 mx-auto mb-3 text-neutral-700" />
                  <p>Belum ada transaksi yang terhubung ke wishlist ini.</p>
                  <p className="text-xs mt-1 text-neutral-600">Hubungkan transaksi ke wishlist ini saat mencatat pemasukan.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 shrink-0">
              <button
                onClick={() => setDetailItem(null)}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
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
