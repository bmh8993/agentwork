/**
 * Warning Card Component
 *
 * Displays draft warnings with guidance.
 */

interface WarningCardProps {
  warnings: string[];
  onDismiss?: () => void;
}

export function WarningCard({ warnings, onDismiss }: WarningCardProps) {
  if (warnings.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '500px',
        maxHeight: '300px',
        overflow: 'auto',
        background: '#292524',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #78350f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#e5e5e5' }}>
            Draft Warnings ({warnings.length})
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

      {/* Warning List */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {warnings.map((warning, index) => (
          <div
            key={index}
            style={{
              padding: '10px',
              background: '#1c1917',
              border: '1px solid #78350f',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#fef3c7',
            }}
          >
            {warning}
          </div>
        ))}

        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            background: '#292524',
            border: '1px solid #78716c',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#d6d3d1',
          }}
        >
          Draft saved with warnings. You can continue editing.
        </div>
      </div>
    </div>
  );
}
