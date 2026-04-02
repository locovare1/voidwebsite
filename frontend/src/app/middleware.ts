    import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security middleware for comprehensive protection
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy - Strictest settings
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://apis.google.com https://firebase.googleapis.com https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://fcmregistrations.googleapis.com https://storage.googleapis.com https://youtube.googleapis.com https://www.googleapis.com https://api.stripe.com https://js.stripe.com",
    "frame-src 'self' https://js.stripe.com https://www.youtube.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];

  // Enhanced security headers
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Cache control for sensitive pages
  if (request.nextUrl.pathname.includes('/admin') || 
      request.nextUrl.pathname.includes('/api') ||
      request.nextUrl.pathname.includes('/cart')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Block suspicious user agents and referrers
  const userAgent = request.headers.get('user-agent') || '';
  const referrer = request.headers.get('referer') || '';
  
  // Block known scraping tools
  const blockedAgents = [
    'curl', 'wget', 'python-requests', 'axios', 'node-fetch',
    'insomnia', 'postman', 'httpie'
  ];
  
  if (blockedAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
