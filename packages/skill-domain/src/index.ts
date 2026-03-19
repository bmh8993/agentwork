/**
 * @opencode/skill-domain
 *
 * Domain validation rules for SKILL.json
 */

import type { ValidationResult } from '@opencode/skill-schema'
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
        ...result.flags,
        readOnlyCompatibility: true,
        unsupportedNodeTypes: unsupportedTypes,
      },
    }
  }

  return result
}

// Turn 7+: Check Agent node required fields (agent_ref, action_text, done_criteria)
interface MissingFieldInfo {
  nodeId: string
  nodeName: string
  missingFields: string[]
}

function hasValidAgentRef(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const ref = value as Record<string, unknown>
  return typeof ref.package === 'string' &&
    ref.package.trim() !== '' &&
    typeof ref.name === 'string' &&
    ref.name.trim() !== ''
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
      // No config at all - all publish fields missing
      nodeMissing.push('agent_ref', 'action_text', 'done_criteria')
    } else {
      const cfg = config as Record<string, unknown>
      if (!hasValidAgentRef(cfg.agent_ref)) {
        nodeMissing.push('agent_ref')
      }
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

// ADR-0019: Cardinality validation
export interface CardinalityViolation {
  type: 'multiple_start' | 'multiple_end' | 'missing_start' | 'missing_end'
  count: number
}

export interface CardinalityCheckResult {
  valid: boolean
  violations: CardinalityViolation[]
}

// Count nodes by type
function countNodesByType(data: unknown): Record<string, number> {
  const nodes = getNodes(data)
  const counts: Record<string, number> = {}

  for (const node of nodes) {
    const type = node.type
    if (typeof type === 'string') {
      counts[type] = (counts[type] || 0) + 1
    }
  }

  return counts
}

// Check node cardinality (Start: 1, End: 1, Agent: 0+)
export function checkNodeCardinality(data: unknown): CardinalityCheckResult {
  const counts = countNodesByType(data)
  const violations: CardinalityViolation[] = []

  const startCount = counts['Start'] || 0
  const endCount = counts['End'] || 0

  if (startCount > 1) {
    violations.push({ type: 'multiple_start', count: startCount })
  }
  if (startCount === 0) {
    violations.push({ type: 'missing_start', count: 0 })
  }
  if (endCount > 1) {
    violations.push({ type: 'multiple_end', count: endCount })
  }
  if (endCount === 0) {
    violations.push({ type: 'missing_end', count: 0 })
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}

// Add cardinality errors for Publish/Run validation
export function addCardinalityErrors(result: ValidationResult, data: unknown): ValidationResult {
  const check = checkNodeCardinality(data)

  if (check.valid) {
    return result
  }

  const errors = check.violations.map((violation) => {
    switch (violation.type) {
      case 'multiple_start':
        return createError(ERROR_CODES.MULTIPLE_START_NODES, {
          path: '/workflow/nodes',
          message_user: `Workflow has ${violation.count} Start nodes. Only one is allowed.`,
        })
      case 'multiple_end':
        return createError(ERROR_CODES.MULTIPLE_END_NODES, {
          path: '/workflow/nodes',
          message_user: `Workflow has ${violation.count} End nodes. Only one is allowed.`,
        })
      case 'missing_start':
        return createError(ERROR_CODES.MISSING_START_NODE, {
          path: '/workflow/nodes',
          message_user: 'Workflow is missing a Start node.',
        })
      case 'missing_end':
        return createError(ERROR_CODES.MISSING_END_NODE, {
          path: '/workflow/nodes',
          message_user: 'Workflow is missing an End node.',
        })
    }
  })

  return {
    ...result,
    valid: false,
    errors: [...result.errors, ...errors],
  }
}

// Add cardinality warnings for Draft validation
export function addCardinalityWarnings(result: ValidationResult, data: unknown): ValidationResult {
  const check = checkNodeCardinality(data)

  if (check.valid) {
    return result
  }

  const warnings = check.violations.map((violation) => {
    switch (violation.type) {
      case 'multiple_start':
        return `Workflow has ${violation.count} Start nodes. Only one Start node is allowed for publish.`
      case 'multiple_end':
        return `Workflow has ${violation.count} End nodes. Only one End node is allowed for publish.`
      case 'missing_start':
        return 'Workflow will require a Start node for publish.'
      case 'missing_end':
        return 'Workflow will require an End node for publish.'
    }
  })

  return {
    ...result,
    warnings: [...result.warnings, ...warnings],
  }
}

// Add cardinality read-only flags for Load validation
export function addCardinalityReadOnlyFlags(result: ValidationResult, data: unknown): ValidationResult {
  const check = checkNodeCardinality(data)

  if (check.valid) {
    return result
  }

  // If there are cardinality violations, set read-only compatibility mode
  const violationTypes = check.violations.map((v) => v.type)

  return {
    ...result,
    flags: {
      ...result.flags,
      readOnlyCompatibility: true,
      cardinalityViolations: violationTypes,
    },
  }
}
