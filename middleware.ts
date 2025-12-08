import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/reservar', '/admin'];
// Páginas de autenticación (login/register)
const authRoutes = ['/login', '/register'];

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const pathname = nextUrl.pathname;

    // Verificar si es una ruta protegida
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Verificar si es una página de autenticación
    const isAuthRoute = authRoutes.includes(pathname);

    // Si el usuario está logueado e intenta acceder a login/register, redirigir a dashboard
    if (isLoggedIn && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    // Si el usuario NO está logueado e intenta acceder a una ruta protegida, redirigir a login
    if (!isLoggedIn && isProtectedRoute) {
        const callbackUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }

    // En cualquier otro caso, continuar normalmente
    return NextResponse.next();
});

export const config = {
    // Excluir explícitamente las rutas que no necesitan middleware
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
    ],
};