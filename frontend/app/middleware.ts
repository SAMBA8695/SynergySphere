// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/login', '/signup', '/forgot-password']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  const { pathname } = request.nextUrl

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Case 1: User NOT logged in, trying to access protected route → redirect to /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Case 2: User IS logged in, but visiting a public route → redirect to /dashboard
  if (token && isPublicRoute) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Otherwise, allow the request
  return NextResponse.next()
}

// This matcher applies middleware to *all* routes except static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
