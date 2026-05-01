'use client';

import { useState } from 'react';
import { updateProfile } from './actions';
import { User, Loader2, CheckCircle } from 'lucide-react';

export default function SettingsForm({ name, email, userId }: { name: string; email: string; userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="userId" value={userId} />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Profil berhasil diperbarui!
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
          <User className="w-8 h-8 text-neutral-950" />
        </div>
        <div>
          <p className="font-semibold text-neutral-200">{name || 'User'}</p>
          <p className="text-sm text-neutral-500">{email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">Nama Tampilan</label>
        <input
          name="name"
          type="text"
          defaultValue={name}
          placeholder="Masukkan nama Anda"
          required
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
        />
        <p className="text-xs text-neutral-600">Email tidak dapat diubah melalui halaman ini.</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-neutral-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
