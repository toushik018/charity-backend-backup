/* eslint-disable no-console */
import mongoose from 'mongoose';
import app from './app';
import { ensureAdminUser } from './app/bootstrap/admin';
import config from './app/config';
import logger from './app/utils/logger';

async function main() {
  try {
    // Set up mongoose connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('Database connected successfully');
      console.log('\x1b[42m ✓ Database connected successfully!\x1b[0m');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Database connection error', { error: err.message });
      console.error('\x1b[41m ✕ Database connection error:\x1b[0m', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Database disconnected');
      console.log('\x1b[43m ✕ Database disconnected\x1b[0m');
    });

    // Connect to MongoDB
    logger.info('Connecting to database...');
    console.log('\x1b[33m ⚡︎Connecting to database...\x1b[0m');
    await mongoose.connect(config.database_url as string);

    // Ensure a single admin user exists when configured
    await ensureAdminUser();

    // Start the server
    app.listen(config.port, () => {
      logger.info('Server started', {
        port: config.port,
        env: config.NODE_ENV,
        url: `http://localhost:${config.port}`,
      });
      console.log(
        `\x1b[42m ✓ Fundsus backend listening on port ${config.port}\x1b[0m`
      );
      console.log(
        `\x1b[36m ✓ Server URL: http://localhost:${config.port}\x1b[0m`
      );
      console.log('\x1b[32m ✓ Server is ready to accept requests!\x1b[0m');
    });
  } catch (error) {
    logger.error('Database connection failed', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error('\x1b[41m ✕ Database connection failed!\x1b[0m');
    console.error('\x1b[31m Error details:\x1b[0m', error);
    console.error(
      '\x1b[33m ✕ Please check your DATABASE_URL in .env file\x1b[0m'
    );
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error('Unhandled error in main', {
    error: err.message,
    stack: err.stack,
  });
  console.log(err);
});
