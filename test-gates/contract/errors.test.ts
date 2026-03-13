/**
 * Test Gate: Error Contract and Code Map (Turn 2)
 *
 * Validates:
 * 1. error_code, category, next_action, retryable 일관 포맷
 * 2. 테스트에서 코드 매핑 단위 검증 가능
 */

import { describe, it, expect } from 'vitest'
import {
  ERROR_CODES,
  ERROR_CATEGORIES,
  TRIGGER_STAGES,
  createError,
  createSchemaError,
  type ValidationError,
  type ValidationResult,
  isValid,
  getFirstErrorMessage,
} from '@opencode/skill-schema'

describe('Error Contract: Code Catalog', () => {
  it('all error codes have required fields', () => {
    const errors = Object.values(ERROR_CODES)

    for (const code of errors) {
      const error = createError(code)

      expect(error).toMatchObject({
        code: expect.any(String),
        category: expect.any(String),
        trigger_stage: expect.any(String),
        message_user: expect.any(String),
        next_action: expect.any(String),
        retryable: expect.any(Boolean),
      })
    }
  })

  it('error codes use consistent format', () => {
    const errors = Object.values(ERROR_CODES).map((code) => createError(code))

    // All codes should be lowercase with underscores
    for (const error of errors) {
      expect(error.code).toMatch(/^[a-z_]+$/)
    }
  })

  it('categories match POL-02 specification', () => {
    expect(ERROR_CATEGORIES.ValidationError).toBe('ValidationError')
    expect(ERROR_CATEGORIES.InstallError).toBe('InstallError')
    expect(ERROR_CATEGORIES.RuntimeError).toBe('RuntimeError')
  })

  it('trigger stages match phase workflow', () => {
    expect(TRIGGER_STAGES.LOAD).toBe('Load')
    expect(TRIGGER_STAGES.DRAFT).toBe('Draft')
    expect(TRIGGER_STAGES.PUBLISH).toBe('Publish')
    expect(TRIGGER_STAGES.RUN).toBe('Run')
  })
})

describe('Error Factory', () => {
  it('creates error with default catalog values', () => {
    const error = createError(ERROR_CODES.MISSING_VERSION)

    expect(error.code).toBe(ERROR_CODES.MISSING_VERSION)
    expect(error.category).toBe(ERROR_CATEGORIES.ValidationError)
    expect(error.trigger_stage).toBe(TRIGGER_STAGES.LOAD)
    expect(error.message_user).toBe('Version is missing.')
    expect(error.next_action).toContain('version')
    expect(error.retryable).toBe(false)
  })

  it('allows override of catalog values', () => {
    const error = createError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, {
      path: '/workflow/nodes/0',
      message_user: 'Custom error message',
    })

    expect(error.code).toBe(ERROR_CODES.SCHEMA_VALIDATION_FAILED)
    expect(error.path).toBe('/workflow/nodes/0')
    expect(error.message_user).toBe('Custom error message')
  })

  it('creates schema error with path', () => {
    const error = createSchemaError('/workflow/nodes/1', 'Invalid node type')

    expect(error.code).toBe(ERROR_CODES.SCHEMA_VALIDATION_FAILED)
    expect(error.path).toBe('/workflow/nodes/1')
    expect(error.message_user).toBe('Invalid node type')
    expect(error.category).toBe(ERROR_CATEGORIES.ValidationError)
  })
})

describe('Validation Result Helpers', () => {
  it('isValid type guard works correctly', () => {
    const validResult: ValidationResult = { valid: true, errors: [], warnings: [] }
    const invalidResult: ValidationResult = {
      valid: false,
      errors: [createError(ERROR_CODES.MISSING_VERSION)],
      warnings: [],
    }

    expect(isValid(validResult)).toBe(true)
    expect(isValid(invalidResult)).toBe(false)

    if (isValid(validResult)) {
      expect(validResult.valid).toBe(true)
    }
  })

  it('getFirstErrorMessage returns null for no errors', () => {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }

    expect(getFirstErrorMessage(result)).toBeNull()
  })

  it('getFirstErrorMessage returns first error message', () => {
    const error = createError(ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)
    const result: ValidationResult = { valid: false, errors: [error], warnings: [] }

    expect(getFirstErrorMessage(result)).toBe('Required publish fields are missing.')
  })
})

describe('Phase 1 Error Coverage', () => {
  it('includes all Phase 1 validation errors', () => {
    const phase1Codes = [
      ERROR_CODES.MISSING_VERSION,
      ERROR_CODES.INVALID_VERSION_TYPE,
      ERROR_CODES.UNSUPPORTED_VERSION,
      ERROR_CODES.SCHEMA_VALIDATION_FAILED,
      ERROR_CODES.MIGRATION_FAILED,
      ERROR_CODES.UNSUPPORTED_NODE_TYPE,
      ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING,
      ERROR_CODES.PUBLISH_VALIDATION_FAILED,
      ERROR_CODES.RUN_VALIDATION_FAILED,
    ]

    for (const code of phase1Codes) {
      const error = createError(code)
      expect(error.category).toBe(ERROR_CATEGORIES.ValidationError)
      expect(error.code).toBeDefined()
    }
  })

  it('retryable flag is correctly set', () => {
    const retryableError = createError(ERROR_CODES.MIGRATION_FAILED)
    const nonRetryableError = createError(ERROR_CODES.MISSING_VERSION)

    expect(retryableError.retryable).toBe(true)
    expect(nonRetryableError.retryable).toBe(false)
  })
})
