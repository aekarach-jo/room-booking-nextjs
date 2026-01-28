import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge, type JwtPayload } from './lib/auth-edge';

// Routes that require authentication
const protectedRoutes = [
  '/bookings',
  '/calendar',
  '/history',
  '/recurring',
  '/announcements',
  '/notifications',
  '/profile',
  '/settings',
];

// Routes that require admin role (STAFF or DEPARTMENT_HEAD)
const adminRoutes = [
  '/admin',
  '/approval',
  '/rooms',
  '/users',
  '/semesters',
  '/special-dates',
];

// Routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Check if it's an API route
  if (pathname.startsWith('/api/')) {
    // Allow auth routes without token
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
      return NextResponse.next();
    }

    // For other API routes, verify token
    const authHeader = request.headers.get('authorization');
    const apiToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : token;

    if (!apiToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyTokenEdge(apiToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check admin routes
    if (pathname.includes('/api/users') && request.method !== 'GET') {
      if (!['STAFF', 'DEPARTMENT_HEAD'].includes(payload.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.next();
  }

  // Handle auth routes (login/register)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      const payload = await verifyTokenEdge(token);
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // Handle protected routes (including root path)
  const isProtectedRoute = pathname === '/' || protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyTokenEdge(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // Check admin access
    if (isAdminRoute && !['STAFF', 'DEPARTMENT_HEAD'].includes(payload.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
