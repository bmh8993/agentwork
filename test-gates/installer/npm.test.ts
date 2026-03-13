/**
 * Phase 3 Installer NPM Error Mapping Tests
 *
 * Test Gates:
 * - installer-npm-errors: Verify npm install errors map to standard codes with correct retryable flags
 */

import { describe, it, expect } from 'vitest'
import {
  mapNpmInstallError,
  parseNpmErrorMessage,
  simulateNpmInstall,
} from '@opencode/installer'
import { ERROR_CODES } from '@opencode/skill-schema'

describe('installer-npm-errors', () => {
  describe('network error mapping', () => {
    it('should map network errors to dependency_resolution_failed with retryable=true', () => {
      const error = mapNpmInstallError('network', 'ECONNREFUSED')

      expect(error.code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
      expect(error.retryable).toBe(true)
      expect(error.message_user).toContain('Network')
    })

    it('should parse ECONNREFUSED as network error', () => {
      const errorType = parseNpmErrorMessage('ECONNREFUSED registry.npmjs.org')

      expect(errorType).toBe('network')
    })

    it('should parse ENOTFOUND as network error', () => {
      const errorType = parseNpmErrorMessage('ENOTFOUND registry.npmjs.org')

      expect(errorType).toBe('network')
    })
  })

  describe('version conflict error mapping', () => {
    it('should map version conflicts to dependency_resolution_failed with retryable=false', () => {
      const error = mapNpmInstallError('version_conflict', 'ERESOLVE unable to satisfy')

      expect(error.code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
      expect(error.retryable).toBe(false)
      expect(error.message_user).toContain('conflict')
    })

    it('should parse ERESOLVE as version conflict', () => {
      const errorType = parseNpmErrorMessage('ERESOLVE unable to satisfy dependency')

      expect(errorType).toBe('version_conflict')
    })

    it('should parse conflict keyword as version conflict', () => {
      const errorType = parseNpmErrorMessage('Conflict: unable to find suitable version')

      expect(errorType).toBe('version_conflict')
    })
  })

  describe('peer dependency error mapping', () => {
    it('should map peer dependency errors to dependency_resolution_failed with retryable=true', () => {
      const error = mapNpmInstallError('peer_dependency', 'peer dep missing')

      expect(error.code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
      expect(error.retryable).toBe(true)
      expect(error.message_user).toContain('Peer dependency')
    })

    it('should parse peer dependency keyword', () => {
      const errorType = parseNpmErrorMessage('peer dependency missing')

      expect(errorType).toBe('peer_dependency')
    })
  })

  describe('not found error mapping', () => {
    it('should map 404 errors to dependency_resolution_failed with retryable=false', () => {
      const error = mapNpmInstallError('not_found', '404 Not Found')

      expect(error.code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
      expect(error.retryable).toBe(false)
      expect(error.message_user).toContain('not found')
    })

    it('should parse 404 as not found', () => {
      const errorType = parseNpmErrorMessage('404 Not Found package')

      expect(errorType).toBe('not_found')
    })
  })

  describe('permission error mapping', () => {
    it('should map permission errors to dependency_resolution_failed with retryable=true', () => {
      const error = mapNpmInstallError('permission', 'EACCES')

      expect(error.code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
      expect(error.retryable).toBe(true)
      expect(error.message_user).toContain('Permission')
    })

    it('should parse EACCES as permission error', () => {
      const errorType = parseNpmErrorMessage('EACCES permission denied')

      expect(errorType).toBe('permission')
    })

    it('should parse EPERM as permission error', () => {
      const errorType = parseNpmErrorMessage('EPERM permission denied')

      expect(errorType).toBe('permission')
    })
  })

  describe('disk space error mapping', () => {
    it('should map disk space errors to dependency_resolution_failed with retryable=true', () => {
      const error = mapNpmInstallError('disk_space', 'ENOSPC')

      expect(error.code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
      expect(error.retryable).toBe(true)
      expect(error.message_user).toContain('disk')
    })

    it('should parse ENOSPC as disk space error', () => {
      const errorType = parseNpmErrorMessage('ENOSPC no space left')

      expect(errorType).toBe('disk_space')
    })
  })

  describe('unknown error mapping', () => {
    it('should map unknown errors to dependency_resolution_failed with default values', () => {
      const error = mapNpmInstallError('unknown', 'something went wrong')

      expect(error.code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
      expect(error.retryable).toBe(true)
    })
  })

  describe('simulateNpmInstall', () => {
    it('should return success when no mock error', async () => {
      const result = await simulateNpmInstall('@opencode/test-skill')

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0]).toContain('@opencode/test-skill')
    })

    it('should return error when mock error provided', async () => {
      const result = await simulateNpmInstall('missing-package', {
        type: 'not_found',
        message: '404 Not Found',
      })

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
      expect(result.errors[0].retryable).toBe(false)
    })
  })
})

describe('installer-npm-errors integration', () => {
  it('should consistently map network errors', async () => {
    const result = await simulateNpmInstall('test-package', {
      type: 'network',
      message: 'ECONNREFUSED',
    })

    expect(result.success).toBe(false)
    expect(result.errors[0].code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
    expect(result.errors[0].retryable).toBe(true)
    expect(result.errors[0].next_action).toContain('network')
  })

  it('should consistently map version conflicts', async () => {
    const result = await simulateNpmInstall('test-package', {
      type: 'version_conflict',
      message: 'ERESOLVE',
    })

    expect(result.success).toBe(false)
    expect(result.errors[0].code).toBe(ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED)
    expect(result.errors[0].retryable).toBe(false)
    expect(result.errors[0].next_action).toContain('version')
  })
})
