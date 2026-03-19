import { describe, expect, it } from 'vitest'
import { resolve } from 'path'

import { importAgentCatalogFromPackage } from './import-package-catalog'

describe('importAgentCatalogFromPackage', () => {
  it('loads package metadata and agents from a package layout', async () => {
    const packagePath = resolve(
      process.cwd(),
      'test-gates/installer/fixtures/catalog-package'
    )

    const catalog = await importAgentCatalogFromPackage(packagePath)

    expect(catalog.packages['customer-support']).toEqual({
      id: 'customer-support',
      name: 'customer-support',
      version: '1.2.3',
    })
    expect(catalog.agents['customer-support/refund-processor']?.model).toBe(
      'anthropic/claude-sonnet-4'
    )
    expect(catalog.agents['customer-support/refund-processor']?.tool_refs).toEqual([
      'customer-support/refund-check',
      'customer-support/refund-log',
    ])
    expect(catalog.agents['customer-support/refund-processor']?.knowledge_refs).toEqual([
      'customer-support/refund-policy',
    ])
    expect(catalog.agents['customer-support/escalation-reviewer']?.model).toBe(
      'openai/gpt-5.4'
    )
    expect(catalog.tools['customer-support/refund-check']).toEqual({
      id: 'customer-support/refund-check',
      package: 'customer-support',
      name: 'refund-check',
      description: 'Checks refund eligibility',
      script_ref: 'customer-support/refund-check.sh',
    })
    expect(catalog.knowledge['customer-support/refund-policy']).toEqual({
      id: 'customer-support/refund-policy',
      package: 'customer-support',
      name: 'refund-policy',
      type: 'file',
      source: 'knowledge/refund-policy.md',
    })
    expect(catalog.scripts['customer-support/refund-check.sh']).toEqual({
      id: 'customer-support/refund-check.sh',
      package: 'customer-support',
      name: 'refund-check.sh',
      path: 'scripts/refund-check.sh',
    })
    expect(catalog.byPackage['customer-support']?.agents).toEqual([
      'customer-support/escalation-reviewer',
      'customer-support/refund-processor',
    ])
    expect(catalog.byPackage['customer-support']?.tools).toEqual([
      'customer-support/refund-check',
      'customer-support/refund-log',
    ])
    expect(catalog.byPackage['customer-support']?.knowledge).toEqual([
      'customer-support/refund-policy',
    ])
    expect(catalog.byPackage['customer-support']?.scripts).toEqual([
      'customer-support/refund-check.sh',
      'customer-support/refund-log.sh',
    ])
  })
})
