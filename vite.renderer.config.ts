import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf?.name ?? '';

  console.log('👋 👋 👋 [vite.renderer.config.ts]', name, root, mode);

  return {
    root: path.resolve(root, 'src/renderer'),
    mode,
    base: "./",
    build: {
      outDir: path.resolve(root, `.vite/renderer/${name}`),
      // assetsDir: ""
    },
    plugins: [
      pluginExposeRenderer(name),
      react()
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@": path.resolve(root, 'src/renderer/src'),
      }
    },
    clearScreen: false,
  } as UserConfig;
});
