/**
 * preload.js — Secure Bridge between Renderer and Main Process
 * Sistema de Recibos v5.0 Supreme Edition
 * 
 * Expone APIs seguras al frontend sin dar acceso directo a Node.js
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // License
    getLicenseInfo: () => ipcRenderer.invoke('license:info'),
    activateLicense: () => ipcRenderer.invoke('license:activate'),
    renewLicense: (code) => ipcRenderer.invoke('license:renew', code),
    
    // Print
    printReceipt: () => ipcRenderer.send('print-receipt'),
    
    // App info
    getAppVersion: () => ipcRenderer.invoke('app:version'),
    
    // Platform detection
    isElectron: true
});
