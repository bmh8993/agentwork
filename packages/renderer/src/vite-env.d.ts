/// <reference types="vite/client" />

/**
 * Electron API types
 */
interface ElectronAPI {
  ping: () => Promise<{ status: string; timestamp: number }>;
  loadPackageCatalog?: (packagePath: string) => Promise<{
    packages: Record<string, { id: string; name: string; version: string }>;
    agents: Record<string, {
      id: string;
      package: string;
      name: string;
      description?: string;
      instructions?: string;
      model?: string;
    }>;
    tools: Record<string, unknown>;
    knowledge: Record<string, unknown>;
    scripts: Record<string, unknown>;
    byPackage: Record<string, {
      agents: string[];
      tools: string[];
      knowledge: string[];
      scripts: string[];
    }>;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
