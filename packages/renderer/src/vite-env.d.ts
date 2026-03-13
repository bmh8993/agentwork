/// <reference types="vite/client" />

/**
 * Electron API types
 */
interface ElectronAPI {
  ping: () => Promise<{ status: string; timestamp: number }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
