import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            userId: session.user.id,
            status: 'CONFIRMED',
            startTime: {
                gte: new Date(),
            },
        },
        orderBy: {
            startTime: 'asc',
        },
    });

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-[#8b4513]">
                        Mis Citas
                    </h1>
                    <Link
                        href="/reservar"
                        className="bg-[#8b4513] text-white px-6 py-3 rounded-md hover:bg-[#6d3610] transition-colors font-semibold flex items-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        Nueva Cita
                    </Link>
                </div>

                {appointments.length === 0 ? (
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md p-12 text-center">
                        <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                            No tienes citas programadas
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            ¡Reserva tu primera cita ahora!
                        </p>
                        <Link
                            href="/reservar"
                            className="inline-block bg-[#8b4513] text-white px-6 py-3 rounded-md hover:bg-[#6d3610] transition-colors font-semibold"
                        >
                            Reservar Cita
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
