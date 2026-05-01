'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitFeedback(message: string) {
  if (!message || message.trim().length < 5) {
    return { error: 'Masukan terlalu pendek. Mohon jelaskan lebih detail.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Anda harus login untuk memberikan masukan.' };
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
