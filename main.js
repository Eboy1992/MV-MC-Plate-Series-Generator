const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater'); // <-- ADD THIS
const https = require('https');
const path = require('path');

const GITHUB_URL = 'https://raw.githubusercontent.com/Eboy1992/plate-app-killswitch/main/auth.txt';

function checkAuthorization(callback) {
  https.get(GITHUB_URL, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      if (data.trim() === 'allow') {
        callback(true); // App is allowed to run
      } else {
        callback(false); // Block if anything else
      }
    });
  }).on('error', (err) => {
    console.error('Network error:', err);
    callback(false); // Block on error or offline
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
  });

  checkAuthorization((allowed) => {
    if (allowed) {
      win.loadFile('index.html');

      // Auto-updater setup (only run if app is allowed)
      autoUpdater.on('download-progress', (progressObj) => {
        console.log(`Downloaded ${Math.round(progressObj.percent)}%`);
      });

      autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded. Will install on quit.');
      });

      win.webContents.on('did-finish-load', () => {
        autoUpdater.checkForUpdatesAndNotify();
      });

    } else {
      win.loadURL('data:text/html,<h1 style="color:red;">App is disabled by the developer.</h1>');
    }
  });
}

app.whenReady().then(createWindow);
