import "./styles/globals.css";
import "./config";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";

import { NuqsAdapter } from "nuqs/adapters/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

createInertiaApp({
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      //@ts-ignore
      import.meta.glob("./pages/**/*.tsx")
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(
      <NuqsAdapter>
        <ThemeProvider>
          <QueryClientProvider client={new QueryClient()}>
            <App {...props} />
            <Toaster />
            {import.meta.env.DEV && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </QueryClientProvider>
        </ThemeProvider>
      </NuqsAdapter>
    );
  },
  progress: {
    color: "#4B5563",
  },
});
