/**
 * main.js — Electron Main Process
 * Sistema de Recibos v5.0 Supreme Edition
 * 
 * Features:
 * - License validation on startup
 * - Auto-activation for first use
 * - Secure preload bridge
 * - Native PDF printing
 * - Professional window management
 */

const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const license = require('./license');

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'icon.png'),
        title: 'Sistema de Recibos v5.0 Supreme',
        show: false, // Show after ready
        backgroundColor: '#0a0f1e'
    });

    // Maximize on start
    mainWindow.maximize();
    mainWindow.show();

    mainWindow.loadFile('SistemaRecibos.html');

    // Remove menu completely
    mainWindow.setMenu(null);
}

// ══════ LICENSE IPC HANDLERS ══════

ipcMain.handle('license:info', async () => {
    return license.getLicenseInfo();
});

ipcMain.handle('license:activate', async () => {
    return license.autoActivate();
});

ipcMain.handle('app:version', async () => {
    return app.getVersion();
});

// ══════ PRINT IPC HANDLER ══════

ipcMain.on('print-receipt', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    try {
        const pdfPath = path.join(os.tmpdir(), `recibo_${Date.now()}.pdf`);

        const data = await win.webContents.printToPDF({
            landscape: true,
            printBackground: true,
            marginsType: 0,
            pageSize: 'A4',
            scale: 1
        });

        fs.writeFile(pdfPath, data, (error) => {
            if (error) {
                console.error('Failed to save PDF:', error);
                dialog.showErrorBox('Error', 'No se pudo generar el PDF: ' + error.message);
                return;
            }
            shell.openPath(pdfPath);
        });
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        dialog.showErrorBox('Error', 'Error al generar PDF: ' + error.message);
    }
});

// ══════ APP LIFECYCLE ══════

app.whenReady().then(() => {
    // Auto-activate license on first run
    const activation = license.autoActivate();
    console.log('[License]', activation.message);

    // Validate license
    const licenseInfo = license.getLicenseInfo();
    
    if (!licenseInfo.valid && licenseInfo.reason !== 'NO_LICENSE') {
        // License expired or invalid machine
        createWindow();
        // The frontend will handle showing the expired modal
        console.log('[License] Status:', licenseInfo.reason, '- Days remaining:', licenseInfo.daysRemaining);
    } else {
        createWindow();
        console.log('[License] Valid - Days remaining:', licenseInfo.daysRemaining);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
