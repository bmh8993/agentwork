/**
 * OpenCode Workflow State Management
 *
 * Zustand store for workflow graph state.
 * Manages nodes, edges, and read-only compatibility mode.
 */

import { create } from 'zustand';
import type { NodeData, Edge, WorkflowState, ReadOnlyFlags } from '../types/workflow';

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

  // Validation state
  validationErrors: string[];
  setValidationErrors: (errors: string[]) => void;

  // UI state
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  metadata: {
    version: '1',
  },
  readOnlyMode: false,
};

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  ...initialState,

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, { ...node, position: node.position || [0, 0] }],
    })),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      // Update: use source_node_id/target_node_id for v1 schema
      edges: state.edges.filter(
        (e) => e.source_node_id !== id && e.target_node_id !== id
      ),
    })),

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

  validationErrors: [],
  setValidationErrors: (errors) => set({ validationErrors: errors }),

  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));
