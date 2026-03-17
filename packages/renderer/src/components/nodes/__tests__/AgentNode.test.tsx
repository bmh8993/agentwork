/**
 * AgentNode component tests
 * ADR-0020/0021: Knowledge and Tool refs are now arrays
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { AgentNode } from '../AgentNode';
import type { NodeData } from '../../../types/workflow';

// Wrapper to provide React Flow context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}

describe('AgentNode', () => {
  it('should render knowledge_refs and tool_refs arrays', () => {
    const mockNode: NodeData = {
      id: 'agent-1',
      name: 'Test Agent',
      type: 'Agent',
      position: [0, 0],
      config: {
        knowledge_refs: ['kb-refund-policy', 'kb-api-guide'],
        tool_refs: ['tool-file-search'],
        action_text: 'Process refund request',
        done_criteria: 'Refund processed successfully',
      },
    };

    render(<AgentNode data={mockNode} id="agent-1" />, { wrapper: TestWrapper });

    // Check that knowledge refs are displayed
    expect(screen.getByText(/kb-refund-policy/)).toBeInTheDocument();
    expect(screen.getByText(/kb-api-guide/)).toBeInTheDocument();

    // Check that tool refs are displayed
    expect(screen.getByText(/tool-file-search/)).toBeInTheDocument();
  });

  it('should display (empty) when refs are missing', () => {
    const mockNode: NodeData = {
      id: 'agent-2',
      name: 'Empty Agent',
      type: 'Agent',
      position: [0, 0],
      config: {
        action_text: 'Do something',
        done_criteria: 'Done',
      },
    };

    render(<AgentNode data={mockNode} id="agent-2" />, { wrapper: TestWrapper });

    // Should show empty placeholders for both Knowledge and Tool
    const emptyElements = screen.getAllByText(/\(empty\)/);
    expect(emptyElements).toHaveLength(2);
  });

  it('should handle empty arrays gracefully', () => {
    const mockNode: NodeData = {
      id: 'agent-3',
      name: 'Empty Arrays Agent',
      type: 'Agent',
      position: [0, 0],
      config: {
        knowledge_refs: [],
        tool_refs: [],
        action_text: 'Do something',
        done_criteria: 'Done',
      },
    };

    render(<AgentNode data={mockNode} id="agent-3" />, { wrapper: TestWrapper });

    // Should show empty placeholders for both Knowledge and Tool
    const emptyElements = screen.getAllByText(/\(empty\)/);
    expect(emptyElements).toHaveLength(2);
  });
});
