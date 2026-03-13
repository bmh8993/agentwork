/**
 * UI Contract Tests: Read-only Compatibility Mode
 *
 * Tests that unsupported nodes trigger read-only mode.
 * Phase 2 Exit Criterion: Unsupported node read-only UI
 */

import { describe, it, expect } from 'vitest';
import { validateLoad } from '@opencode/skill-schema';

describe('unsupported-node-readonly-ui', () => {
  const minimalSkill = {
    id: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill',
  };

  it('should detect unsupported node types and set read-only flag', () => {
    const workflowWithCondition = {
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
            id: 'condition-1',
            name: 'Condition',
            type: 'Condition', // Unsupported in MVP
            position: [100, 0],
          },
          {
            id: 'agent-1',
            name: 'Agent',
            type: 'Agent',
            position: [200, 0],
          },
        ],
        edges: [],
      },
    };

    const result = validateLoad(workflowWithCondition);

    expect(result.valid).toBe(true); // Load should succeed
    expect(result.flags?.readOnlyCompatibility).toBe(true);
    expect(result.flags?.unsupportedNodeTypes).toContain('Condition');
  });

  it('should not set read-only flag for supported nodes only (flags undefined)', () => {
    const supportedWorkflow = {
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
              action_text: 'Do work',
              done_criteria: 'Done',
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

    const result = validateLoad(supportedWorkflow);

    expect(result.valid).toBe(true);
    expect(result.flags?.readOnlyCompatibility).toBeUndefined();
    expect(result.flags?.unsupportedNodeTypes).toBeUndefined();
  });

  it('should list all unsupported node types', () => {
    const workflowWithMultipleUnsupported = {
      version: '1',
      skill: minimalSkill,
      workflow: {
        nodes: [
          {
            id: 'agent-1',
            name: 'Agent',
            type: 'Agent',
            position: [0, 0],
          },
          {
            id: 'condition-1',
            name: 'Condition 1',
            type: 'Condition',
            position: [100, 0],
          },
          {
            id: 'loop-1',
            name: 'Loop',
            type: 'Loop', // Also unsupported
            position: [200, 0],
          },
        ],
        edges: [],
      },
    };

    const result = validateLoad(workflowWithMultipleUnsupported);

    expect(result.valid).toBe(true);
    expect(result.flags?.readOnlyCompatibility).toBe(true);
    expect(result.flags?.unsupportedNodeTypes).toContain('Condition');
    expect(result.flags?.unsupportedNodeTypes).toContain('Loop');
  });
});
