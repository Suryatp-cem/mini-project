const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        console.log('--- USER ROLES ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('------------------');
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
