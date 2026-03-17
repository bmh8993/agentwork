/**
 * Test Gate: run-gate-strict
 *
 * Validates:
 * 1. strict validation failure blocks run start
 * 2. strict validation pass allows run start
 * 3. unsupported node blocks run
 */

import { describe, it, expect } from 'vitest'
import { validateRun, ERROR_CODES } from '@opencode/skill-schema'

function createValidSkill() {
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
        {
          id: 'agent1',
          name: 'Test Agent',
          type: 'Agent',
          position: [100, 0],
          config: {
            action_text: 'Do the task',
            done_criteria: 'Task complete',
          },
        },
        { id: 'n2', name: 'End', type: 'End', position: [200, 0], config: {} },
      ],
      edges: [],
    },
  }
}

describe('run-gate-strict: Schema validation', () => {
  it('invalid schema blocks run', () => {
    const invalidData = {
      // Missing version
      skill: {
        name: 'Test',
      },
      workflow: {
        nodes: [],
        edges: [],
      },
    }

    const result = validateRun(invalidData)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].code).toBe(ERROR_CODES.SCHEMA_VALIDATION_FAILED)
  })

  it('valid schema passes first validation gate', () => {
    const data = createValidSkill()

    const result = validateRun(data)

    // Should pass schema validation
    // (but still needs to check other constraints)
    expect(result.valid).toBe(true)
  })
})

describe('run-gate-strict: Required fields gate', () => {
  it('missing action_text blocks run', () => {
    const data = createValidSkill()
    // @ts-ignore - modify config for testing
    data.workflow.nodes[1].config = {
      done_criteria: 'Task complete',
    }

    const result = validateRun(data)

    expect(result.valid).toBe(false)

    const requiredFieldErrors = result.errors.filter((e) => e.code === ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)
    expect(requiredFieldErrors.length).toBeGreaterThan(0)
  })

  it('missing done_criteria blocks run', () => {
    const data = createValidSkill()
    // @ts-ignore - modify config for testing
    data.workflow.nodes[1].config = {
      action_text: 'Do the task',
    }

    const result = validateRun(data)

    expect(result.valid).toBe(false)

    const requiredFieldErrors = result.errors.filter((e) => e.code === ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)
    expect(requiredFieldErrors.length).toBeGreaterThan(0)
  })

  it('all required fields present passes validation', () => {
    const data = createValidSkill()

    const result = validateRun(data)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('run-gate-strict: Unsupported nodes', () => {
  it('unsupported node type blocks run (unlike load)', () => {
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
          { id: 'n2', name: 'Condition', type: 'Condition', position: [100, 0], config: {} },
          { id: 'n3', name: 'End', type: 'End', position: [200, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateRun(data)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    const unsupportedErrors = result.errors.filter((e) => e.code === 'unsupported_node_type')
    expect(unsupportedErrors.length).toBeGreaterThan(0)
    expect(unsupportedErrors[0].message_user).toContain('Cannot run')
  })

  it('unsupported node with required fields still blocks run', () => {
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
          {
            id: 'agent1',
            name: 'Agent',
            type: 'Agent',
            position: [100, 0],
            config: {
              action_text: 'Do task',
              done_criteria: 'Task done',
            },
          },
          { id: 'n2', name: 'Loop', type: 'Loop', position: [200, 0], config: {} },
          { id: 'n3', name: 'End', type: 'End', position: [300, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateRun(data)

    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'unsupported_node_type')).toBe(true)
  })
})

describe('run-gate-strict: Complete validation pass', () => {
  it('valid complete workflow passes run gate', () => {
    const data = createValidSkill()

    const result = validateRun(data)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })
})

describe('run-gate-strict: ADR-0020/0021 resource refs optional', () => {
  it('run succeeds with action_text and done_criteria, no resource refs', () => {
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
          {
            id: 'agent1',
            name: 'Test Agent',
            type: 'Agent',
            position: [100, 0],
            config: {
              action_text: 'Do the task',
              done_criteria: 'Task complete',
              // knowledge_refs and tool_refs absent - should still pass
            },
          },
          { id: 'n2', name: 'End', type: 'End', position: [200, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateRun(data)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('run succeeds with action_text, done_criteria, and empty resource ref arrays', () => {
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
          {
            id: 'agent1',
            name: 'Test Agent',
            type: 'Agent',
            position: [100, 0],
            config: {
              action_text: 'Do the task',
              done_criteria: 'Task complete',
              knowledge_refs: [],
              tool_refs: [],
            },
          },
          { id: 'n2', name: 'End', type: 'End', position: [200, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateRun(data)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('run succeeds with action_text, done_criteria, and populated resource refs', () => {
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
          {
            id: 'agent1',
            name: 'Test Agent',
            type: 'Agent',
            position: [100, 0],
            config: {
              action_text: 'Do the task',
              done_criteria: 'Task complete',
              knowledge_refs: [
                'kb-knowledge-base',
              ],
              tool_refs: [
                'tool-search',
              ],
            },
          },
          { id: 'n2', name: 'End', type: 'End', position: [200, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateRun(data)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
