/**
 * OpenCode Workflow Type Definitions
 *
 * Aligned with:
 * - ADR-0018: Action-only Workflow Model
 * - ADR-0015: Node Type Extension Policy
 * - ADR-0020: AgentNode Composition and Action Ownership
 * - ADR-0021: AgentNode Resource Reference Shape
 * - SKILL.json v1 Schema
 */

/**
 * Supported node types in MVP (matching v1 schema case)
 */
export type NodeType = 'Start' | 'Agent' | 'End';

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
 * For Agent type nodes (AgentNode in ADR-0020):
 * - Action and Done Criteria are owned by the AgentNode, not by Agent
 * - Knowledge and Tool references are arrays of stable names/ids (ADR-0021)
 */
export interface NodeData {
  [key: string]: unknown;
  id: string;
  name: string;  // v1 schema: "name" (was "label" in UI-only version)
  type: NodeType;
  position: [number, number];  // v1 schema: required position array [x, y]

  // AgentNode-specific config (ADR-0020, ADR-0021)
  config?: {
    knowledge_refs?: string[];  // ADR-0021: Knowledge resource references
    tool_refs?: string[];  // ADR-0021: Tool capability references
    action_text?: string;  // ADR-0020: Action owned by AgentNode, required for Publish
    done_criteria?: string;  // ADR-0020: Done Criteria owned by AgentNode, required for Publish
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
