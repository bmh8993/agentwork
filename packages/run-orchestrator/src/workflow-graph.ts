export interface WorkflowNode {
  id: string
  name?: string
  type: string
  config?: Record<string, unknown>
}

export interface WorkflowEdge {
  source_node_id: string
  target_node_id: string
}

export function getJoinPolicy(node: WorkflowNode): 'all' {
  const joinPolicy = node.config?.join_policy
  return joinPolicy === 'all' ? 'all' : 'all'
}

export function getWorkflowNodes(workflowData: unknown): WorkflowNode[] {
  if (typeof workflowData !== 'object' || workflowData === null) return []
  const workflow = (workflowData as Record<string, unknown>).workflow
  if (typeof workflow !== 'object' || workflow === null) return []
  const nodes = (workflow as Record<string, unknown>).nodes
  if (!Array.isArray(nodes)) return []

  return nodes.filter((node): node is WorkflowNode => typeof node === 'object' && node !== null && typeof (node as Record<string, unknown>).id === 'string')
}

export function getWorkflowEdges(workflowData: unknown): WorkflowEdge[] {
  if (typeof workflowData !== 'object' || workflowData === null) return []
  const workflow = (workflowData as Record<string, unknown>).workflow
  if (typeof workflow !== 'object' || workflow === null) return []
  const edges = (workflow as Record<string, unknown>).edges
  if (!Array.isArray(edges)) return []

  return edges.filter((edge): edge is WorkflowEdge =>
    typeof edge === 'object' &&
    edge !== null &&
    typeof (edge as Record<string, unknown>).source_node_id === 'string' &&
    typeof (edge as Record<string, unknown>).target_node_id === 'string'
  )
}

export function buildPredecessorMap(nodes: WorkflowNode[], edges: WorkflowEdge[]): Map<string, string[]> {
  const predecessors = new Map<string, string[]>()

  for (const node of nodes) {
    predecessors.set(node.id, [])
  }

  for (const edge of edges) {
    const current = predecessors.get(edge.target_node_id) ?? []
    current.push(edge.source_node_id)
    predecessors.set(edge.target_node_id, current)
  }

  return predecessors
}

export function getReadyNodes(
  nodes: WorkflowNode[],
  predecessors: Map<string, string[]>,
  executed: Set<string>
): WorkflowNode[] {
  return nodes.filter((node) => {
    if (executed.has(node.id)) {
      return false
    }
    const deps = predecessors.get(node.id) ?? []
    const joinPolicy = getJoinPolicy(node)

    if (joinPolicy === 'all') {
      return deps.every((depId) => executed.has(depId))
    }

    return false
  })
}
