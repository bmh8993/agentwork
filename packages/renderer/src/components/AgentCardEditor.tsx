/**
 * Agent Card Editor Component
 *
 * Form for editing Agent node:
 * - Agent Reference (required for Publish) - selects reusable Agent from package catalog
 * - Action (required for Publish)
 * - Done Criteria (required for Publish)
 *
 * ADR-0017: Agent Card UX and Draft/Publish Gate
 * ADR-0022: AgentNode references Agent via agent_ref
 *
 * UX STRATEGY:
 * - Agent ref as catalog-backed picker
 * - Action and Done Criteria as text areas
 * - Store agent_ref, action_text, done_criteria in node config
 */

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkflowStore } from '../store/workflowStore';
import type { NodeData, AgentReference } from '../types/workflow';

/**
 * Helper: Parse agent_ref string "package/name" into AgentReference object
 */
function parseAgentRef(value: string): AgentReference | undefined {
  if (!value || value.trim() === '') {
    return undefined;
  }
  const parts = value.trim().split('/');
  if (parts.length !== 2) {
    return undefined;
  }
  return {
    package: parts[0].trim(),
    name: parts[1].trim(),
  };
}

/**
 * Helper: Convert AgentReference object to "package/name" string
 */
function agentRefToString(agentRef?: AgentReference): string {
  if (!agentRef || !agentRef.package || !agentRef.name) {
    return '';
  }
  return `${agentRef.package}/${agentRef.name}`;
}

function isValidAgentRefString(value: string): boolean {
  return parseAgentRef(value) !== undefined
}

// Form schema - Agent ref, Action and Done Criteria are required for Publish
const agentCardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  agent_ref_input: z
    .string()
    .min(1, { message: 'Agent reference is required (format: package/name)' })
    .refine(isValidAgentRefString, { message: 'Agent reference must use the format package/name' }),
  action_text: z.string().min(1, { message: 'Action is required for Publish' }),
  done_criteria: z.string().min(1, { message: 'Done Criteria is required for Publish' }),
});

type AgentCardFormData = z.infer<typeof agentCardSchema>;

interface AgentCardEditorProps {
  node: NodeData;
  onClose: () => void;
}

