/**
 * UI Contract Tests: Draft vs Publish Gate
 *
 * Tests that Draft allows incomplete work while Publish requires completeness.
 * Phase 2 Exit Criterion: Draft Save와 Publish 결과 차이 검증
 */

import { describe, it, expect } from 'vitest';
import { validateDraft, validatePublish } from '@opencode/skill-schema';

describe('draft-vs-publish-gate', () => {
  const minimalSkill = {
    id: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill',
  };

  const incompleteWorkflow = {
    version: '1',
    skill: minimalSkill,
    workflow: {
      nodes: [
        {
          id: 'agent-1',
          name: 'Incomplete Agent',
          type: 'Agent',
          position: [0, 0],
          config: {}, // Empty config = both fields missing
        },
      ],
      edges: [],
    },
  };

  it('should allow draft save with incomplete agent data', () => {
    const draftResult = validateDraft(incompleteWorkflow);

    // Draft should succeed (valid=true, warnings only)
    expect(draftResult.valid).toBe(true);
    expect(draftResult.errors).toHaveLength(0);

    // But there should be warnings (string[])
    expect(draftResult.warnings.length).toBeGreaterThan(0);
    expect(typeof draftResult.warnings[0]).toBe('string');
  });

  it('should block publish with incomplete agent data', () => {
    const publishResult = validatePublish(incompleteWorkflow);

    // Publish should fail
    expect(publishResult.valid).toBe(false);
    expect(publishResult.errors.length).toBeGreaterThan(0);
  });

  it('should show different behavior for draft vs publish on same data', () => {
    const draftResult = validateDraft(incompleteWorkflow);
    const publishResult = validatePublish(incompleteWorkflow);

    // Draft: valid=true, errors=[]
    expect(draftResult.valid).toBe(true);
    expect(draftResult.errors).toHaveLength(0);

    // Publish: valid=false, errors.length > 0
    expect(publishResult.valid).toBe(false);
    expect(publishResult.errors.length).toBeGreaterThan(0);
  });

  it('should allow both draft and publish for complete data', () => {
    const completeWorkflow = {
      version: '1',
      skill: minimalSkill,
      workflow: {
        nodes: [
          {
            id: 'agent-1',
            name: 'Complete Agent',
            type: 'Agent',
            position: [0, 0],
            config: {
              action_text: 'Process data',
              done_criteria: 'Output ready',
            },
          },
        ],
        edges: [],
      },
    };

    const draftResult = validateDraft(completeWorkflow);
    const publishResult = validatePublish(completeWorkflow);

    // Both should succeed
    expect(draftResult.valid).toBe(true);
    expect(draftResult.errors).toHaveLength(0);

    expect(publishResult.valid).toBe(true);
    expect(publishResult.errors).toHaveLength(0);
  });
});
