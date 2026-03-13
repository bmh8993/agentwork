/**
 * OpenCode Electron Main Process
 *
 * Entry point for the Electron application.
 * Initializes the main window and handles IPC communication.
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

/**
 * Create and configure the main browser window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    backgroundColor: '#1a1a1a',
    titleBarStyle: 'hiddenInset',
  });

  // Load the renderer process
  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * App lifecycle handlers
 */

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();

  // Recreate window on macOS when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * IPC Handlers
 *
 * TODO: Add IPC handlers for:
 * - Loading SKILL.json files
 * - Saving workflow changes
 * - Publishing skills
 * - Running skills
 */

// Example: Health check handler
ipcMain.handle('app:ping', async () => {
  return { status: 'ok', timestamp: Date.now() };
});
