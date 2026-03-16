/**
 * Validation Utilities
 *
 * Connects UI to Phase 1 backend validators.
 * Converts UI workflow state to SKILL.json v1 format.
 */

import { validateDraft, validatePublish } from '@opencode/skill-schema';
import type { Workflow } from '../types/workflow';

/**
 * Convert UI workflow state to SKILL.json v1 format
 *
 * This follows the v1 schema structure:
 * - nodes: { id, name, type, position, config }
 * - edges: { id, source_node_id, target_node_id, branch }
 */
function workflowToSkillJson(workflow: Workflow): any {
  // Build minimal skill metadata if not present
  const skill = {
    id: workflow.metadata?.name || 'skill-placeholder',
    name: workflow.metadata?.name || 'Untitled Skill',
    description: workflow.metadata?.description || 'A skill plugin',
  };

  // Convert nodes to v1 format
  const nodes = workflow.nodes.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    position: node.position || [0, 0], // Default position if not set
    config: node.config || {},
  }));

  // Convert edges to v1 format
  const edges = workflow.edges.map((edge) => ({
    id: edge.id,
    source_node_id: edge.source_node_id,
    target_node_id: edge.target_node_id,
    branch: edge.branch || 'default', // Default branch if not set
  }));

  return {
    version: '1',
    skill,
    workflow: {
      nodes,
      edges,
    },
  };
}

/**
 * Validate workflow for Draft Save
 * Blocks save when draft validation returns errors
 */
export function validateForDraft(workflow: Workflow) {
  const skillJson = workflowToSkillJson(workflow);
  const result = validateDraft(skillJson);

  return {
    canSave: result.valid,
    warnings: result.warnings || [],
    errors: result.errors || [],
  };
}

/**
 * Validate workflow for Publish
 * Strict validation - blocks publish on errors
 */
export function validateForPublish(workflow: Workflow) {
  const skillJson = workflowToSkillJson(workflow);
  const result = validatePublish(skillJson);

  return {
    canPublish: result.valid,
    errors: result.errors || [],
    warnings: result.warnings || [],
  };
}
