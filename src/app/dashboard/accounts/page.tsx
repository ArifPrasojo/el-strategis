import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AccountForm from './AccountForm';
import AccountList from './AccountList';

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Manajemen Akun</h1>
        <p className="text-sm text-neutral-400">Tambah dan kelola rekening bank, dompet digital, atau uang tunai Anda.</p>
      </div>

      {/* Form shown at top on mobile, sidebar on desktop */}
      <div className="block lg:hidden">
        <AccountForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AccountList accounts={accounts} />
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <AccountForm />
          </div>
        </div>
      </div>
    </div>
  );
}
