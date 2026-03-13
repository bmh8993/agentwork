/**
 * Phase 3 Installer Tests
 *
 * Test Gates:
 * - install-folder-only: Verify local folder and npm are allowed, zip is blocked
 * - package-layout-validation: Verify SKILL.json presence and layout validation
 */

import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { fileURLToPath } from 'url'
import {
  detectInstallSource,
  validateInstallSource,
  validatePackageLayout,
  validateInstall,
} from '@opencode/installer'
import { ERROR_CODES } from '@opencode/skill-schema'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const fixturesDir = join(__dirname, 'fixtures')

describe('install-folder-only', () => {
  describe('local folder source', () => {
    it('should accept relative path starting with ./', () => {
      const source = detectInstallSource('./my-skill')
      expect(source.type).toBe('local-folder')
      if (source.type === 'local-folder') {
        expect(source.path).toBe('./my-skill')
      }

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(0)
    })

    it('should accept relative path starting with ../', () => {
      const source = detectInstallSource('../my-skill')
      expect(source.type).toBe('local-folder')
      if (source.type === 'local-folder') {
        expect(source.path).toBe('../my-skill')
      }

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(0)
    })

    it('should accept absolute path starting with /', () => {
      const source = detectInstallSource('/path/to/skill')
      expect(source.type).toBe('local-folder')
      if (source.type === 'local-folder') {
        expect(source.path).toBe('/path/to/skill')
      }

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(0)
    })

    it('should accept folder-like path without path separator', () => {
      const source = detectInstallSource('my-skill')
      expect(source.type).toBe('local-folder')

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(0)
    })
  })

  describe('npm source', () => {
    it('should accept scoped npm package @scope/name', () => {
      const source = detectInstallSource('@opencode/my-skill')
      expect(source.type).toBe('npm')
      if (source.type === 'npm') {
        expect(source.packageName).toBe('@opencode/my-skill')
      }

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(0)
    })

    it('should accept npm package with version @scope/name@1.0.0', () => {
      const source = detectInstallSource('@opencode/my-skill@1.0.0')
      expect(source.type).toBe('npm')
      if (source.type === 'npm') {
        expect(source.packageName).toBe('@opencode/my-skill@1.0.0')
      }

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(0)
    })

    it('should accept simple npm package name with version', () => {
      const source = detectInstallSource('my-skill@1.0.0')
      expect(source.type).toBe('npm')
      if (source.type === 'npm') {
        expect(source.packageName).toBe('my-skill@1.0.0')
      }

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(0)
    })

    it('should treat simple name without path separator as local folder', () => {
      const source = detectInstallSource('my-skill')
      expect(source.type).toBe('local-folder')
      if (source.type === 'local-folder') {
        expect(source.path).toBe('my-skill')
      }

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(0)
    })

    it('should accept npm package with version name@1.0.0', () => {
      const source = detectInstallSource('my-skill@1.0.0')
      expect(source.type).toBe('npm')
      if (source.type === 'npm') {
        expect(source.packageName).toBe('my-skill@1.0.0')
      }

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(0)
    })
  })

  describe('unsupported zip source', () => {
    it('should reject .zip file', () => {
      const source = detectInstallSource('my-skill.zip')
      expect(source.type).toBe('unknown')

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(1)
      expect(errors[0].code).toBe(ERROR_CODES.UNSUPPORTED_SOURCE)
    })

    it('should reject .zip#path format', () => {
      const source = detectInstallSource('my-skill.zip#main')
      expect(source.type).toBe('unknown')

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(1)
      expect(errors[0].code).toBe(ERROR_CODES.UNSUPPORTED_SOURCE)
    })

    it('should reject zip with full path', () => {
      const source = detectInstallSource('/path/to/my-skill.zip')
      expect(source.type).toBe('unknown')

      const errors = validateInstallSource(source)
      expect(errors).toHaveLength(1)
      expect(errors[0].code).toBe(ERROR_CODES.UNSUPPORTED_SOURCE)
    })
  })
})

describe('package-layout-validation', () => {
  describe('valid package layout', () => {
    it('should accept package with SKILL.json', async () => {
      const validSkillPath = join(fixturesDir, 'valid-skill')
      const errors = await validatePackageLayout(validSkillPath)

      expect(errors).toHaveLength(0)
    })
  })

  describe('missing required files', () => {
    it('should reject package without SKILL.json', async () => {
      const missingJsonPath = join(fixturesDir, 'missing-skill-json')
      const errors = await validatePackageLayout(missingJsonPath)

      expect(errors.length).toBeGreaterThan(0)
      const missingError = errors.find(e => e.code === ERROR_CODES.MISSING_REQUIRED_FILE)
      expect(missingError).toBeDefined()
    })

    it('should provide next_action for missing SKILL.json', async () => {
      const missingJsonPath = join(fixturesDir, 'missing-skill-json')
      const errors = await validatePackageLayout(missingJsonPath)

      const missingError = errors.find(e => e.code === ERROR_CODES.MISSING_REQUIRED_FILE)
      expect(missingError?.next_action).toContain('SKILL.json')
    })
  })

  describe('non-existent path', () => {
    it('should reject non-existent directory', async () => {
      const nonExistentPath = join(fixturesDir, 'does-not-exist')
      const errors = await validatePackageLayout(nonExistentPath)

      expect(errors.length).toBeGreaterThan(0)
      const layoutError = errors.find(e => e.code === ERROR_CODES.INVALID_PACKAGE_LAYOUT)
      expect(layoutError).toBeDefined()
    })
  })
})

describe('install-folder-only integration', () => {
  it('should accept valid local folder install', async () => {
    const validSkillPath = join(fixturesDir, 'valid-skill')
    const result = await validateInstall(validSkillPath)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject local folder without SKILL.json', async () => {
    const missingJsonPath = join(fixturesDir, 'missing-skill-json')
    const result = await validateInstall(missingJsonPath)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    const missingError = result.errors.find(e => e.code === ERROR_CODES.MISSING_REQUIRED_FILE)
    expect(missingError).toBeDefined()
  })

  it('should reject zip install source', async () => {
    const result = await validateInstall('my-skill.zip')

    expect(result.success).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].code).toBe(ERROR_CODES.UNSUPPORTED_SOURCE)
    expect(result.errors[0].retryable).toBe(false)
  })

  it('should accept npm package reference', async () => {
    const result = await validateInstall('@opencode/my-skill')

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
