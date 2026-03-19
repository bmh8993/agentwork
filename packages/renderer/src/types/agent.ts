/**
 * Agent and Package Catalog Type Definitions
 *
 * Aligned with:
 * - ADR-0022: Platform-neutral Assistant Package Canonical and AgentNode Reference
 * - ADR-0010: Plugin Package Layout and Manifest
 */

/**
 * ADR-0022: Reusable Agent entity
 * Agent is a standalone execution unit with reusable settings
 */
export interface Agent {
  // Identity
  id: string;           // Unique agent identifier (format: package/name)
  name: string;         // Agent name
  package: string;      // Package identifier

  // Description
  description?: string; // Human-readable description
  instructions?: string; // System prompt / instructions

  // Model settings
  model?: string;       // Model identifier
  model_options?: {
    provider?: string;
    temperature?: number;
    max_tokens?: number;
    [key: string]: unknown;
  };

  // Resources (owned by Agent, not AgentNode per ADR-0022)
  tool_refs?: string[];      // Tool capability references
  knowledge_refs?: string[]; // Knowledge base references
  skill_permissions?: string[]; // Skill access permissions

  // Runtime options
  sampling_options?: {
    [key: string]: unknown;
  };

  // Metadata
  version?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * ADR-0022: Tool capability definition
 */
export interface Tool {
  id: string;
  name: string;
  package: string;
  description?: string;
  script_ref?: string; // Reference to script in package
  [key: string]: unknown;
}

/**
 * ADR-0022: Knowledge base definition
 */
export interface Knowledge {
  id: string;
  name: string;
  package: string;
  type?: string; // e.g., 'file', 'directory', 'url'
  source?: string;
  [key: string]: unknown;
}

/**
 * ADR-0022: Script asset definition
 */
export interface Script {
  id: string;
  name: string;
  package: string;
  path: string; // Relative path from package root (e.g., scripts/tool.sh)
  description?: string;
  [key: string]: unknown;
}

/**
 * ADR-0022: Package manifest
 * Assistant Package is the installation/deployment/transform unit
 */
export interface PackageManifest {
  // Identity
  id: string;           // Package identifier
  name: string;
  version: string;

  // Metadata
  description?: string;
  author?: string;

  // Export configuration
  exports?: {
    opencode?: {
      enabled: boolean;
      [key: string]: unknown;
    };
    claude_code?: {
      enabled: boolean;
      [key: string]: unknown;
    };
  };

  // Asset indices
  agents?: string[];    // Agent IDs provided by this package
  skills?: string[];    // Skill IDs provided by this package
  tools?: string[];     // Tool IDs provided by this package
  knowledge?: string[]; // Knowledge IDs provided by this package
  scripts?: string[];   // Script IDs provided by this package

  // Canonical layout references (ADR-0022)
  // agents/, skills/, tools/, knowledge/, scripts/
}

/**
 * Agent Catalog state
 * Registry of all available Agents across packages
 */
export interface AgentCatalog {
  packages: Record<string, PackageManifest>; // package_id -> manifest
  agents: Record<string, Agent>;             // agent_id -> agent
  tools: Record<string, Tool>;               // tool_id -> tool
  knowledge: Record<string, Knowledge>;      // knowledge_id -> knowledge
  scripts: Record<string, Script>;           // script_id -> script

  // Index by package for quick lookup
  byPackage: Record<string, {
    agents: string[];
    tools: string[];
    knowledge: string[];
    scripts: string[];
  }>;
}

/**
 * Empty catalog initializer
 */
export function createEmptyCatalog(): AgentCatalog {
  return {
    packages: {},
    agents: {},
    tools: {},
    knowledge: {},
    scripts: {},
    byPackage: {},
  };
}
