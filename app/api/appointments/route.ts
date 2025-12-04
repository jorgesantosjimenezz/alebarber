import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateAppointment } from '@/lib/scheduling';
import { addMinutes } from 'date-fns';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                userId: session.user.id,
                status: 'CONFIRMED',
                startTime: {
                    gte: new Date(), // Only future appointments
                },
            },
            orderBy: {
                startTime: 'asc',
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

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { startTime } = body;

        if (!startTime) {
            return NextResponse.json(
                { error: 'Hora de inicio requerida' },
                { status: 400 }
            );
        }

        const startDateTime = new Date(startTime);

        if (isNaN(startDateTime.getTime())) {
            return NextResponse.json(
                { error: 'Fecha inválida' },
                { status: 400 }
            );
        }

        // Validate the appointment
        const validation = await validateAppointment(startDateTime);

        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Create the appointment
        const endDateTime = addMinutes(startDateTime, 45);

        const appointment = await prisma.appointment.create({
            data: {
                userId: session.user.id,
                startTime: startDateTime,
                endTime: endDateTime,
                status: 'CONFIRMED',
            },
        });

        return NextResponse.json(
            { message: 'Cita creada exitosamente', appointment },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'Error al crear cita' },
            { status: 500 }
        );
    }
}
