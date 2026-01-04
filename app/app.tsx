import "./config";
import "./styles/globals.css";

import { createInertiaApp } from "@inertiajs/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";

import Layout from "@/layouts/default";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/react";

createInertiaApp({
  resolve: async (name) => {
    const page = await resolvePageComponent(
      `./pages/${name}.tsx`,
      //@ts-ignore
      import.meta.glob("./pages/**/*.tsx")
    );

    //@ts-ignore
    page.default.layout =
      //@ts-ignore
      page.default.layout || ((page) => <Layout children={page} />);

    return page;
  },
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(
      <NuqsAdapter>
        <ThemeProvider>
          <QueryClientProvider client={new QueryClient()}>
            {import.meta.env.DEV && (
              <div className="bg-destructive text-destructive-foreground h-10 flex justify-center items-center border-b-4 border-red-700">
                <span className="text-base font-bold">
                  🚧 LIVE MAINTENANCE IN PROGRESS - Errors expected
                </span>
              </div>
            )}
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
