/**
 * @opencode/installer
 *
 * Plugin installer with source gate and layout validation
 * ADR-0016: MVP supports local folder + npm only
 * ADR-0019: Support SKILL.md only input with default Start/End nodes
 */

import { promises as fs } from 'fs'
import { join } from 'path'
import {
  ERROR_CODES,
  ERROR_CATEGORIES,
  TRIGGER_STAGES,
  type ValidationError,
} from '@opencode/skill-schema'
import { importFromMarkdown, isMarkdownFile } from '@opencode/skill-io'

// Install source types
export type InstallSource =
  | { type: 'local-folder'; path: string }
  | { type: 'npm'; packageName: string }
  | { type: 'unknown'; value: string }

// Install result
export interface InstallResult {
  success: boolean
  errors: ValidationError[]
  warnings: string[]
}

/**
 * Detect install source type from input
 * ADR-0016: Only local folder and npm are supported
 *
 * Detection order (important!):
 * 1. Check for zip files (unsupported) - must be checked before npm pattern
 * 2. Check for explicit local folder paths (./, ../, /)
 * 3. Check for npm package references
 * 4. Default to local folder for simple names
 */
export function detectInstallSource(input: string): InstallSource {
  // Step 1: Check if it's a zip file (unsupported)
  // Must be checked before npm pattern since npm pattern also matches zip filenames
  if (input.endsWith('.zip') || input.includes('.zip#')) {
    return { type: 'unknown', value: input }
  }

  // Step 2: Check if it's an explicit local folder path
  if (input.startsWith('./') || input.startsWith('../') || input.startsWith('/')) {
    return { type: 'local-folder', path: input }
  }

  // Step 3: Check if it's an npm package reference
  // npm package: starts with @scope/name OR contains version specifier @
  const npmPattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(@[^/]+)?$/

  if (npmPattern.test(input) && input.includes('@')) {
    // Only treat as npm if it has @scope or @version
    return { type: 'npm', packageName: input }
  }

  // Step 4: Default to local folder for simple names
  return { type: 'local-folder', path: input }
}

/**
 * Validate install source type
 * ADR-0016: Only local folder and npm are supported, zip is blocked
 */
export function validateInstallSource(source: InstallSource): ValidationError[] {
  const errors: ValidationError[] = []

  if (source.type === 'unknown') {
    errors.push({
      code: ERROR_CODES.UNSUPPORTED_SOURCE,
      category: ERROR_CATEGORIES.InstallError,
      trigger_stage: TRIGGER_STAGES.INSTALL,
      message_user: 'Unsupported install source.',
      next_action: 'Use local folder or npm source only.',
      retryable: false,
    })
  }

  return errors
}

/**
 * Validate package layout
 * ADR-0010: Plugin package layout and manifest
 * ADR-0019: Support SKILL.md only input with default Start/End nodes
 */
export async function validatePackageLayout(
  packagePath: string
): Promise<{ errors: ValidationError[]; warnings: string[]; importedSkillData?: unknown }> {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  try {
    // Check if path exists
    await fs.access(packagePath)
  } catch {
    errors.push({
      code: ERROR_CODES.INVALID_PACKAGE_LAYOUT,
      category: ERROR_CATEGORIES.InstallError,
      trigger_stage: TRIGGER_STAGES.INSTALL,
      message_user: 'Package layout is invalid.',
      next_action: 'Fix package layout to match the spec.',
      retryable: false,
    })
    return { errors, warnings }
  }

  /**
   * Check if file exists
   */
  async function fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  // ADR-0019: Check for SKILL.json (required canonical file) or SKILL.md (import source)
  const skillJsonPath = join(packagePath, 'SKILL.json')
  const skillMdPath = join(packagePath, 'SKILL.md')

  const hasSkillJson = await fileExists(skillJsonPath)
  const hasSkillMd = await fileExists(skillMdPath)

  if (!hasSkillJson && !hasSkillMd) {
    errors.push({
      code: ERROR_CODES.MISSING_REQUIRED_FILE,
      category: ERROR_CATEGORIES.InstallError,
      trigger_stage: TRIGGER_STAGES.INSTALL,
      message_user: 'Required file is missing.',
      next_action: 'Include `SKILL.json` or `SKILL.md`.',
      retryable: false,
    })
    return { errors, warnings }
  }

  // ADR-0019: SKILL.md only input - import to SKILL.json
  if (!hasSkillJson && hasSkillMd) {
    const importResult = await importFromMarkdown(skillMdPath)

    if (!importResult.success || !importResult.skillData) {
      errors.push({
        code: ERROR_CODES.INVALID_PACKAGE_LAYOUT,
        category: ERROR_CATEGORIES.InstallError,
        trigger_stage: TRIGGER_STAGES.INSTALL,
        message_user: importResult.error || 'Failed to import SKILL.md',
        next_action: 'Fix SKILL.md format and try again.',
        retryable: false,
      })
      return { errors, warnings }
    }

    warnings.push('SKILL.md only input detected. Imported with default Start/End nodes.')

    // Return imported skill data for subsequent validation
    return { errors, warnings, importedSkillData: importResult.skillData }
  }

  // Optional: Check for package.json (recommended for npm packages)
  const packageJsonPath = join(packagePath, 'package.json')
  try {
    await fs.access(packageJsonPath)
  } catch {
    // package.json is optional for local folder skills
    warnings.push('package.json not found (recommended for npm packages)')
  }

  return { errors, warnings }
}

