/**
 * Error Card Component
 *
 * Displays validation errors with next_action guidance.
 * ADR-0005: Failure Taxonomy and Error UX
 */

import type { ValidationError } from '@opencode/skill-schema';

interface ErrorCardProps {
  errors: ValidationError[];
  onDismiss?: () => void;
}

export function ErrorCard({ errors, onDismiss }: ErrorCardProps) {
  if (errors.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '500px',
        maxHeight: '400px',
        overflow: 'auto',
        background: '#292524',
        border: '1px solid #78716c',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #44403c',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>❌</span>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#e5e5e5' }}>
            Validation Errors ({errors.length})
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#a8a29e',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Error List */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {errors.map((error, index) => (
          <div
            key={index}
            style={{
              padding: '12px',
              background: '#1c1917',
              border: '1px solid #44403c',
              borderRadius: '6px',
            }}
          >
            {/* Error Code */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#a8a29e',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {error.error_code}
            </div>

            {/* Message */}
            <div style={{ fontSize: '13px', color: '#e5e5e5', marginBottom: '8px' }}>
              {error.message_user}
            </div>

            {/* Next Action */}
            {error.next_action && (
              <div
                style={{
                  padding: '8px 12px',
                  background: '#292524',
                  border: '1px solid #78716c',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#d6d3d1',
                }}
              >
                <strong>Next:</strong> {error.next_action}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
