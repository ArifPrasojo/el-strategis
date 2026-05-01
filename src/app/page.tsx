import Link from 'next/link';
import { ArrowRight, Wallet, PieChart, Activity, Shield, MessageSquare, Quote } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import FeedbackButton from './FeedbackButton';
import prisma from '@/lib/prisma';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Ambil 6 masukan terbaru untuk ditampilkan
  const feedbacks = await prisma.feedback.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-neutral-950" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">El Strategis</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Demo</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Masuk
              </Link>
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium bg-white text-neutral-950 rounded-full hover:bg-neutral-200 transition-colors">
                Mulai Sekarang
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium bg-emerald-500 text-neutral-950 rounded-full hover:bg-emerald-400 transition-colors">
              Ke Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Kelola keuangan Anda dengan <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              El Strategis
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ekosistem keuangan pribadi yang komprehensif untuk mencatat transaksi, mengelola anggaran, dan mencapai tujuan finansial Anda dengan wawasan yang jernih.
          </p>
          <div className="flex items-center justify-center gap-4 flex-col sm:flex-row">
            <Link href="/dashboard" className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-neutral-950 font-semibold rounded-full hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95">
              Ke Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Activity className="w-6 h-6 text-emerald-400" />,
                title: "Pelacakan Real-time",
                description: "Catat pemasukan dan pengeluaran Anda secara instan dengan kategorisasi cerdas."
              },
              {
                icon: <PieChart className="w-6 h-6 text-emerald-400" />,
                title: "Anggaran Pintar",
                description: "Tetapkan anggaran untuk berbagai kategori dan dapatkan peringatan sebelum Anda belanja berlebihan."
              },
              {
                icon: <Shield className="w-6 h-6 text-emerald-400" />,
                title: "Keamanan Standar Bank",
                description: "Data keuangan Anda dienkripsi dan disimpan dengan aman menggunakan standar terbaru."
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 hover:border-emerald-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-neutral-800/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback / Testimonials Section */}
        {feedbacks.length > 0 && (
          <div className="max-w-6xl mx-auto px-6 py-12 mb-24 border-t border-neutral-800">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Masukan & Saran Pengguna</h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">Mendengarkan suara pengguna untuk menjadikan El Strategis lebih baik setiap harinya.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50 relative">
                  <Quote className="w-8 h-8 text-neutral-800 absolute top-4 right-4" />
                  <p className="text-neutral-300 mb-6 relative z-10 leading-relaxed">
                    "{fb.message}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold uppercase">
                      {fb.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-200">{fb.user.name}</p>
                      <p className="text-xs text-neutral-500">{new Date(fb.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Feedback Component - always visible */}
      <FeedbackButton isLoggedIn={!!user} />
    </div>
  );
}
