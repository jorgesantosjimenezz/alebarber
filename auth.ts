import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import { authenticateUser } from './lib/auth-utils';

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
    },
    // IMPORTANTE: Esto arregla problemas de redirección en Vercel
    trustHost: true,
    pages: {
        signIn: '/login',
    },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await authenticateUser(
                    credentials.email as string,
                    credentials.password as string
                );

                if (!user) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
    // AQUÍ ESTÁ EL ARREGLO DEL ID 👇
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Rutas protegidas
            const protectedRoutes = ['/dashboard', '/reservar', '/admin'];
            const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

            // Páginas de autenticación
            const authRoutes = ['/login', '/register'];
            const isAuthRoute = authRoutes.includes(pathname);

            // Si intenta acceder a ruta protegida sin estar logueado
            if (isProtectedRoute && !isLoggedIn) {
                return false; // Esto redirige automáticamente a signIn page
            }

            // Si está logueado e intenta acceder a login/register, redirigir a dashboard
            if (isLoggedIn && isAuthRoute) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            return true;
        },
        async jwt({ token, user }) {
            // "user" solo existe la primera vez que inicias sesión.
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Pasamos el ID del token a la sesión final para que el Dashboard lo vea
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});