/**
 * Node Palette Component
 *
 * Draggable node templates for creating new nodes.
 * MVP: Only Start, Agent, End types are supported (ADR-0015, ADR-0018).
 */

import { useCallback } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import type { NodeData } from '../types/workflow';

const NODE_TEMPLATES: Array<{
  type: 'Start' | 'Agent' | 'End';
  label: string;
  color: string;
  defaultPosition: [number, number];
}> = [
  { type: 'Start', label: '🚀 Start', color: '#10b981', defaultPosition: [100, 100] },
  { type: 'Agent', label: '🤖 Agent', color: '#3b82f6', defaultPosition: [300, 100] },
  { type: 'End', label: '🏁 End', color: '#ef4444', defaultPosition: [500, 100] },
];

export function NodePalette() {
  const { addNode, readOnlyMode } = useWorkflowStore();

  const handleAddNode = useCallback(
    (type: 'Start' | 'Agent' | 'End') => {
      if (readOnlyMode) return;

      const template = NODE_TEMPLATES.find((t) => t.type === type);
      if (!template) return;

      const id = `${type.toLowerCase()}-${Date.now()}`;
      addNode({
        id,
        name: template.label,  // v1 schema uses "name"
        type,
        position: [...template.defaultPosition],  // v1 schema requires position
      });
    },
    [addNode, readOnlyMode]
  );

  return (
    <div
      style={{
        padding: '16px',
        background: '#262626',
        borderRight: '1px solid #404040',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: '600',
          color: '#e5e5e5',
        }}
      >
        Nodes
      </h3>

      {NODE_TEMPLATES.map((template) => (
        <button
          key={template.type}
          onClick={() => handleAddNode(template.type)}
          disabled={readOnlyMode}
          style={{
            padding: '10px 12px',
            background: readOnlyMode ? '#262626' : '#1f1f1f',
            border: `1px solid ${template.color}`,
            borderRadius: '6px',
            color: readOnlyMode ? '#525252' : '#e5e5e5',
            cursor: readOnlyMode ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            textAlign: 'left',
            transition: 'all 0.2s',
            opacity: readOnlyMode ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!readOnlyMode) {
              e.currentTarget.style.background = template.color;
              e.currentTarget.style.color = '#000';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = readOnlyMode ? '#262626' : '#1f1f1f';
            e.currentTarget.style.color = readOnlyMode ? '#525252' : '#e5e5e5';
          }}
        >
          {template.label}
        </button>
      ))}

      {readOnlyMode && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            background: '#444036',
            border: '1px solid #a8a29e',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#d6d3d1',
          }}
        >
          Read-only mode
        </div>
      )}
    </div>
  );
}
