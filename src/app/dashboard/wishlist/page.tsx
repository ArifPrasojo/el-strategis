import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import WishlistForm from './WishlistForm';
import WishlistList from './WishlistList';

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Wishlist</h1>
        <p className="text-sm text-neutral-400">Daftar keinginan Anda dan progres tabungan untuk mencapainya.</p>
      </div>

      <div className="block lg:hidden">
        <WishlistForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WishlistList wishlist={wishlist} />
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <WishlistForm />
          </div>
        </div>
      </div>
    </div>
  );
}
