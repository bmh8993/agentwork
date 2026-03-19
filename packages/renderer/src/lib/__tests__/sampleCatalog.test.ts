import { describe, expect, it } from 'vitest'

import { createSampleAgentCatalog } from '../sampleCatalog'

describe('createSampleAgentCatalog', () => {
  it('returns a reusable sample catalog with packages and agents', () => {
    const catalog = createSampleAgentCatalog()

    expect(Object.keys(catalog.packages)).toEqual(['customer-support', 'analytics'])
    expect(catalog.agents['customer-support/refund-processor']?.model).toBe('anthropic/claude-sonnet-4')
    expect(catalog.agents['analytics/data-analyst']?.package).toBe('analytics')
  })
})
