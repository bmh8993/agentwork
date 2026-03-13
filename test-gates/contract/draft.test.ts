/**
 * Test Gate: draft-structural-save
 *
 * Validates:
 * 1. Draft save with valid structure succeeds
 * 2. Draft save with invalid structure fails
 * 3. Write failure preserves original
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { unlinkSync, existsSync, readFileSync, readdirSync } from 'fs'
import { validateDraft } from '@opencode/skill-schema'
import { saveSkill, canSave } from '@opencode/skill-io'
import { join, dirname } from 'path'
import { tmpdir } from 'os'

const TEMP_DIR = join(tmpdir(), 'opencode-test-draft')
const TEST_FILE = join(TEMP_DIR, 'test-skill.json')

describe('draft-structural-save: Validation', () => {
  it('valid structure passes draft validation', () => {
    const validData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test skill',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
          { id: 'n2', name: 'End', type: 'End', position: [100, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = validateDraft(validData)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('invalid structure fails draft validation', () => {
    const invalidData = {
      // Missing version field
      skill: {
        name: 'Test',
      },
      workflow: {
        nodes: [],
        edges: [],
      },
    }

    const result = validateDraft(invalidData)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('canSave helper works correctly', () => {
    const validData = {
      version: '1',
      skill: { id: 'test', name: 'Test', description: 'Test' },
      workflow: { nodes: [], edges: [] },
    }

    const invalidData = {
      skill: { name: 'Test' },
      workflow: { nodes: [], edges: [] },
    }

    expect(canSave(validData).valid).toBe(true)
    expect(canSave(invalidData).valid).toBe(false)
  })
})

describe('draft-structural-save: Save operations', () => {
  beforeEach(async () => {
    // Clean up temp dir before each test
    if (existsSync(TEST_FILE)) {
      unlinkSync(TEST_FILE)
    }
  })

  afterEach(async () => {
    // Clean up temp dir after each test
    if (existsSync(TEST_FILE)) {
      unlinkSync(TEST_FILE)
    }
  })

  it('valid structure saves successfully', async () => {
    const validData = {
      version: '1',
      skill: {
        id: 'test-skill',
        name: 'Test',
        description: 'Test skill',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
          { id: 'n2', name: 'End', type: 'End', position: [100, 0], config: {} },
        ],
        edges: [],
      },
    }

    const result = await saveSkill(TEST_FILE, validData)

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(result.path).toBe(TEST_FILE)
    expect(result.validation?.valid).toBe(true)

    // Verify file was created
    expect(existsSync(TEST_FILE)).toBe(true)

    // Verify content
    const content = readFileSync(TEST_FILE, 'utf-8')
    const saved = JSON.parse(content)
    expect(saved.version).toBe('1')
    expect(saved.skill.id).toBe('test-skill')
  })

  it('invalid structure is rejected before save', async () => {
    const invalidData = {
      // Missing required fields
      skill: {
        name: 'Test',
      },
      workflow: {
        nodes: [],
        edges: [],
      },
    }

    const result = await saveSkill(TEST_FILE, invalidData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Draft validation failed')
    expect(result.validation?.valid).toBe(false)
    expect(result.validation?.errors.length).toBeGreaterThan(0)

    // Verify file was NOT created
    expect(existsSync(TEST_FILE)).toBe(false)
  })

  it('atomic write preserves original on failure', async () => {
    const originalData = {
      version: '1',
      skill: {
        id: 'original-skill',
        name: 'Original',
        description: 'Original content',
      },
      workflow: {
        nodes: [
          { id: 'n1', name: 'Start', type: 'Start', position: [0, 0], config: {} },
          { id: 'n2', name: 'End', type: 'End', position: [100, 0], config: {} },
        ],
        edges: [],
      },
    }

    // Step 1: Create original file
    const writeResult1 = await saveSkill(TEST_FILE, originalData)
    expect(writeResult1.success).toBe(true)
    expect(existsSync(TEST_FILE)).toBe(true)

    // Step 2: Read original content
    const contentBefore = readFileSync(TEST_FILE, 'utf-8')

    // Step 3: Attempt to save invalid data (should fail before write)
    const invalidData = {
      skill: { name: 'Invalid' },
      workflow: { nodes: [], edges: [] },
    }

    const writeResult2 = await saveSkill(TEST_FILE, invalidData)
    expect(writeResult2.success).toBe(false)

    // Step 4: Verify original content is unchanged
    const contentAfter = readFileSync(TEST_FILE, 'utf-8')
    expect(contentAfter).toBe(contentBefore)

    // Step 5: Verify no temp files left behind
    const dir = dirname(TEST_FILE)
    const files = readdirSync(dir)
    const tempFiles = files.filter((f: string) => f.startsWith('.'))
    expect(tempFiles.length).toBe(0)
  })

  it('atomic write overwrites existing file safely', async () => {
    const data1 = {
      version: '1',
      skill: { id: 'skill1', name: 'Version 1', description: 'First' },
      workflow: { nodes: [], edges: [] },
    }

    const data2 = {
      version: '1',
      skill: { id: 'skill2', name: 'Version 2', description: 'Second' },
      workflow: { nodes: [], edges: [] },
    }

    // Save first version
    const result1 = await saveSkill(TEST_FILE, data1)
    expect(result1.success).toBe(true)

    // Overwrite with second version
    const result2 = await saveSkill(TEST_FILE, data2)
    expect(result2.success).toBe(true)

    // Verify second version is now in file
    const finalContent = readFileSync(TEST_FILE, 'utf-8')
    const finalData = JSON.parse(finalContent)
    expect(finalData.skill.name).toBe('Version 2')
    expect(finalData.skill.id).toBe('skill2')
  })
})
