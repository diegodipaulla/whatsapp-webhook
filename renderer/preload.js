const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onQRCode: (callback) => ipcRenderer.on('qr-code', (event, qr) => callback(qr)),
  onConnected: (callback) => ipcRenderer.on('connected', () => callback()),
  onAuthFailure: (callback) => ipcRenderer.on('auth-failure', () => callback()),
});
