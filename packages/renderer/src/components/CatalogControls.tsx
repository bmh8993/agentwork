import { useState } from 'react'
import { createSampleAgentCatalog } from '../lib/sampleCatalog'
import { useWorkflowStore } from '../store/workflowStore'
import type { AgentCatalog } from '../types/agent'

export function CatalogControls() {
  const { agentCatalog, setAgentCatalog } = useWorkflowStore()
  const [packagePath, setPackagePath] = useState('')

  const agentCount = Object.keys(agentCatalog.agents).length

  const handleImportPackageCatalog = async () => {
    if (!packagePath || !window.electronAPI?.loadPackageCatalog) {
      return
    }

    const importedCatalog = await window.electronAPI.loadPackageCatalog(packagePath)
    setAgentCatalog(importedCatalog as AgentCatalog)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '13px', color: '#a3a3a3' }}>
        Agents: {agentCount}
      </span>
      <button
        onClick={() => setAgentCatalog(createSampleAgentCatalog())}
        style={{
          padding: '8px 16px',
          background: '#3f3f46',
          border: 'none',
          borderRadius: '6px',
          color: '#e5e5e5',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
        }}
      >
        Load Sample Catalog
      </button>
      <input
        value={packagePath}
        onChange={(event) => setPackagePath(event.target.value)}
        placeholder="/path/to/package"
        style={{
          width: '220px',
          padding: '8px 12px',
          background: '#18181b',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          color: '#e5e5e5',
          fontSize: '13px',
        }}
      />
      <button
        onClick={() => {
          void handleImportPackageCatalog()
        }}
        style={{
          padding: '8px 16px',
          background: '#2563eb',
          border: 'none',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
        }}
      >
        Import Package Catalog
      </button>
    </div>
  )
}
