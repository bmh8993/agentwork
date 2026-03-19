/**
 * OpenCode Workflow State Management
 *
 * Zustand store for workflow graph state.
 * Manages nodes, edges, and read-only compatibility mode.
 */

import { create } from 'zustand';
import type { NodeData, Edge, WorkflowState, ReadOnlyFlags, NodeType } from '../types/workflow';
import { createEmptyCatalog, type AgentCatalog } from '../types/agent';
import { CARDINALITY_RULES } from '../types/workflow';

interface WorkflowStore extends WorkflowState {
  // Actions
  addNode: (node: NodeData) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;
  setWorkflow: (workflow: WorkflowState) => void;
  setReadOnlyMode: (flags: ReadOnlyFlags) => void;
  clearWorkflow: () => void;

  // ADR-0022: Package/Agent catalog state
  agentCatalog: AgentCatalog;
  setAgentCatalog: (catalog: AgentCatalog) => void;

  // ADR-0019: Cardinality guards
  canAddNodeType: (type: NodeType) => boolean;
  canDeleteNode: (id: string) => boolean;

  // Validation state
  validationErrors: string[];
  setValidationErrors: (errors: string[]) => void;

  // UI state
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

const initialState: WorkflowState = {
  // ADR-0019: Default workflow starts with Start and End nodes
  nodes: [
    {
      id: 'start-1',
      name: '🚀 Start',
      type: 'Start',
      position: [100, 100],
    },
    {
      id: 'end-1',
      name: '🏁 End',
      type: 'End',
      position: [500, 100],
    },
  ],
  edges: [],
  metadata: {
    version: '1',
  },
  readOnlyMode: false,
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  ...initialState,
  agentCatalog: createEmptyCatalog(),

  // ADR-0019: Cardinality guard - check if node type can be added
  canAddNodeType: (type: NodeType) => {
    const state = get()
    const currentCount = state.nodes.filter((n) => n.type === type).length
    const rule = CARDINALITY_RULES[type]

    return currentCount < rule.max
  },

  // ADR-0019: Cardinality guard - check if node can be deleted
  canDeleteNode: (id: string) => {
    const state = get()
    const node = state.nodes.find((n) => n.id === id)

    if (!node) {
      return false // Node doesn't exist
    }

    const type = node.type as NodeType
    const rule = CARDINALITY_RULES[type]
    const currentCount = state.nodes.filter((n) => n.type === type).length

    // Can't delete if it would go below minimum
    return currentCount > rule.min
  },

  addNode: (node) =>
    set((state) => {
      // ADR-0019: Check cardinality before adding
      const type = node.type as NodeType
      const currentCount = state.nodes.filter((n) => n.type === type).length
      const rule = CARDINALITY_RULES[type]

      if (currentCount >= rule.max) {
        // Don't add if it would exceed maximum
        return state
      }

      return {
        nodes: [...state.nodes, { ...node, position: node.position || [0, 0] }],
      }
    }),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    })),

  deleteNode: (id) =>
    set((state) => {
      // ADR-0019: Check cardinality before deleting
      const node = state.nodes.find((n) => n.id === id)

      if (!node) {
        return state // Node doesn't exist
      }

      const type = node.type as NodeType
      const rule = CARDINALITY_RULES[type]
      const currentCount = state.nodes.filter((n) => n.type === type).length

      // Don't delete if it would go below minimum
      if (currentCount <= rule.min) {
        return state
      }

      return {
        nodes: state.nodes.filter((n) => n.id !== id),
        // Update: use source_node_id/target_node_id for v1 schema
        edges: state.edges.filter(
          (e) => e.source_node_id !== id && e.target_node_id !== id
        ),
      }
    }),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),

  deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),

  setWorkflow: (workflow) =>
    set({
      nodes: workflow.nodes,
      edges: workflow.edges,
      metadata: workflow.metadata,
      readOnlyMode: workflow.readOnlyMode,
      readOnlyFlags: workflow.readOnlyFlags,
    }),

  setReadOnlyMode: (flags) =>
    set({
      readOnlyMode: flags.readOnlyCompatibility,
      readOnlyFlags: flags,
    }),

  clearWorkflow: () => set(initialState),

  setAgentCatalog: (catalog) => set({ agentCatalog: catalog }),

  validationErrors: [],
  setValidationErrors: (errors) => set({ validationErrors: errors }),

  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));