export function AgentCardEditor({ node, onClose }: AgentCardEditorProps) {
  const { updateNode, agentCatalog } = useWorkflowStore();
  const [agentSearch, setAgentSearch] = useState('');
  const currentAgentRef = node.config?.agent_ref as AgentReference | undefined;
  const currentAgentRefValue = agentRefToString(currentAgentRef);
  const normalizedSearch = agentSearch.trim().toLowerCase();
  const catalogAgentOptions = useMemo(
    () =>
      Object.values(agentCatalog.agents)
        .filter((agent) => {
          if (!normalizedSearch) {
            return true;
          }

          const haystack = [
            agent.package,
            agent.name,
            agent.description ?? '',
            agent.model ?? '',
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(normalizedSearch);
        })
        .map((agent) => `${agent.package}/${agent.name}`)
        .sort(),
    [agentCatalog.agents, normalizedSearch]
  );
  const agentOptions = currentAgentRefValue && !catalogAgentOptions.includes(currentAgentRefValue)
    ? [currentAgentRefValue, ...catalogAgentOptions]
    : catalogAgentOptions;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AgentCardFormData>({
    resolver: zodResolver(agentCardSchema),
    defaultValues: {
      name: node.name || '',
      // Convert agent_ref object to "package/name" string for form
      agent_ref_input: currentAgentRefValue,
      action_text: node.config?.action_text || '',
      done_criteria: node.config?.done_criteria || '',
    },
  });
  const selectedAgentRefValue = watch('agent_ref_input', currentAgentRefValue);
  const selectedAgentRef = parseAgentRef(selectedAgentRefValue);
  const selectedAgent = selectedAgentRef
    ? agentCatalog.agents[`${selectedAgentRef.package}/${selectedAgentRef.name}`]
    : undefined;
  const selectedToolNames = (selectedAgent?.tool_refs ?? []).map(
    (toolRef) => agentCatalog.tools[toolRef]?.name ?? toolRef
  );
  const selectedKnowledgeNames = (selectedAgent?.knowledge_refs ?? []).map(
    (knowledgeRef) => agentCatalog.knowledge[knowledgeRef]?.name ?? knowledgeRef
  );
  const groupedAgentOptions = agentOptions.reduce<Record<string, string[]>>((groups, option) => {
    const ref = parseAgentRef(option);
    const packageId = ref?.package ?? 'ungrouped';
    groups[packageId] = groups[packageId] ?? [];
    groups[packageId].push(option);
    return groups;
  }, {});

  const onSubmit = (data: AgentCardFormData) => {
    // Parse "package/name" string to AgentReference object
    const agent_ref = parseAgentRef(data.agent_ref_input);

    updateNode(node.id, {
      name: data.name,
      config: {
        // ADR-0022: Store agent_ref object (not inline agent config)
        agent_ref,
        action_text: data.action_text,
        done_criteria: data.done_criteria,
      },
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#262626',
          border: '1px solid #404040',
          borderRadius: '12px',
          padding: '24px',
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#e5e5e5' }}>
            🤖 Edit Agent
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#a3a3a3a',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label
              htmlFor="agent-node-name"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#d4d4d8',
                marginBottom: '6px',
              }}
            >
              Name
            </label>
            <input
              id="agent-node-name"
              {...register('name')}
              placeholder="Agent node name"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#18181b',
                border: `1px solid ${errors.name ? '#ef4444' : '#3f3f46'}`,
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '14px',
              }}
            />
            {errors.name && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Agent Reference (Required for Publish) - ADR-0022 */}
          <div>
            <label
              htmlFor="agent-search-input"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#a1a1aa',
                marginBottom: '6px',
              }}
            >
              Search
            </label>
            <input
              id="agent-search-input"
              value={agentSearch}
              onChange={(event) => setAgentSearch(event.target.value)}
              placeholder="Search catalog agents"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '13px',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="agent-ref-picker"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#d4d4d8',
                marginBottom: '6px',
              }}
            >
              🤖 Agent Reference <span style={{ color: '#ef4444', fontWeight: '400' }}>* required</span>
            </label>
            <select
              id="agent-ref-picker"
              {...register('agent_ref_input')}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#18181b',
                border: `1px solid ${errors.agent_ref_input ? '#ef4444' : '#3f3f46'}`,
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '14px',
              }}
            >
              <option value="">Select an agent from the catalog</option>
              {Object.entries(groupedAgentOptions).map(([packageId, options]) => {
                const packageLabel = agentCatalog.packages[packageId]?.name ?? packageId;

                return (
                  <optgroup key={packageId} label={packageLabel}>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            {errors.agent_ref_input && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.agent_ref_input.message}
              </span>
            )}
            <div style={{ fontSize: '11px', color: '#737373', marginTop: '4px' }}>
              {agentOptions.length > 0
                ? 'Select a reusable Agent from the package catalog'
                : 'Load or import a catalog to select a reusable Agent'}
            </div>
            {normalizedSearch && catalogAgentOptions.length === 0 && (
              <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '4px' }}>
                No catalog agents match this search
              </div>
            )}
          </div>

          {selectedAgent && (
            <div
              style={{
                padding: '12px',
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#e5e5e5' }}>
                Selected Agent
              </div>
              <div style={{ fontSize: '12px', color: '#d4d4d8' }}>
                {selectedAgent.package}/{selectedAgent.name}
              </div>
              {selectedAgent.model && (
                <div style={{ fontSize: '12px', color: '#93c5fd' }}>
                  Model: {selectedAgent.model}
                </div>
              )}
              {selectedAgent.description && (
                <div style={{ fontSize: '12px', color: '#a3a3a3' }}>
                  {selectedAgent.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    padding: '4px 8px',
                    background: '#27272a',
                    borderRadius: '999px',
                    fontSize: '11px',
                    color: '#d4d4d8',
                  }}
                >
                  Tools: {selectedAgent.tool_refs?.length ?? 0}
                </div>
                <div
                  style={{
                    padding: '4px 8px',
                    background: '#27272a',
                    borderRadius: '999px',
                    fontSize: '11px',
                    color: '#d4d4d8',
                  }}
                >
                  Knowledge: {selectedAgent.knowledge_refs?.length ?? 0}
                </div>
              </div>
              {selectedToolNames.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#d4d4d8' }}>
                    Tool Names
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedToolNames.map((toolName) => (
                      <div
                        key={toolName}
                        style={{
                          padding: '4px 8px',
                          background: '#172554',
                          borderRadius: '999px',
                          fontSize: '11px',
                          color: '#bfdbfe',
                        }}
                      >
                        {toolName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedKnowledgeNames.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#d4d4d8' }}>
                    Knowledge Names
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedKnowledgeNames.map((knowledgeName) => (
                      <div
                        key={knowledgeName}
                        style={{
                          padding: '4px 8px',
                          background: '#3f2a17',
                          borderRadius: '999px',
                          fontSize: '11px',
                          color: '#fcd34d',
                        }}
                      >
                        {knowledgeName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action (Required for Publish) */}
          <div>
            <label
              htmlFor="agent-action-text"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#d4d4d8',
                marginBottom: '6px',
              }}
            >
              ⚡ Action <span style={{ color: '#ef4444', fontWeight: '400' }}>* required for Publish</span>
            </label>
            <textarea
              id="agent-action-text"
              {...register('action_text')}
              placeholder="What should this agent do in this workflow context?"
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#18181b',
                border: `1px solid ${errors.action_text ? '#ef4444' : '#3f3f46'}`,
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
            {errors.action_text && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.action_text.message}
              </span>
            )}
          </div>

          {/* Done Criteria (Required for Publish) */}
          <div>
            <label
              htmlFor="agent-done-criteria"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#d4d4d8',
                marginBottom: '6px',
              }}
            >
              ✅ Done Criteria <span style={{ color: '#ef4444', fontWeight: '400' }}>* required for Publish</span>
            </label>
            <textarea
              id="agent-done-criteria"
              {...register('done_criteria')}
              placeholder="How do we know this agent is done?"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#18181b',
                border: `1px solid ${errors.done_criteria ? '#ef4444' : '#3f3f46'}`,
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
            {errors.done_criteria && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.done_criteria.message}
              </span>
            )}
          </div>

          {/* Validation Notice */}
          <div
            style={{
              padding: '12px',
              background: '#3f3f46',
              border: '1px solid #52525b',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#d4d4d8',
            }}
          >
            <strong>Draft Save:</strong> Can save with empty required fields
            <br />
            <strong>Publish:</strong> Agent Reference, Action and Done Criteria must be filled
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid #52525b',
                borderRadius: '6px',
                color: '#d4d4d8',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
