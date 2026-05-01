'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ─── Daftar kata tidak pantas (bahasa Indonesia & Inggris) ────────────────────
const KATA_TIDAK_PANTAS = [
  // Indonesia
  'anjing', 'bangsat', 'brengsek', 'bajingan', 'keparat', 'babi',
  'kontol', 'memek', 'ngentot', 'jancok', 'asu', 'celeng', 'goblok',
  'tolol', 'bodoh', 'idiot', 'sialan', 'kampret', 'kurang ajar',
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'bastard',
];

function mengandungKataTidakPantas(text: string): string | null {
  const lower = text.toLowerCase();
  for (const kata of KATA_TIDAK_PANTAS) {
    if (lower.includes(kata)) return kata;
  }
  return null;
}

// ─── Cek apakah user sudah pernah memberi masukan ────────────────────────────
export async function checkUserFeedback(): Promise<{ hasSubmitted: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { hasSubmitted: false };

  const existing = await prisma.feedback.findFirst({
    where: { userId: user.id },
  });

  return { hasSubmitted: !!existing };
}

// ─── Submit masukan ────────────────────────────────────────────────────────────
export async function submitFeedback(message: string) {
  // Validasi panjang
  if (!message || message.trim().length < 5) {
    return { error: 'Masukan terlalu pendek. Mohon jelaskan lebih detail.' };
  }

  if (message.trim().length > 500) {
    return { error: 'Masukan terlalu panjang. Maksimal 500 karakter.' };
  }

  // Validasi kata tidak pantas
  const kataTemuan = mengandungKataTidakPantas(message);
  if (kataTemuan) {
    return { error: `Masukan mengandung kata yang tidak pantas. Mohon gunakan bahasa yang sopan.` };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Anda harus login untuk memberikan masukan.' };
  }

  // Cek batas 1 masukan per user
  const existing = await prisma.feedback.findFirst({
    where: { userId: user.id },
  });

  if (existing) {
    return { error: 'Anda sudah pernah memberikan masukan sebelumnya. Terima kasih atas partisipasi Anda!' };
  }

  try {
    await prisma.feedback.create({
      data: {
        message: message.trim(),
        userId: user.id,
      }
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Feedback error:', error);
    return { error: 'Gagal mengirim masukan. Silakan coba lagi.' };
  }
}

