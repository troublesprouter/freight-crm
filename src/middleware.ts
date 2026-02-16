import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Manager-only routes
    if (path.startsWith('/manager') && token?.role === 'rep') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Admin-only routes
    if (path.startsWith('/settings') && token?.role === 'rep') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/leads/:path*', '/cold-bucket/:path*', '/manager/:path*', '/settings/:path*'],
};
