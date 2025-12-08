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
    // IMPORTANTE: Esto ayuda a Vercel a manejar bien las redirecciones https
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
                if (!user) return null;

                // Devolvemos el ID explícitamente
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // "user" solo existe la primera vez que inicias sesión.
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Pasamos el ID del token a la sesión final
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});