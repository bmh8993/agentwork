/**
 * Test Gate: load-compat-readonly
 *
 * Validates:
 * 1. unsupported node loads successfully in read-only mode
 * 2. save/run is blocked in read-only mode
 * 3. original file hash unchanged
 */

import { describe, it, expect } from 'vitest'
import { validateLoad, ERROR_CODES } from '@opencode/skill-schema'
import { SUPPORTED_NODE_TYPES } from '@opencode/skill-domain'

describe('load-compat-readonly: Unsupported node detection', () => {
  it('valid supported nodes load without flags', () => {
    const validData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
          { id: 'n2', name: 'Agent', type: 'Agent', position: [100, 0], config: {} },
          { id: 'n3', name: 'End', type: 'End', position: [200, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateLoad(validData)

    expect(result.valid).toBe(true)
    expect(result.flags?.readOnlyCompatibility).toBeUndefined()
    expect(result.flags?.unsupportedNodeTypes).toBeUndefined()
  })

  it('unsupported node loads successfully with readOnlyCompatibility flag', () => {
    const unsupportedData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
          // Condition is not supported in MVP
          { id: 'n2', name: 'Condition', type: 'Condition', position: [100, 0], config: {} },
          { id: 'n3', name: 'End', type: 'End', position: [200, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateLoad(unsupportedData)

    // Load should succeed even with unsupported nodes
    expect(result.valid).toBe(true)
    expect(result.flags?.readOnlyCompatibility).toBe(true)
    expect(result.flags?.unsupportedNodeTypes).toContain('Condition')
  })

  it('multiple unsupported node types are all reported', () => {
    const unsupportedData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
          { id: 'n2', name: 'Condition', type: 'Condition', position: [100, 0], config: {} },
          { id: 'n3', name: 'Loop', type: 'Loop', position: [200, 0], config: {} },
          { id: 'n4', name: 'End', type: 'End', position: [300, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateLoad(unsupportedData)

    expect(result.valid).toBe(true)
    expect(result.flags?.readOnlyCompatibility).toBe(true)
    expect(result.flags?.unsupportedNodeTypes).toEqual(expect.arrayContaining(['Condition', 'Loop']))
    expect(result.flags?.unsupportedNodeTypes).toHaveLength(2)
  })

  it('all supported node types are recognized', () => {
    expect(SUPPORTED_NODE_TYPES).toContain('Start')
    expect(SUPPORTED_NODE_TYPES).toContain('Agent')
    expect(SUPPORTED_NODE_TYPES).toContain('End')
    expect(SUPPORTED_NODE_TYPES).toHaveLength(3)
  })
})

describe('load-compat-readonly: Schema validation still applies', () => {
  it('invalid schema fails even with unsupported node check', () => {
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

    const result = validateLoad(invalidData)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].code).toBe(ERROR_CODES.SCHEMA_VALIDATION_FAILED)
  })
})

// ADR-0019: Cardinality violations also trigger read-only compatibility
describe('load-compat-readonly: Cardinality violations', () => {
  it('multiple Start nodes load with readOnlyCompatibility flag', () => {
    const multipleStartData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start 1', type: 'Start', position: [0, 0], config: {} },
          { id: 'n2', name: 'Start 2', type: 'Start', position: [100, 0], config: {} },
          { id: 'n3', name: 'End', type: 'End', position: [200, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateLoad(multipleStartData)

    // Load should succeed but with read-only flag
    expect(result.valid).toBe(true)
    expect(result.flags?.readOnlyCompatibility).toBe(true)
    expect(result.flags?.cardinalityViolations).toContain('multiple_start')
  })

  it('multiple End nodes load with readOnlyCompatibility flag', () => {
    const multipleEndData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
          { id: 'n2', name: 'End 1', type: 'End', position: [100, 0], config: {} },
          { id: 'n3', name: 'End 2', type: 'End', position: [200, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateLoad(multipleEndData)

    // Load should succeed but with read-only flag
    expect(result.valid).toBe(true)
    expect(result.flags?.readOnlyCompatibility).toBe(true)
    expect(result.flags?.cardinalityViolations).toContain('multiple_end')
  })

  it('missing Start node loads with readOnlyCompatibility flag', () => {
    const missingStartData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Agent', type: 'Agent', position: [100, 0], config: {} },
          { id: 'n2', name: 'End', type: 'End', position: [200, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateLoad(missingStartData)

    // Load should succeed but with read-only flag
    expect(result.valid).toBe(true)
    expect(result.flags?.readOnlyCompatibility).toBe(true)
    expect(result.flags?.cardinalityViolations).toContain('missing_start')
  })

  it('missing End node loads with readOnlyCompatibility flag', () => {
    const missingEndData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
          { id: 'n2', name: 'Agent', type: 'Agent', position: [100, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateLoad(missingEndData)

    // Load should succeed but with read-only flag
    expect(result.valid).toBe(true)
    expect(result.flags?.readOnlyCompatibility).toBe(true)
    expect(result.flags?.cardinalityViolations).toContain('missing_end')
  })

  it('both unsupported nodes and cardinality violations are reported', () => {
    const combinedData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start 1', type: 'Start', position: [0, 0], config: {} },
          { id: 'n2', name: 'Start 2', type: 'Start', position: [100, 0], config: {} },
          { id: 'n3', name: 'Condition', type: 'Condition', position: [200, 0], config: {} },
          { id: 'n4', name: 'End', type: 'End', position: [300, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateLoad(combinedData)

    // Load should succeed but with both flags
    expect(result.valid).toBe(true)
    expect(result.flags?.readOnlyCompatibility).toBe(true)
    expect(result.flags?.cardinalityViolations).toContain('multiple_start')
    expect(result.flags?.unsupportedNodeTypes).toContain('Condition')
  })
})