/**
 * Main install entry point with source gate and layout validation
 * ADR-0019: SKILL.md only import and subsequent validation
 */
export async function validateInstall(input: string): Promise<InstallResult> {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // Step 1: Detect and validate install source
  const source = detectInstallSource(input)
  const sourceErrors = validateInstallSource(source)
  errors.push(...sourceErrors)

  if (sourceErrors.length > 0) {
    return { success: false, errors, warnings }
  }

  // Step 2: Validate package layout (only for local folder)
  let importedSkillData: unknown | undefined
  if (source.type === 'local-folder') {
    const layoutResult = await validatePackageLayout(source.path)
    errors.push(...layoutResult.errors)
    warnings.push(...layoutResult.warnings)

    if (layoutResult.errors.length > 0) {
      return { success: false, errors, warnings }
    }

    // ADR-0019: If SKILL.md was imported, validate the generated data
    importedSkillData = layoutResult.importedSkillData
  }

  // Step 3: Validate imported skill data (if any)
  if (importedSkillData) {
    // Use Publish-level validation for imported data
    const { validatePublish } = await import('@opencode/skill-schema')
    const validationResult = validatePublish(importedSkillData)

    if (!validationResult.valid) {
      errors.push(...validationResult.errors)
      return { success: false, errors, warnings }
    }

    // Add validation warnings to installer warnings
    warnings.push(...validationResult.warnings)
  }

  return { success: true, errors, warnings }
}

// Re-export types
export type { ValidationError }

/**
 * NPM install error types for mapping
 */
export type NpmInstallErrorType =
  | 'network'
  | 'version_conflict'
  | 'peer_dependency'
  | 'not_found'
  | 'permission'
  | 'disk_space'
  | 'unknown'

/**
 * Map npm install error to standard error code
 * POL-02: dependency_resolution_failed mapping
 */
export function mapNpmInstallError(
  errorType: NpmInstallErrorType,
  originalMessage: string
): ValidationError {
  const baseError = {
    category: ERROR_CATEGORIES.InstallError,
    trigger_stage: TRIGGER_STAGES.INSTALL,
    code: ERROR_CODES.DEPENDENCY_RESOLUTION_FAILED,
    message_user: 'Dependency resolution failed.',
    next_action: 'Check package versions and network, then retry.',
    retryable: true,
  }

  // Customize message based on error type
  switch (errorType) {
    case 'network':
      return {
        ...baseError,
        message_user: 'Network error during npm install.',
        next_action: 'Check network connection and npm registry, then retry.',
      }
    case 'version_conflict':
      return {
        ...baseError,
        message_user: 'Dependency version conflict detected.',
        next_action: 'Resolve version conflicts in package.json, then retry.',
        retryable: false,
      }
    case 'peer_dependency':
      return {
        ...baseError,
        message_user: 'Peer dependency resolution failed.',
        next_action: 'Install missing peer dependencies or use --legacy-peer-deps.',
        retryable: true,
      }
    case 'not_found':
      return {
        ...baseError,
        message_user: 'Package not found in npm registry.',
        next_action: 'Verify package name and registry, then retry.',
        retryable: false,
      }
    case 'permission':
      return {
        ...baseError,
        message_user: 'Permission denied during npm install.',
        next_action: 'Check file permissions and try again with appropriate access.',
        retryable: true,
      }
    case 'disk_space':
      return {
        ...baseError,
        message_user: 'Insufficient disk space for npm install.',
        next_action: 'Free up disk space and retry.',
        retryable: true,
      }
    default:
      return baseError
  }
}

/**
 * Parse npm error message to determine error type
 */
export function parseNpmErrorMessage(message: string): NpmInstallErrorType {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('network') || lowerMessage.includes('econnrefused') || lowerMessage.includes('enotfound')) {
    return 'network'
  }
  if (lowerMessage.includes('eresolve') || lowerMessage.includes('conflict') || lowerMessage.includes('unable to satisfy')) {
    return 'version_conflict'
  }
  if (lowerMessage.includes('peer dependency') || lowerMessage.includes('peer dep')) {
    return 'peer_dependency'
  }
  if (lowerMessage.includes('404') || lowerMessage.includes('not found') || lowerMessage.includes('enoent')) {
    return 'not_found'
  }
  if (lowerMessage.includes('eacces') || lowerMessage.includes('eperm') || lowerMessage.includes('permission')) {
    return 'permission'
  }
  if (lowerMessage.includes('enospc') || lowerMessage.includes('disk') || lowerMessage.includes('space')) {
    return 'disk_space'
  }

  return 'unknown'
}

/**
 * Simulate npm install for testing purposes
 * In production, this would call actual npm commands
 */
export async function simulateNpmInstall(
  packageName: string,
  mockError?: { type: NpmInstallErrorType; message: string }
): Promise<InstallResult> {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // If mock error is provided, return error result
  if (mockError) {
    const error = mapNpmInstallError(mockError.type, mockError.message)
    errors.push(error)
    return { success: false, errors, warnings }
  }

  // Simulate successful install
  warnings.push(`Simulated npm install for ${packageName}`)
  return { success: true, errors, warnings }
}
