import type { NodeExecutionAdapter } from './node-executor'
import type { WorkflowNode } from './workflow-graph'

export interface AgentReferenceLike {
  package: string
  name: string
}

export type AgentExecutorCatalog = Record<string, NodeExecutionAdapter>

export interface CatalogAgentLike extends AgentReferenceLike {
  id?: string
}

export interface AgentCatalogLike {
  agents: Record<string, CatalogAgentLike>
}

export function createCatalogKey(agentRef: AgentReferenceLike): string {
  return `${agentRef.package}/${agentRef.name}`
}

export function resolveNodeExecutionAdapter(
  node: WorkflowNode,
  catalog?: AgentExecutorCatalog
): NodeExecutionAdapter | undefined {
  if (!catalog || node.type !== 'Agent') {
    return undefined
  }

  const agentRef = node.config?.agent_ref
  if (typeof agentRef !== 'object' || agentRef === null) {
    return undefined
  }

  const ref = agentRef as Partial<AgentReferenceLike>
  if (!ref.package || !ref.name) {
    return undefined
  }

  return catalog[createCatalogKey({ package: ref.package, name: ref.name })]
}

export function createExecutorCatalogFromAgentCatalog(
  agentCatalog: AgentCatalogLike,
  createAdapter: (agent: CatalogAgentLike, agentId: string) => NodeExecutionAdapter | undefined
): AgentExecutorCatalog {
  const executorCatalog: AgentExecutorCatalog = {}

  for (const [agentId, agent] of Object.entries(agentCatalog.agents)) {
    if (!agent.package || !agent.name) {
      continue
    }

    const adapter = createAdapter(agent, agentId)
    if (!adapter) {
      continue
    }

    executorCatalog[createCatalogKey({ package: agent.package, name: agent.name })] = adapter
  }

  return executorCatalog
}
