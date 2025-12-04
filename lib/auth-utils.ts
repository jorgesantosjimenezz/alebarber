import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { z } from 'zod';

// Validation schemas
export const registerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    phone: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Create a new user
 */
export async function createUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
}) {
    // Validate input
    const validated = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
    });

    if (existingUser) {
        throw new Error('Un usuario con este email ya existe');
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.password);

    // Create user
    const user = await prisma.user.create({
        data: {
            name: validated.name,
            email: validated.email,
            password: hashedPassword,
            phone: validated.phone,
        },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

/**
 * Authenticate a user
 */
export async function authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return null;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
        return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
