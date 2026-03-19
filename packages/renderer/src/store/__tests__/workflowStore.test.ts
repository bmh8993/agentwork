/**
 * ADR-0019: WorkflowStore cardinality guard tests
 * ADR-0022: AgentNode references Agent via agent_ref
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkflowStore } from '../workflowStore'
import type { NodeData, AgentReference } from '../../types/workflow'
import { createEmptyCatalog } from '../../types/agent'

describe('useWorkflowStore cardinality guards', () => {
  beforeEach(() => {
    // Reset store before each test
    useWorkflowStore.getState().clearWorkflow()
  })

  describe('canAddNodeType', () => {
    it('should not allow adding second Start node (store has default)', () => {
      const store = useWorkflowStore.getState()

      // Store has default Start node
      expect(store.canAddNodeType('Start')).toBe(false)
    })

    it('should not allow adding second End node (store has default)', () => {
      const store = useWorkflowStore.getState()

      // Store has default End node
      expect(store.canAddNodeType('End')).toBe(false)
    })

    it('should always allow adding Agent nodes', () => {
      const store = useWorkflowStore.getState()

      // Add multiple agents
      for (let i = 0; i < 5; i++) {
        expect(store.canAddNodeType('Agent')).toBe(true)

        const agentNode: NodeData = {
          id: `agent-${i}`,
          name: `Agent ${i}`,
          type: 'Agent',
          position: [i * 100, 0],
        }

        store.addNode(agentNode)
      }

      // Should still allow more agents
      expect(store.canAddNodeType('Agent')).toBe(true)
    })
  })

  describe('canDeleteNode', () => {
    it('should not allow deleting the only Start node', () => {
      const store = useWorkflowStore.getState()

      // Store has default Start node
      expect(store.canDeleteNode('start-1')).toBe(false)
    })

    it('should allow deleting an Agent node', () => {
      const store = useWorkflowStore.getState()

      const agentNode: NodeData = {
        id: 'agent-1',
        name: 'Agent',
        type: 'Agent',
        position: [100, 0],
      }

      store.addNode(agentNode)

      expect(store.canDeleteNode('agent-1')).toBe(true)
    })

    it('should not allow deleting the only End node', () => {
      const store = useWorkflowStore.getState()

      // Store has default End node
      expect(store.canDeleteNode('end-1')).toBe(false)
    })

    it('should return false for non-existent node', () => {
      const store = useWorkflowStore.getState()

      expect(store.canDeleteNode('non-existent')).toBe(false)
    })
  })

  describe('addNode', () => {
    it('should not add Start node when at limit', () => {
      // Reset store
      useWorkflowStore.getState().clearWorkflow()
      const store = useWorkflowStore.getState()

      const startCount = store.nodes.filter((n) => n.type === 'Start').length

      const secondStartNode: NodeData = {
        id: 'start-2',
        name: 'Start 2',
        type: 'Start',
        position: [200, 0],
      }

      store.addNode(secondStartNode)

      // Get updated state
      const updatedStore = useWorkflowStore.getState()

      // Start count should not increase
      expect(updatedStore.nodes.filter((n) => n.type === 'Start').length).toBe(startCount)
    })

    it('should not add End node when at limit', () => {
      // Reset store
      useWorkflowStore.getState().clearWorkflow()
      const store = useWorkflowStore.getState()

      const endCount = store.nodes.filter((n) => n.type === 'End').length

      const secondEndNode: NodeData = {
        id: 'end-2',
        name: 'End 2',
        type: 'End',
        position: [400, 0],
      }

      store.addNode(secondEndNode)

      // Get updated state
      const updatedStore = useWorkflowStore.getState()

      // End count should not increase
      expect(updatedStore.nodes.filter((n) => n.type === 'End').length).toBe(endCount)
    })

    it('should always add Agent nodes', () => {
      // Reset store
      useWorkflowStore.getState().clearWorkflow()
      const store = useWorkflowStore.getState()

      const agentNode: NodeData = {
        id: 'agent-1',
        name: 'Agent',
        type: 'Agent',
        position: [100, 0],
      }

      const beforeCount = store.nodes.length
      store.addNode(agentNode)

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const afterCount = updatedStore.nodes.length

      // Should have one more node
      expect(afterCount).toBe(beforeCount + 1)

      // Find the agent node
      const addedAgent = updatedStore.nodes.find((n) => n.id === 'agent-1')
      expect(addedAgent).toBeDefined()
      expect(addedAgent?.type).toBe('Agent')
    })
  })

  describe('AgentNode config with agent_ref (ADR-0022)', () => {
    it('should preserve agent_ref, action_text, and done_criteria in Agent node config', () => {
      const store = useWorkflowStore.getState()

      const agentRef: AgentReference = {
        package: 'customer-support',
        name: 'refund-processor',
      }

      const agentNode: NodeData = {
        id: 'agent-1',
        name: 'Agent',
        type: 'Agent',
        position: [100, 0],
        config: {
          agent_ref: agentRef,
          action_text: 'Process refund request',
          done_criteria: 'Refund processed successfully',
        },
      }

      store.addNode(agentNode)

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const addedAgent = updatedStore.nodes.find((n) => n.id === 'agent-1')

      // Verify the node was added
      expect(addedAgent).toBeDefined()
      expect(addedAgent?.type).toBe('Agent')

      // Verify config preserves agent_ref and other fields
      expect(addedAgent?.config).toBeDefined()
      expect(addedAgent?.config?.agent_ref).toEqual(agentRef)
      expect(addedAgent?.config?.action_text).toBe('Process refund request')
      expect(addedAgent?.config?.done_criteria).toBe('Refund processed successfully')
    })

    it('should allow missing agent_ref for draft state', () => {
      const store = useWorkflowStore.getState()

      const agentNode: NodeData = {
        id: 'agent-2',
        name: 'Agent 2',
        type: 'Agent',
        position: [200, 0],
        config: {
          action_text: 'Another action',
          done_criteria: 'Done when complete',
        },
      }

      store.addNode(agentNode)

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const addedAgent = updatedStore.nodes.find((n) => n.id === 'agent-2')

      // Verify agent_ref can be undefined for draft state
      expect(addedAgent?.config?.agent_ref).toBeUndefined()
      expect(addedAgent?.config?.action_text).toBe('Another action')
      expect(addedAgent?.config?.done_criteria).toBe('Done when complete')
    })

    it('should preserve join_policy for parallel execution (ADR-0023)', () => {
      const store = useWorkflowStore.getState()

      const agentRef: AgentReference = {
        package: 'analytics',
        name: 'data-analyst',
      }

      const agentNode: NodeData = {
        id: 'agent-3',
        name: 'Agent 3',
        type: 'Agent',
        position: [300, 0],
        config: {
          agent_ref: agentRef,
          action_text: 'Analyze data',
          done_criteria: 'Analysis complete',
          join_policy: 'all',
        },
      }

      store.addNode(agentNode)

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const addedAgent = updatedStore.nodes.find((n) => n.id === 'agent-3')

      // Verify join_policy is preserved
      expect(addedAgent?.config?.join_policy).toBe('all')
    })
  })

  describe('updateNode with Agent card form data (ADR-0022)', () => {
    it('should store agent_ref, action_text, and done_criteria in canonical format', () => {
      const store = useWorkflowStore.getState()

      // First add an agent node
      const agentNode: NodeData = {
        id: 'agent-form-test',
        name: 'Form Test Agent',
        type: 'Agent',
        position: [100, 0],
      }

      store.addNode(agentNode)

      // Simulate form submission with agent_ref
      const agentRef: AgentReference = {
        package: 'customer-support',
        name: 'refund-processor',
      }

      store.updateNode('agent-form-test', {
        name: 'Form Test Agent',
        config: {
          agent_ref: agentRef,
          action_text: 'Process refund request',
          done_criteria: 'Refund processed successfully',
        },
      })

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const updatedAgent = updatedStore.nodes.find((n) => n.id === 'agent-form-test')

      // Verify fields are stored
      expect(updatedAgent?.config?.agent_ref).toEqual(agentRef)
      expect(updatedAgent?.config?.action_text).toBe('Process refund request')
      expect(updatedAgent?.config?.done_criteria).toBe('Refund processed successfully')
    })

    it('should handle update without agent_ref for draft state', () => {
      const store = useWorkflowStore.getState()

      // Add an agent node
      const agentNode: NodeData = {
        id: 'agent-draft',
        name: 'Draft Agent',
        type: 'Agent',
        position: [200, 0],
      }

      store.addNode(agentNode)

      // Simulate form submission with draft data (no agent_ref yet)
      store.updateNode('agent-draft', {
        name: 'Draft Agent',
        config: {
          action_text: 'Draft action',
          done_criteria: 'Draft done criteria',
        },
      })

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const updatedAgent = updatedStore.nodes.find((n) => n.id === 'agent-draft')

      // Verify fields are stored without agent_ref
      expect(updatedAgent?.config?.agent_ref).toBeUndefined()
      expect(updatedAgent?.config?.action_text).toBe('Draft action')
      expect(updatedAgent?.config?.done_criteria).toBe('Draft done criteria')
    })

    it('should handle agent_ref update from draft to complete', () => {
      const store = useWorkflowStore.getState()

      // Add an agent node with draft state (no agent_ref)
      const agentNode: NodeData = {
        id: 'agent-update-test',
        name: 'Update Test Agent',
        type: 'Agent',
        position: [300, 0],
        config: {
          action_text: 'Original action',
          done_criteria: 'Original done criteria',
        },
      }

      store.addNode(agentNode)

      // Verify the node was added without agent_ref
      let currentState = useWorkflowStore.getState()
      const addedAgent = currentState.nodes.find((n) => n.id === 'agent-update-test')
      expect(addedAgent?.config?.agent_ref).toBeUndefined()

      // Update with agent_ref (simulating user selecting an agent)
      const agentRef: AgentReference = {
        package: 'analytics',
        name: 'data-analyst',
      }

      store.updateNode('agent-update-test', {
        name: 'Update Test Agent',
        config: {
          agent_ref: agentRef,
          action_text: 'Updated action',
          done_criteria: 'Updated done criteria',
        },
      })

      // Verify agent_ref is now set
      currentState = useWorkflowStore.getState()
      const updatedAgent = currentState.nodes.find((n) => n.id === 'agent-update-test')
      expect(updatedAgent?.config?.agent_ref).toEqual(agentRef)
      expect(updatedAgent?.config?.action_text).toBe('Updated action')
      expect(updatedAgent?.config?.done_criteria).toBe('Updated done criteria')
    })
  })

  describe('AgentCatalog state (ADR-0022)', () => {
    it('should store AgentCatalog state separately from workflow nodes', () => {
      const store = useWorkflowStore.getState()
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
        model: 'anthropic/claude-sonnet-4',
      }
      catalog.byPackage['customer-support'] = {
        agents: ['customer-support/refund-processor'],
        tools: [],
        knowledge: [],
        scripts: [],
      }

      store.setAgentCatalog(catalog)

      const updatedStore = useWorkflowStore.getState()
      expect(updatedStore.agentCatalog.agents['customer-support/refund-processor']?.model).toBe('anthropic/claude-sonnet-4')
      expect(updatedStore.nodes).toHaveLength(2)
    })

    it('should preserve AgentCatalog when workflow graph is cleared', () => {
      const store = useWorkflowStore.getState()
      const catalog = createEmptyCatalog()
      catalog.agents['analytics/data-analyst'] = {
        id: 'analytics/data-analyst',
        package: 'analytics',
        name: 'data-analyst',
      }

      store.setAgentCatalog(catalog)
      store.clearWorkflow()

      const updatedStore = useWorkflowStore.getState()
      expect(updatedStore.agentCatalog.agents['analytics/data-analyst']).toBeDefined()
      expect(updatedStore.nodes).toHaveLength(2)
    })
  })

  describe('deleteNode', () => {
    it('should not delete the only Start node', () => {
      // Reset store
      useWorkflowStore.getState().clearWorkflow()
      const store = useWorkflowStore.getState()

      const startCount = store.nodes.filter((n) => n.type === 'Start').length

      store.deleteNode('start-1')

      // Get updated state
      const updatedStore = useWorkflowStore.getState()

      // Start count should not decrease
      expect(updatedStore.nodes.filter((n) => n.type === 'Start').length).toBe(startCount)
    })

    it('should not delete the only End node', () => {
      // Reset store
      useWorkflowStore.getState().clearWorkflow()
      const store = useWorkflowStore.getState()

      const endCount = store.nodes.filter((n) => n.type === 'End').length

      store.deleteNode('end-1')

      // Get updated state
      const updatedStore = useWorkflowStore.getState()

      // End count should not decrease
      expect(updatedStore.nodes.filter((n) => n.type === 'End').length).toBe(endCount)
    })

    it('should delete Agent node', () => {
      // Reset store
      useWorkflowStore.getState().clearWorkflow()
      const store = useWorkflowStore.getState()

      const agentNode: NodeData = {
        id: 'agent-1',
        name: 'Agent',
        type: 'Agent',
        position: [100, 0],
      }

      store.addNode(agentNode)

      // Get state after adding agent
      let afterAddStore = useWorkflowStore.getState()
      const beforeCount = afterAddStore.nodes.length

      afterAddStore.deleteNode('agent-1')

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const afterCount = updatedStore.nodes.length

      // Should have one less node
      expect(afterCount).toBe(beforeCount - 1)

      // Agent should be gone
      const deletedAgent = updatedStore.nodes.find((n) => n.id === 'agent-1')
      expect(deletedAgent).toBeUndefined()
    })

    it('should also delete connected edges when deleting node', () => {
      // Reset store
      useWorkflowStore.getState().clearWorkflow()
      const store = useWorkflowStore.getState()

      const agentNode: NodeData = {
        id: 'agent-1',
        name: 'Agent',
        type: 'Agent',
        position: [100, 0],
      }

      const edge = {
        id: 'e-start-1-agent-1',
        source_node_id: 'start-1',
        target_node_id: 'agent-1',
        branch: 'default',
      }

      store.addNode(agentNode)
      store.addEdge(edge)

      // Get state after adding edge
      let afterAddStore = useWorkflowStore.getState()
      expect(afterAddStore.edges.some((e) => e.id === edge.id)).toBe(true)

      afterAddStore.deleteNode('agent-1')

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      expect(updatedStore.edges.some((e) => e.id === edge.id)).toBe(false)
    })
  })
})
