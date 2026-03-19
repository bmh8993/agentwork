import {
  ERROR_CODES,
  type ValidationError,
} from '@opencode/skill-schema'

export type RunSessionState = 'idle' | 'validated' | 'running' | 'completed' | 'failed'

export type NodeExecutionStatus = 'success' | 'failed' | 'skipped'

export interface BranchOutput {
  node_id: string
  status: NodeExecutionStatus
  output?: string
  error?: string
}

export interface NodeExecutionResult {
  nodeId: string
  nodeName: string
  type: string
  status: NodeExecutionStatus
  output?: string
  error?: string
  branch_outputs?: BranchOutput[]
}

export interface RunSession {
  id: string
  state: RunSessionState
  validatedAt?: Date
  startedAt?: Date
  completedAt?: Date
  errors: ValidationError[]
  nodeResults?: NodeExecutionResult[]
}

export interface PreFlightValidationResult {
  canRun: boolean
  errors: ValidationError[]
  warnings: string[]
}

export function collectBranchOutputs(results: NodeExecutionResult[]): BranchOutput[] {
  return results.map((result) => ({
    node_id: result.nodeId,
    status: result.status,
    output: result.output,
    error: result.error,
  }))
}

export function createRuntimeError(message: string, nextAction: string): ValidationError {
  return {
    code: ERROR_CODES.RUN_VALIDATION_FAILED,
    category: 'RuntimeError',
    trigger_stage: 'Run',
    message_user: message,
    next_action: nextAction,
    retryable: false,
  }
}
