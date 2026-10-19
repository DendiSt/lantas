import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

const protectedRoutes = ['/dashboard', '/admin', '/teacher']
const publicRoutes = ['/']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = request.cookies.get('lantas_session')?.value
  const session = cookie ? await decrypt(cookie) : null

  // 1. Belum login mencoba nembak rute admin atau teacher -> Tampilkan 404
  if (isProtectedRoute && !session) {
    if (path.startsWith('/admin') || path.startsWith('/teacher')) {
      return NextResponse.rewrite(new URL('/_not-found', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Sudah login tetapi membuka landing/login page -> arahkan ke portal masing-masing
  if (isPublicRoute && session) {
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (session.role === 'TEACHER') {
      return NextResponse.redirect(new URL('/teacher', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // 3. Sudah login tetapi nembak domain/link milik role lain -> Tampilkan 404
  if (isProtectedRoute && session) {
    if (path.startsWith('/admin') && session.role !== 'ADMIN') {
      return NextResponse.rewrite(new URL('/_not-found', request.url))
    }
    if (path.startsWith('/teacher') && session.role !== 'TEACHER') {
      return NextResponse.rewrite(new URL('/_not-found', request.url))
    }
    if (path.startsWith('/dashboard') && session.role !== 'STUDENT') {
      return NextResponse.rewrite(new URL('/_not-found', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
