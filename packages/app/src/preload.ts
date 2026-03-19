/**
 * OpenCode Electron Preload Script
 *
 * Secure bridge between main and renderer processes.
 * Exposes limited, safe APIs to the renderer.
 */

import { contextBridge, ipcRenderer } from 'electron';

/**
 * Exposed API for renderer process
 */
const electronAPI = {
  // App info
  ping: () => ipcRenderer.invoke('app:ping'),

  // TODO: Add skill file operations
  // loadSkill: (filePath: string) => ipcRenderer.invoke('skill:load', filePath),
  // saveSkill: (data: SkillData) => ipcRenderer.invoke('skill:save', data),
  // publishSkill: (data: SkillData) => ipcRenderer.invoke('skill:publish', data),
  loadPackageCatalog: (packagePath: string) =>
    ipcRenderer.invoke('catalog:load-package', packagePath),

  // TODO: Add run operations
  // runSkill: (skillId: string) => ipcRenderer.invoke('skill:run', skillId),
};

/**
 * Expose API to renderer via contextBridge
 */
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

/**
 * Type definitions for renderer (will be available via d.ts)
 */
export type ElectronAPI = typeof electronAPI;
