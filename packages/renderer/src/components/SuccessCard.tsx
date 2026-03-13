/**
 * Success Card Component
 *
 * Displays success messages for save/publish operations.
 */

interface SuccessCardProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessCard({ message, onDismiss }: SuccessCardProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '16px 20px',
        background: '#14532d',
        border: '1px solid #22c55e',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span style={{ fontSize: '24px' }}>✅</span>
      <span style={{ fontSize: '14px', color: '#e5e5e5' }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            marginLeft: '12px',
            background: 'none',
            border: 'none',
            color: '#86efac',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 4px',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
