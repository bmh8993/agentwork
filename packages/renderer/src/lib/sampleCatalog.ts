import { createEmptyCatalog, type AgentCatalog } from '../types/agent'

export function createSampleAgentCatalog(): AgentCatalog {
  const catalog = createEmptyCatalog()

  catalog.packages['customer-support'] = {
    id: 'customer-support',
    name: 'Customer Support',
    version: '1.0.0',
  }
  catalog.packages.analytics = {
    id: 'analytics',
    name: 'Analytics',
    version: '1.0.0',
  }

  catalog.agents['customer-support/refund-processor'] = {
    id: 'customer-support/refund-processor',
    package: 'customer-support',
    name: 'refund-processor',
    description: 'Processes refund requests',
    model: 'anthropic/claude-sonnet-4',
  }
  catalog.agents['analytics/data-analyst'] = {
    id: 'analytics/data-analyst',
    package: 'analytics',
    name: 'data-analyst',
    description: 'Analyzes structured workflow outputs',
    model: 'openai/gpt-5.4',
  }

  catalog.byPackage['customer-support'] = {
    agents: ['customer-support/refund-processor'],
    tools: [],
    knowledge: [],
    scripts: [],
  }
  catalog.byPackage.analytics = {
    agents: ['analytics/data-analyst'],
    tools: [],
    knowledge: [],
    scripts: [],
  }

  return catalog
}
