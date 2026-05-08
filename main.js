const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simplicity with existing code using localStorage/FileReader
            // If stricter security is needed later, we can use preload scripts.
        },
        autoHideMenuBar: true, // Hide menu for app-like feel
        icon: path.join(__dirname, 'icon.png') // We'll need to check if an icon exists or handle this gracefully
    });

    win.loadFile('SistemaRecibos.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    const { ipcMain } = require('electron');
    ipcMain.on('print-receipt', async (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return;

        try {
            const fs = require('fs');
            const os = require('os');
            const { shell } = require('electron');

            const pdfPath = path.join(os.tmpdir(), `recibo_${Date.now()}.pdf`);

            // Use printToPDF to force landscape rendering
            const data = await win.webContents.printToPDF({
                landscape: true,
                printBackground: true,
                marginsType: 0, // No margins
                pageSize: 'A4',
                scale: 1
            });

            fs.writeFile(pdfPath, data, (error) => {
                if (error) {
                    console.error('Failed to save PDF:', error);
                    return;
                }
                // Open the PDF with the default system app (provides the best preview)
                shell.openPath(pdfPath);
            });
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
