// dummy logger for now
type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  error?: Error
}

class Logger {
  private logs: LogEntry[] = []

  private log(level: LogLevel, message: string, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      error,
    }

    this.logs.push(entry)

    // In a real application, you would send this to a logging service
    // For now, we'll just log to console
    console.log(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, error || '')
  }

  error(message: string, error?: Error): void {
    this.log('error', message, error)
  }

  warn(message: string, error?: Error): void {
    this.log('warn', message, error)
  }

  info(message: string): void {
    this.log('info', message)
  }

  debug(message: string): void {
    this.log('debug', message)
  }

  // Get all logs (useful for debugging)
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }
}

// Export a singleton instance
export const logger = new Logger()

