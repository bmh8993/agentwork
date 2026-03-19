import { describe, it, expect } from 'vitest'

import {
  collectBranchOutputs,
  type NodeExecutionResult,
} from './execution-contract'
import { buildPredecessorMap, getReadyNodes, type WorkflowNode, type WorkflowEdge } from './workflow-graph'

describe('execution-contract', () => {
  it('serializes predecessor results into branch_outputs for join nodes', () => {
    const predecessorResults: NodeExecutionResult[] = [
      {
        nodeId: 'branch-a',
        nodeName: 'Branch A',
        type: 'Agent',
        status: 'success',
        output: 'A complete',
      },
      {
        nodeId: 'branch-b',
        nodeName: 'Branch B',
        type: 'Agent',
        status: 'failed',
        error: 'Branch B failed',
      },
    ]

    expect(collectBranchOutputs(predecessorResults)).toEqual([
      {
        node_id: 'branch-a',
        status: 'success',
        output: 'A complete',
        error: undefined,
      },
      {
        node_id: 'branch-b',
        status: 'failed',
        output: undefined,
        error: 'Branch B failed',
      },
    ])
  })
})

describe('workflow-graph', () => {
  it('returns all ready nodes for the current batch', () => {
    const nodes: WorkflowNode[] = [
      { id: 'start', type: 'Start', name: 'Start' },
      { id: 'planner', type: 'Agent', name: 'Planner' },
      { id: 'branch-a', type: 'Agent', name: 'Branch A' },
      { id: 'branch-b', type: 'Agent', name: 'Branch B' },
      { id: 'judge', type: 'Agent', name: 'Judge', config: { join_policy: 'all' } },
    ]

    const edges: WorkflowEdge[] = [
      { source_node_id: 'start', target_node_id: 'planner' },
      { source_node_id: 'planner', target_node_id: 'branch-a' },
      { source_node_id: 'planner', target_node_id: 'branch-b' },
      { source_node_id: 'branch-a', target_node_id: 'judge' },
      { source_node_id: 'branch-b', target_node_id: 'judge' },
    ]

    const predecessors = buildPredecessorMap(nodes, edges)

    expect(getReadyNodes(nodes, predecessors, new Set(['start']))?.map((node) => node.id)).toEqual(['planner'])
    expect(getReadyNodes(nodes, predecessors, new Set(['start', 'planner']))?.map((node) => node.id)).toEqual(['branch-a', 'branch-b'])
    expect(getReadyNodes(nodes, predecessors, new Set(['start', 'planner', 'branch-a']))?.map((node) => node.id)).toEqual(['branch-b'])
    expect(getReadyNodes(nodes, predecessors, new Set(['start', 'planner', 'branch-a', 'branch-b']))?.map((node) => node.id)).toEqual(['judge'])
  })
})
