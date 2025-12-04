import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Error: Debes proporcionar un email');
        console.log('Uso: npm run make-admin your@email.com');
        process.exit(1);
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`❌ Error: Usuario con email "${email}" no encontrado`);
            process.exit(1);
        }

        if (user.role === 'ADMIN') {
            console.log(`✅ El usuario ${email} ya es administrador`);
            process.exit(0);
        }

        await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });

        console.log(`✅ Usuario ${email} convertido a administrador exitosamente`);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();
