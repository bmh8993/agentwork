/**
 * Agent Node Component
 *
 * Core workflow node with agent_ref, Action, Done Criteria.
 * ADR-0017: Agent Card UX and Draft/Publish Gate
 * ADR-0022: AgentNode references Agent via agent_ref
 * ADR-0023: Supports parallel execution via fan-out/fan-in edges
 */

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData, AgentReference } from '../../types/workflow';

export function AgentNode({ data }: NodeProps) {
  const nodeData = data as NodeData;
  const displayName = (nodeData.name || 'Agent').replace(/^\s*🤖\s*/, '');

  // Check if required fields are populated (from config object)
  const agentRef = nodeData.config?.agent_ref as AgentReference | undefined;
  const actionText = nodeData.config?.action_text;
  const doneCriteria = nodeData.config?.done_criteria;
  const hasAgentRef = !!agentRef && !!agentRef.package && !!agentRef.name;
  const hasActionText = !!actionText && actionText.trim().length > 0;
  const hasDoneCriteria = !!doneCriteria && doneCriteria.trim().length > 0;
  const isComplete = hasAgentRef && hasActionText && hasDoneCriteria;

  // ADR-0022: Display agent_ref as "package/name"
  const agentRefDisplay = hasAgentRef
    ? `${agentRef.package}/${agentRef.name}`
    : '(no agent selected)';

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
        <strong>{displayName}</strong>
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
        {/* ADR-0022: Agent Reference */}
        <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: hasAgentRef ? '#10b981' : '#f59e0b' }}>🤖 Agent:</span>
          <span style={{ opacity: hasAgentRef ? 1 : 0.5 }}>
            {agentRefDisplay}
          </span>
        </div>
        {/* ADR-0020/0022: Action owned by AgentNode */}
        <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: hasActionText ? '#10b981' : '#f59e0b' }}>⚡ Action:</span>
          <span style={{ opacity: hasActionText ? 1 : 0.5 }}>
            {actionText || '(required)'}
          </span>
        </div>
        {/* ADR-0020/0022: Done Criteria owned by AgentNode */}
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
