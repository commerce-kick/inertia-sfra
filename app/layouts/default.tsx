import { AccountMenu } from "@/components/commerce/account/account-menu";
import { BagFlyout } from "@/components/commerce/cart/bag-flyout";
import { HeaderSearch } from "@/components/commerce/search/header-search";
/**
 * Storefront shell — stark atelier system (user-pinned: high-fashion design
 * agency; direction contract lives as the first child of <body> in
 * components/layout/inertia.isml). Hairline header with caps nav; footer is
 * the inverse ground carrying a giant wordmark. Flash → toasts.
 */
import { Link } from "@/components/link";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { homeShow } from "@/generated/routes/home-show";
import { useMaskedReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { PageWithFlash, SharedProps } from "@/types/shared";
import { usePage } from "@inertiajs/react";
import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "display-caps inline-flex items-center gap-1.5 text-base",
        className
      )}
    >
      meridian
      <span
        className="size-1.5 bg-current transition-transform duration-(--motion-fast) ease-(--motion-ease) group-hover:rotate-45"
        aria-hidden
      />
    </span>
  );
}

/**
 * A nav category is active when the current page URL points at the same
 * Search-Show target (pathname + cgid). String-parse only — SSR-safe.
 */
function isActiveCategory(pageUrl: string, categoryUrl: string) {
  try {
    const current = new URL(pageUrl, "http://x");
    const target = new URL(categoryUrl, "http://x");
    return (
      current.pathname === target.pathname &&
      current.searchParams.get("cgid") === target.searchParams.get("cgid")
    );
  } catch {
    return false;
  }
}


function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

function Header() {
  const page = usePage<SharedProps>();
  const { navBar } = page.props;
  const categories = navBar?.categories ?? [];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center gap-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Wordmark />
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Categories" className="flex flex-col px-4">
              {categories.map((category) => {
                const active = isActiveCategory(page.url, category.url);
                return (
                  <Link
                    key={category.id}
                    href={category.url}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "label-caps border-b py-4 transition-colors hover:text-foreground",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto px-4 pb-6">
              <HeaderSearch onSubmitted={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link
          href={homeShow({})}
          aria-label="Meridian — home"
          className="group"
        >
          <Wordmark />
        </Link>

        <nav
          aria-label="Categories"
          className="hidden items-center gap-7 md:flex"
        >
          {categories.map((category) => {
            const active = isActiveCategory(page.url, category.url);
            return (
              <Link
                key={category.id}
                href={category.url}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "label-caps relative py-2 transition-colors",
                  active
                    ? "text-foreground after:absolute after:inset-x-0 after:-bottom-[19px] after:h-px after:bg-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <HeaderSearch />
          </div>
          <ThemeToggle />
          <AccountMenu />
          <BagFlyout />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { navBar, locale } = usePage<SharedProps>().props;
  const categories = navBar?.categories ?? [];
  const signatureRef = useRef<HTMLDivElement>(null);
  // The closing echo of the hero: the signature rises once, on first sight.
  useMaskedReveal(signatureRef, { whenInView: true });

  return (
    <footer className="mt-32 bg-foreground text-background">
      <div className="container grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr]">
        <p className="max-w-sm text-sm leading-relaxed opacity-70">
          A full-catalog storefront, composed the modern way. Reference
          implementation of the Inertia.js adapter for Salesforce B2C Commerce
          (SFRA).
        </p>
        <nav aria-label="Categories" className="flex flex-col gap-3">
          <span className="label-caps opacity-50">Collections</span>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.url}
              className="link-draw label-caps w-fit opacity-80 transition-opacity hover:opacity-100"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          <span className="label-caps opacity-50">The project</span>
          <span className="meta-caps opacity-70">
            Built with Inertia v2 · SFRA · React 19
          </span>
          <span className="meta-caps opacity-70">open source</span>
        </div>
      </div>
      {/* The house signature: the wordmark at architectural scale. */}
      <div ref={signatureRef} className="overflow-hidden px-2" aria-hidden>
        <div
          data-anim="line"
          className="display-caps -mb-[0.16em] select-none text-center text-[clamp(3.25rem,15vw,15rem)] leading-none"
        >
          meridian
        </div>
      </div>
      <div className="border-t border-background/20">
        <div className="container flex items-center justify-between gap-4 py-4">
          <span className="meta-caps opacity-60">{locale} · demo</span>
          <span className="meta-caps opacity-60">inertia-sfra</span>
        </div>
      </div>
    </footer>
  );
}

function FlashToasts() {
  const page = usePage() as PageWithFlash;
  const flash = page.flash;

  useEffect(() => {
    if (!flash) return;
    Object.entries(flash).forEach(([kind, message]) => {
      if (kind === "success") toast.success(message);
      else if (kind === "error") toast.error(message);
      else toast(message);
    });
  }, [flash]);

  return null;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <FlashToasts />
    </div>
  );
}
