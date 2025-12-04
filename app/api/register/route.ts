import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth-utils';
import { z } from 'zod';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const user = await createUser(body);

        return NextResponse.json(
            { message: 'Usuario creado exitosamente', user },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error al crear usuario' },
            { status: 500 }
        );
    }
}
