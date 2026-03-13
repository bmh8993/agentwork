/**
 * Error Contract for SKILL.json validation
 *
 * Reference: POL-02-error-codes-and-test-gates.md
 */

// Error categories
export const ERROR_CATEGORIES = {
  ValidationError: 'ValidationError',
  InstallError: 'InstallError',
  RuntimeError: 'RuntimeError',
} as const

export type ErrorCategory = (typeof ERROR_CATEGORIES)[keyof typeof ERROR_CATEGORIES]

// Error codes for Phase 1 (Validation focus)
export const ERROR_CODES = {
  MISSING_VERSION: 'missing_version',
  INVALID_VERSION_TYPE: 'invalid_version_type',
  UNSUPPORTED_VERSION: 'unsupported_version',
  SCHEMA_VALIDATION_FAILED: 'schema_validation_failed',
  MIGRATION_FAILED: 'migration_failed',
  UNSUPPORTED_NODE_TYPE: 'unsupported_node_type',
  PUBLISH_REQUIRED_FIELD_MISSING: 'publish_required_field_missing',
  PUBLISH_VALIDATION_FAILED: 'publish_validation_failed',
  RUN_VALIDATION_FAILED: 'run_validation_failed',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

// Trigger stages
export const TRIGGER_STAGES = {
  LOAD: 'Load',
  DRAFT: 'Draft',
  PUBLISH: 'Publish',
  RUN: 'Run',
  INSTALL: 'Install',
} as const

export type TriggerStage = (typeof TRIGGER_STAGES)[keyof typeof TRIGGER_STAGES]

// Error contract interface
export interface ValidationError {
  code: ErrorCode
  category: ErrorCategory
  trigger_stage: TriggerStage
  message_user: string
  next_action: string
  retryable: boolean
  path?: string // Optional JSON path for schema errors
}

// Error code catalog (Phase 1 subset)
export const ERROR_CATALOG: Record<ErrorCode, Omit<ValidationError, 'path'>> = {
  [ERROR_CODES.MISSING_VERSION]: {
    code: ERROR_CODES.MISSING_VERSION,
    category: ERROR_CATEGORIES.ValidationError,
    trigger_stage: TRIGGER_STAGES.LOAD,
    message_user: 'Version is missing.',
    next_action: 'Add `version: "1"` to `SKILL.json`.',
    retryable: false,
  },
  [ERROR_CODES.INVALID_VERSION_TYPE]: {
    code: ERROR_CODES.INVALID_VERSION_TYPE,
    category: ERROR_CATEGORIES.ValidationError,
    trigger_stage: TRIGGER_STAGES.LOAD,
    message_user: 'Version format is invalid.',
    next_action: 'Set `version` to a string value.',
    retryable: false,
  },
  [ERROR_CODES.UNSUPPORTED_VERSION]: {
    code: ERROR_CODES.UNSUPPORTED_VERSION,
    category: ERROR_CATEGORIES.ValidationError,
    trigger_stage: TRIGGER_STAGES.LOAD,
    message_user: 'This version is not supported.',
    next_action: 'Migrate to a supported version.',
    retryable: false,
  },
  [ERROR_CODES.SCHEMA_VALIDATION_FAILED]: {
    code: ERROR_CODES.SCHEMA_VALIDATION_FAILED,
    category: ERROR_CATEGORIES.ValidationError,
    trigger_stage: TRIGGER_STAGES.DRAFT,
    message_user: 'File structure is invalid.',
    next_action: 'Fix required fields and field types.',
    retryable: false,
  },
  [ERROR_CODES.MIGRATION_FAILED]: {
    code: ERROR_CODES.MIGRATION_FAILED,
    category: ERROR_CATEGORIES.ValidationError,
    trigger_stage: TRIGGER_STAGES.LOAD,
    message_user: 'Migration failed.',
    next_action: 'Restore from `.bak` and retry migration.',
    retryable: true,
  },
  [ERROR_CODES.UNSUPPORTED_NODE_TYPE]: {
    code: ERROR_CODES.UNSUPPORTED_NODE_TYPE,
    category: ERROR_CATEGORIES.ValidationError,
    trigger_stage: TRIGGER_STAGES.PUBLISH,
    message_user: 'Unsupported node type is included.',
    next_action: 'Replace unsupported nodes with supported types.',
    retryable: false,
  },
  [ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING]: {
    code: ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING,
    category: ERROR_CATEGORIES.ValidationError,
    trigger_stage: TRIGGER_STAGES.PUBLISH,
    message_user: 'Required publish fields are missing.',
    next_action: 'Fill `action_text` and `done_criteria`.',
    retryable: false,
  },
  [ERROR_CODES.PUBLISH_VALIDATION_FAILED]: {
    code: ERROR_CODES.PUBLISH_VALIDATION_FAILED,
    category: ERROR_CATEGORIES.ValidationError,
    trigger_stage: TRIGGER_STAGES.PUBLISH,
    message_user: 'Publish validation failed.',
    next_action: 'Resolve validation errors and publish again.',
    retryable: false,
  },
  [ERROR_CODES.RUN_VALIDATION_FAILED]: {
    code: ERROR_CODES.RUN_VALIDATION_FAILED,
    category: ERROR_CATEGORIES.ValidationError,
    trigger_stage: TRIGGER_STAGES.RUN,
    message_user: 'Pre-run validation failed.',
    next_action: 'Resolve validation errors and run again.',
    retryable: false,
  },
}

// Error factory
export function createError(
  code: ErrorCode,
  overrides?: Partial<Omit<ValidationError, 'code' | 'category'>>
): ValidationError {
  const base = ERROR_CATALOG[code]
  return {
    ...base,
    ...overrides,
  }
}

// Create schema validation error with path
export function createSchemaError(path: string, message: string): ValidationError {
  return createError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, {
    path,
    message_user: message,
  })
}

// Validation result type
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: string[]
  flags?: ValidationFlags
}

// Validation flags for stage-specific behavior
export interface ValidationFlags {
  // Load stage: read-only compatibility mode
  readOnlyCompatibility?: boolean
  // Load stage: unsupported node types detected
  unsupportedNodeTypes?: string[]
}

// Helper to check if validation passed
export function isValid(result: ValidationResult): result is { valid: true } & ValidationResult {
  return result.valid
}

// Helper to get first error message
export function getFirstErrorMessage(result: ValidationResult): string | null {
  return result.errors.length > 0 ? result.errors[0].message_user : null
}
