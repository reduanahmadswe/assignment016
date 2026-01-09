import createApp from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { verifyEmailConfig } from './config/mail.config.js';
import { initCronJobs } from './cron/index.js';
// Nudged to restart

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Verify email configuration
    await verifyEmailConfig();

    // Initialize cron jobs
    initCronJobs();

    // Create and start the app
    const app = createApp();

    app.listen(env.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗ ██████╗ ██╗██╗   ██╗███████╗████████╗           ║
║  ██╔═══██╗██╔══██╗██║╚██╗ ██╔╝██╔════╝╚══██╔══╝           ║
║  ██║   ██║██████╔╝██║ ╚████╔╝ █████╗     ██║              ║
║  ██║   ██║██╔══██╗██║  ╚██╔╝  ██╔══╝     ██║              ║
║  ╚██████╔╝██║  ██║██║   ██║   ███████╗   ██║              ║
║   ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝   ╚═╝              ║
║                                                           ║
║   Education & Event Platform API                          ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║   🚀 Server running on port ${env.port}                   ║
║   📚 Environment: ${env.nodeEnv.padEnd(20)}               ║
║   🔗 API URL: http://localhost:${env.port}/api            ║
║   📖 Health: http://localhost:${env.port}/api/health      ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
