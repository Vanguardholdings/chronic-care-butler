import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['zh', 'en'];
const defaultLocale = 'zh';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

// Paths that don't require authentication
const publicPathPatterns = ['/login', '/register', '/api', '/'];

function isPublicPath(pathname: string): boolean {
  // Strip locale prefix if present
  const strippedPath = pathname.replace(/^\/(zh|en)/, '') || '/';
  return publicPathPatterns.some(p => strippedPath === p || strippedPath.startsWith(p + '/'));
}

function isDashboardPath(pathname: string): boolean {
  const strippedPath = pathname.replace(/^\/(zh|en)/, '') || '/';
  return strippedPath.startsWith('/dashboard') || 
         strippedPath.startsWith('/patients') || 
         strippedPath.startsWith('/medications') ||
         strippedPath.startsWith('/settings') ||
         strippedPath.startsWith('/appointments') ||
         strippedPath.startsWith('/reports');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Let intl middleware handle locale routing first
  const response = intlMiddleware(request);
  
  // Check for auth token in cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Protect dashboard routes at middleware level
  if (isDashboardPath(pathname) && !token) {
    // Extract locale from path or use default
    const localeMatch = pathname.match(/^\/(zh|en)/);
    const locale = localeMatch ? localeMatch[1] : defaultLocale;
    const loginUrl = locale === defaultLocale 
      ? new URL('/login', request.url)
      : new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
