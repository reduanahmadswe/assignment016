import cron from 'node-cron';
import { eventService } from '../modules/events/event.service.js';

export const startEventStatusCron = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      await eventService.updateEventStatuses();
      } catch (error) {
      console.error('❌ Event status update failed:', error);
    }
  });

  };
