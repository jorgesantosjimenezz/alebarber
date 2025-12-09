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

        // Delete the appointment from the database
        await prisma.appointment.delete({
            where: { id },
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

export async function PUT(
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
        const { startTime } = await req.json();

        if (!startTime) {
            return NextResponse.json(
                { error: 'Se requiere fecha y hora' },
                { status: 400 }
            );
        }

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
                { error: 'No autorizado para modificar esta cita' },
                { status: 403 }
            );
        }

        const newStartTime = new Date(startTime);
        const newEndTime = new Date(newStartTime.getTime() + 45 * 60 * 1000); // 45 minutes

        // Check if the new time slot is available (excluding current appointment)
        const conflictingAppointment = await prisma.appointment.findFirst({
            where: {
                id: { not: id },
                OR: [
                    {
                        startTime: { lte: newStartTime },
                        endTime: { gt: newStartTime },
                    },
                    {
                        startTime: { lt: newEndTime },
                        endTime: { gte: newEndTime },
                    },
                    {
                        startTime: { gte: newStartTime },
                        endTime: { lte: newEndTime },
                    },
                ],
            },
        });

        if (conflictingAppointment) {
            return NextResponse.json(
                { error: 'El horario seleccionado no está disponible' },
                { status: 409 }
            );
        }

        // Update the appointment
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: {
                startTime: newStartTime,
                endTime: newEndTime,
            },
        });

        return NextResponse.json(updatedAppointment, { status: 200 });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json(
            { error: 'Error al actualizar la cita' },
            { status: 500 }
        );
    }
}
