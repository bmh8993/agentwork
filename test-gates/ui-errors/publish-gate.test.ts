/**
 * UI Contract Tests: Publish Gate
 *
 * Tests that Publish UI correctly enforces required field validation.
 * Phase 2 Exit Criterion: publish-gate-required-fields gate
 */

import { describe, it, expect } from 'vitest';
import { validatePublish } from '@opencode/skill-schema';

describe('publish-gate-required-fields', () => {
  const minimalSkill = {
    id: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill',
  };

  it('should pass publish validation when all required fields are filled', () => {
    const validWorkflow = {
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
            name: 'Test Agent',
            type: 'Agent',
            position: [100, 0],
            config: {
              agent_ref: { package: 'test-package', name: 'test-agent' },
              action_text: 'Process the data',
              done_criteria: 'Output file exists',
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

    const result = validatePublish(validWorkflow);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail publish validation when action_text is missing', () => {
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
            name: 'Test Agent',
            type: 'Agent',
            position: [100, 0],
            config: {
              agent_ref: { package: 'test-package', name: 'test-agent' },
              done_criteria: 'Output file exists',
              // action_text missing
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

    const result = validatePublish(invalidWorkflow);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);

    const publishError = result.errors.find((e) => e.code === 'publish_required_field_missing');
    expect(publishError).toBeDefined();
    expect(publishError?.next_action).toContain('action_text');
  });

  it('should fail publish validation when done_criteria is missing', () => {
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
            name: 'Test Agent',
            type: 'Agent',
            position: [100, 0],
            config: {
              agent_ref: { package: 'test-package', name: 'test-agent' },
              action_text: 'Process the data',
              // done_criteria missing
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

    const result = validatePublish(invalidWorkflow);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);

    const publishError = result.errors.find((e) => e.code === 'publish_required_field_missing');
    expect(publishError).toBeDefined();
    expect(publishError?.next_action).toContain('done_criteria');
  });

  it('should fail publish validation when required fields are missing', () => {
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
            name: 'Test Agent',
            type: 'Agent',
            position: [100, 0],
            config: {
              // agent_ref, action_text and done_criteria missing
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

    const result = validatePublish(invalidWorkflow);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);

    const publishErrors = result.errors.filter((e) => e.code === 'publish_required_field_missing');
    expect(publishErrors.length).toBeGreaterThan(0);
  });

  it('should provide clear next_action for missing fields', () => {
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
            name: 'Test Agent',
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

    expect(result.valid).toBe(false);

    const error = result.errors[0];
    expect(error.code).toBe('publish_required_field_missing');
    expect(error.message_user).toBeTruthy();
    expect(error.next_action).toBeTruthy();
    expect(error.next_action).toMatch(/agent_ref|action_text|done_criteria/);
  });
});
