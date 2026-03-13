/**
 * Save operations for SKILL.json with validation and atomic write
 */

import { mkdir } from 'fs/promises'
import { dirname } from 'path'
import type { ValidationResult } from '@opencode/skill-schema'
import { validateDraft } from '@opencode/skill-schema'
import { atomicWrite } from './atomic'

export interface SaveResult {
  success: boolean
  error?: string
  validation?: ValidationResult
  path?: string
}

/**
 * Save skill data to file with validation and atomic write
 * @param path - File path to save to
 * @param data - Skill data to save
 * @returns SaveResult with success status and validation details
 */
export async function saveSkill(path: string, data: unknown): Promise<SaveResult> {
  // First validate draft structure
  const validation = validateDraft(data)

  if (!validation.valid) {
    return {
      success: false,
      error: 'Draft validation failed',
      validation,
    }
  }

  try {
    // Ensure directory exists
    const dir = dirname(path)
    await mkdir(dir, { recursive: true })

    // Write content atomically (temp file + rename)
    const content = JSON.stringify(data, null, 2)
    const writeResult = await atomicWrite(path, content)

    if (!writeResult.success) {
      return {
        success: false,
        error: writeResult.error || 'Atomic write failed',
        validation,
      }
    }

    return {
      success: true,
      path,
      validation,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      validation,
    }
  }
}

/**
 * Check if data can be saved (validation only, no write)
 */
export function canSave(data: unknown): ValidationResult {
  return validateDraft(data)
}
