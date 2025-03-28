import winston from 'winston';
import { config } from '../config';

export class Logger {
  private loggerInstance: winston.Logger;

  constructor() {
    this.loggerInstance = winston.createLogger({
      level: config.logLevel || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({ 
          filename: config.logFilePath || 'logs/app.log',
          maxsize: 5242880, 
          maxFiles: 5,
        }),
      ],
    });
  }

  log(level: string, message: string): void {
    this.loggerInstance.log(level, message);
  }

  info(message: string): void {
    this.loggerInstance.info(message);
  }

  error(message: string): void {
    this.loggerInstance.error(message);
  }

  warn(message: string): void {
    this.loggerInstance.warn(message);
  }

  debug(message: string): void {
    this.loggerInstance.debug(message);
  }
}


