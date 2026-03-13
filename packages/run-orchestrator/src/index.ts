/**
 * @opencode/run-orchestrator
 *
 * Skill execution orchestrator with strict pre-flight validation
 * Phase 3: Run gate integration - enforce validateRun before execution
 */

import {
  validateRun,
  type ValidationResult,
  type ValidationError,
} from '@opencode/skill-schema'

// Run session state
export type RunSessionState = 'idle' | 'validated' | 'running' | 'completed' | 'failed'

// Run session
export interface RunSession {
  id: string
  state: RunSessionState
  validatedAt?: Date
  startedAt?: Date
  completedAt?: Date
  errors: ValidationError[]
}

// Pre-flight validation result
export interface PreFlightValidationResult {
  canRun: boolean
  errors: ValidationError[]
  warnings: string[]
}

/**
 * Perform pre-flight validation before starting a run
 * Phase 3 Task 4: Run Strict Gate Integration
 *
 * This function enforces strict validation before allowing execution.
 * If validation fails, the run is blocked before starting.
 */
export function performPreFlightValidation(
  workflowData: unknown
): PreFlightValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // Call validateRun from skill-schema
  // This enforces:
  // 1. Schema validation
  // 2. Publish required fields (action_text, done_criteria)
  // 3. Unsupported node type blocking
  const validationResult: ValidationResult = validateRun(workflowData)

  if (!validationResult.valid) {
    errors.push(...validationResult.errors)
  }

  // Collect warnings if any
  if (validationResult.warnings.length > 0) {
    warnings.push(...validationResult.warnings)
  }

  return {
    canRun: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Create a new run session
 */
export function createRunSession(id: string): RunSession {
  return {
    id,
    state: 'idle',
    errors: [],
  }
}

/**
 * Validate and prepare run session
 * Returns false if validation fails, blocking execution
 */
export function validateRunSession(
  session: RunSession,
  workflowData: unknown
): RunSession {
  // Perform pre-flight validation
  const preFlight = performPreFlightValidation(workflowData)

  if (!preFlight.canRun) {
    return {
      ...session,
      state: 'failed',
      errors: preFlight.errors,
    }
  }

  // Validation passed, session ready to run
  return {
    ...session,
    state: 'validated',
    validatedAt: new Date(),
    errors: [],
  }
}

/**
 * Start a run session
 * Only allowed if session is in 'validated' state
 */
export function startRunSession(session: RunSession): RunSession {
  if (session.state !== 'validated') {
    return {
      ...session,
      state: 'failed',
      errors: [
        ...session.errors,
        {
          code: 'run_validation_failed' as const,
          category: 'ValidationError' as const,
          trigger_stage: 'Run' as const,
          message_user: 'Cannot start run: session not validated',
          next_action: 'Validate workflow before starting run',
          retryable: false,
        },
      ],
    }
  }

  return {
    ...session,
    state: 'running',
    startedAt: new Date(),
  }
}

/**
 * Simulate run execution (for testing)
 */
export async function simulateRunExecution(
  session: RunSession,
  workflowData: unknown
): Promise<RunSession> {
  // Only allow execution if validated
  if (session.state !== 'validated' && session.state !== 'running') {
    return {
      ...session,
      state: 'failed',
      errors: [
        ...session.errors,
        {
          code: 'run_validation_failed' as const,
          category: 'ValidationError' as const,
          trigger_stage: 'Run' as const,
          message_user: 'Cannot execute run: session not validated',
          next_action: 'Validate workflow before running',
          retryable: false,
        },
      ],
    }
  }

  // Simulate successful execution
  return {
    ...session,
    state: 'completed',
    completedAt: new Date(),
  }
}

// Re-export types
export type { ValidationError }
