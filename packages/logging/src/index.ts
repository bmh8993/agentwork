/**
 * @opencode/logging
 *
 * Structured logging with masking and retention policies
 * ADR-0012: Log retention and masking policy for SkillRun
 */

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Structured log entry
export interface LogEntry {
  service: string
  level: LogLevel
  message: string
  timestamp: string
  run_id?: string
  node_id?: string
  agent_id?: string
  error_code?: string
  extra?: Record<string, unknown>
}

// Sensitive key patterns (case-insensitive)
const SENSITIVE_KEY_PATTERNS = [
  'password',
  'secret',
  'token',
  'credentials',
  'authorization',
  'api_key',
  'apikey',
  'access_token',
  'refresh_token',
]

// Sensitive value patterns
const SENSITIVE_VALUE_PATTERNS = [
  /Bearer\s+\S+/i, // Bearer tokens
  /Basic\s+\S+/i, // Basic auth tokens
]

/**
 * Check if a key is sensitive (case-insensitive)
 */
export function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return SENSITIVE_KEY_PATTERNS.some(pattern => lowerKey.includes(pattern))
}

/**
 * Mask sensitive value
 * ADR-0012: Partial masking (first 2 + ... + last 2) or 'hidden'
 */
export function maskSensitiveValue(value: string): string {
  if (value.length <= 4) {
    return 'hidden'
  }

  const firstTwo = value.substring(0, 2)
  const lastTwo = value.substring(value.length - 2)
  return `${firstTwo}...${lastTwo}`
}

/**
 * Check if value matches sensitive pattern
 */
export function hasSensitivePattern(value: string): boolean {
  return SENSITIVE_VALUE_PATTERNS.some(pattern => pattern.test(value))
}

/**
 * Mask sensitive data in object
 * ADR-0012: Key-based blocking + value pattern blocking
 */
export function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    // Check if key is sensitive
    if (isSensitiveKey(key)) {
      if (typeof value === 'string') {
        masked[key] = maskSensitiveValue(value)
      } else {
        masked[key] = 'hidden'
      }
      continue
    }

    // Check if value is sensitive string
    if (typeof value === 'string' && hasSensitivePattern(value)) {
      masked[key] = maskSensitiveValue(value)
      continue
    }

    // Recursively mask nested objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      masked[key] = maskSensitiveData(value as Record<string, unknown>)
      continue
    }

    // Keep other values as-is
    masked[key] = value
  }

  return masked
}

/**
 * Apply masking to log entry extra data
 */
export function applyMaskingToLogEntry(entry: LogEntry): LogEntry {
  if (!entry.extra) {
    return entry
  }

  return {
    ...entry,
    extra: maskSensitiveData(entry.extra),
  }
}

// Log retention policy
export const MAX_LOG_FILES = 10

/**
 * Mock log file names for testing
 * In production, this would read actual log directory
 */
export function getMockLogFileNames(): string[] {
  const logs: string[] = []
  const now = Date.now()

  for (let i = 0; i < 15; i++) {
    const timestamp = new Date(now - i * 3600000) // 1 hour apart
    const dateStr = timestamp.toISOString().split('T')[0]
    logs.push(`skill-run-${dateStr}-${i.toString().padStart(3, '0')}.log`)
  }

  return logs
}

/**
 * Apply retention policy - keep only latest MAX_LOG_FILES
 * ADR-0012: Keep latest 10 files, delete older ones
 */
export function applyRetentionPolicy(
  logFiles: string[],
  maxFiles: number = MAX_LOG_FILES
): { keep: string[]; delete: string[] } {
  // Sort by name (which includes timestamp) in descending order
  const sorted = [...logFiles].sort().reverse()

  const keep = sorted.slice(0, maxFiles)
  const toDelete = sorted.slice(maxFiles)

  return { keep, delete: toDelete }
}

/**
 * Create structured log entry
 */
export function createLogEntry(
  service: string,
  level: LogLevel,
  message: string,
  metadata?: {
    run_id?: string
    node_id?: string
    agent_id?: string
    error_code?: string
    extra?: Record<string, unknown>
  }
): LogEntry {
  const entry: LogEntry = {
    service,
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  }

  return applyMaskingToLogEntry(entry)
}

/**
 * Logger class for structured logging
 */
export class SkillLogger {
  private service: string
  private runId?: string

  constructor(service: string, runId?: string) {
    this.service = service
    this.runId = runId
  }

  debug(message: string, extra?: Record<string, unknown>): LogEntry {
    return createLogEntry(this.service, 'debug', message, {
      run_id: this.runId,
      extra,
    })
  }

  info(message: string, extra?: Record<string, unknown>): LogEntry {
    return createLogEntry(this.service, 'info', message, {
      run_id: this.runId,
      extra,
    })
  }

  warn(message: string, extra?: Record<string, unknown>): LogEntry {
    return createLogEntry(this.service, 'warn', message, {
      run_id: this.runId,
      extra,
    })
  }

  error(message: string, extra?: Record<string, unknown>): LogEntry {
    return createLogEntry(this.service, 'error', message, {
      run_id: this.runId,
      extra,
    })
  }

  withRunId(runId: string): SkillLogger {
    return new SkillLogger(this.service, runId)
  }
}

/**
 * Create logger instance
 */
export function createLogger(service: string, runId?: string): SkillLogger {
  return new SkillLogger(service, runId)
}
