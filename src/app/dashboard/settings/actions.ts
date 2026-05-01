'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

export async function updateProfile(formData: FormData) {
  const userId = formData.get('userId') as string
  const name = formData.get('name') as string

  if (!name || name.trim() === '') return { error: 'Nama tidak boleh kosong' }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() }
    })
    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Gagal memperbarui profil' }
  }
}
