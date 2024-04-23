import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
export { default } from 'next-auth/middleware';
//  docs link for middleware 🤩 : https://nextjs.org/docs/app/building-your-application/routing/middleware

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  if (
    token &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname.startsWith('/'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

// this is the file in which we tell WHERE the MIDDLEWARE should be applied 😊
export const config = {
  // /path:* means ALL PARTS WITHIN DASHBOARD AND VERIFY Routes 😃
  matcher: ['/sign-in', '/sign-up', '/', '/dashboard/:path*', '/verify/:path*'],
};
