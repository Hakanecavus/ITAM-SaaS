import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded user files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. erze.itam.com, erze.localhost:3000)
  const hostname = req.headers
    .get('host')!
    .replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`);

  // Find the subdomain if it exists
  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, '')
      : hostname.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`, '');

  // If it's the root domain, or no subdomain is found
  if (currentHost === hostname || currentHost === 'www' || currentHost === 'localhost:3000') {
    // We can rewrite to a specific folder if needed, e.g. /app (landing pages)
    // For now, let it hit the default /app directory structure
    return NextResponse.next();
  }

  // Allow auth pages to pass through even on subdomains
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/register')) {
    return NextResponse.rewrite(new URL(url.pathname, req.url));
  }

  const searchParams = url.searchParams.toString();
  const pathWithParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  return NextResponse.rewrite(new URL(`/tenant/${currentHost}${pathWithParams}`, req.url));
}
