import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { CatalogControls } from '../CatalogControls'
import { useWorkflowStore } from '../../store/workflowStore'

describe('CatalogControls', () => {
  beforeEach(() => {
    useWorkflowStore.getState().clearWorkflow()
    useWorkflowStore.getState().setAgentCatalog({
      packages: {},
      agents: {},
      tools: {},
      knowledge: {},
      scripts: {},
      byPackage: {},
    })
  })

  it('loads the sample agent catalog into the store', () => {
    render(<CatalogControls />)

    expect(screen.getByText('Agents: 0')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Load Sample Catalog' }))

    expect(screen.getByText('Agents: 2')).toBeTruthy()
    expect(useWorkflowStore.getState().agentCatalog.agents['customer-support/refund-processor']).toBeDefined()
  })

  it('imports a package catalog through electronAPI and stores it', async () => {
    window.electronAPI = {
      ping: async () => ({ status: 'ok', timestamp: Date.now() }),
      loadPackageCatalog: async () => ({
        packages: {
          'customer-support': {
            id: 'customer-support',
            name: 'customer-support',
            version: '1.2.3',
          },
        },
        agents: {
          'customer-support/refund-processor': {
            id: 'customer-support/refund-processor',
            package: 'customer-support',
            name: 'refund-processor',
            model: 'anthropic/claude-sonnet-4',
          },
        },
        tools: {},
        knowledge: {},
        scripts: {},
        byPackage: {
          'customer-support': {
            agents: ['customer-support/refund-processor'],
            tools: [],
            knowledge: [],
            scripts: [],
          },
        },
      }),
    }

    render(<CatalogControls />)

    fireEvent.change(screen.getByPlaceholderText('/path/to/package'), {
      target: { value: '/tmp/catalog-package' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Package Catalog' }))

    await screen.findByText('Agents: 1')
    expect(useWorkflowStore.getState().agentCatalog.agents['customer-support/refund-processor']).toBeDefined()
  })
})
