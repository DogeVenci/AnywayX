import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AppState {
    urls: string[],
    addUrl: (url: string) => void,
    removeAllUrls: () => void,
    defaultUrl: string,
    setDefaultUrl: (url: string) => void
}

export const useAppStore = create(
    persist<AppState>(
        (set, get) => ({
            urls: [],
            addUrl: (url: string) => set((state) => ({ urls: [...state.urls, url] })),
            removeAllUrls: () => set({ urls: [] }),
            defaultUrl: 'https://www.google.com',
            setDefaultUrl: (url: string) => set({ defaultUrl: url }),
        }),
        {
            name: 'app-state', // unique name
        }
    )
)
