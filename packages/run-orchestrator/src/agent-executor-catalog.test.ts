import { describe, it, expect } from 'vitest'

import type { NodeExecutionAdapter } from './node-executor'
import {
  createCatalogKey,
  createExecutorCatalogFromAgentCatalog,
  resolveNodeExecutionAdapter,
  type AgentCatalogLike,
  type AgentExecutorCatalog,
} from './agent-executor-catalog'
import type { WorkflowNode } from './workflow-graph'

describe('agent-executor-catalog', () => {
  it('creates a stable catalog key from package/name', () => {
    expect(createCatalogKey({ package: 'customer-support', name: 'refund-processor' })).toBe('customer-support/refund-processor')
  })

  it('resolves the node execution adapter from agent_ref', () => {
    const adapter: NodeExecutionAdapter = {
      async execute() {
        return { status: 'success', output: 'ok' }
      },
    }

    const catalog: AgentExecutorCatalog = {
      'customer-support/refund-processor': adapter,
    }

    const node: WorkflowNode = {
      id: 'agent-1',
      name: 'Refund Agent',
      type: 'Agent',
      config: {
        agent_ref: {
          package: 'customer-support',
          name: 'refund-processor',
        },
      },
    }

    expect(resolveNodeExecutionAdapter(node, catalog)).toBe(adapter)
  })

  it('returns undefined when no matching adapter exists', () => {
    const catalog: AgentExecutorCatalog = {}
    const node: WorkflowNode = {
      id: 'agent-1',
      name: 'Refund Agent',
      type: 'Agent',
      config: {
        agent_ref: {
          package: 'customer-support',
          name: 'refund-processor',
        },
      },
    }

    expect(resolveNodeExecutionAdapter(node, catalog)).toBeUndefined()
  })

  it('builds an executor catalog from an agent catalog', async () => {
    const agentCatalog: AgentCatalogLike = {
      agents: {
        'customer-support/refund-processor': {
          id: 'customer-support/refund-processor',
          package: 'customer-support',
          name: 'refund-processor',
        },
        'customer-support/escalation-reviewer': {
          id: 'customer-support/escalation-reviewer',
          package: 'customer-support',
          name: 'escalation-reviewer',
        },
      },
    }

    const executorCatalog = createExecutorCatalogFromAgentCatalog(agentCatalog, (agent) => ({
      async execute() {
        return {
          status: 'success',
          output: `adapter:${agent.package}/${agent.name}`,
        }
      },
    }))

    const refundAdapter = executorCatalog['customer-support/refund-processor']
    expect(refundAdapter).toBeDefined()

    const result = await refundAdapter?.execute(
      {
        id: 'agent-1',
        type: 'Agent',
        config: {},
      },
      {
        sessionId: 'session-1',
        predecessorResults: [],
      }
    )

    expect(result?.output).toBe('adapter:customer-support/refund-processor')
  })
})
