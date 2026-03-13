/**
 * AJV-based schema validator for SKILL.json v1
 */

import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import v1Schema from './v1.schema.json'
import { createSchemaError, type ValidationResult } from './errors'

// Compile AJV validator once (cached)
const ajv = new Ajv({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
})

addFormats(ajv)

const v1Validator = ajv.compile(v1Schema)

/**
 * Validate data against SKILL.json v1 schema
 * @param data - Unknown data to validate
 * @returns ValidationResult with errors if invalid
 */
export function validateSchema(data: unknown): ValidationResult {
  const valid = v1Validator(data)

  if (valid) {
    return {
      valid: true,
      errors: [],
      warnings: [],
    }
  }

  // Convert AJV errors to ValidationError format
  const errors = (v1Validator.errors || []).map((err) => {
    const path = err.instancePath || err.schemaPath || '(root)'
    const message = err.message || 'Validation failed'

    return createSchemaError(path, `${path}: ${message}`)
  })

  return {
    valid: false,
    errors,
    warnings: [],
  }
}

/**
 * Check if data has a valid version field for v1
 */
export function hasValidVersion(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const obj = data as Record<string, unknown>
  return obj.version === '1' || obj.version === 1
}

/**
 * Get version from data, or null if missing/invalid
 */
export function getVersion(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const obj = data as Record<string, unknown>
  const version = obj.version

  if (typeof version === 'string') {
    return version
  }

  if (typeof version === 'number') {
    return String(version)
  }

  return null
}
