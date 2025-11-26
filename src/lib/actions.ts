'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_TOKEN_COOKIE } from './constants';

export async function login(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;
  const ADMIN_PASSWORD = 'Admin2025';

  if (password === ADMIN_PASSWORD) {
    // Parol düzgündürsə, cookie təyin et
    cookies().set(AUTH_TOKEN_COOKIE, 'admin-logged-in', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 həftə
    });
    return { error: null };
  } else {
    // Parol səhvdirsə, xəta mesajı qaytar
    return { error: 'Parol yanlışdır.' };
  }
}

export async function logout() {
  cookies().delete(AUTH_TOKEN_COOKIE);
  redirect('/admin/login');
}
