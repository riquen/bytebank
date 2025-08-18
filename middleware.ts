import { NextResponse, type NextRequest } from 'next/server'
import { requireSession } from './utils/require-session'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const { session } = await requireSession()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname === '/login'
  const isApi = pathname.startsWith('/api')
  const isProtected = !isAuthRoute

  if (isApi && !session && isProtected) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (!isApi && !session && isProtected) {
    const url = new URL('/login', request.url)

    url.searchParams.set('redirectTo', pathname)

    return NextResponse.redirect(url)
  }

  if (!isApi && session && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
