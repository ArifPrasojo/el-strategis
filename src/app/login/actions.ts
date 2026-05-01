'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string || 'User'
  
  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Create user in Prisma DB as well to maintain relations
  if (data.user) {
    try {
      await prisma.user.create({
        data: {
          id: data.user.id, // Match Supabase User ID
          email: data.user.email!,
          name: name,
          password: 'supabase-auth-placeholder' // Password managed by Supabase
        }
      })
    } catch (err) {
      console.error('Error creating user in Prisma:', err)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
