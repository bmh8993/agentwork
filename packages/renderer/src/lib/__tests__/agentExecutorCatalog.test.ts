import { describe, expect, it } from 'vitest'

import type { AgentCatalog } from '../../types/agent'
import { createExecutorCatalogFromRendererCatalog } from '../agentExecutorCatalog'

describe('createExecutorCatalogFromRendererCatalog', () => {
  it('converts renderer AgentCatalog entries into orchestrator executor catalog entries', async () => {
    const catalog: AgentCatalog = {
      packages: {
        'customer-support': {
          id: 'customer-support',
          name: 'Customer Support',
          version: '1.0.0',
        },
      },
      agents: {
        'customer-support/refund-processor': {
          id: 'customer-support/refund-processor',
          package: 'customer-support',
          name: 'refund-processor',
          model: 'anthropic/claude-sonnet-4',
        },
      },
      tools: {},
      knowledge: {},
      scripts: {},
      byPackage: {
        'customer-support': {
          agents: ['customer-support/refund-processor'],
          tools: [],
          knowledge: [],
          scripts: [],
        },
      },
    }

    const executorCatalog = createExecutorCatalogFromRendererCatalog(catalog, (agent) => ({
      async execute() {
        return {
          status: 'success',
          output: `${agent.package}/${agent.name}:${agent.model}`,
        }
      },
    }))

    const adapter = executorCatalog['customer-support/refund-processor']
    expect(adapter).toBeDefined()

    const result = await adapter?.execute(
      { id: 'agent-1', type: 'Agent', config: {} },
      { sessionId: 'session-1', predecessorResults: [] }
    )

    expect(result?.output).toBe('customer-support/refund-processor:anthropic/claude-sonnet-4')
  })
})
