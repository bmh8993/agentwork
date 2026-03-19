import {
  createRunSession,
  simulateRunExecution,
  startRunSession,
  validateRunSession,
  type NodeExecutionAdapter,
  type NodeExecutionAdapterResult,
  type RunSession,
} from '../../../run-orchestrator/src'

import { createExecutorCatalogFromRendererCatalog } from './agentExecutorCatalog'
import { workflowToSkillJson } from './validation'
import type { Agent, AgentCatalog } from '../types/agent'
import type { Workflow } from '../types/workflow'

function createSimulatedAgentAdapter(agent: Agent): NodeExecutionAdapter {
  return {
    async execute(node): Promise<NodeExecutionAdapterResult> {
      const actionText = typeof node.config?.action_text === 'string' ? node.config.action_text : ''
      const shouldFail = actionText.includes('[fail]') || node.config?.simulate_result === 'failed'

      if (shouldFail) {
        return {
          status: 'failed',
          error: `Agent "${node.name ?? node.id}" execution failed`,
        }
      }

      const modelSuffix = agent.model ? ` using ${agent.model}` : ''
      return {
        status: 'success',
        output: `${agent.package}/${agent.name}${modelSuffix}`,
      }
    },
  }
}

export async function runWorkflowSimulation(
  workflow: Workflow,
  agentCatalog: AgentCatalog,
  sessionId = 'renderer-run-session'
): Promise<RunSession> {
  const skillJson = workflowToSkillJson(workflow)
  const session = createRunSession(sessionId)
  const validatedSession = validateRunSession(session, skillJson)

  if (validatedSession.state === 'failed') {
    return validatedSession
  }

  const startedSession = startRunSession(validatedSession)
  const executorCatalog = createExecutorCatalogFromRendererCatalog(
    agentCatalog,
    (agent) => createSimulatedAgentAdapter(agent)
  )

  return simulateRunExecution(startedSession, skillJson, undefined, executorCatalog)
}
