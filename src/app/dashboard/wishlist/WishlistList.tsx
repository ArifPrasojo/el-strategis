'use client';

import { useState } from 'react';
import { deleteWishlistItem, updateWishlistItem } from './actions';
import { Trash2, Heart, Loader2, CheckCircle, Edit3, X, Check } from 'lucide-react';
import { Wishlist } from '@prisma/client';

export default function WishlistList({ wishlist }: { wishlist: Wishlist[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus item wishlist ini?')) return;
    setDeletingId(id);
    const formData = new FormData();
    formData.append('id', id);
    await deleteWishlistItem(formData);
    setDeletingId(null);
  };

  const startEdit = (item: Wishlist) => {
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

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

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
                  <input
                    type="number"
                    value={editTargetAmount}
                    onChange={(e) => setEditTargetAmount(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                    placeholder="Target Harga"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(item.id)} disabled={isUpdating} className="p-2.5 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 rounded-xl transition-colors flex-1 flex justify-center items-center">
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  </button>
                  <button onClick={cancelEdit} disabled={isUpdating} className="p-2.5 bg-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex-1 flex justify-center items-center">
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
                    <button onClick={() => startEdit(item)} className="p-2 text-neutral-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50" title="Hapus">
                      {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden mb-4">
                  <div className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-pink-500'} rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }} />
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500">Tabungan (Otomatis)</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-neutral-100">{fmt(item.savedAmount)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black ${isComplete ? 'text-emerald-400' : 'text-pink-400'}`}>{percentage.toFixed(0)}%</p>
                    {!isComplete && <p className="text-[10px] text-neutral-500 italic">Sisa {fmt(item.targetAmount - item.savedAmount)}</p>}
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
