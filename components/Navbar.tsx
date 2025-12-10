import Link from 'next/link';
import { auth } from '@/auth';
import { SignOutButton } from './SignOutButton';
import { prisma } from '@/lib/prisma';
import { Scissors, Instagram } from 'lucide-react';

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
            <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
                <div className="flex justify-between items-center">
                    <Link
                        href="/"
                        className="text-lg md:text-2xl font-bold hover:text-[#daa520] transition-all duration-300 flex items-center gap-2 md:gap-3 group"
                    >
                        <div className="p-1.5 md:p-2 bg-white/10 rounded-lg md:rounded-xl group-hover:bg-white/20 transition-all duration-300 group-hover:rotate-12">
                            <Scissors className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 group-hover:from-[#daa520] group-hover:to-[#c79420]">
                            AleBarber
                        </span>
                    </Link>

                    {/* Instagram Link */}
                    <a
                        href="https://instagram.com/aleepuerto_"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 md:p-2 bg-white/10 rounded-lg md:rounded-xl hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 transition-all duration-300 hover:scale-110 hover:rotate-6"
                        aria-label="Síguenos en Instagram"
                    >
                        <Instagram className="w-5 h-5 md:w-6 md:h-6" />
                    </a>

                    <div className="flex items-center gap-2 md:gap-6">
                        {session?.user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-base font-medium hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                >
                                    Mis Citas
                                </Link>
                                <Link
                                    href="/reservar"
                                    className="px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-base font-medium hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                >
                                    Reservar
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="gradient-secondary text-[#1a1a1a] px-2 md:px-5 py-1.5 md:py-2.5 rounded-lg transition-all duration-300 font-semibold text-xs md:text-sm shadow-lg hover:shadow-xl hover:scale-105 button-primary"
                                    >
                                        <span className="hidden md:inline">⚡ Admin</span>
                                        <span className="md:hidden">⚡</span>
                                    </Link>
                                )}
                                <div className="flex items-center gap-2 md:gap-4 ml-1 md:ml-2">
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
                                    className="px-2 md:px-5 py-1.5 md:py-2.5 rounded-lg text-xs md:text-base font-medium hover:bg-white/10 transition-all duration-300 hover:scale-105 whitespace-nowrap"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className="gradient-secondary text-[#1a1a1a] px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg hover:scale-105 transition-all duration-300 text-xs md:text-base font-bold shadow-lg hover:shadow-xl button-primary gradient-shine whitespace-nowrap"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
