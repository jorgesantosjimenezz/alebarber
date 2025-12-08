import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // Protected routes
    const protectedRoutes = ['/dashboard', '/reservar', '/admin'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Public auth pages - usuarios ya logueados no deberían estar aquí
    const authPages = ['/login', '/register'];
    const isAuthPage = authPages.some(page => pathname === page); // Cambiado a === para match exacto

    // Redirigir a login si intenta acceder a ruta protegida sin estar logueado
    if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Redirigir a dashboard si está logueado e intenta acceder a páginas de auth
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};