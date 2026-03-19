import {
  createExecutorCatalogFromAgentCatalog,
  type AgentExecutorCatalog,
  type CatalogAgentLike,
  type NodeExecutionAdapter,
} from '../../../run-orchestrator/src'

import type { Agent, AgentCatalog } from '../types/agent'

export type RendererAgentAdapterFactory = (
  agent: Agent,
  agentId: string
) => NodeExecutionAdapter | undefined

function toCatalogAgent(agent: Agent): CatalogAgentLike {
  return {
    id: agent.id,
    package: agent.package,
    name: agent.name,
  }
}

export function createExecutorCatalogFromRendererCatalog(
  agentCatalog: AgentCatalog,
  createAdapter: RendererAgentAdapterFactory
): AgentExecutorCatalog {
  return createExecutorCatalogFromAgentCatalog(
    {
      agents: Object.fromEntries(
        Object.entries(agentCatalog.agents).map(([agentId, agent]) => [
          agentId,
          toCatalogAgent(agent),
        ])
      ),
    },
    (_agent, agentId) => {
      const rendererAgent = agentCatalog.agents[agentId]
      if (!rendererAgent) {
        return undefined
      }

      return createAdapter(rendererAgent, agentId)
    }
  )
}
