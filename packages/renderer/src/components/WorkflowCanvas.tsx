/**
 * OpenCode Workflow Canvas
 *
 * React Flow-based workflow editor canvas.
 * Enforces Start/Agent/End node type constraints (ADR-0015, ADR-0018).
 * ADR-0019: Enforces cardinality rules (Start/End must be exactly 1 each).
 */

import { useCallback, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { nodeTypes } from './nodes';

interface WorkflowCanvasProps {
  onNodeClick?: (nodeId: string) => void;
}

export function WorkflowCanvas({ onNodeClick }: WorkflowCanvasProps) {
  const { nodes, edges, addEdge: storeAddEdge, deleteNode: storeDeleteNode, readOnlyMode, canDeleteNode } = useWorkflowStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const flowEdgeData: Edge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source_node_id,
    target: edge.target_node_id,
  }));

  // React Flow state
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(
    nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: n.position[0], y: n.position[1] },  // v1: position array
      data: n,
    }))
  );

  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(flowEdgeData);

  // Sync store nodes to React Flow when store changes
  useEffect(() => {
    setFlowNodes(
      nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: { x: n.position[0], y: n.position[1] },
        data: n,
      }))
    );
  }, [nodes, setFlowNodes]);

  // Sync store edges to React Flow when store changes
  useEffect(() => {
    setFlowEdges(flowEdgeData);
  }, [flowEdgeData, setFlowEdges]);

  // Handle new connections (v1 format: source_node_id, target_node_id, branch)
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        id: `e-${connection.source}-${connection.target}`,
        source_node_id: connection.source!,
        target_node_id: connection.target!,
        branch: 'default',  // v1 schema requires branch
      };
      storeAddEdge(newEdge);
      // Don't update React Flow edges here - they will sync from store
    },
    [storeAddEdge]
  );

  // Handle node click
  const onNodeClickHandler = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!readOnlyMode && onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [readOnlyMode, onNodeClick]
  );

  // ADR-0019: Handle node deletion with cardinality guard
  const onNodesDeleteHandler = useCallback(
    (nodesToDelete: Node[]) => {
      if (readOnlyMode) {
        return false; // Prevent deletion in read-only mode
      }

      // Check each node for cardinality constraints
      for (const node of nodesToDelete) {
        if (!canDeleteNode(node.id)) {
          const nodeData = node.data as { type: string; name: string };
          const message =
            nodeData.type === 'Start'
              ? 'Cannot delete the only Start node'
              : nodeData.type === 'End'
              ? 'Cannot delete the only End node'
              : 'Cannot delete this node';

          setToastMessage(message);
          setTimeout(() => setToastMessage(null), 3000);
          return false; // Prevent deletion
        }
      }

      // All nodes can be deleted, proceed with deletion
      for (const node of nodesToDelete) {
        storeDeleteNode(node.id);
      }
      return true;
    },
    [readOnlyMode, canDeleteNode, storeDeleteNode]
  );

  // Disable editing in read-only mode
  const isInteractive = useMemo(() => !readOnlyMode, [readOnlyMode]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a1a', position: 'relative' }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={readOnlyMode ? undefined : onNodesChange}
        onEdgesChange={readOnlyMode ? undefined : onEdgesChange}
        onConnect={readOnlyMode ? undefined : onConnect}
        onNodeClick={onNodeClickHandler}
        onNodesDelete={readOnlyMode ? undefined : onNodesDeleteHandler}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={isInteractive}
        nodesConnectable={isInteractive}
        elementsSelectable={isInteractive}
        panOnScroll
        selectionOnDrag
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode="Delete"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#333" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'Start':
              case 'start':
                return '#4ade80';
              case 'End':
              case 'end':
                return '#f87171';
              case 'Agent':
              case 'agent':
                return '#60a5fa';
              default:
                return '#6b7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>

      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            background: '#7c2d12',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#fee2e2',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
