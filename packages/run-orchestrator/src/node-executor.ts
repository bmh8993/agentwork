import { collectBranchOutputs, type NodeExecutionResult } from './execution-contract'
import type { WorkflowNode } from './workflow-graph'

export interface ExecutionContext {
  sessionId: string
  workflowName?: string
  predecessorResults: NodeExecutionResult[]
}

export interface NodeExecutionAdapterResult {
  status: NodeExecutionResult['status']
  output?: string
  error?: string
}

export interface NodeExecutionAdapter {
  execute(node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionAdapterResult>
}

interface ExecuteNodeOptions {
  adapter?: NodeExecutionAdapter
  context?: Omit<ExecutionContext, 'predecessorResults'>
}

export async function executeNode(
  node: WorkflowNode,
  predecessorResults: NodeExecutionResult[],
  options: ExecuteNodeOptions = {}
): Promise<NodeExecutionResult> {
  const nodeName = typeof node.name === 'string' ? node.name : node.id

  if (node.type !== 'Agent') {
    return {
      nodeId: node.id,
      nodeName,
      type: node.type,
      status: 'success',
      output: `${node.type} completed`,
    }
  }

  const branchOutputs = collectBranchOutputs(predecessorResults)
  const executionContext: ExecutionContext = {
    sessionId: options.context?.sessionId ?? 'simulated-session',
    workflowName: options.context?.workflowName,
    predecessorResults,
  }

  if (options.adapter) {
    const adapterResult = await options.adapter.execute(node, executionContext)
    return {
      nodeId: node.id,
      nodeName,
      type: node.type,
      status: adapterResult.status,
      output: adapterResult.output,
      error: adapterResult.error,
      branch_outputs: branchOutputs.length > 0 ? branchOutputs : undefined,
    }
  }

  const actionText = typeof node.config?.action_text === 'string' ? node.config.action_text : ''
  const shouldFail = actionText.includes('[fail]') || node.config?.simulate_result === 'failed'

  if (shouldFail) {
    return {
      nodeId: node.id,
      nodeName,
      type: node.type,
      status: 'failed',
      error: `Agent "${nodeName}" execution failed`,
      branch_outputs: branchOutputs.length > 0 ? branchOutputs : undefined,
    }
  }

  return {
    nodeId: node.id,
    nodeName,
    type: node.type,
    status: 'success',
    output: `Agent "${nodeName}" completed`,
    branch_outputs: branchOutputs.length > 0 ? branchOutputs : undefined,
  }
}
