import app from './src/app.js';
import { env, logger, connectDatabase, disconnectDatabase } from './src/config/index.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start the Express server
    const server = app.listen(env.port, () => {
      logger.info('========================================');
      logger.info('  KundaGo Backend Server Started');
      logger.info('========================================');
      logger.info(`  Environment: ${env.nodeEnv}`);
      logger.info(`  Port: ${env.port}`);
      logger.info(`  Health Check: http://localhost:${env.port}/health`);
      logger.info('========================================');
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await disconnectDatabase();
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise: String(promise), reason: String(reason) });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
