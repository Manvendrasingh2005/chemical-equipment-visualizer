const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    title: "ChemEquip Analytics",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Helps load local files
    },
    autoHideMenuBar: true,
  });

  // --- THE BULLETPROOF PATH ---
  // In production, the file is usually at: resources/app.asar/build/index.html
  // We use __dirname to find where we are right now.
  const prodPath = `file://${path.join(__dirname, '../build/index.html')}`;
  
  console.log("Loading URL:", isDev ? 'http://localhost:3000' : prodPath);

  mainWindow.loadURL(isDev ? 'http://localhost:3000' : prodPath);

  // --- IMPORTANT: OPEN ERROR CONSOLE ---
  // This will open the side menu so we can see the RED errors
  mainWindow.webContents.openDevTools(); 
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});