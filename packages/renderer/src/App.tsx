/**
 * OpenCode Main App Component
 */

import { useState } from 'react';
import { useWorkflowStore } from './store/workflowStore';
import { WorkflowEditor } from './components/WorkflowEditor';
import { ErrorCard } from './components/ErrorCard';
import { WarningCard } from './components/WarningCard';
import { SuccessCard } from './components/SuccessCard';
import { validateForDraft, validateForPublish } from './lib/validation';
import type { ValidationError } from '@opencode/skill-schema';

type NotificationState = {
  type: 'error' | 'warning' | 'success' | null;
  errors: ValidationError[];
  warnings: string[];
  message: string;
};

function App() {
  const [filename] = useState<string>('untitled.skill.json');
  const { nodes, edges, metadata, readOnlyMode } = useWorkflowStore();
  const [notification, setNotification] = useState<NotificationState>({
    type: null,
    errors: [],
    warnings: [],
    message: '',
  });

  // Build workflow for validation
  const workflow = {
    nodes,
    edges,
    metadata,
  };

  // Draft Save handler
  const handleDraftSave = () => {
    const result = validateForDraft(workflow);

    if (!result.canSave) {
      setNotification({
        type: 'error',
        errors: result.errors,
        warnings: [],
        message: 'Draft save failed',
      });
      return;
    }

    if (result.warnings.length > 0) {
      setNotification({
        type: 'warning',
        errors: [],
        warnings: result.warnings,
        message: 'Draft saved with warnings',
      });
    } else {
      setNotification({
        type: 'success',
        errors: [],
        warnings: [],
        message: 'Draft saved successfully',
      });
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, type: null }));
    }, 5000);
  };

  // Publish handler
  const handlePublish = () => {
    const result = validateForPublish(workflow);

    if (!result.canPublish) {
      setNotification({
        type: 'error',
        errors: result.errors,
        warnings: [],
        message: 'Publish failed',
      });
      return;
    }

    setNotification({
      type: 'success',
      errors: [],
      warnings: [],
      message: 'Published successfully',
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, type: null }));
    }, 5000);
  };

  // Dismiss notification
  const dismissNotification = () => {
    setNotification((prev) => ({ ...prev, type: null }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          height: '60px',
          background: '#262626',
          borderBottom: '1px solid #404040',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#e5e5e5', margin: 0 }}>
            OpenCode
          </h1>
          <span style={{ fontSize: '13px', color: '#a3a3a3' }}>{filename}</span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDraftSave}
            disabled={readOnlyMode}
            style={{
              padding: '8px 16px',
              background: readOnlyMode ? '#27272a' : '#3f3f46',
              border: 'none',
              borderRadius: '6px',
              color: readOnlyMode ? '#52525b' : '#e5e5e5',
              fontSize: '13px',
              fontWeight: '500',
              cursor: readOnlyMode ? 'not-allowed' : 'pointer',
              opacity: readOnlyMode ? 0.5 : 1,
            }}
          >
            Draft Save
          </button>
          <button
            onClick={handlePublish}
            disabled={readOnlyMode}
            style={{
              padding: '8px 16px',
              background: readOnlyMode ? '#27272a' : '#2563eb',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '500',
              cursor: readOnlyMode ? 'not-allowed' : 'pointer',
              opacity: readOnlyMode ? 0.5 : 1,
            }}
          >
            Publish
          </button>
        </div>
      </header>

      {/* Workflow Editor */}
      <WorkflowEditor />

      {/* Notifications */}
      {notification.type === 'error' && (
        <ErrorCard errors={notification.errors} onDismiss={dismissNotification} />
      )}
      {notification.type === 'warning' && (
        <WarningCard warnings={notification.warnings} onDismiss={dismissNotification} />
      )}
      {notification.type === 'success' && (
        <SuccessCard message={notification.message} onDismiss={dismissNotification} />
      )}
    </div>
  );
}

export default App;
