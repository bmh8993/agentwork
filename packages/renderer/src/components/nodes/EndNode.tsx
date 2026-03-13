/**
 * End Node Component
 *
 * Terminal node for workflow.
 */

import { Handle, Position, NodeProps } from '@xyflow/react';
import type { NodeData } from '../../types/workflow';

export function EndNode({ data }: NodeProps<NodeData>) {
  return (
    <div
      style={{
        padding: '12px 16px',
        background: '#7f1d1d',
        border: '2px solid #ef4444',
        borderRadius: '8px',
        minWidth: '80px',
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#ef4444' }} />
      <div>🏁 {data.name || 'End'}</div>
    </div>
  );
}
