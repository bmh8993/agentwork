/**
 * Global type declarations for OpenCode
 */

import { ElectronAPI } from './preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
