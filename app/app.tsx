import "./config";
import "./styles/globals.css";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppShell, resolvePage } from "./lib/create-app";

createInertiaApp({
  // Explicit devtools contract: dev mode exposes window.__inertia_interceptors__,
  // which the SFCC Inertia DevTools extension needs for request lineage. This is
  // the adapter's default, pinned here so an upstream default change can't
  // silently kill the extension.
  dev: import.meta.env.DEV,
  resolve: resolvePage,
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(
      <AppShell>
        <App {...props} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </AppShell>
    );
  },
  progress: {
    color: "#c8341f",
  },
});
