import { readdir, readFile } from 'fs/promises'
import { basename, join } from 'path'

export interface ImportedPackageManifest {
  id: string
  name: string
  version: string
}

export interface ImportedAgent {
  id: string
  package: string
  name: string
  description?: string
  instructions?: string
  model?: string
  tool_refs?: string[]
  knowledge_refs?: string[]
  skill_permissions?: string[]
}

export interface ImportedTool {
  id: string
  package: string
  name: string
  description?: string
  script_ref?: string
}

export interface ImportedKnowledge {
  id: string
  package: string
  name: string
  type?: string
  source?: string
}

export interface ImportedScript {
  id: string
  package: string
  name: string
  path: string
  description?: string
}

export interface ImportedAgentCatalog {
  packages: Record<string, ImportedPackageManifest>
  agents: Record<string, ImportedAgent>
  tools: Record<string, ImportedTool>
  knowledge: Record<string, ImportedKnowledge>
  scripts: Record<string, ImportedScript>
  byPackage: Record<string, {
    agents: string[]
    tools: string[]
    knowledge: string[]
    scripts: string[]
  }>
}

interface PackageJsonLike {
  name?: string
  version?: string
}

interface SkillJsonLike {
  skill?: {
    id?: string
    name?: string
  }
}

interface AgentFileLike {
  name?: string
  description?: string
  instructions?: string
  model?: string
  tool_refs?: string[]
  knowledge_refs?: string[]
  skill_permissions?: string[]
}

interface ToolFileLike {
  name?: string
  description?: string
  script_ref?: string
}

interface KnowledgeFileLike {
  name?: string
  type?: string
  source?: string
}

async function readJsonFile<T>(filePath: string): Promise<T | undefined> {
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch {
    return undefined
  }
}

function toCatalogId(packageId: string, localRef: string | undefined): string | undefined {
  if (!localRef) {
    return undefined
  }

  return localRef.includes('/') ? localRef : `${packageId}/${localRef}`
}

function toCatalogRefs(packageId: string, refs: string[] | undefined): string[] | undefined {
  if (!refs || refs.length === 0) {
    return undefined
  }

  return refs.map((ref) => toCatalogId(packageId, ref) ?? ref)
}

export async function importAgentCatalogFromPackage(
  packagePath: string
): Promise<ImportedAgentCatalog> {
  const packageJson = await readJsonFile<PackageJsonLike>(join(packagePath, 'package.json'))
  const skillJson = await readJsonFile<SkillJsonLike>(join(packagePath, 'SKILL.json'))

  const packageId =
    packageJson?.name ??
    skillJson?.skill?.id ??
    basename(packagePath)

  const packageName =
    packageJson?.name ??
    skillJson?.skill?.name ??
    packageId

  const packageVersion = packageJson?.version ?? '0.0.0'

  const catalog: ImportedAgentCatalog = {
    packages: {
      [packageId]: {
        id: packageId,
        name: packageName,
        version: packageVersion,
      },
    },
    agents: {},
    tools: {},
    knowledge: {},
    scripts: {},
    byPackage: {
      [packageId]: {
        agents: [],
        tools: [],
        knowledge: [],
        scripts: [],
      },
    },
  }

  const agentsDir = join(packagePath, 'agents')

  let entries: string[] = []
  try {
    entries = await readdir(agentsDir)
  } catch {
    return catalog
  }

  const agentFiles = entries.filter((entry) => entry.endsWith('.json')).sort()

  for (const agentFile of agentFiles) {
    const agentData = await readJsonFile<AgentFileLike>(join(agentsDir, agentFile))
    const agentName = agentData?.name ?? agentFile.replace(/\.json$/, '')
    const agentId = `${packageId}/${agentName}`

    catalog.agents[agentId] = {
      id: agentId,
      package: packageId,
      name: agentName,
      description: agentData?.description,
      instructions: agentData?.instructions,
      model: agentData?.model,
      tool_refs: toCatalogRefs(packageId, agentData?.tool_refs),
      knowledge_refs: toCatalogRefs(packageId, agentData?.knowledge_refs),
      skill_permissions: agentData?.skill_permissions,
    }
    catalog.byPackage[packageId].agents.push(agentId)
  }

  catalog.byPackage[packageId].agents.sort()

  const toolsDir = join(packagePath, 'tools')
  try {
    const toolEntries = (await readdir(toolsDir))
      .filter((entry) => entry.endsWith('.json'))
      .sort()

    for (const toolFile of toolEntries) {
      const toolData = await readJsonFile<ToolFileLike>(join(toolsDir, toolFile))
      const toolName = toolData?.name ?? toolFile.replace(/\.json$/, '')
      const toolId = `${packageId}/${toolName}`

      catalog.tools[toolId] = {
        id: toolId,
        package: packageId,
        name: toolName,
        description: toolData?.description,
        script_ref: toCatalogId(packageId, toolData?.script_ref),
      }
      catalog.byPackage[packageId].tools.push(toolId)
    }
  } catch {
    // tools/ is optional in package layouts
  }

  catalog.byPackage[packageId].tools.sort()

  const knowledgeDir = join(packagePath, 'knowledge')
  try {
    const knowledgeEntries = (await readdir(knowledgeDir))
      .filter((entry) => entry.endsWith('.json'))
      .sort()

    for (const knowledgeFile of knowledgeEntries) {
      const knowledgeData = await readJsonFile<KnowledgeFileLike>(join(knowledgeDir, knowledgeFile))
      const knowledgeName = knowledgeData?.name ?? knowledgeFile.replace(/\.json$/, '')
      const knowledgeId = `${packageId}/${knowledgeName}`

      catalog.knowledge[knowledgeId] = {
        id: knowledgeId,
        package: packageId,
        name: knowledgeName,
        type: knowledgeData?.type,
        source: knowledgeData?.source,
      }
      catalog.byPackage[packageId].knowledge.push(knowledgeId)
    }
  } catch {
    // knowledge/ is optional in package layouts
  }

  catalog.byPackage[packageId].knowledge.sort()

  const scriptsDir = join(packagePath, 'scripts')
  try {
    const scriptEntries = (await readdir(scriptsDir))
      .filter((entry) => !entry.startsWith('.'))
      .sort()

    for (const scriptFile of scriptEntries) {
      const scriptName = scriptFile
      const scriptId = `${packageId}/${scriptName}`

      catalog.scripts[scriptId] = {
        id: scriptId,
        package: packageId,
        name: scriptName,
        path: `scripts/${scriptFile}`,
      }
      catalog.byPackage[packageId].scripts.push(scriptId)
    }
  } catch {
    // scripts/ is optional in package layouts
  }

  catalog.byPackage[packageId].scripts.sort()

  return catalog
}
