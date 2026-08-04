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

type PageModule = {
  default: React.ComponentType & {
    layout?: (page: React.ReactNode) => React.ReactNode;
  };
};

createInertiaApp({
  resolve: async (name) => {
    const page = (await resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob("./pages/**/*.tsx")
    )) as PageModule;

    page.default.layout =
      page.default.layout || ((page) => <Layout children={page} />);

    return page.default;
  },
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(
      <ThemeProvider>
        <QueryClientProvider client={new QueryClient()}>
          <App {...props} />
          <Toaster />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ThemeProvider>
    );
  },
  progress: {
    color: "#4B5563",
  },
});
