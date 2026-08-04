import "./config";
import "./styles/globals.css";

import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
import { AppShell, resolvePage } from "./lib/create-app";

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: resolvePage,
    setup: ({ App, props }) => (
      <AppShell>
        <App {...props} />
      </AppShell>
    ),
  })
);
