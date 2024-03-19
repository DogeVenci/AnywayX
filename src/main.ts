import { app, BrowserWindow, clipboard, globalShortcut, ipcMain, IpcMainInvokeEvent, Menu, session, Tray } from 'electron';
import path from 'path';
import fs from 'fs';
import { createSettingWindow } from './setting';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null
let config: Config | null = null
let currentUrl: string = ""

interface Config {
  defaultUrl?: string
  urls?: string[]
}

const createWindow = () => {
  Menu.setApplicationMenu(null);
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
  });

  mainWindow.on('close', event => {
    event.preventDefault();
    mainWindow.hide()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const $ = (el) => document.querySelector(el);
      function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        if (valueSetter && valueSetter !== prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else {
          valueSetter.call(element, value);
        }
      }
      $("textarea").focus();
      window.API.onMessage((action, param)=>{
        console.log(action,param)
        switch(action){
          case 'clipboard':
            setNativeValue($("textarea"), param);
            $("textarea").dispatchEvent(new Event('input', { bubbles: true }));
            break;
        }
      });0
    `).catch(err => console.log(err))
  })

  // and load the index.html of the app.
  // if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  //   mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  // } else {
  //   mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  // }

  // Open the DevTools.
  process.env.NODE_ENV === 'development' && mainWindow.webContents.openDevTools({ mode: "undocked" });
  // createSettingWindow()
  registerShortcut(mainWindow);
  createTray();
  ipcMain.handle('message', handleMessage)
  config = readConfig();
  loadURL(mainWindow, config.defaultUrl || "https://www.google.com")
};

const handleMessage = (event: IpcMainInvokeEvent, args: any[]) => {
  console.log("handleMessage", args)
  const [action, param] = args
  const mapAction: {
    [key: string]: (param: any) => void;
  } = {
    'setDefaultUrl': (param: any) => {
      currentUrl = param
      writeConfig({ defaultUrl: param })
      readConfig()
      loadURL(mainWindow, param)
    },
    'setUrls': (param: any) => {
      console.log("setUrls", param)
      writeConfig({ urls: param })
      readConfig()
    }
  }
  if (action in mapAction) {
    mapAction[action](param)
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const registerShortcut = (window: BrowserWindow) => {
  globalShortcut.register('CommandOrControl+R', () => {
    if (window.isVisible()) {
      window.hide()
    } else {
      window.show()
      const text = clipboard.readText()
      console.log(text)
      try {
        window.webContents.send('message', "clipboard", text)
      } catch (error) {
        console.log(error)
      }
    }
  })

  globalShortcut.register('Alt+Up', () => {
    console.log('CommandOrControl+Up is pressed', config?.urls)
    if (config?.urls?.length > 0) {
      const len = config.urls.length
      const index = config?.urls.findIndex((v) => currentUrl === v)
      if (index === -1) {
        currentUrl = config.urls[0]
      } else if (index <= 0) {
        currentUrl = config.urls[len - 1]
      }
      else {
        currentUrl = config.urls[index - 1]
      }
      window.loadURL(currentUrl)
    }
  })

  globalShortcut.register('Alt+Down', () => {
    if (config?.urls?.length > 0) {
      const len = config.urls.length
      const index = config?.urls.findIndex((v) => currentUrl === v)
      if (index === -1 || index >= len - 1) {
        currentUrl = config.urls[0]
      } else {
        currentUrl = config.urls[index + 1]
      }
      window.loadURL(currentUrl)
    }
  })

  globalShortcut.register('Alt+Left', () => {
    window.webContents.goBack()
  })

  globalShortcut.register('Alt+Right', () => {
    window.webContents.goForward()
  })

}


const createTray = () => {
  const pathIcon = path.join(__dirname, './assets/logo.png')

  const tray = new Tray(pathIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '设置',
      click: () => {
        createSettingWindow();
      }
    },
    {
      label: '退出',
      click: () => app.exit()
    },
    // ...
  ])

  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
}

const loadURL = (window: BrowserWindow, url: string, proxyRules: string | null = "socks5://localhost:7777") => {
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    // console.log(details.url)
    callback({ cancel: false })
  })
  if (proxyRules) {
    session.defaultSession.setProxy({ proxyRules })
  }

  window.loadURL(url)
}

const readConfig = () => {
  try {
    const dataPath = path.join(app.getPath('userData'), 'data.json')
    const bytes = fs.readFileSync(dataPath)
    return JSON.parse(bytes.toString())
  } catch (e) {
    console.log(e)
    return {}
  }

}

const writeConfig = (params: Config) => {
  const dataPath = path.join(app.getPath('userData'), 'data.json')
  let config = {}
  if (fs.existsSync(dataPath)) {
    const bytes = fs.readFileSync(dataPath)
    config = JSON.parse(bytes.toString())
  }
  const newConfig = { ...config, ...params }
  fs.writeFileSync(dataPath, JSON.stringify(newConfig))
}