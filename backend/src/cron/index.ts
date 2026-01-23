import { startEventReminderCron } from './eventReminder.cron.js';
import { startEventStatusCron } from './eventStatus.cron.js';
import { startPaymentCleanup } from './paymentCleanup.cron.js';
import { startOtpCleanup } from './otpCleanup.cron.js';
import { startLicenseCheckCron } from './license.cron.js';

export const initCronJobs = () => {
  startEventReminderCron();
  startEventStatusCron();
  startPaymentCleanup();
  startOtpCleanup();
  startLicenseCheckCron();


  };
