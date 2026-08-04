import "./config";
import "./styles/globals.css";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppShell, resolvePage } from "./lib/create-app";

createInertiaApp({
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
