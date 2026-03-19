/**
 * UI Contract Tests: Error Next Action
 *
 * Tests that all errors include next_action guidance.
 * Phase 2 Exit Criterion: ui-error-next-action gate
 */

import { describe, it, expect } from 'vitest';
import { validatePublish, validateDraft } from '@opencode/skill-schema';

describe('ui-error-next-action', () => {
  const minimalSkill = {
    id: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill',
  };

  it('should include next_action in publish_required_field_missing error', () => {
    const incompleteWorkflow = {
      version: '1',
      skill: minimalSkill,
      workflow: {
        nodes: [
          {
            id: 'start-1',
            name: 'Start',
            type: 'Start',
            position: [0, 0],
          },
          {
            id: 'agent-1',
            name: 'Agent',
            type: 'Agent',
            position: [100, 0],
            config: {
              // Missing required fields
            },
          },
          {
            id: 'end-1',
            name: 'End',
            type: 'End',
            position: [200, 0],
          },
        ],
        edges: [
          { id: 'e1', source_node_id: 'start-1', target_node_id: 'agent-1', branch: 'default' },
          { id: 'e2', source_node_id: 'agent-1', target_node_id: 'end-1', branch: 'default' },
        ],
      },
    };

    const result = validatePublish(incompleteWorkflow);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);

    const publishError = result.errors.find((e) => e.code === 'publish_required_field_missing');
    expect(publishError).toBeDefined();
    expect(publishError?.next_action).toBeTruthy();
    expect(publishError?.next_action).toMatch(/agent_ref|action_text|done_criteria/);
  });

  it('should include next_action in all validation errors', () => {
    // Test with publish_required_field_missing error (most relevant for UI)
    const incompleteWorkflow = {
      version: '1',
      skill: minimalSkill,
      workflow: {
        nodes: [
          {
            id: 'start-1',
            name: 'Start',
            type: 'Start',
            position: [0, 0],
          },
          {
            id: 'agent-1',
            name: 'Agent',
            type: 'Agent',
            position: [100, 0],
            config: {}, // Missing required publish fields
          },
          {
            id: 'end-1',
            name: 'End',
            type: 'End',
            position: [200, 0],
          },
        ],
        edges: [
          { id: 'e1', source_node_id: 'start-1', target_node_id: 'agent-1', branch: 'default' },
          { id: 'e2', source_node_id: 'agent-1', target_node_id: 'end-1', branch: 'default' },
        ],
      },
    };

    const result = validatePublish(incompleteWorkflow);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);

    const error = result.errors.find((e) => e.code === 'publish_required_field_missing');
    expect(error).toBeDefined();

    // Verify error structure
    expect(error?.code).toBeTruthy();
    expect(error?.message_user).toBeTruthy();
    expect(error?.next_action).toBeTruthy();
    expect(error?.category).toBeTruthy();
  });

  it('should include user-friendly message in all errors', () => {
    const invalidWorkflow = {
      version: '1',
      skill: minimalSkill,
      workflow: {
        nodes: [
          {
            id: 'start-1',
            name: 'Start',
            type: 'Start',
            position: [0, 0],
          },
          {
            id: 'agent-1',
            name: 'Agent',
            type: 'Agent',
            position: [100, 0],
            config: {},
          },
          {
            id: 'end-1',
            name: 'End',
            type: 'End',
            position: [200, 0],
          },
        ],
        edges: [
          { id: 'e1', source_node_id: 'start-1', target_node_id: 'agent-1', branch: 'default' },
          { id: 'e2', source_node_id: 'agent-1', target_node_id: 'end-1', branch: 'default' },
        ],
      },
    };

    const result = validatePublish(invalidWorkflow);

    result.errors.forEach((error) => {
      expect(error.message_user).toBeTruthy();
      expect(error.message_user.length).toBeGreaterThan(0);
      expect(error.next_action).toBeTruthy();
      expect(error.next_action.length).toBeGreaterThan(0);
    });
  });

  it('should include category in all errors', () => {
    const invalidWorkflow = {
      version: '1',
      skill: minimalSkill,
      workflow: {
        nodes: [
          {
            id: 'start-1',
            name: 'Start',
            type: 'Start',
            position: [0, 0],
          },
          {
            id: 'agent-1',
            name: 'Agent',
            type: 'Agent',
            position: [100, 0],
            config: {},
          },
          {
            id: 'end-1',
            name: 'End',
            type: 'End',
            position: [200, 0],
          },
        ],
        edges: [
          { id: 'e1', source_node_id: 'start-1', target_node_id: 'agent-1', branch: 'default' },
          { id: 'e2', source_node_id: 'agent-1', target_node_id: 'end-1', branch: 'default' },
        ],
      },
    };

    const result = validatePublish(invalidWorkflow);

    result.errors.forEach((error) => {
      expect(error.category).toBeTruthy();
      expect(['ValidationError', 'InstallError', 'RuntimeError']).toContain(error.category);
    });
  });
});
