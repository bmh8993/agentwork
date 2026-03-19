/**
 * @opencode/skill-io
 *
 * SKILL.md import operations
 * ADR-0019: Support SKILL.md only input with default Start/End nodes
 */

import { readFile } from 'fs/promises'

// Define types inline to avoid circular dependencies
export interface ImportedSkillData {
  version: string
  skill: {
    id: string
    name: string
    description: string
    license?: string
    compatibility?: string
    metadata?: Record<string, unknown>
    content_md: string
  }
  workflow?: {
    nodes: Array<{
      id: string
      name: string
      type: 'Start' | 'Agent' | 'End'
      position: [number, number]
      config?: Record<string, unknown>
    }>
    edges: Array<unknown>
    layout?: Record<string, unknown>
  }
  policy?: {
    execution_mode?: string
    failure_mode?: string
  }
}

export interface ImportResult {
  success: boolean
  skillData?: ImportedSkillData
  error?: string
}

export interface ParsedMarkdown {
  frontmatter: Record<string, unknown>
  content: string
}

/**
 * Parse SKILL.md to extract frontmatter and content
 */
function parseMarkdown(markdown: string): ParsedMarkdown {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = markdown.match(frontmatterRegex)

  if (!match) {
    return {
      frontmatter: {},
      content: markdown,
    }
  }

  const frontmatterText = match[1]
  const content = match[2]

  // Parse YAML frontmatter
  const frontmatter: Record<string, unknown> = {}
  const lines = frontmatterText.split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    let value: string | boolean = line.slice(colonIndex + 1).trim()

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Handle boolean values
    if (value === 'true') value = true
    if (value === 'false') value = false

    frontmatter[key] = value
  }

  return { frontmatter, content }
}

/**
 * Import SKILL.md and generate SKILL.json data
 * ADR-0019: Creates default workflow with Start 1 + End 1
 */
export async function importFromMarkdown(markdownPath: string): Promise<ImportResult> {
  try {
    const markdown = await readFile(markdownPath, 'utf-8')
    const { frontmatter, content } = parseMarkdown(markdown)

    // Build skill data from markdown
    const skillData: ImportedSkillData = {
      version: '1',
      skill: {
        id: frontmatter.id?.toString() || frontmatter.name?.toString().toLowerCase().replace(/\s+/g, '-') || 'imported-skill',
        name: frontmatter.name?.toString() || 'Imported Skill',
        description: frontmatter.description?.toString() || 'Imported from SKILL.md',
        license: frontmatter.license?.toString(),
        compatibility: frontmatter.compatibility?.toString(),
        metadata: frontmatter.metadata as Record<string, unknown>,
        content_md: content,
      },
      // ADR-0019: Import creates default workflow with Start 1 + End 1
      workflow: {
        nodes: [
          {
            id: 'start-1',
            name: '🚀 Start',
            type: 'Start',
            position: [100, 100],
            config: {},
          },
          {
            id: 'end-1',
            name: '🏁 End',
            type: 'End',
            position: [500, 100],
            config: {},
          },
        ],
        edges: [],
        layout: {},
      },
      policy: {
        execution_mode: frontmatter.execution_mode?.toString(),
        failure_mode: frontmatter.failure_mode?.toString(),
      },
    }

    // Add import metadata
    if (!skillData.skill.metadata) {
      skillData.skill.metadata = {}
    }
    skillData.skill.metadata.imported_from_md = true

    return {
      success: true,
      skillData,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to import SKILL.md',
    }
  }
}

/**
 * Check if path is a markdown file
 */
export function isMarkdownFile(path: string): boolean {
  return path.endsWith('.md') || path.endsWith('.markdown')
}
