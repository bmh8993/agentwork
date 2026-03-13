/**
 * Agent Node Component
 *
 * Core workflow node with required slots: Knowledge, Tool, Action, Done Criteria.
 * ADR-0017: Agent Card UX and Draft/Publish Gate
 */

import { Handle, Position, NodeProps } from '@xyflow/react';
import type { NodeData } from '../../types/workflow';

export function AgentNode({ data }: NodeProps<NodeData>) {
  // Check if required fields are populated (from config object)
  const actionText = data.config?.action_text;
  const doneCriteria = data.config?.done_criteria;
  const hasActionText = !!actionText && actionText.trim().length > 0;
  const hasDoneCriteria = !!doneCriteria && doneCriteria.trim().length > 0;
  const isComplete = hasActionText && hasDoneCriteria;

  return (
    <div
      style={{
        padding: '16px',
        background: '#1e3a8a',
        border: `2px solid ${isComplete ? '#3b82f6' : '#f59e0b'}`,
        borderRadius: '12px',
        minWidth: '200px',
        maxWidth: '280px',
        color: '#fff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#3b82f6' }} />

      {/* Node Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span style={{ fontSize: '20px' }}>🤖</span>
        <strong>{data.name || 'Agent'}</strong>
        {!isComplete && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '12px',
              background: '#f59e0b',
              color: '#000',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            Draft
          </span>
        )}
      </div>

      {/* Required Slots Preview */}
      <div style={{ fontSize: '12px', opacity: 0.9 }}>
        <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📚 Knowledge:</span>
          <span style={{ opacity: data.config?.knowledge ? 1 : 0.5 }}>
            {data.config?.knowledge || '(empty)'}
          </span>
        </div>
        <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔧 Tool:</span>
          <span style={{ opacity: data.config?.tool ? 1 : 0.5 }}>
            {data.config?.tool || '(empty)'}
          </span>
        </div>
        <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: hasActionText ? '#10b981' : '#f59e0b' }}>⚡ Action:</span>
          <span style={{ opacity: hasActionText ? 1 : 0.5 }}>
            {actionText || '(required)'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: hasDoneCriteria ? '#10b981' : '#f59e0b' }}>✅ Done:</span>
          <span style={{ opacity: hasDoneCriteria ? 1 : 0.5 }}>
            {doneCriteria || '(required)'}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6' }} />
    </div>
  );
}
