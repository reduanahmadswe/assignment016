import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEvents() {
  try {
    console.log('Checking events...');
    
    const events = await prisma.event.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        eventStatus: true,
        startDate: true,
        isPublished: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    console.log(`Total events found: ${events.length}`);
    console.log('Events:', JSON.stringify(events, null, 2));

    const totalCount = await prisma.event.count();
    console.log(`Total events in database: ${totalCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEvents();
