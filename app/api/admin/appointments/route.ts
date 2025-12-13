import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Acceso denegado - Solo administradores' },
                { status: 403 }
            );
        }

        // Get only pending appointments (startTime >= now) with user information
        // Past appointments are kept in the database but not shown in admin panel
        const appointments = await prisma.appointment.findMany({
            where: {
                startTime: {
                    gte: new Date(),
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                startTime: 'desc',
            },
        });

        return NextResponse.json({ appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json(
            { error: 'Error al obtener citas' },
            { status: 500 }
        );
    }
}
