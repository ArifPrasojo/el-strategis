import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Pengaturan</h1>
        <p className="text-sm text-neutral-400">Kelola profil dan preferensi akun El Strategis Anda.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Info */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-6">Informasi Profil</h2>
          <SettingsForm name={dbUser?.name || ''} email={user.email || ''} userId={user.id} />
        </div>

        {/* Account Info */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-4">Informasi Akun</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-neutral-800">
              <span className="text-sm text-neutral-400">Email</span>
              <span className="text-sm font-medium text-neutral-200">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-neutral-800">
              <span className="text-sm text-neutral-400">Bergabung sejak</span>
              <span className="text-sm font-medium text-neutral-200" suppressHydrationWarning>
                {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-neutral-400">Status Akun</span>
              <span className="px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full">Aktif</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/40">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Zona Berbahaya</h2>
          <p className="text-sm text-neutral-500 mb-4">Keluar dari semua sesi aktif Anda.</p>
          <form action="/auth/signout" method="post">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-red-400 border border-red-500/40 rounded-xl hover:bg-red-500/10 transition-colors">
              Keluar dari akun
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
