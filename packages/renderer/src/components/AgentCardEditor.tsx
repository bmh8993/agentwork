/**
 * Agent Card Editor Component
 *
 * Form for editing Agent node required slots:
 * - Knowledge (optional)
 * - Tool (optional)
 * - Action (required for Publish)
 * - Done Criteria (required for Publish)
 *
 * ADR-0017: Agent Card UX and Draft/Publish Gate
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkflowStore } from '../store/workflowStore';
import type { NodeData } from '../types/workflow';

// Form schema - Action and Done Criteria are required for Publish
const agentCardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  knowledge: z.string().optional(),
  tool: z.string().optional(),
  action_text: z.string().min(1, { message: 'Action is required for Publish' }),
  done_criteria: z.string().min(1, { message: 'Done Criteria is required for Publish' }),
});

type AgentCardFormData = z.infer<typeof agentCardSchema>;

interface AgentCardEditorProps {
  node: NodeData;
  onClose: () => void;
}

export function AgentCardEditor({ node, onClose }: AgentCardEditorProps) {
  const { updateNode } = useWorkflowStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentCardFormData>({
    resolver: zodResolver(agentCardSchema),
    defaultValues: {
      name: node.name || '',
      knowledge: node.config?.knowledge || '',
      tool: node.config?.tool || '',
      action_text: node.config?.action_text || '',
      done_criteria: node.config?.done_criteria || '',
    },
  });

  const onSubmit = (data: AgentCardFormData) => {
    updateNode(node.id, {
      name: data.name,
      config: {
        knowledge: data.knowledge,
        tool: data.tool,
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
              {...register('name')}
              placeholder="Agent name"
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

          {/* Knowledge (Optional) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#d4d4d8',
                marginBottom: '6px',
              }}
            >
              📚 Knowledge <span style={{ color: '#737373', fontWeight: '400' }}>(optional)</span>
            </label>
            <textarea
              {...register('knowledge')}
              placeholder="Knowledge base or context for this agent"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Tool (Optional) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#d4d4d8',
                marginBottom: '6px',
              }}
            >
              🔧 Tool <span style={{ color: '#737373', fontWeight: '400' }}>(optional)</span>
            </label>
            <input
              {...register('tool')}
              placeholder="Tool name (e.g., file_search, code_editor)"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Action (Required for Publish) */}
          <div>
            <label
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
              {...register('action_text')}
              placeholder="What should this agent do?"
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
            <strong>Publish:</strong> Action and Done Criteria must be filled
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
