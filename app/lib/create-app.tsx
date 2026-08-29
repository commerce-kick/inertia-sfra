import Layout from "@/layouts/default";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

type PageModule = {
  default: React.ComponentType & {
    layout?: (page: React.ReactNode) => React.ReactNode;
  };
};

/**
 * Shared page resolver for the client and SSR entries: identical glob and
 * identical persistent-layout fallback, so the server renders the same tree
 * the client hydrates.
 */
export async function resolvePage(name: string) {
  const page = (await resolvePageComponent(
    `../pages/${name}.tsx`,
    import.meta.glob("../pages/**/*.tsx")
  )) as PageModule;

  page.default.layout =
    page.default.layout || ((page) => <Layout children={page} />);

  return page.default;
}

/**
 * Shared provider stack around the Inertia <App/>. Any provider added here
 * reaches both entries — never add one to a single entry, that's how
 * hydration drift starts.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={new QueryClient()}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
