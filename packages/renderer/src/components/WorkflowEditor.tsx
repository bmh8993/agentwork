/**
 * Workflow Editor Component
 *
 * Main editor layout with node palette and canvas.
 */

import { useWorkflowStore } from '../store/workflowStore';
import { NodePalette } from './NodePalette';
import { WorkflowCanvas } from './WorkflowCanvas';
import { AgentCardEditor } from './AgentCardEditor';

export function WorkflowEditor() {
  const { readOnlyMode, readOnlyFlags, selectedNodeId, nodes, setSelectedNodeId } = useWorkflowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: 'calc(100vh - 60px)',
      }}
    >
      {/* Node Palette */}
      <NodePalette />

      {/* Canvas */}
      <WorkflowCanvas onNodeClick={setSelectedNodeId} />

      {/* Read-only Banner */}
      {readOnlyMode && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            background: '#444036',
            border: '1px solid #a8a29e',
            borderRadius: '8px',
            color: '#d6d3d1',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
        >
          ⚠️ Read-only mode: Document contains unsupported nodes
          {readOnlyFlags?.unsupportedNodeTypes && (
            <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.8 }}>
              ({readOnlyFlags.unsupportedNodeTypes.join(', ')})
            </span>
          )}
        </div>
      )}

      {/* Agent Card Editor Modal */}
      {selectedNode && selectedNode.type === 'agent' && (
        <AgentCardEditor node={selectedNode} onClose={() => setSelectedNodeId(null)} />
      )}
    </div>
  );
}
