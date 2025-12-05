import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Use a secret if defined, otherwise NextAuth v5 might handle it automatically if configured correctly,
  // but getToken usually needs it if not using the new auth() wrapper.
  // We'll assume NEXTAUTH_SECRET is in env.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();

  // 1. If not logged in and trying to access protected routes
  if (!token) {
    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/mobile')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // 1.5 Redirect root to dashboard (which handles role redirect)
  if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 2. If logged in and trying to access Login
  if (url.pathname === '/login') {
    if (token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/mobile/home', req.url));
    }
  }

  // 3. Role-based protection
  // Driver trying to access Admin Dashboard
  if (url.pathname.startsWith('/dashboard') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/mobile/home', req.url));
  }

  // Admin trying to access Mobile View
  if (url.pathname.startsWith('/mobile') && token.role === 'ADMIN') {
     return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/mobile/:path*', '/login'],
};
