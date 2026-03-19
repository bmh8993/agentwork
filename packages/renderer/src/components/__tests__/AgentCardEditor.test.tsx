import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AgentCardEditor } from '../AgentCardEditor'
import { useWorkflowStore } from '../../store/workflowStore'
import { createEmptyCatalog } from '../../types/agent'
import type { NodeData } from '../../types/workflow'

describe('AgentCardEditor', () => {
  beforeEach(() => {
    useWorkflowStore.getState().clearWorkflow()
    useWorkflowStore.getState().setAgentCatalog(createEmptyCatalog())
  })

  it('renders catalog-backed agent options in a picker', () => {
    const catalog = createEmptyCatalog()
    catalog.packages['customer-support'] = {
      id: 'customer-support',
      name: 'Customer Support',
      version: '1.0.0',
    }
    catalog.packages.analytics = {
      id: 'analytics',
      name: 'Analytics',
      version: '1.0.0',
    }
    catalog.agents['customer-support/refund-processor'] = {
      id: 'customer-support/refund-processor',
      package: 'customer-support',
      name: 'refund-processor',
      description: 'Processes refund requests',
      model: 'anthropic/claude-sonnet-4',
    }
    catalog.agents['analytics/data-analyst'] = {
      id: 'analytics/data-analyst',
      package: 'analytics',
      name: 'data-analyst',
      description: 'Analyzes workflow outputs',
      model: 'openai/gpt-5.4',
    }
    useWorkflowStore.getState().setAgentCatalog(catalog)

    const node: NodeData = {
      id: 'agent-1',
      name: 'Agent 1',
      type: 'Agent',
      position: [0, 0],
      config: {
        action_text: 'Analyze input',
        done_criteria: 'Analysis complete',
      },
    }

    render(<AgentCardEditor node={node} onClose={vi.fn()} />)

    const picker = screen.getByLabelText(/Agent Reference/i)
    expect(picker).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Customer Support' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Analytics' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'customer-support/refund-processor' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'analytics/data-analyst' })).toBeTruthy()
  })

  it('shows selected agent metadata preview', () => {
    const catalog = createEmptyCatalog()
    catalog.packages['customer-support'] = {
      id: 'customer-support',
      name: 'Customer Support',
      version: '1.0.0',
    }
    catalog.agents['customer-support/refund-processor'] = {
      id: 'customer-support/refund-processor',
      package: 'customer-support',
      name: 'refund-processor',
      description: 'Processes refund requests',
      model: 'anthropic/claude-sonnet-4',
      tool_refs: ['customer-support/refund-check', 'customer-support/refund-log'],
      knowledge_refs: ['customer-support/refund-policy'],
    }
    catalog.tools['customer-support/refund-check'] = {
      id: 'customer-support/refund-check',
      package: 'customer-support',
      name: 'Refund Check',
    }
    catalog.tools['customer-support/refund-log'] = {
      id: 'customer-support/refund-log',
      package: 'customer-support',
      name: 'Refund Log',
    }
    catalog.knowledge['customer-support/refund-policy'] = {
      id: 'customer-support/refund-policy',
      package: 'customer-support',
      name: 'Refund Policy',
    }
    useWorkflowStore.getState().setAgentCatalog(catalog)

    const node: NodeData = {
      id: 'agent-preview-test',
      name: 'Agent Preview Test',
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
    }

    render(<AgentCardEditor node={node} onClose={vi.fn()} />)

    expect(screen.getByText(/Processes refund requests/)).toBeTruthy()
    expect(screen.getByText(/anthropic\/claude-sonnet-4/)).toBeTruthy()
    expect(screen.getByText('Tools: 2')).toBeTruthy()
    expect(screen.getByText('Knowledge: 1')).toBeTruthy()
    expect(screen.getByText('Refund Check')).toBeTruthy()
    expect(screen.getByText('Refund Log')).toBeTruthy()
    expect(screen.getByText('Refund Policy')).toBeTruthy()
  })

  it('stores selected agent_ref from the picker on save', async () => {
    const catalog = createEmptyCatalog()
    catalog.agents['customer-support/refund-processor'] = {
      id: 'customer-support/refund-processor',
      package: 'customer-support',
      name: 'refund-processor',
    }
    useWorkflowStore.getState().setAgentCatalog(catalog)

    const node: NodeData = {
      id: 'agent-save-test',
      name: 'Agent Save Test',
      type: 'Agent',
      position: [0, 0],
      config: {
        action_text: 'Original action',
        done_criteria: 'Original done',
      },
    }
    useWorkflowStore.getState().addNode(node)

    render(<AgentCardEditor node={node} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/Agent Reference/i), {
      target: { value: 'customer-support/refund-processor' },
    })
    fireEvent.change(screen.getByLabelText(/^Name$/i), {
      target: { value: 'Updated Agent Save Test' },
    })
    fireEvent.change(screen.getByLabelText(/Action/i), {
      target: { value: 'Process refund request' },
    })
    fireEvent.change(screen.getByLabelText(/Done Criteria/i), {
      target: { value: 'Refund processed successfully' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      const updatedNode = useWorkflowStore.getState().nodes.find((item) => item.id === 'agent-save-test')
      expect(updatedNode?.config?.agent_ref).toEqual({
        package: 'customer-support',
        name: 'refund-processor',
      })
    })
  })
})
