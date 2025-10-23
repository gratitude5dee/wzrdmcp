import pino from 'pino';

const level = process.env.LOG_LEVEL ?? 'info';

export const logger = pino({
  level,
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
});

export type LogContext = Record<string, unknown>;

export function logInfo(message: string, context: LogContext = {}): void {
  logger.info(context, message);
}

export function logWarn(message: string, context: LogContext = {}): void {
  logger.warn(context, message);
}

export function logError(message: string, context: LogContext = {}): void {
  logger.error(context, message);
}

export function logDebug(message: string, context: LogContext = {}): void {
  logger.debug(context, message);
}
