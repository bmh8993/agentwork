/**
 * ADR-0019: WorkflowStore cardinality guard tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkflowStore } from '../workflowStore'
import type { NodeData } from '../../types/workflow'

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

  describe('AgentNode config with knowledge_refs and tool_refs', () => {
    it('should preserve knowledge_refs and tool_refs arrays in Agent node config', () => {
      const store = useWorkflowStore.getState()

      const agentNode: NodeData = {
        id: 'agent-1',
        name: 'Agent',
        type: 'Agent',
        position: [100, 0],
        config: {
          knowledge_refs: ['kb-refund-policy'],
          tool_refs: ['tool-file-search'],
          action_text: 'Do something',
          done_criteria: 'Done',
        },
      }

      store.addNode(agentNode)

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const addedAgent = updatedStore.nodes.find((n) => n.id === 'agent-1')

      // Verify the node was added
      expect(addedAgent).toBeDefined()
      expect(addedAgent?.type).toBe('Agent')

      // Verify config preserves both arrays
      expect(addedAgent?.config).toBeDefined()
      expect(addedAgent?.config?.knowledge_refs).toEqual(['kb-refund-policy'])
      expect(addedAgent?.config?.tool_refs).toEqual(['tool-file-search'])
      expect(addedAgent?.config?.action_text).toBe('Do something')
      expect(addedAgent?.config?.done_criteria).toBe('Done')
    })

    it('should allow empty knowledge_refs and tool_refs arrays', () => {
      const store = useWorkflowStore.getState()

      const agentNode: NodeData = {
        id: 'agent-2',
        name: 'Agent 2',
        type: 'Agent',
        position: [200, 0],
        config: {
          knowledge_refs: [],
          tool_refs: [],
          action_text: 'Another action',
          done_criteria: 'Done when complete',
        },
      }

      store.addNode(agentNode)

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const addedAgent = updatedStore.nodes.find((n) => n.id === 'agent-2')

      // Verify empty arrays are preserved
      expect(addedAgent?.config?.knowledge_refs).toEqual([])
      expect(addedAgent?.config?.tool_refs).toEqual([])
    })

    it('should allow multiple knowledge and tool references', () => {
      const store = useWorkflowStore.getState()

      const agentNode: NodeData = {
        id: 'agent-3',
        name: 'Agent 3',
        type: 'Agent',
        position: [300, 0],
        config: {
          knowledge_refs: ['kb-refund-policy', 'kb-shipping-guide', 'kb-returns'],
          tool_refs: ['tool-file-search', 'tool-api-client', 'tool-database-query'],
          action_text: 'Process refund',
          done_criteria: 'Refund processed',
        },
      }

      store.addNode(agentNode)

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const addedAgent = updatedStore.nodes.find((n) => n.id === 'agent-3')

      // Verify multiple refs are preserved
      expect(addedAgent?.config?.knowledge_refs).toEqual([
        'kb-refund-policy',
        'kb-shipping-guide',
        'kb-returns',
      ])
      expect(addedAgent?.config?.tool_refs).toEqual([
        'tool-file-search',
        'tool-api-client',
        'tool-database-query',
      ])
    })
  })

  describe('updateNode with Agent card form data', () => {
    it('should store knowledge_refs and tool_refs as arrays in canonical format', () => {
      const store = useWorkflowStore.getState()

      // First add an agent node
      const agentNode: NodeData = {
        id: 'agent-form-test',
        name: 'Form Test Agent',
        type: 'Agent',
        position: [100, 0],
      }

      store.addNode(agentNode)

      // Simulate form submission with comma-separated knowledge/tool refs
      // (UX strategy: Option A - single text input with comma-separated values)
      store.updateNode('agent-form-test', {
        name: 'Form Test Agent',
        config: {
          knowledge_refs: ['kb-refund-policy', 'kb-shipping-guide'],
          tool_refs: ['tool-file-search', 'tool-api-client'],
          action_text: 'Process refund request',
          done_criteria: 'Refund processed successfully',
        },
      })

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const updatedAgent = updatedStore.nodes.find((n) => n.id === 'agent-form-test')

      // Verify canonical arrays are stored
      expect(updatedAgent?.config?.knowledge_refs).toEqual(['kb-refund-policy', 'kb-shipping-guide'])
      expect(updatedAgent?.config?.tool_refs).toEqual(['tool-file-search', 'tool-api-client'])
      expect(updatedAgent?.config?.action_text).toBe('Process refund request')
      expect(updatedAgent?.config?.done_criteria).toBe('Refund processed successfully')
    })

    it('should store empty arrays when no knowledge or tool refs provided', () => {
      const store = useWorkflowStore.getState()

      // Add an agent node
      const agentNode: NodeData = {
        id: 'agent-empty-refs',
        name: 'Empty Refs Agent',
        type: 'Agent',
        position: [200, 0],
      }

      store.addNode(agentNode)

      // Simulate form submission with empty refs
      store.updateNode('agent-empty-refs', {
        name: 'Empty Refs Agent',
        config: {
          knowledge_refs: [],
          tool_refs: [],
          action_text: 'Simple action',
          done_criteria: 'Done',
        },
      })

      // Get updated state
      const updatedStore = useWorkflowStore.getState()
      const updatedAgent = updatedStore.nodes.find((n) => n.id === 'agent-empty-refs')

      // Verify empty arrays are stored
      expect(updatedAgent?.config?.knowledge_refs).toEqual([])
      expect(updatedAgent?.config?.tool_refs).toEqual([])
    })

    it('should handle form data conversion from comma-separated strings to arrays', () => {
      const store = useWorkflowStore.getState()

      // Add an agent node with canonical array format (simulating loaded from file)
      const agentNode: NodeData = {
        id: 'agent-conversion-test',
        name: 'Conversion Test Agent',
        type: 'Agent',
        position: [300, 0],
        config: {
          knowledge_refs: ['kb-refund-policy'],
          tool_refs: ['tool-file-search'],
          action_text: 'Original action',
          done_criteria: 'Original done criteria',
        },
      }

      store.addNode(agentNode)

      // Verify the node was added with arrays
      let currentState = useWorkflowStore.getState()
      const addedAgent = currentState.nodes.find((n) => n.id === 'agent-conversion-test')
      expect(addedAgent?.config?.knowledge_refs).toEqual(['kb-refund-policy'])
      expect(addedAgent?.config?.tool_refs).toEqual(['tool-file-search'])

      // Update with new array data (simulating form submit with converted data)
      store.updateNode('agent-conversion-test', {
        name: 'Conversion Test Agent',
        config: {
          knowledge_refs: ['kb-refund-policy', 'kb-shipping-guide', 'kb-returns'],
          tool_refs: ['tool-file-search', 'tool-database-query'],
          action_text: 'Updated action',
          done_criteria: 'Updated done criteria',
        },
      })

      // Verify arrays are preserved
      currentState = useWorkflowStore.getState()
      const updatedAgent = currentState.nodes.find((n) => n.id === 'agent-conversion-test')
      expect(updatedAgent?.config?.knowledge_refs).toEqual([
        'kb-refund-policy',
        'kb-shipping-guide',
        'kb-returns',
      ])
      expect(updatedAgent?.config?.tool_refs).toEqual(['tool-file-search', 'tool-database-query'])
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
