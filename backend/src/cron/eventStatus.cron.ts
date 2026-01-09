import cron from 'node-cron';
import { eventService } from '../modules/events/event.service.js';

export const startEventStatusCron = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('🔄 Running event status update cron job...');
    
    try {
      await eventService.updateEventStatuses();
      console.log('✅ Event status update completed');
    } catch (error) {
      console.error('❌ Event status update failed:', error);
    }
  });

  console.log('⏰ Event status cron job scheduled');
};
