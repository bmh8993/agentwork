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
