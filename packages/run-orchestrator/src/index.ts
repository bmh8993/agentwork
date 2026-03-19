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
import {
  createRuntimeError,
  type NodeExecutionResult,
  type PreFlightValidationResult,
  type RunSession,
} from './execution-contract'
import {
  resolveNodeExecutionAdapter,
  type AgentExecutorCatalog,
} from './agent-executor-catalog'
import { executeNode, type NodeExecutionAdapter } from './node-executor'
import {
  buildPredecessorMap,
  getReadyNodes,
  getWorkflowEdges,
  getWorkflowNodes,
} from './workflow-graph'

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
  // 2. Publish required fields (agent_ref, action_text, done_criteria)
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
    nodeResults: [],
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
  workflowData: unknown,
  adapter?: NodeExecutionAdapter,
  agentCatalog?: AgentExecutorCatalog
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

  const nodes = getWorkflowNodes(workflowData)
  const edges = getWorkflowEdges(workflowData)

  if (nodes.length === 0) {
    return {
      ...session,
      state: 'failed',
      errors: [
        ...session.errors,
        createRuntimeError('Cannot execute run: workflow has no nodes', 'Add workflow nodes before running'),
      ],
    }
  }

  const predecessors = buildPredecessorMap(nodes, edges)

  const pending = new Set(nodes.map((node) => node.id))
  const executed = new Map<string, NodeExecutionResult>()
  const runtimeErrors: ValidationError[] = [...session.errors]
  const nodeResults: NodeExecutionResult[] = []

  while (pending.size > 0) {
    const readyNodes = getReadyNodes(nodes.filter((node) => pending.has(node.id)), predecessors, new Set(executed.keys()))

    if (readyNodes.length === 0) {
      return {
        ...session,
        state: 'failed',
        errors: [
          ...runtimeErrors,
          createRuntimeError('Cannot execute run: workflow graph has unresolved dependencies', 'Check workflow edges for cycles or disconnected dependencies'),
        ],
        nodeResults,
      }
    }

    const batchResults = await Promise.all(
      readyNodes.map(async (node) => {
        const deps = predecessors.get(node.id) ?? []
        const predecessorResults = deps
          .map((depId) => executed.get(depId))
          .filter((result): result is NodeExecutionResult => result !== undefined)
        const resolvedAdapter = resolveNodeExecutionAdapter(node, agentCatalog) ?? adapter
        return executeNode(node, predecessorResults, {
          adapter: resolvedAdapter,
          context: {
            sessionId: session.id,
            workflowName: typeof (workflowData as Record<string, unknown>)?.skill === 'object' && (workflowData as Record<string, unknown>)?.skill !== null
              ? ((workflowData as Record<string, unknown>).skill as Record<string, unknown>).name as string | undefined
              : undefined,
          },
        })
      })
    )

    for (const result of batchResults) {
      pending.delete(result.nodeId)
      executed.set(result.nodeId, result)
      nodeResults.push(result)

      if (result.status === 'failed') {
        runtimeErrors.push(
          createRuntimeError(
            result.error ?? `Agent "${result.nodeName}" execution failed`,
            'Inspect branch outputs and retry or adjust the agent configuration'
          )
        )
      }
    }
  }

  return {
    ...session,
    state: 'completed',
    completedAt: new Date(),
    errors: runtimeErrors,
    nodeResults,
  }
}

// Re-export types
export type { ValidationError }
export type {
  BranchOutput,
  NodeExecutionResult,
  NodeExecutionStatus,
  PreFlightValidationResult,
  RunSession,
  RunSessionState,
} from './execution-contract'
export { executeNode } from './node-executor'
export {
  createCatalogKey,
  createExecutorCatalogFromAgentCatalog,
  resolveNodeExecutionAdapter,
} from './agent-executor-catalog'
export type {
  AgentExecutorCatalog,
  AgentCatalogLike,
  CatalogAgentLike,
} from './agent-executor-catalog'
export type {
  ExecutionContext,
  NodeExecutionAdapter,
  NodeExecutionAdapterResult,
} from './node-executor'
