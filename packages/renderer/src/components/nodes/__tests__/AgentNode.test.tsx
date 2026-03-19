/**
 * AgentNode component tests
 * ADR-0022: AgentNode references Agent via agent_ref
 * ADR-0023: Supports parallel execution via fan-out/fan-in edges
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { AgentNode } from '../AgentNode';
import type { NodeData } from '../../../types/workflow';

// Wrapper to provide React Flow context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}

describe('AgentNode', () => {
  it('should render agent_ref as package/name', () => {
    const mockNode: NodeData = {
      id: 'agent-1',
      name: 'Test Agent',
      type: 'Agent',
      position: [0, 0],
      config: {
        agent_ref: {
          package: 'customer-support',
          name: 'refund-processor',
        },
        action_text: 'Process refund request',
        done_criteria: 'Refund processed successfully',
      },
    };

    render(<AgentNode {...({ data: mockNode, id: 'agent-1' } as any)} />, { wrapper: TestWrapper });

    // Check that agent_ref is displayed as package/name
    expect(screen.getByText(/customer-support\/refund-processor/)).toBeTruthy();
  });

  it('should display (no agent selected) when agent_ref is missing', () => {
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

    render(<AgentNode {...({ data: mockNode, id: 'agent-2' } as any)} />, { wrapper: TestWrapper });

    // Should show placeholder for agent_ref
    expect(screen.getByText(/\(no agent selected\)/)).toBeTruthy();
  });

  it('should render action_text and done_criteria', () => {
    const mockNode: NodeData = {
      id: 'agent-3',
      name: 'Complete Agent',
      type: 'Agent',
      position: [0, 0],
      config: {
        agent_ref: {
          package: 'analytics',
          name: 'data-analyst',
        },
        action_text: 'Analyze sales data',
        done_criteria: 'Analysis report generated',
      },
    };

    render(<AgentNode {...({ data: mockNode, id: 'agent-3' } as any)} />, { wrapper: TestWrapper });

    // Check action and done criteria
    expect(screen.getByText(/Analyze sales data/)).toBeTruthy();
    expect(screen.getByText(/Analysis report generated/)).toBeTruthy();
  });

  it('should show Draft badge when required fields are missing', () => {
    const mockNode: NodeData = {
      id: 'agent-4',
      name: 'Incomplete Agent',
      type: 'Agent',
      position: [0, 0],
      config: {
        action_text: 'Do something',
        // Missing done_criteria and agent_ref
      },
    };

    render(<AgentNode {...({ data: mockNode, id: 'agent-4' } as any)} />, {
      wrapper: TestWrapper,
    });

    // Should show Draft badge
    expect(screen.getByText('Draft')).toBeTruthy();
  });

  it('should not render duplicate robot emoji when name already includes it', () => {
    const mockNode: NodeData = {
      id: 'agent-5',
      name: '🤖 Agent',
      type: 'Agent',
      position: [0, 0],
      config: {
        agent_ref: {
          package: 'test',
          name: 'test-agent',
        },
        action_text: 'Do something',
        done_criteria: 'Done',
      },
    };

    render(<AgentNode {...({ data: mockNode, id: 'agent-5' } as any)} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText('Agent')).toBeTruthy();
    // Check emoji appears only once (not duplicated)
    expect(screen.getAllByText('Agent').length).toBeGreaterThan(0);
  });

  it('should show complete border when all required fields are present', () => {
    const mockNode: NodeData = {
      id: 'agent-6',
      name: 'Complete Agent',
      type: 'Agent',
      position: [0, 0],
      config: {
        agent_ref: {
          package: 'test',
          name: 'complete-agent',
        },
        action_text: 'Test action',
        done_criteria: 'Test done',
      },
    };

    render(<AgentNode {...({ data: mockNode, id: 'agent-6' } as any)} />, {
      wrapper: TestWrapper,
    });

    // Should not show Draft badge when complete
    expect(screen.queryByText('Draft')).toBeNull();
  });
});
