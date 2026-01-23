import cron from 'node-cron';
import { eventService } from '../modules/events/event.service.js';

export const startEventStatusCron = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('🔄 Running automatic event status update...');
      const result = await eventService.updateEventStatuses();
      console.log('✅ Event statuses updated successfully');
    } catch (error) {
      console.error('❌ Event status update failed:', error);
    }
  });

  console.log('⏰ Event status cron job started (runs every 15 minutes)');
  console.log('   → Updates events to "ongoing" when start time is reached');
  console.log('   → Updates events to "completed" when end time is passed');
};
