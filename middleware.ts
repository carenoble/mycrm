import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register' || path === '/'

  // Get the token from cookies
  const token = request.cookies.get('token')?.value || ''

  // Skip middleware for API routes (let them handle their own auth)
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user has token and tries to access login/register, redirect to dashboard
  if ((path === '/login' || path === '/register') && token) {
    try {
      // Simple token validation - just check if it exists and has proper format
      if (token.includes('.') && token.split('.').length === 3) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // Invalid token, clear it and let them access login
      const response = NextResponse.next()
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ]
}