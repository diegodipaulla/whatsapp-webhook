const { app: electronApp, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let win = null;
let tray = null;

function createWindow() {
    win = new BrowserWindow({
        width: 400,
        height: 550,
        frame: false,
        resizable: false,
        movable: true,
        backgroundColor: '#f0f2f5',
        show: true,
        webPreferences: {
            preload: path.join(__dirname, 'renderer', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    win.on('closed', () => {
        win = null;
    });

    return win;
}

function createTray() {
    const iconDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGySURBVDhPjZJPS1RRGMb/7t4bVVERjSAiSg3hIqLo2p/gH3Bv6a+gqAtx0aJd2qVLk67dJbZJk2YyF5s2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k2N5k-aHR0cDovL3d3cuZ29vZ2xlLmNvbS9zZWFyY2g/cT1od2F0c2FwcCtpY29uK2RhdGErdXJsJmF1ZD1BQUFBRWREcWlYVzFNS1l6Z0tjdG5lZ3ZfX0VzN2NfXy1hYmNfX3NlcnAmdj0xJmJlaT1aV3lJWnVlV0xuZ3ZrcGFjLTZtZ0I=';
    const icon = nativeImage.createFromDataURL(iconDataURL);
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Sair', type: 'normal', click: () => electronApp.quit() }
    ]);
    tray.setToolTip('WhatsApp Webhook está rodando.');
    tray.setContextMenu(contextMenu);
}

electronApp.on('window-all-closed', e => e.preventDefault());

electronApp.whenReady().then(() => {
    createWindow();
    createTray();
});

module.exports = { createWindow };
