import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Find the appointment
        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!appointment) {
            return NextResponse.json(
                { error: 'Cita no encontrada' },
                { status: 404 }
            );
        }

        // Check if the appointment belongs to the user
        if (appointment.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'No autorizado para cancelar esta cita' },
                { status: 403 }
            );
        }

        // Update appointment status to CANCELLED
        await prisma.appointment.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        return NextResponse.json(
            { message: 'Cita cancelada exitosamente' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return NextResponse.json(
            { error: 'Error al cancelar cita' },
            { status: 500 }
        );
    }
}
