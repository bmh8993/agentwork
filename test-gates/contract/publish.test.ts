/**
 * Test Gate: publish-gate-required-fields
 *
 * Validates:
 * 1. missing action_text blocks publish
 * 2. missing done_criteria blocks publish
 * 3. both fields present allows publish
 */

import { describe, it, expect } from 'vitest'
import { validatePublish, validateDraft, ERROR_CODES } from '@opencode/skill-schema'

function createSkillWithAgent(config: Record<string, unknown>) {
  return {
    version: '1',
    skill: {
      id: 'test-skill',
      name: 'Test',
      description: 'Test skill',
    },
    workflow: {
      nodes: [
        { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
        { id: 'agent1', name: 'Test Agent', type: 'Agent', position: [100, 0], config },
        { id: 'n2', name: 'End', type: 'End', position: [200, 0], config: {} },
      ],
      edges: [],
    },
  }
}

function createValidAgentRef() {
  return {
    package: 'test-package',
    name: 'test-agent',
  }
}

describe('publish-gate-required-fields: Publish blocking', () => {
  it('missing action_text blocks publish', () => {
    const data = createSkillWithAgent({
      agent_ref: createValidAgentRef(),
      done_criteria: 'Task complete',
      // action_text missing
    })

    const result = validatePublish(data)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    const requiredFieldErrors = result.errors.filter((e) => e.code === ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)
    expect(requiredFieldErrors.length).toBeGreaterThan(0)
    expect(requiredFieldErrors[0].message_user).toContain('action_text')
  })

  it('missing done_criteria blocks publish', () => {
    const data = createSkillWithAgent({
      agent_ref: createValidAgentRef(),
      action_text: 'Do the task',
      // done_criteria missing
    })

    const result = validatePublish(data)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    const requiredFieldErrors = result.errors.filter((e) => e.code === ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)
    expect(requiredFieldErrors.length).toBeGreaterThan(0)
    expect(requiredFieldErrors[0].message_user).toContain('done_criteria')
  })

  it('both fields missing blocks publish with both errors', () => {
    const data = createSkillWithAgent({
      // Both fields missing
    })

    const result = validatePublish(data)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    const requiredFieldErrors = result.errors.filter((e) => e.code === ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)
    expect(requiredFieldErrors.length).toBe(1) // One error for the node, but mentions both fields
    expect(requiredFieldErrors[0].message_user).toContain('agent_ref')
    expect(requiredFieldErrors[0].message_user).toContain('action_text')
    expect(requiredFieldErrors[0].message_user).toContain('done_criteria')
  })

  it('agent_ref, action_text, and done_criteria allow publish', () => {
    const data = createSkillWithAgent({
      agent_ref: createValidAgentRef(),
      action_text: 'Do the task',
      done_criteria: 'Task complete',
    })

    const result = validatePublish(data)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('empty string values are treated as missing', () => {
    const data = createSkillWithAgent({
      agent_ref: {
        package: ' ',
        name: '',
      },
      action_text: '   ', // whitespace only
      done_criteria: '',
    })

    const result = validatePublish(data)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
  it('missing agent_ref blocks publish', () => {
    const data = createSkillWithAgent({
      action_text: 'Do the task',
      done_criteria: 'Task complete',
    })

    const result = validatePublish(data)

    expect(result.valid).toBe(false)
    const requiredFieldErrors = result.errors.filter((e) => e.code === ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)
    expect(requiredFieldErrors.length).toBeGreaterThan(0)
    expect(requiredFieldErrors[0].message_user).toContain('agent_ref')
  })
})

describe('publish-gate-required-fields: Draft vs Publish', () => {
  it('draft allows missing action_text as warning only', () => {
    const data = createSkillWithAgent({
      agent_ref: createValidAgentRef(),
      done_criteria: 'Task complete',
    })

    const draftResult = validateDraft(data)
    const publishResult = validatePublish(data)

    // Draft should succeed with warnings
    expect(draftResult.valid).toBe(true)
    expect(draftResult.warnings.length).toBeGreaterThan(0)
    expect(draftResult.warnings.some((w) => w.includes('action_text'))).toBe(true)

    // Publish should fail with errors
    expect(publishResult.valid).toBe(false)
    expect(publishResult.errors.length).toBeGreaterThan(0)
  })

  it('draft allows missing done_criteria as warning only', () => {
    const data = createSkillWithAgent({
      agent_ref: createValidAgentRef(),
      action_text: 'Do the task',
    })

    const draftResult = validateDraft(data)
    const publishResult = validatePublish(data)

    // Draft should succeed with warnings
    expect(draftResult.valid).toBe(true)
    expect(draftResult.warnings.length).toBeGreaterThan(0)
    expect(draftResult.warnings.some((w) => w.includes('done_criteria'))).toBe(true)

    // Publish should fail with errors
    expect(publishResult.valid).toBe(false)
    expect(publishResult.errors.length).toBeGreaterThan(0)
  })

  it('complete agent passes both draft and publish', () => {
    const data = createSkillWithAgent({
      agent_ref: createValidAgentRef(),
      action_text: 'Do the task',
      done_criteria: 'Task complete',
    })

    const draftResult = validateDraft(data)
    const publishResult = validatePublish(data)

    expect(draftResult.valid).toBe(true)
    expect(draftResult.warnings).toHaveLength(0)

    expect(publishResult.valid).toBe(true)
    expect(publishResult.errors).toHaveLength(0)
  })
  it('draft allows missing agent_ref as warning only', () => {
    const data = createSkillWithAgent({
      action_text: 'Do the task',
      done_criteria: 'Task complete',
    })

    const draftResult = validateDraft(data)
    const publishResult = validatePublish(data)

    expect(draftResult.valid).toBe(true)
    expect(draftResult.warnings.some((w) => w.includes('agent_ref'))).toBe(true)

    expect(publishResult.valid).toBe(false)
    expect(publishResult.errors.some((e) => e.code === ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)).toBe(true)
  })
})

describe('publish-gate-required-fields: Multiple agents', () => {
  it('detects missing fields across multiple agents', () => {
    const data = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test skill',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
          { id: 'agent1', name: 'Agent 1', type: 'Agent', position: [100, 0], config: { agent_ref: createValidAgentRef(), action_text: 'Task 1' } },
          { id: 'agent2', name: 'Agent 2', type: 'Agent', position: [200, 0], config: {} },
          { id: 'n2', name: 'End', type: 'End', position: [300, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validatePublish(data)

    expect(result.valid).toBe(false)

    const requiredFieldErrors = result.errors.filter((e) => e.code === ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)
    expect(requiredFieldErrors.length).toBe(2) // One for Agent 1 (missing done_criteria), one for Agent 2 (both missing)
  })
})

describe('publish-gate-required-fields: ADR-0020/0021 resource refs optional', () => {
  it('publish succeeds with action_text and done_criteria, no resource refs', () => {
    const data = createSkillWithAgent({
      agent_ref: createValidAgentRef(),
      action_text: 'Do the task',
      done_criteria: 'Task complete',
    })

    const result = validatePublish(data)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('publish succeeds with agent_ref, action_text, and done_criteria only', () => {
    const data = createSkillWithAgent({
      agent_ref: createValidAgentRef(),
      action_text: 'Do the task',
      done_criteria: 'Task complete',
    })

    const result = validatePublish(data)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('publish fails when agent_ref shape is invalid', () => {
    const data = createSkillWithAgent({
      agent_ref: {
        package: 'test-package',
      },
      action_text: 'Do the task',
      done_criteria: 'Task complete',
    })

    const result = validatePublish(data)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
