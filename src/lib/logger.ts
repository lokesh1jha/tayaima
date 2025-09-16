// Centralized logging utility
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isClient = typeof window !== 'undefined';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment && (level === 'debug' || level === 'info')) {
      return false;
    }
    return true;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    
    if (this.isClient) {
      console.debug(this.formatMessage('debug', message, context));
    } else {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    
    if (this.isClient) {
      console.info(this.formatMessage('info', message, context));
    } else {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    
    if (this.isClient) {
      console.warn(this.formatMessage('warn', message, context));
    } else {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    const errorContext = {
      ...context,
      ...(error instanceof Error ? {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      } : error ? { error } : {})
    };

    if (this.isClient) {
      console.error(this.formatMessage('error', message, errorContext));
    } else {
      console.error(this.formatMessage('error', message, errorContext));
    }
  }

  // Specialized methods for common use cases
  api(method: string, endpoint: string, status?: number, context?: LogContext): void {
    this.info(`API ${method} ${endpoint}${status ? ` - ${status}` : ''}`, context);
  }

  database(operation: string, table: string, context?: LogContext): void {
    this.debug(`DB ${operation} on ${table}`, context);
  }

  storage(operation: string, key: string, context?: LogContext): void {
    this.debug(`Storage ${operation}: ${key}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel, LogContext };
