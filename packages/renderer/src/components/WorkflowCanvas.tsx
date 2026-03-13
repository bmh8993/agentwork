/**
 * OpenCode Workflow Canvas
 *
 * React Flow-based workflow editor canvas.
 * Enforces Start/Agent/End node type constraints (ADR-0015, ADR-0018).
 */

import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  OnNodesChange,
  OnEdgesChange,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { nodeTypes } from './nodes';
import type { NodeData } from '../types/workflow';

interface WorkflowCanvasProps {
  onNodeClick?: (nodeId: string) => void;
}

export function WorkflowCanvas({ onNodeClick }: WorkflowCanvasProps) {
  const { nodes, edges, addEdge: storeAddEdge, readOnlyMode } = useWorkflowStore();

  // React Flow state
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<Node<NodeData>>(
    nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: n.position[0], y: n.position[1] },  // v1: position array
      data: n,
    }))
  );

  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>(edges);

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
    setFlowEdges(edges);
  }, [edges, setFlowEdges]);

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
    (_: React.MouseEvent, node: Node<NodeData>) => {
      if (!readOnlyMode && onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [readOnlyMode, onNodeClick]
  );

  // Disable editing in read-only mode
  const isInteractive = useMemo(() => !readOnlyMode, [readOnlyMode]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={readOnlyMode ? undefined : onNodesChange}
        onEdgesChange={readOnlyMode ? undefined : onEdgesChange}
        onConnect={readOnlyMode ? undefined : onConnect}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={isInteractive}
        nodesConnectable={isInteractive}
        elementsSelectable={isInteractive}
        panOnScroll
        selectionOnDrag
        minZoom={0.2}
        maxZoom={2}
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
    </div>
  );
}
