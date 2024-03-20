export interface IElectronAPI {
    sendMessage: (...args) => Promise<void>,
    onMessage: (callback: Function) => Promise<void>,
}

declare global {
    interface Window {
        API: IElectronAPI
    }
}