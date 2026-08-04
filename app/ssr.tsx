import './config';
import "./styles/globals.css";

import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import ReactDOMServer from "react-dom/server";
import { Toaster } from "./components/ui/sonner";

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => `${title} - SSR`,
    resolve: async (name) => {
      const page = (await resolvePageComponent(
        `./pages/${name}.tsx`,
        import.meta.glob("./pages/**/*.tsx")
      )) as {
        default: React.ComponentType & {
          layout?: (page: React.ReactNode) => React.ReactNode;
        };
      };

      return page.default;
    },
    setup: ({ App, props }) => {
      return (
        <QueryClientProvider client={new QueryClient()}>
          <App {...props} />
          <Toaster />
        </QueryClientProvider>
      );
    },
  })
);
