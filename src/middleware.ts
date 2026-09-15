import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

const protectedRoutes = ['/dashboard', '/admin']
const publicRoutes = ['/']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = request.cookies.get('lantas_session')?.value
  const session = cookie ? await decrypt(cookie) : null

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isPublicRoute && session) {
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  if (isProtectedRoute && session) {
      if (path.startsWith('/admin') && session.role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      if (path.startsWith('/dashboard') && session.role !== 'STUDENT') {
          return NextResponse.redirect(new URL('/admin', request.url))
      }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
