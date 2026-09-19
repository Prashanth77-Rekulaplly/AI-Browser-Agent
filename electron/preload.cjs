const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  sendAction: (channel, data) => ipcRenderer.send(channel, data),
  onEvent: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
});
