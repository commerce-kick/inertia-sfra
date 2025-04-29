import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { resolve } from "node:path";
import { defineConfig } from "vite";

import mkcert from "vite-plugin-mkcert";

import viteHotFilePlugin from "./plugins/vite-hot-file-plugin";
import routesPlugin from "./plugins/vite-routes-plugin";

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "./store_front/cartridges/store_front/cartridge/static/default",
  },
  server: {
    https: true,
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      preflightContinue: false,
      credentials: true,
      headers: "Content-Type, Authorization",
    },
    headers: {
      "Access-Control-Allow-Private-Network": "true",
    },
  },
  plugins: [
    laravel({
      input: ["./app/styles/globals.css", "./app/app.tsx"],
      refresh: false,
      buildDirectory: "/on/demandware.static/Sites-RefArch-Site/-/en_US/",
      base: "/on/demandware.static/Sites-RefArch-Site/-/en_US/",
      publicDirectory:
        "./store_front/cartridges/store_front/cartridge/static/default",
    }),
    react(),
    tailwindcss(),
    mkcert(),
    viteHotFilePlugin(
      "./store_front/cartridges/store_front/cartridge/scripts/hot.json"
    ),
    routesPlugin(),
  ],
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./app"),
    },
  },
});
