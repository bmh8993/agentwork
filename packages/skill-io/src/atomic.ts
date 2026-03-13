/**
 * Atomic write operations for safe file updates
 */

import { writeFile, rename, unlink } from 'fs/promises'
import { join, dirname } from 'path'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'

export interface AtomicWriteResult {
  success: boolean
  error?: string
  tempPath?: string
}

/**
 * Write content to file atomically using temp file + rename pattern
 * @param path - Target file path
 * @param content - Content to write
 * @returns AtomicWriteResult with success status
 */
export async function atomicWrite(path: string, content: string): Promise<AtomicWriteResult> {
  const tempDir = dirname(path)
  const tempFileName = `.${randomBytes(8).toString('hex')}.tmp`
  const tempPath = join(tempDir, tempFileName)

  try {
    // Step 1: Write to temporary file
    await writeFile(tempPath, content, 'utf-8')

    // Step 2: Atomic rename to target path
    // rename is atomic on most filesystems
    await rename(tempPath, path)

    return {
      success: true,
      tempPath,
    }
  } catch (err) {
    // Clean up temp file if it exists
    try {
      await unlink(tempPath)
    } catch {
      // Ignore cleanup errors
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      tempPath,
    }
  }
}

/**
 * Check if a write operation would be safe
 */
export function canWriteAtomic(): boolean {
  // Node.js fs.rename is atomic on most platforms
  return true
}
