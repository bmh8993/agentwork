/**
 * Phase 3 Logging Tests
 *
 * Test Gates:
 * - logging-masking-retention: Verify log masking and retention policies
 */

import { describe, it, expect } from 'vitest'
import {
  isSensitiveKey,
  maskSensitiveValue,
  hasSensitivePattern,
  maskSensitiveData,
  applyMaskingToLogEntry,
  getMockLogFileNames,
  applyRetentionPolicy,
  createLogEntry,
  createLogger,
  MAX_LOG_FILES,
} from '@opencode/logging'

describe('logging-masking-retention', () => {
  describe('sensitive key detection', () => {
    it('should detect password key', () => {
      expect(isSensitiveKey('password')).toBe(true)
      expect(isSensitiveKey('user_password')).toBe(true)
      expect(isSensitiveKey('PASSWORD')).toBe(true)
    })

    it('should detect secret key', () => {
      expect(isSensitiveKey('secret')).toBe(true)
      expect(isSensitiveKey('api_secret')).toBe(true)
    })

    it('should detect token key', () => {
      expect(isSensitiveKey('token')).toBe(true)
      expect(isSensitiveKey('access_token')).toBe(true)
    })

    it('should detect credentials key', () => {
      expect(isSensitiveKey('credentials')).toBe(true)
    })

    it('should detect authorization key', () => {
      expect(isSensitiveKey('authorization')).toBe(true)
      expect(isSensitiveKey('Authorization')).toBe(true)
    })

    it('should not detect non-sensitive keys', () => {
      expect(isSensitiveKey('username')).toBe(false)
      expect(isSensitiveKey('message')).toBe(false)
      expect(isSensitiveKey('timestamp')).toBe(false)
    })
  })

  describe('value masking', () => {
    it('should mask short values as hidden', () => {
      expect(maskSensitiveValue('abc')).toBe('hidden')
      expect(maskSensitiveValue('ab')).toBe('hidden')
    })

    it('should partially mask longer values', () => {
      expect(maskSensitiveValue('my-secret-token')).toBe('my...en')
      expect(maskSensitiveValue('Bearer abc123')).toBe('Be...23')
    })
  })

  describe('sensitive pattern detection', () => {
    it('should detect Bearer token pattern', () => {
      expect(hasSensitivePattern('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')).toBe(true)
    })

    it('should detect Basic auth pattern', () => {
      expect(hasSensitivePattern('Basic YWxhZGRpbjpvcGVuc2VzYW1l')).toBe(true)
    })

    it('should not detect non-sensitive patterns', () => {
      expect(hasSensitivePattern('regular text')).toBe(false)
      expect(hasSensitivePattern('some value')).toBe(false)
    })
  })

  describe('data masking', () => {
    it('should mask sensitive keys in object', () => {
      const data = {
        username: 'user123',
        password: 'secret123',
        message: 'hello',
      }

      const masked = maskSensitiveData(data)

      expect(masked.username).toBe('user123')
      expect(masked.password).toBe('se...23')
      expect(masked.message).toBe('hello')
    })

    it('should hide non-string sensitive values', () => {
      const data = {
        secret: { nested: 'value' },
        token: 12345,
      }

      const masked = maskSensitiveData(data)

      expect(masked.secret).toBe('hidden')
      expect(masked.token).toBe('hidden')
    })

    it('should mask sensitive patterns in values', () => {
      const data = {
        auth_header: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        message: 'hello',
      }

      const masked = maskSensitiveData(data)

      expect(masked.auth_header).toBe('Be...J9')
      expect(masked.message).toBe('hello')
    })

    it('should recursively mask nested objects', () => {
      const data = {
        user: {
          username: 'user123',
          password: 'secret123',
        },
        config: {
          api_key: 'key123',
        },
      }

      const masked = maskSensitiveData(data)

      expect(masked.user.username).toBe('user123')
      expect(masked.user.password).toBe('se...23')
      expect(masked.config.api_key).toBe('ke...23')
    })
  })

  describe('log entry masking', () => {
    it('should apply masking to log entry extra data', () => {
      const entry = {
        service: 'test-service',
        level: 'info' as const,
        message: 'Test message',
        timestamp: '2024-01-01T00:00:00Z',
        extra: {
          password: 'secret123',
          message: 'hello',
        },
      }

      const masked = applyMaskingToLogEntry(entry)

      expect(masked.extra?.password).toBe('se...23')
      expect(masked.extra?.message).toBe('hello')
    })

    it('should not modify entries without extra data', () => {
      const entry = {
        service: 'test-service',
        level: 'info' as const,
        message: 'Test message',
        timestamp: '2024-01-01T00:00:00Z',
      }

      const masked = applyMaskingToLogEntry(entry)

      expect(masked).toEqual(entry)
    })
  })

  describe('retention policy', () => {
    it('should keep only latest MAX_LOG_FILES files', () => {
      const logFiles = getMockLogFileNames()
      const result = applyRetentionPolicy(logFiles)

      expect(result.keep).toHaveLength(MAX_LOG_FILES)
      expect(result.delete).toHaveLength(logFiles.length - MAX_LOG_FILES)
    })

    it('should keep newest files and delete oldest', () => {
      const logFiles = getMockLogFileNames()
      const result = applyRetentionPolicy(logFiles)

      // Keep should be sorted newest first
      const deleteOldest = result.delete[0]
      const keepNewest = result.keep[0]

      expect(deleteOldest < keepNewest).toBe(true)
    })

    it('should handle empty log list', () => {
      const result = applyRetentionPolicy([])

      expect(result.keep).toHaveLength(0)
      expect(result.delete).toHaveLength(0)
    })

    it('should keep all files when under limit', () => {
      const smallList = ['log1.log', 'log2.log', 'log3.log']
      const result = applyRetentionPolicy(smallList)

      expect(result.keep).toHaveLength(3)
      expect(result.delete).toHaveLength(0)
    })
  })

  describe('log entry creation', () => {
    it('should create log entry with required fields', () => {
      const entry = createLogEntry('test-service', 'info', 'Test message')

      expect(entry.service).toBe('test-service')
      expect(entry.level).toBe('info')
      expect(entry.message).toBe('Test message')
      expect(entry.timestamp).toBeDefined()
    })

    it('should create log entry with metadata', () => {
      const entry = createLogEntry('test-service', 'error', 'Error occurred', {
        run_id: 'run-123',
        node_id: 'node-456',
        error_code: 'ERR_001',
      })

      expect(entry.run_id).toBe('run-123')
      expect(entry.node_id).toBe('node-456')
      expect(entry.error_code).toBe('ERR_001')
    })

    it('should mask sensitive data in extra field', () => {
      const entry = createLogEntry('test-service', 'info', 'Test', {
        extra: {
          password: 'secret123',
          message: 'hello',
        },
      })

      expect(entry.extra?.password).toBe('se...23')
      expect(entry.extra?.message).toBe('hello')
    })
  })

  describe('logger', () => {
    it('should create logger with service name', () => {
      const logger = createLogger('test-service')

      const entry = logger.info('Test message')

      expect(entry.service).toBe('test-service')
      expect(entry.level).toBe('info')
    })

    it('should create logger with run_id', () => {
      const logger = createLogger('test-service', 'run-123')

      const entry = logger.debug('Debug message')

      expect(entry.run_id).toBe('run-123')
    })

    it('should create logger with run_id using withRunId', () => {
      const baseLogger = createLogger('test-service')
      const runLogger = baseLogger.withRunId('run-456')

      const entry = runLogger.warn('Warning message')

      expect(entry.run_id).toBe('run-456')
    })

    it('should support all log levels', () => {
      const logger = createLogger('test-service')

      expect(logger.debug('Debug').level).toBe('debug')
      expect(logger.info('Info').level).toBe('info')
      expect(logger.warn('Warn').level).toBe('warn')
      expect(logger.error('Error').level).toBe('error')
    })
  })
})

describe('logging-masking-retention integration', () => {
  it('should mask and retain logs correctly', () => {
    const logger = createLogger('integration-test', 'run-integration')

    // Create log with sensitive data
    const entry = logger.info('User login', {
      username: 'user123',
      password: 'secretPass',
      token: 'Bearer abc123xyz',
    })

    // Verify masking
    expect(entry.extra?.password).toBe('se...ss')
    expect(entry.extra?.token).toBe('Be...yz')
    expect(entry.extra?.username).toBe('user123')

    // Verify retention
    const logs = getMockLogFileNames()
    const retention = applyRetentionPolicy(logs)

    expect(retention.keep.length).toBe(MAX_LOG_FILES)
    expect(retention.delete.length).toBeGreaterThan(0)
  })

  it('should conserve masking policy on all log levels', () => {
    const logger = createLogger('masking-test', 'run-mask')

    const levels: Array<'debug' | 'info' | 'warn' | 'error'> = ['debug', 'info', 'warn', 'error']

    levels.forEach(level => {
      const entry = logger[level]('Test', {
        secret: 'sec', // Short value will be masked as 'hidden'
      })

      expect(entry.level).toBe(level)
      expect(entry.extra?.secret).toBe('hidden')
    })
  })
})
