/**
 * ADR-0019: Cardinality validation tests
 */

import { describe, it, expect } from 'vitest'
import {
  checkNodeCardinality,
  addCardinalityErrors,
  addCardinalityWarnings,
  addCardinalityReadOnlyFlags,
} from '../index'

describe('checkNodeCardinality', () => {
  it('should pass with exactly 1 Start and 1 End', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start', position: [0, 0] },
          { id: 'end-1', type: 'End', name: 'End', position: [200, 0] },
        ],
      },
    }

    const result = checkNodeCardinality(data)
    expect(result.valid).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('should detect multiple Start nodes', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start 1', position: [0, 0] },
          { id: 'start-2', type: 'Start', name: 'Start 2', position: [200, 0] },
          { id: 'end-1', type: 'End', name: 'End', position: [400, 0] },
        ],
      },
    }

    const result = checkNodeCardinality(data)
    expect(result.valid).toBe(false)
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].type).toBe('multiple_start')
    expect(result.violations[0].count).toBe(2)
  })

  it('should detect multiple End nodes', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start', position: [0, 0] },
          { id: 'end-1', type: 'End', name: 'End 1', position: [200, 0] },
          { id: 'end-2', type: 'End', name: 'End 2', position: [400, 0] },
        ],
      },
    }

    const result = checkNodeCardinality(data)
    expect(result.valid).toBe(false)
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].type).toBe('multiple_end')
    expect(result.violations[0].count).toBe(2)
  })

  it('should detect missing Start node', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'agent-1', type: 'Agent', name: 'Agent', position: [100, 0] },
          { id: 'end-1', type: 'End', name: 'End', position: [200, 0] },
        ],
      },
    }

    const result = checkNodeCardinality(data)
    expect(result.valid).toBe(false)
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].type).toBe('missing_start')
  })

  it('should detect missing End node', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start', position: [0, 0] },
          { id: 'agent-1', type: 'Agent', name: 'Agent', position: [100, 0] },
        ],
      },
    }

    const result = checkNodeCardinality(data)
    expect(result.valid).toBe(false)
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].type).toBe('missing_end')
  })

  it('should detect multiple violations at once', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start 1', position: [0, 0] },
          { id: 'start-2', type: 'Start', name: 'Start 2', position: [100, 0] },
          { id: 'agent-1', type: 'Agent', name: 'Agent', position: [200, 0] },
        ],
      },
    }

    const result = checkNodeCardinality(data)
    expect(result.valid).toBe(false)
    expect(result.violations).toHaveLength(2) // multiple_start and missing_end

    const types = result.violations.map((v) => v.type)
    expect(types).toContain('multiple_start')
    expect(types).toContain('missing_end')
  })

  it('should allow Agent nodes (0 or more)', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start', position: [0, 0] },
          { id: 'agent-1', type: 'Agent', name: 'Agent 1', position: [100, 0] },
          { id: 'agent-2', type: 'Agent', name: 'Agent 2', position: [200, 0] },
          { id: 'end-1', type: 'End', name: 'End', position: [300, 0] },
        ],
      },
    }

    const result = checkNodeCardinality(data)
    expect(result.valid).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('should handle empty workflow', () => {
    const data = {
      workflow: {
        nodes: [],
      },
    }

    const result = checkNodeCardinality(data)
    expect(result.valid).toBe(false)
    expect(result.violations).toHaveLength(2) // missing_start and missing_end
  })
})

describe('addCardinalityErrors', () => {
  it('should add errors for Publish/Run validation', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start 1', position: [0, 0] },
          { id: 'start-2', type: 'Start', name: 'Start 2', position: [100, 0] },
          { id: 'end-1', type: 'End', name: 'End', position: [200, 0] },
        ],
      },
    }

    const baseResult = { valid: true, errors: [], warnings: [] }
    const result = addCardinalityErrors(baseResult, data)

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].code).toBe('multiple_start_nodes')
  })

  it('should not modify result if cardinality is valid', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start', position: [0, 0] },
          { id: 'end-1', type: 'End', name: 'End', position: [200, 0] },
        ],
      },
    }

    const baseResult = { valid: true, errors: [], warnings: [] }
    const result = addCardinalityErrors(baseResult, data)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('addCardinalityWarnings', () => {
  it('should add warnings for Draft validation', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start', position: [0, 0] },
        ],
      },
    }

    const baseResult = { valid: true, errors: [], warnings: [] }
    const result = addCardinalityWarnings(baseResult, data)

    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toContain('End node')
  })

  it('should not modify result if cardinality is valid', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start', position: [0, 0] },
          { id: 'end-1', type: 'End', name: 'End', position: [200, 0] },
        ],
      },
    }

    const baseResult = { valid: true, errors: [], warnings: [] }
    const result = addCardinalityWarnings(baseResult, data)

    expect(result.warnings).toHaveLength(0)
  })
})

describe('addCardinalityReadOnlyFlags', () => {
  it('should add read-only flags for Load validation', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start 1', position: [0, 0] },
          { id: 'start-2', type: 'Start', name: 'Start 2', position: [100, 0] },
          { id: 'end-1', type: 'End', name: 'End', position: [200, 0] },
        ],
      },
    }

    const baseResult = { valid: true, errors: [], warnings: [] }
    const result = addCardinalityReadOnlyFlags(baseResult, data)

    expect(result.flags?.readOnlyCompatibility).toBe(true)
    expect(result.flags?.cardinalityViolations).toContain('multiple_start')
  })

  it('should not add flags if cardinality is valid', () => {
    const data = {
      workflow: {
        nodes: [
          { id: 'start-1', type: 'Start', name: 'Start', position: [0, 0] },
          { id: 'end-1', type: 'End', name: 'End', position: [200, 0] },
        ],
      },
    }

    const baseResult = { valid: true, errors: [], warnings: [] }
    const result = addCardinalityReadOnlyFlags(baseResult, data)

    expect(result.flags?.readOnlyCompatibility).toBeUndefined()
  })
})
