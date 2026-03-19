/**
 * OpenCode Workflow Type Definitions
 *
 * Aligned with:
 * - ADR-0018: Action-only Workflow Model
 * - ADR-0015: Node Type Extension Policy
 * - ADR-0020: AgentNode Composition and Action Ownership
 * - ADR-0021: AgentNode Resource Reference Shape
 * - ADR-0022: Platform-neutral Assistant Package Canonical and AgentNode Reference
 * - ADR-0023: Parallel AgentNode Execution via Graph Fan-out and Fan-in
 * - SKILL.json v1 Schema
 */

/**
 * Supported node types in MVP (matching v1 schema case)
 */
export type NodeType = 'Start' | 'Agent' | 'End';

/**
 * ADR-0022: Agent reference shape
 * AgentNode references reusable Agent from package catalog
 */
export interface AgentReference {
  package: string;  // Package identifier
  name: string;     // Agent name within package
}

/**
 * ADR-0023: Join policy for parallel execution
 * Default is 'all' - all predecessors must complete
 */
export type JoinPolicy = 'all';  // Future: 'any' | 'quorum' | 'weighted'

/**
 * ADR-0019: Cardinality rules for node types
 */
export interface CardinalityRule {
  min: number;
  max: number;
}

export const CARDINALITY_RULES: Record<NodeType, CardinalityRule> = {
  Start: { min: 1, max: 1 },
  End: { min: 1, max: 1 },
  Agent: { min: 0, max: Infinity },
};

/**
 * Node data structure (aligned with v1 schema)
 *
 * For Agent type nodes (AgentNode in ADR-0020, ADR-0022, ADR-0023):
 * - Agent is referenced by agent_ref, not defined inline (ADR-0022)
 * - Action and Done Criteria are owned by the AgentNode (ADR-0020, ADR-0022)
 * - Knowledge and Tool are owned by Agent, not AgentNode (ADR-0022)
 * - Join policy controls parallel execution behavior (ADR-0023)
 */
export interface NodeData {
  [key: string]: unknown;
  id: string;
  name: string;  // v1 schema: "name" (was "label" in UI-only version)
  type: NodeType;
  position: [number, number];  // v1 schema: required position array [x, y]

  // AgentNode-specific config (ADR-0020, ADR-0022, ADR-0023)
  config?: {
    // ADR-0022: Reference to reusable Agent in package catalog
    agent_ref?: AgentReference;

    // ADR-0020, ADR-0022: Action and Done Criteria owned by AgentNode, required for Publish
    action_text?: string;
    done_criteria?: string;

    // ADR-0023: Join policy for parallel execution (default: 'all')
    join_policy?: JoinPolicy;
  };
}

/**
 * Workflow edge (aligned with v1 schema)
 */
export interface Edge {
  id: string;
  source_node_id: string;  // v1 schema: source_node_id (was "source")
  target_node_id: string;  // v1 schema: target_node_id (was "target")
  branch: string;  // v1 schema: required branch field
}

/**
 * Complete workflow graph
 */
export interface Workflow {
  nodes: NodeData[];
  edges: Edge[];
  metadata?: {
    version: string;
    name?: string;
    description?: string;
  };
}

/**
 * Read-only compatibility flags (from Phase 1 backend)
 */
export interface ReadOnlyFlags {
  readOnlyCompatibility: boolean;
  unsupportedNodeTypes: string[];
}

/**
 * Workflow state including compatibility mode
 */
export interface WorkflowState extends Workflow {
  readOnlyMode?: boolean;
  readOnlyFlags?: ReadOnlyFlags;
}
