import { useMemo, useState } from 'react'
import type { RunSession } from '../../../run-orchestrator/src'

interface ExecutionPanelProps {
  sessions: RunSession[]
  activeSessionId?: string | null
  onSelectSession?: (sessionId: string) => void
  onDismiss?: () => void
}

function statusColor(status: string): string {
  if (status === 'success') return '#22c55e'
  if (status === 'failed') return '#ef4444'
  return '#a3a3a3'
}

export function ExecutionPanel({
  sessions,
  activeSessionId,
  onSelectSession,
  onDismiss,
}: ExecutionPanelProps) {
  const [showFailuresOnly, setShowFailuresOnly] = useState(false)
  const [internalActiveSessionId, setInternalActiveSessionId] = useState<string | null>(
    activeSessionId ?? sessions[0]?.id ?? null
  )
  const resolvedActiveSessionId = onSelectSession
    ? (activeSessionId ?? internalActiveSessionId)
    : internalActiveSessionId
  const activeSession = useMemo(() => {
    if (sessions.length === 0) {
      return null
    }
    if (resolvedActiveSessionId) {
      return sessions.find((session) => session.id === resolvedActiveSessionId) ?? sessions[0]
    }
    return sessions[0]
  }, [resolvedActiveSessionId, sessions])
  const nodeResults = (activeSession?.nodeResults ?? []).filter((result) =>
    showFailuresOnly ? result.status === 'failed' : true
  )

  return (
    <div
      style={{
        position: 'fixed',
        top: '76px',
        right: '20px',
        width: '360px',
        maxHeight: '70vh',
        overflow: 'auto',
        background: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.45)',
        zIndex: 1500,
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#f4f4f5' }}>
            Execution Results
          </div>
          <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
            Session: {activeSession?.id ?? '-'} · State: {activeSession?.state ?? 'idle'}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '2px 6px',
            }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sessions.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sessions.map((session) => {
              const isActive = session.id === activeSession?.id
              return (
                <button
                  key={session.id}
                  onClick={() => {
                    if (onSelectSession) {
                      onSelectSession(session.id)
                      return
                    }
                    setInternalActiveSessionId(session.id)
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '999px',
                    border: '1px solid #3f3f46',
                    background: isActive ? '#2563eb' : '#27272a',
                    color: '#f4f4f5',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {session.id}
                </button>
              )
            })}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowFailuresOnly((value) => !value)}
            style={{
              padding: '4px 8px',
              borderRadius: '999px',
              border: '1px solid #3f3f46',
              background: showFailuresOnly ? '#7f1d1d' : '#27272a',
              color: '#f4f4f5',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Failures Only
          </button>
        </div>
        {nodeResults.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
            {showFailuresOnly ? 'No failed node results recorded.' : 'No node results recorded.'}
          </div>
        ) : (
          nodeResults.map((result) => (
            <div
              key={result.nodeId}
              style={{
                border: '1px solid #27272a',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: '#111113',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f4f4f5' }}>
                  {result.nodeName}
                </div>
                <div
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: `${statusColor(result.status)}22`,
                    color: statusColor(result.status),
                    fontSize: '11px',
                    fontWeight: '600',
                  }}
                >
                  {result.status}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>
                {result.type} · {result.nodeId}
              </div>
              {result.output && (
                <div style={{ fontSize: '12px', color: '#d4d4d8' }}>
                  Output: {result.output}
                </div>
              )}
              {result.error && (
                <div style={{ fontSize: '12px', color: '#fca5a5' }}>
                  Error: {result.error}
                </div>
              )}
              {result.branch_outputs && result.branch_outputs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#d4d4d8' }}>
                    Branch Outputs
                  </div>
                  {result.branch_outputs.map((branch) => (
                    <div
                      key={`${result.nodeId}-${branch.node_id}`}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '8px',
                        background: '#18181b',
                        border: '1px solid #27272a',
                        fontSize: '11px',
                        color: '#d4d4d8',
                      }}
                    >
                      {branch.node_id} · {branch.status}
                      {branch.output ? ` · ${branch.output}` : ''}
                      {branch.error ? ` · ${branch.error}` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
