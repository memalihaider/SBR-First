import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MockJWTUtils, canAccessRoute, PUBLIC_ROUTES } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from cookie or Authorization header
  const tokenFromCookie = request.cookies.get('auth-token')?.value;
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  const token = tokenFromCookie || tokenFromHeader;

  // No token - redirect to login
  if (!token) {
    console.log(`[Middleware] No token found for ${pathname}, redirecting to login`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Verify token
  const payload = MockJWTUtils.verifyToken(token);
  if (!payload) {
    console.log(`[Middleware] Invalid token for ${pathname}, redirecting to login`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Check if user can access this route
  if (!canAccessRoute(payload.role, pathname)) {
    console.log(`[Middleware] User role ${payload.role} cannot access ${pathname}`);
    
    // Redirect to appropriate portal based on role
    const redirectMap: Record<string, string> = {
      super_admin: '/admin/dashboard',
      sales_manager: '/sales/dashboard',
      sales_rep: '/sales/leads',
      inventory_manager: '/inventory/dashboard',
      project_manager: '/project/dashboard',
      finance_manager: '/finance/dashboard',
      client: '/client/projects',
      vendor: '/vendor/orders',
      hr_manager: '/hr/dashboard',
      employee: '/employee/dashboard',
    };
    
    const redirectPath = redirectMap[payload.role] || '/auth/login';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // User is authenticated and authorized
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
