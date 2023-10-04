const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';
let mainWindow;
//Menu template
const menu = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {
          label: 'About',
          click: createAboutWindow
        }
      ]
    }] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        click: () => app.quit(),
        accelerator: 'Ctrl+W'
      }
    ]
  },
  ...(!isMac ? [{
    label: 'Help',
    submenu: [{
      label: 'About',
      click: createAboutWindow
    }]
  }] : [])
]

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

//Create the main window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  //Implement Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu)

  //Open Dev Tools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, './_theme_files/index.html'));
  mainWindow.on('closed', () => (mainWindow = null));

};


//App is ready
app.whenReady().then(() => {
  createWindow();
});

//Close Browser
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


//FUNCTIONS

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  //Implement Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu)

  aboutWindow.loadFile(path.join(__dirname, './_theme_files/about.html'));
}

async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    })
    //Create filename
    const filename = path.basename(imgPath);

    //Create dest folderif not exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    //Write file to destination folder
    fs.writeFileSync(path.join(dest, filename), newPath);

    //Send success message back to renderer for alert
    mainWindow.webContents.send('image:done');

    // Open destination folder so they can see the image
    shell.openPath(dest);

  } catch (error){
    console.log(error);
  }
}

//Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer')
  resizeImage(options);
})
