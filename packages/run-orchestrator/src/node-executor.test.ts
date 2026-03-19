import { describe, it, expect } from 'vitest'

import type { NodeExecutionResult } from './execution-contract'
import { executeNode, type ExecutionContext, type NodeExecutionAdapter } from './node-executor'
import type { WorkflowNode } from './workflow-graph'

describe('node-executor', () => {
  it('executes non-Agent nodes as successful pass-through results', async () => {
    const node: WorkflowNode = {
      id: 'start',
      name: 'Start',
      type: 'Start',
    }

    const result = await executeNode(node, [])

    expect(result).toEqual({
      nodeId: 'start',
      nodeName: 'Start',
      type: 'Start',
      status: 'success',
      output: 'Start completed',
    })
  })

  it('executes Agent nodes and collects predecessor branch outputs', async () => {
    const node: WorkflowNode = {
      id: 'judge',
      name: 'Judge',
      type: 'Agent',
      config: {
        action_text: 'Merge outputs',
      },
    }

    const predecessorResults: NodeExecutionResult[] = [
      {
        nodeId: 'branch-a',
        nodeName: 'Branch A',
        type: 'Agent',
        status: 'success',
        output: 'A result',
      },
      {
        nodeId: 'branch-b',
        nodeName: 'Branch B',
        type: 'Agent',
        status: 'failed',
        error: 'B failed',
      },
    ]

    const result = await executeNode(node, predecessorResults)

    expect(result.status).toBe('success')
    expect(result.branch_outputs).toEqual([
      {
        node_id: 'branch-a',
        status: 'success',
        output: 'A result',
        error: undefined,
      },
      {
        node_id: 'branch-b',
        status: 'failed',
        output: undefined,
        error: 'B failed',
      },
    ])
  })

  it('marks Agent nodes as failed when action_text requests simulated failure', async () => {
    const node: WorkflowNode = {
      id: 'branch-b',
      name: 'Branch B',
      type: 'Agent',
      config: {
        action_text: '[fail] Analyze branch B',
      },
    }

    const result = await executeNode(node, [])

    expect(result.status).toBe('failed')
    expect(result.error).toContain('Branch B')
  })

  it('delegates Agent execution to a custom adapter with execution context', async () => {
    const node: WorkflowNode = {
      id: 'agent-1',
      name: 'Agent 1',
      type: 'Agent',
      config: {
        action_text: 'Do custom work',
      },
    }

    const context: ExecutionContext = {
      sessionId: 'session-1',
      workflowName: 'Custom Workflow',
      predecessorResults: [],
    }

    const adapter: NodeExecutionAdapter = {
      async execute(agentNode, executionContext) {
        expect(agentNode.id).toBe('agent-1')
        expect(executionContext.sessionId).toBe('session-1')
        expect(executionContext.workflowName).toBe('Custom Workflow')

        return {
          status: 'success',
          output: `adapter:${agentNode.id}`,
        }
      },
    }

    const result = await executeNode(node, [], { adapter, context })

    expect(result.status).toBe('success')
    expect(result.output).toBe('adapter:agent-1')
  })
})
