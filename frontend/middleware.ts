import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_ADMIN = ['/admin-dashboard'];
const PROTECTED_USER  = ['/user-dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = PROTECTED_ADMIN.some((p) => pathname.startsWith(p));
  const isUserRoute  = PROTECTED_USER.some((p) => pathname.startsWith(p));

  if (!isAdminRoute && !isUserRoute) {
    return NextResponse.next();
  }

  // Read token from cookie (set at login) or Authorization header
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT payload without verifying (verification happens in the API)
  // Edge runtime doesn't have Node crypto so we skip verify here and rely on the API.
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) throw new Error('malformed token');

    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson) as { role?: string; exp?: number };

    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      return response;
    }

    const role = payload.role;

    // Role-based route guard
    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/user-dashboard', request.url));
    }

    if (isUserRoute && role !== 'user') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/admin-dashboard/:path*', '/user-dashboard/:path*'],
};
