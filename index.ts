import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // create a user
    const user = await prisma.user.create({
        data: {
            name:'John Doe',
            email: 'john@gmail.com',
        },
    })

    console.log(user);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    })