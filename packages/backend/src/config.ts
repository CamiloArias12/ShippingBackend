import * as dotenv from 'dotenv';
import * as path from 'path';

const configPath = path.resolve('.env');
dotenv.config({
  path: configPath
});

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 8000,
  apiVersion: process.env.API_VERSION || 'v1',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.DB_USERNAME || 'shipping_user',
    password: process.env.DB_PASSWORD || 'shipping_password',
    name: process.env.DB_DATABASE || 'shipping_db',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
    ttl: Number(process.env.REDIS_TTL) || 3600,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret_here',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  email: {
    user: process.env.EMAIL_AUTH_USER || 'your_email@example.com',
    password: process.env.EMAIL_AUTH_PASS || 'your_email_password',
  },
  smtp: {
    host: process.env.MAIL_HOST || 'smtp.example.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_SECURE === 'true' || true,
    name: process.env.MAIL_NAME || 'Shipping App',
    auth: {
      user: process.env.MAIL_USERNAME || 'your_email@example.com',
      pass: process.env.MAIL_PASSWORD || 'your_email_password',
    },
    from: process.env.MAIL_FROM_NAME || 'Shipping App',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  logFilePath: process.env.LOG_FILE_PATH || 'logs/app.log',
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // default 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  },
};