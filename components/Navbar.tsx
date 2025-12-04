import Link from 'next/link';
import { auth } from '@/auth';
import { SignOutButton } from './SignOutButton';
import { prisma } from '@/lib/prisma';
import { Scissors } from 'lucide-react';

export async function Navbar() {
    const session = await auth();

    // Check if user is admin
    let isAdmin = false;
    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        isAdmin = user?.role === 'ADMIN';
    }

    return (
        <nav className="gradient-primary text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
            < div className="container mx-auto px-4 py-4" >
                <div className="flex justify-between items-center">
                    <Link
                        href="/"
                        className="text-2xl font-bold hover:text-[#daa520] transition-all duration-300 flex items-center gap-3 group"
                    >
                        <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all duration-300 group-hover:rotate-12">
                            <Scissors className="w-6 h-6" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 group-hover:from-[#daa520] group-hover:to-[#c79420]">
                            AleBarber
                        </span>
                    </Link>

                    <div className="flex items-center gap-4 md:gap-6">
                        {session?.user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                >
                                    Mis Citas
                                </Link>
                                <Link
                                    href="/reservar"
                                    className="px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                >
                                    Reservar
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="gradient-secondary text-[#1a1a1a] px-5 py-2.5 rounded-lg transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 button-primary"
                                    >
                                        ⚡ Admin
                                    </Link>
                                )}
                                <div className="flex items-center gap-4 ml-2">
                                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#daa520] to-[#c79420] flex items-center justify-center font-bold text-sm shadow-lg">
                                            {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium">
                                            {session.user.name?.split(' ')?.[0] || session.user.email?.split('@')?.[0]}
                                        </span>
                                    </div>
                                    <SignOutButton />
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 rounded-lg font-medium hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className="gradient-secondary text-[#1a1a1a] px-6 py-2.5 rounded-lg hover:scale-105 transition-all duration-300 font-bold shadow-lg hover:shadow-xl button-primary gradient-shine"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div >
        </nav >
    );
}
