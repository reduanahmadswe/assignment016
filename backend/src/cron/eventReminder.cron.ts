import cron from 'node-cron';
import prisma from '../config/db.js';
import { sendEventReminder } from '../utils/email.util.js';

export const startEventReminderCron = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const plus23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const plus25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
      const plus1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);
      const plus2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Find events starting in ~24 hours or ~1 hour
      const upcomingEvents = await prisma.event.findMany({
        where: {
          eventStatus: { code: 'upcoming' },
          isPublished: true,
          OR: [
            { startDate: { gte: plus23h, lt: plus25h } },
            { startDate: { gte: plus1h, lt: plus2h } },
          ],
        },
        include: {
          eventMode: { select: { code: true } },
        },
      });

      for (const event of upcomingEvents) {
        // Get registered users
        const registrations = await prisma.eventRegistration.findMany({
          where: { 
            eventId: event.id, 
            status: { code: 'confirmed' } 
          },
          select: { user: { select: { name: true, email: true } } },
        });

        for (const reg of registrations) {
          const user = reg.user;
          if (!user) continue;
          try {
            const eventLink = event.onlineLink || event.meetingLink;
            await sendEventReminder(
              user.email,
              user.name,
              event.title,
              new Date(event.startDate).toLocaleString(),
              event.eventMode.code !== 'offline' ? eventLink ?? undefined : undefined
            );
            } catch (error) {
            console.error(`Failed to send reminder to ${user.email}:`, error);
          }
        }
      }

      } catch (error) {
      console.error('❌ Event reminder cron job failed:', error);
    }
  });

  };
