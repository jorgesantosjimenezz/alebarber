import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Calendar, ArrowLeft } from 'lucide-react';

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl p-8 text-center">
                        <h1 className="text-3xl font-bold text-red-600 mb-4">
                            Acceso Denegado
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            No tienes permisos de administrador para acceder a esta página.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-block bg-[#8b4513] text-white px-6 py-3 rounded-md hover:bg-[#6d3610] transition-colors"
                        >
                            Volver al Dashboard
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Get statistics
    const totalUsers = await prisma.user.count();
    const totalAppointments = await prisma.appointment.count({
        where: { status: 'CONFIRMED' },
    });

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-[#8b4513]">
                        Panel de Administración
                    </h1>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#8b4513] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Total Usuarios
                                </p>
                                <p className="text-3xl font-bold">{totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                                <Calendar className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Citas Confirmadas
                                </p>
                                <p className="text-3xl font-bold">{totalAppointments}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex gap-8 px-6">
                            <Link
                                href="/admin/users"
                                className="py-4 border-b-2 border-transparent hover:border-[#8b4513] transition-colors font-semibold text-gray-700 dark:text-gray-300 hover:text-[#8b4513]"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Usuarios
                                </div>
                            </Link>
                            <Link
                                href="/admin/appointments"
                                className="py-4 border-b-2 border-transparent hover:border-[#8b4513] transition-colors font-semibold text-gray-700 dark:text-gray-300 hover:text-[#8b4513]"
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Citas
                                </div>
                            </Link>
                        </nav>
                    </div>

                    <div className="p-6">
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Selecciona una sección para ver los detalles
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href="/admin/users"
                                    className="bg-[#8b4513] text-white px-6 py-3 rounded-md hover:bg-[#6d3610] transition-colors font-semibold"
                                >
                                    Ver Usuarios
                                </Link>
                                <Link
                                    href="/admin/appointments"
                                    className="bg-[#daa520] text-[#1a1a1a] px-6 py-3 rounded-md hover:bg-[#c79420] transition-colors font-semibold"
                                >
                                    Ver Citas
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
