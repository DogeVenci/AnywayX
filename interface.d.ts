export interface IElectronAPI {
    sendMessage: (...args) => Promise<void>,
}

declare global {
    interface Window {
        API: IElectronAPI
    }
}