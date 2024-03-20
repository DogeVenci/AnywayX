import { BrowserWindow } from "electron";
import path from "path"

let settingWindow: BrowserWindow = null;

export const createSettingWindow = () => {
    if (settingWindow != null) {
        settingWindow.show();
        return
    }
    settingWindow = new BrowserWindow({
        width: 960,
        height: 600,
        webPreferences: {
            // webSecurity: false,
            preload: path.join(__dirname, 'preload.js')
        },
    });
    const route = "#setting"
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        settingWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + route);
    } else {
        settingWindow.loadURL(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`) + route);
    }
    process.env.NODE_ENV === 'development' && settingWindow.webContents.openDevTools({ mode: "undocked" });

    settingWindow.on('closed', () => {
        settingWindow = null;
    })
}