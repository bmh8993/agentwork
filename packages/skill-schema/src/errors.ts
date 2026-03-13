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

// Error codes for Phase 1-3
export const ERROR_CODES = {
  // Phase 1: Validation
  MISSING_VERSION: 'missing_version',
  INVALID_VERSION_TYPE: 'invalid_version_type',
  UNSUPPORTED_VERSION: 'unsupported_version',
  SCHEMA_VALIDATION_FAILED: 'schema_validation_failed',
  MIGRATION_FAILED: 'migration_failed',
  UNSUPPORTED_NODE_TYPE: 'unsupported_node_type',
  PUBLISH_REQUIRED_FIELD_MISSING: 'publish_required_field_missing',
  PUBLISH_VALIDATION_FAILED: 'publish_validation_failed',
  RUN_VALIDATION_FAILED: 'run_validation_failed',
  // Phase 3: Installer & Logging
  MISSING_REQUIRED_FILE: 'missing_required_file',
  INVALID_PACKAGE_LAYOUT: 'invalid_package_layout',
  UNSUPPORTED_SOURCE: 'unsupported_source',
  SKILL_COMPILE_FAILED: 'skill_compile_failed',
  DEPENDENCY_RESOLUTION_FAILED: 'dependency_resolution_failed',
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
  // Phase 3: Installer errors
  [ERROR_CODES.MISSING_REQUIRED_FILE]: {
    code: ERROR_CODES.MISSING_REQUIRED_FILE,
    category: ERROR_CATEGORIES.InstallError,
    trigger_stage: TRIGGER_STAGES.INSTALL,
    message_user: 'Required file is missing.',
    next_action: 'Include `SKILL.json` as canonical input (`SKILL.md` only is not install input).',
    retryable: false,
  },
  [ERROR_CODES.INVALID_PACKAGE_LAYOUT]: {
    code: ERROR_CODES.INVALID_PACKAGE_LAYOUT,
    category: ERROR_CATEGORIES.InstallError,
    trigger_stage: TRIGGER_STAGES.INSTALL,
    message_user: 'Package layout is invalid.',
    next_action: 'Fix package layout to match the spec.',
    retryable: false,
  },
  [ERROR_CODES.UNSUPPORTED_SOURCE]: {
    code: ERROR_CODES.UNSUPPORTED_SOURCE,
    category: ERROR_CATEGORIES.InstallError,
    trigger_stage: TRIGGER_STAGES.INSTALL,
    message_user: 'Unsupported install source.',
    next_action: 'Use local folder or npm source only.',
    retryable: false,
  },
  [ERROR_CODES.SKILL_COMPILE_FAILED]: {
    code: ERROR_CODES.SKILL_COMPILE_FAILED,
    category: ERROR_CATEGORIES.InstallError,
    trigger_stage: TRIGGER_STAGES.INSTALL,
    message_user: '`SKILL.md` compilation failed.',
    next_action: 'Fix skill content and retry install.',
    retryable: false,
  },
  [ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED]: {
    code: ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED,
    category: ERROR_CATEGORIES.InstallError,
    trigger_stage: TRIGGER_STAGES.INSTALL,
    message_user: 'Dependency resolution failed.',
    next_action: 'Check package versions and network, then retry.',
    retryable: true,
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
