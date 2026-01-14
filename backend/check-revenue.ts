import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRevenue() {
    const paidRegistrations = await prisma.eventRegistration.findMany({
        where: {
            event: {
                price: { gt: 0 }
            }
        },
        include: {
            event: true
        }
    });

    console.log(`Registrations for Paid Events: ${paidRegistrations.length}`);
    paidRegistrations.forEach(r => {
        console.log(`- Reg: ${r.registrationNumber}, Event: ${r.event.title}, Price: ${r.event.price}, Status: ${r.status}`);
    });
}

checkRevenue()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
