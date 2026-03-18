import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PASSWORD = process.env.APP_PASSWORD || 'signalstrike2024';

export function middleware(request: NextRequest) {
  // Skip auth for API routes and static assets
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('yt_auth');
  if (authCookie?.value === PASSWORD) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
