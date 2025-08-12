import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    // Only protect dashboard and subscription pages, allow tools in demo mode
    const isProtectedPage = req.nextUrl.pathname.startsWith('/dashboard') || 
                           req.nextUrl.pathname.startsWith('/subscription')

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return null
    }

    if (!isAuth && isProtectedPage) {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      )
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/subscription/:path*", "/auth/:path*"]
}