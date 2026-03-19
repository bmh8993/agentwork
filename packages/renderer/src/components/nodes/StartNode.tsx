/**
 * Start Node Component
 *
 * Entry point node for workflow.
 */

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../../types/workflow';

export function StartNode({ data }: NodeProps) {
  const nodeData = data as NodeData;

  return (
    <div
      style={{
        padding: '12px 16px',
        background: '#064e3b',
        border: '2px solid #10b981',
        borderRadius: '8px',
        minWidth: '80px',
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Handle type="source" position={Position.Bottom} style={{ background: '#10b981' }} />
      <div>{nodeData.name || 'Start'}</div>
    </div>
  );
}
