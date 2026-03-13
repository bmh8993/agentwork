/**
 * Test Gate: schema-contract
 *
 * Validates:
 * 1. valid v1 fixture passes
 * 2. invalid fixture returns schema_validation_failed
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { validateSchema, ERROR_CODES } from '@opencode/skill-schema'

const FIXTURES_DIR = join(__dirname, '../../fixtures/skill-json/v1')

function loadFixture(name: string) {
  const content = readFileSync(join(FIXTURES_DIR, name), 'utf-8')
  return JSON.parse(content)
}

describe('schema-contract: AJV v1 validation', () => {
  it('valid v1 fixture passes validation', () => {
    const valid = loadFixture('valid-minimal.json')
    const result = validateSchema(valid)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('missing version returns schema_validation_failed', () => {
    const invalid = loadFixture('invalid-missing-version.json')
    const result = validateSchema(invalid)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    // All errors should be schema_validation_failed
    for (const error of result.errors) {
      expect(error.code).toBe(ERROR_CODES.SCHEMA_VALIDATION_FAILED)
    }

    // Should mention missing version
    const errorMessages = result.errors.map((e) => e.message_user)
    expect(errorMessages.some((msg) => msg.includes('version'))).toBe(true)
  })

  it('missing required field returns schema_validation_failed', () => {
    const invalid = loadFixture('invalid-missing-required-field.json')
    const result = validateSchema(invalid)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    // All errors should be schema_validation_failed
    for (const error of result.errors) {
      expect(error.code).toBe(ERROR_CODES.SCHEMA_VALIDATION_FAILED)
    }

    // Should mention missing required field
    const errorMessages = result.errors.map((e) => e.message_user)
    expect(
      errorMessages.some((msg) => msg.includes('skill') || msg.includes('id'))
    ).toBe(true)
  })

  it('invalid type returns schema_validation_failed', () => {
    const invalid = {
      version: 1, // number instead of string
      skill: 'invalid', // string instead of object
      workflow: {
        nodes: [],
        edges: [],
      },
    }
    const result = validateSchema(invalid)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    // Check that type errors are captured
    const errorMessages = result.errors.map((e) => e.message_user)
    expect(
      errorMessages.some((msg) => msg.includes('string') || msg.includes('object'))
    ).toBe(true)
  })

  it('full ADR-0009 example passes validation', () => {
    const adrExample = {
      version: '1',
      skill: {
        id: 'skill-refund-v1',
        name: 'Refund Verification',
        description: 'Validate refund request and route action.',
        content_md: '## What I do\nValidate refund input and route to success/failure path.',
      },
      workflow: {
        nodes: [
          {
            id: 'n_start',
            name: 'Start',
            type: 'Start',
            position: [120, 180],
            config: {},
          },
          {
            id: 'n_task_1',
            name: 'Validate Input',
            type: 'Agent',
            position: [360, 180],
            config: {},
          },
          {
            id: 'n_task_2',
            name: 'Create Request',
            type: 'Agent',
            position: [600, 180],
            config: {},
          },
          {
            id: 'n_end',
            name: 'End',
            type: 'End',
            position: [840, 180],
            config: {},
          },
        ],
        edges: [
          {
            id: 'e1',
            source_node_id: 'n_start',
            target_node_id: 'n_task_1',
            branch: 'default',
            source_node_name: 'Start',
            target_node_name: 'Validate Input',
          },
          {
            id: 'e2',
            source_node_id: 'n_task_1',
            target_node_id: 'n_task_2',
            branch: 'default',
            source_node_name: 'Validate Input',
            target_node_name: 'Create Request',
          },
          {
            id: 'e3',
            source_node_id: 'n_task_2',
            target_node_id: 'n_end',
            branch: 'default',
            source_node_name: 'Create Request',
            target_node_name: 'End',
          },
        ],
        layout: {
          grid_size: 16,
          snap_to_grid: true,
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
      policy: {
        execution_mode: 'sequential',
        failure_mode: 'fail_fast',
      },
    }

    const result = validateSchema(adrExample)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
