/**
 * Phase 3 Run Strict Gate Tests
 *
 * Test Gates:
 * - run-gate-strict: Verify strict validation blocks run execution
 */

import { describe, it, expect } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import {
  performPreFlightValidation,
  createRunSession,
  validateRunSession,
  startRunSession,
  simulateRunExecution,
} from '@opencode/run-orchestrator'
import { ERROR_CODES } from '@opencode/skill-schema'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const fixturesDir = join(__dirname, 'fixtures')

// Load fixture data
async function loadFixture(name: string) {
  const content = await fs.readFile(join(fixturesDir, name), 'utf-8')
  return JSON.parse(content)
}

describe('run-gate-strict', () => {
  describe('pre-flight validation', () => {
    it('should pass validation for valid workflow', async () => {
      const workflow = await loadFixture('valid-workflow.json')
      const result = performPreFlightValidation(workflow)

      expect(result.canRun).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation for missing action_text', async () => {
      const workflow = await loadFixture('invalid-missing-action.json')
      const result = performPreFlightValidation(workflow)

      expect(result.canRun).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)

      const actionError = result.errors.find(e => e.code === ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING)
      expect(actionError).toBeDefined()
    })

    it('should fail validation for unsupported node types', async () => {
      const workflow = await loadFixture('invalid-unsupported-node.json')
      const result = performPreFlightValidation(workflow)

      expect(result.canRun).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)

      const unsupportedError = result.errors.find(e => e.code === ERROR_CODES.UNSUPPORTED_NODE_TYPE)
      expect(unsupportedError).toBeDefined()
      expect(unsupportedError?.retryable).toBe(false)
    })
  })

  describe('run session validation', () => {
    it('should validate session and mark as validated', async () => {
      const workflow = await loadFixture('valid-workflow.json')
      const session = createRunSession('test-session-1')

      const validatedSession = validateRunSession(session, workflow)

      expect(validatedSession.state).toBe('validated')
      expect(validatedSession.validatedAt).toBeDefined()
      expect(validatedSession.errors).toHaveLength(0)
    })

    it('should mark session as failed when validation fails', async () => {
      const workflow = await loadFixture('invalid-missing-action.json')
      const session = createRunSession('test-session-2')

      const validatedSession = validateRunSession(session, workflow)

      expect(validatedSession.state).toBe('failed')
      expect(validatedSession.errors.length).toBeGreaterThan(0)
    })

    it('should provide next_action for validation failures', async () => {
      const workflow = await loadFixture('invalid-missing-action.json')
      const session = createRunSession('test-session-3')

      const validatedSession = validateRunSession(session, workflow)

      expect(validatedSession.errors[0].next_action).toBeDefined()
      expect(validatedSession.errors[0].next_action).toContain('action')
    })
  })

  describe('run execution blocking', () => {
    it('should block execution when validation fails', async () => {
      const invalidWorkflow = await loadFixture('invalid-missing-action.json')
      const session = createRunSession('test-session-4')

      // Try to validate (will fail)
      const validatedSession = validateRunSession(session, invalidWorkflow)

      // Try to execute (should be blocked)
      const executionResult = await simulateRunExecution(validatedSession, invalidWorkflow)

      expect(executionResult.state).toBe('failed')
      expect(executionResult.errors.length).toBeGreaterThan(0)
    })

    it('should block execution for unsupported nodes', async () => {
      const unsupportedWorkflow = await loadFixture('invalid-unsupported-node.json')
      const session = createRunSession('test-session-5')

      const validatedSession = validateRunSession(session, unsupportedWorkflow)
      const executionResult = await simulateRunExecution(validatedSession, unsupportedWorkflow)

      expect(executionResult.state).toBe('failed')

      const unsupportedError = executionResult.errors.find(
        e => e.code === ERROR_CODES.UNSUPPORTED_NODE_TYPE
      )
      expect(unsupportedError).toBeDefined()
    })

    it('should allow execution when validation passes', async () => {
      const validWorkflow = await loadFixture('valid-workflow.json')
      const session = createRunSession('test-session-6')

      const validatedSession = validateRunSession(session, validWorkflow)
      expect(validatedSession.state).toBe('validated')

      const executionResult = await simulateRunExecution(validatedSession, validWorkflow)

      expect(executionResult.state).toBe('completed')
      expect(executionResult.completedAt).toBeDefined()
    })
  })

  describe('start run session', () => {
    it('should start session when validated', async () => {
      const workflow = await loadFixture('valid-workflow.json')
      const session = createRunSession('test-session-7')

      const validatedSession = validateRunSession(session, workflow)
      const startedSession = startRunSession(validatedSession)

      expect(startedSession.state).toBe('running')
      expect(startedSession.startedAt).toBeDefined()
    })

    it('should fail to start when not validated', () => {
      const session = createRunSession('test-session-8')
      const startedSession = startRunSession(session)

      expect(startedSession.state).toBe('failed')
      expect(startedSession.errors.length).toBeGreaterThan(0)
    })
  })
})

describe('run-gate-strict integration', () => {
  it('should enforce strict validation before run execution', async () => {
    const validWorkflow = await loadFixture('valid-workflow.json')
    const invalidWorkflow = await loadFixture('invalid-missing-action.json')

    // Valid workflow should pass
    const validSession = createRunSession('integration-1')
    const validValidated = validateRunSession(validSession, validWorkflow)
    expect(validValidated.state).toBe('validated')

    // Invalid workflow should fail
    const invalidSession = createRunSession('integration-2')
    const invalidValidated = validateRunSession(invalidSession, invalidWorkflow)
    expect(invalidValidated.state).toBe('failed')

    // Invalid workflow should not execute
    const executionResult = await simulateRunExecution(invalidValidated, invalidWorkflow)
    expect(executionResult.state).toBe('failed')
  })

  it('should provide actionable error messages', async () => {
    const workflow = await loadFixture('invalid-unsupported-node.json')
    const session = createRunSession('integration-3')

    const validatedSession = validateRunSession(session, workflow)

    expect(validatedSession.errors.length).toBeGreaterThan(0)

    // All errors should have next_action
    validatedSession.errors.forEach(error => {
      expect(error.next_action).toBeDefined()
      expect(error.next_action).toBeTruthy()
    })
  })
})
