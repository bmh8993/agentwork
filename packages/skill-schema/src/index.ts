/**
 * @opencode/skill-schema
 *
 * SKILL.json v1 schema validation with AJV
 */

// Error types and contract
export * from './errors'

// Validator
export * from './validator'

import { validateSchema as validateSchemaImpl } from './validator'
import type { ValidationResult } from './errors'

// Domain validation (lazy import to avoid circular dependency)
import {
  addReadOnlyCompatibilityFlags,
  addDraftPublishWarnings,
  addPublishRequiredFieldErrors,
  hasUnsupportedNodes,
  addCardinalityReadOnlyFlags,
  addCardinalityErrors,
} from '@opencode/skill-domain'

// Stage: Load/Draft/Publish/Run validation entry points
export function validateSchema(data: unknown): ValidationResult {
  return validateSchemaImpl(data)
}

// Turn 5: Load validator with read-only compatibility support
export function validateLoad(data: unknown): ValidationResult {
  const schemaResult = validateSchema(data)

  // ADR-0019: Check cardinality first, then unsupported nodes
  let result = addCardinalityReadOnlyFlags(schemaResult, data)
  result = addReadOnlyCompatibilityFlags(result, data)

  return result
}

// Turn 7: Draft validator with warnings for missing publish fields
export function validateDraft(data: unknown): ValidationResult {
  const schemaResult = validateSchema(data)

  // Add warnings for missing publish fields (doesn't block draft)
  let result = addDraftPublishWarnings(schemaResult, data)

  // ADR-0019: Cardinality violations block Draft Save
  result = addCardinalityErrors(result, data)

  return result
}

// Turn 7: Publish validator with strict required field check
export function validatePublish(data: unknown): ValidationResult {
  const schemaResult = validateSchema(data)

  if (!schemaResult.valid) {
    return schemaResult
  }

  // ADR-0019: Check cardinality first, then required fields
  let result = addCardinalityErrors(schemaResult, data)

  if (!result.valid) {
    return result
  }

  // Add errors for missing required publish fields (blocks publish)
  return addPublishRequiredFieldErrors(result, data)
}

// Turn 8: Run validator with strict validation (same as publish)
export function validateRun(data: unknown): ValidationResult {
  const schemaResult = validateSchema(data)

  if (!schemaResult.valid) {
    return schemaResult
  }

  // ADR-0019: Check cardinality first
  let result = addCardinalityErrors(schemaResult, data)

  if (!result.valid) {
    return result
  }

  // Run requires all publish constraints to be satisfied
  result = addPublishRequiredFieldErrors(result, data)

  if (!result.valid) {
    return result
  }

  // Additionally, run is blocked if unsupported nodes are present
  // (unlike load which allows read-only mode)
  if (hasUnsupportedNodes(data)) {
    return {
      ...result,
      valid: false,
      errors: [
        ...result.errors,
        {
          code: 'unsupported_node_type' as const,
          category: 'ValidationError' as const,
          trigger_stage: 'Run' as const,
          message_user: 'Cannot run workflow with unsupported node types',
          next_action: 'Replace unsupported nodes with supported types (Start, Agent, End)',
          retryable: false,
        },
      ],
    }
  }

  return result
}
