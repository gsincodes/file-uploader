const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // create a user
    // const user = await prisma.user.create({
    //     data: {
    //         name: 'John Doe Singh',
    //         email: 'johnsingh@yahoo.com',
    //     },
    // })

    const user = await prisma.user.findMany();

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