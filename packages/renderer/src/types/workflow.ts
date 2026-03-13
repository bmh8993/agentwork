/**
 * OpenCode Workflow Type Definitions
 *
 * Aligned with:
 * - ADR-0018: Action-only Workflow Model
 * - ADR-0015: Node Type Extension Policy
 * - SKILL.json v1 Schema
 */

/**
 * Supported node types in MVP (matching v1 schema case)
 */
export type NodeType = 'Start' | 'Agent' | 'End';

/**
 * Node data structure (aligned with v1 schema)
 */
export interface NodeData {
  [key: string]: unknown;
  id: string;
  name: string;  // v1 schema: "name" (was "label" in UI-only version)
  type: NodeType;
  position: [number, number];  // v1 schema: required position array [x, y]

  // Agent-specific config (ADR-0017)
  config?: {
    knowledge?: string;
    tool?: string;
    action_text?: string;  // Required for Publish
    done_criteria?: string;  // Required for Publish
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
