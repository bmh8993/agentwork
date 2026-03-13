/**
 * @opencode/skill-domain
 *
 * Domain validation rules for SKILL.json
 */

import type { ValidationResult, ValidationFlags } from '@opencode/skill-schema'
import { createError, ERROR_CODES } from '@opencode/skill-schema'

// Supported node types (MVP: Start, Agent, End only)
export const SUPPORTED_NODE_TYPES = ['Start', 'Agent', 'End'] as const
export type SupportedNodeType = (typeof SUPPORTED_NODE_TYPES)[number]

// Extract nodes from workflow data
function getNodes(data: unknown): Array<Record<string, unknown>> {
  if (typeof data !== 'object' || data === null) {
    return []
  }

  const obj = data as Record<string, unknown>
  const workflow = obj.workflow

  if (typeof workflow !== 'object' || workflow === null) {
    return []
  }

  const wf = workflow as Record<string, unknown>
  const nodes = wf.nodes

  if (!Array.isArray(nodes)) {
    return []
  }

  return nodes.filter((node) => typeof node === 'object' && node !== null) as Array<Record<string, unknown>>
}

// Extract node types from workflow data
function getNodeTypes(data: unknown): string[] {
  return getNodes(data)
    .map((node) => {
      const type = node.type
      return typeof type === 'string' ? type : null
    })
    .filter((type): type is string => type !== null)
}

// Turn 5: Load compatibility detection
export function hasUnsupportedNodes(data: unknown): boolean {
  const nodeTypes = getNodeTypes(data)
  return nodeTypes.some((type) => !SUPPORTED_NODE_TYPES.includes(type as SupportedNodeType))
}

// Get list of unsupported node types
export function getUnsupportedNodeTypes(data: unknown): string[] {
  const nodeTypes = getNodeTypes(data)
  const unsupported = nodeTypes.filter((type) => !SUPPORTED_NODE_TYPES.includes(type as SupportedNodeType))
  return Array.from(new Set(unsupported)) // Unique
}

// Add read-only compatibility flags to validation result
export function addReadOnlyCompatibilityFlags(result: ValidationResult, data: unknown): ValidationResult {
  const unsupportedTypes = getUnsupportedNodeTypes(data)

  if (unsupportedTypes.length > 0) {
    return {
      ...result,
      flags: {
        readOnlyCompatibility: true,
        unsupportedNodeTypes: unsupportedTypes,
      },
    }
  }

  return result
}

// Turn 7: Check Agent node required fields (action_text, done_criteria)
interface MissingFieldInfo {
  nodeId: string
  nodeName: string
  missingFields: string[]
}

export function checkAgentRequiredFields(data: unknown): {
  valid: boolean
  missing: MissingFieldInfo[]
} {
  const nodes = getNodes(data)
  const missing: MissingFieldInfo[] = []

  for (const node of nodes) {
    const type = node.type
    if (type !== 'Agent') continue

    const nodeId = typeof node.id === 'string' ? node.id : '(unknown)'
    const nodeName = typeof node.name === 'string' ? node.name : nodeId
    const config = node.config

    const nodeMissing: string[] = []

    if (typeof config !== 'object' || config === null) {
      // No config at all - both fields missing
      nodeMissing.push('action_text', 'done_criteria')
    } else {
      const cfg = config as Record<string, unknown>
      if (!cfg.action_text || typeof cfg.action_text !== 'string' || cfg.action_text.trim() === '') {
        nodeMissing.push('action_text')
      }
      if (!cfg.done_criteria || typeof cfg.done_criteria !== 'string' || cfg.done_criteria.trim() === '') {
        nodeMissing.push('done_criteria')
      }
    }

    if (nodeMissing.length > 0) {
      missing.push({ nodeId, nodeName, missingFields: nodeMissing })
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

// Add publish required field errors to validation result
export function addPublishRequiredFieldErrors(result: ValidationResult, data: unknown): ValidationResult {
  const check = checkAgentRequiredFields(data)

  if (check.valid) {
    return result
  }

  const errors = check.missing.map((info) => {
    const fields = info.missingFields.join(', ')
    return createError(ERROR_CODES.PUBLISH_REQUIRED_FIELD_MISSING, {
      path: `/workflow/nodes/${info.nodeId}`,
      message_user: `Agent "${info.nodeName}" is missing required fields: ${fields}`,
    })
  })

  return {
    ...result,
    valid: false,
    errors: [...result.errors, ...errors],
  }
}

// Add draft warnings for missing publish fields
export function addDraftPublishWarnings(result: ValidationResult, data: unknown): ValidationResult {
  const check = checkAgentRequiredFields(data)

  if (check.valid) {
    return result
  }

  const warnings = check.missing.map((info) => {
    const fields = info.missingFields.join(', ')
    return `Agent "${info.nodeName}" will require fields for publish: ${fields}`
  })

  return {
    ...result,
    warnings: [...result.warnings, ...warnings],
  }
}
