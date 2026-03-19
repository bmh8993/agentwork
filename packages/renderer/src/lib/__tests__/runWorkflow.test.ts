import { describe, expect, it } from 'vitest'

import type { AgentCatalog } from '../../types/agent'
import type { Workflow } from '../../types/workflow'
import { runWorkflowSimulation } from '../runWorkflow'

function createCatalog(): AgentCatalog {
  return {
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
}

function createWorkflow(actionText = 'Process refund request'): Workflow {
  return {
    nodes: [
      { id: 'start-1', name: 'Start', type: 'Start', position: [0, 0] },
      {
        id: 'agent-1',
        name: 'Refund Agent',
        type: 'Agent',
        position: [100, 0],
        config: {
          agent_ref: {
            package: 'customer-support',
            name: 'refund-processor',
          },
          action_text: actionText,
          done_criteria: 'Refund processed successfully',
        },
      },
      { id: 'end-1', name: 'End', type: 'End', position: [200, 0] },
    ],
    edges: [
      { id: 'edge-1', source_node_id: 'start-1', target_node_id: 'agent-1', branch: 'default' },
      { id: 'edge-2', source_node_id: 'agent-1', target_node_id: 'end-1', branch: 'default' },
    ],
    metadata: {
      version: '1',
      name: 'Refund Workflow',
      description: 'Test workflow',
    },
  }
}

describe('runWorkflowSimulation', () => {
  it('runs workflow with renderer AgentCatalog-backed executors', async () => {
    const result = await runWorkflowSimulation(createWorkflow(), createCatalog())

    expect(result.state).toBe('completed')
    const agentResult = result.nodeResults?.find((node) => node.nodeId === 'agent-1')
    expect(agentResult?.output).toContain('customer-support/refund-processor')
    expect(agentResult?.output).toContain('anthropic/claude-sonnet-4')
  })

  it('preserves simulated failure semantics when catalog-backed agent execution fails', async () => {
    const result = await runWorkflowSimulation(createWorkflow('[fail] Process refund request'), createCatalog())

    expect(result.state).toBe('completed')
    expect(result.errors.some((error) => error.message_user.includes('Refund Agent'))).toBe(true)
    const agentResult = result.nodeResults?.find((node) => node.nodeId === 'agent-1')
    expect(agentResult?.status).toBe('failed')
  })
})
