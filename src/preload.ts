// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("API", {
    sendMessage: (...args: any[]) => ipcRenderer.invoke('message', args).catch(e => console.log(e)),
    onMessage: (callback: Function) => ipcRenderer.on('message', (event, ...args) => callback(...args))
})