import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/scheduling';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('date');

        if (!dateStr) {
            return NextResponse.json(
                { error: 'Fecha requerida' },
                { status: 400 }
            );
        }

        const date = new Date(dateStr);

        if (isNaN(date.getTime())) {
            return NextResponse.json(
                { error: 'Fecha inválida' },
                { status: 400 }
            );
        }

        const availableSlots = await getAvailableSlots(date);

        return NextResponse.json({ slots: availableSlots });
    } catch (error) {
        console.error('Error getting available slots:', error);
        return NextResponse.json(
            { error: 'Error al obtener horarios disponibles' },
            { status: 500 }
        );
    }
}
