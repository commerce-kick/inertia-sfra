/**
 * Storefront shell — clean enterprise-web system (Cloudflare-inspired,
 * user-pinned; direction contract lives as the first child of <body> in
 * components/layout/inertia.isml). White sticky header with wordmark, nav
 * links, search, account/bag; dark graphite footer. Flash → toasts.
 */
import { Link } from "@/components/link";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { homeShow } from "@/generated/routes/home-show";
import { searchShow } from "@/generated/routes/search-show";
import type { PageWithFlash, SharedProps } from "@/types/shared";
import { router, usePage } from "@inertiajs/react";
import {
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1 ${className ?? ""}`}>
      <span className="text-lg font-bold tracking-tight">meridian</span>
      <span className="size-1.5 rounded-[2px] bg-primary" aria-hidden />
    </span>
  );
}

function SearchForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [phrase, setPhrase] = useState("");

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();
        const q = phrase.trim();
        if (!q) return;
        router.get(searchShow({ q }));
        onSubmitted?.();
      }}
    >
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={phrase}
        onChange={(event) => setPhrase(event.target.value)}
        placeholder="Buscar productos"
        aria-label="Buscar productos"
        className="h-9 w-44 pl-8 text-sm md:w-56"
      />
    </form>
  );
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
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

function Header() {
  const { auth, navBar } = usePage<SharedProps>().props;
  const categories = navBar?.categories ?? [];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center gap-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Wordmark />
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Categorías" className="flex flex-col gap-1 px-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.url}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto px-4 pb-6">
              <SearchForm onSubmitted={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href={homeShow({})} aria-label="Meridian — inicio">
          <Wordmark />
        </Link>

        <nav
          aria-label="Categorías"
          className="hidden items-center gap-1 md:flex"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.url}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden md:block">
            <SearchForm />
          </div>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              auth.user ? `Cuenta de ${auth.user.firstName}` : "Iniciar sesión"
            }
            title={
              auth.user
                ? `${auth.user.firstName} ${auth.user.lastName}`
                : undefined
            }
          >
            <UserRound className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Bolsa de compra">
            <ShoppingBag className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { navBar, locale } = usePage<SharedProps>().props;
  const categories = navBar?.categories ?? [];

  return (
    <footer className="mt-24 bg-[oklch(0.2_0.008_260)] text-[oklch(0.95_0.005_250)]">
      <div className="container grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-4">
          <Wordmark />
          <p className="max-w-sm text-sm leading-relaxed text-[oklch(0.72_0.01_255)]">
            Relojes y accesorios seleccionados para el día a día.
          </p>
        </div>
        <nav aria-label="Categorías" className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.6_0.01_255)]">
            Colecciones
          </span>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.url}
              className="w-fit text-sm text-[oklch(0.8_0.01_255)] transition-colors hover:text-white"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.6_0.01_255)]">
            El proyecto
          </span>
          <p className="text-sm leading-relaxed text-[oklch(0.72_0.01_255)]">
            Escaparate de referencia del adaptador Inertia.js para Salesforce
            B2C Commerce (SFRA).
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex items-center justify-between gap-4 py-4">
          <span className="meta-caps text-[oklch(0.6_0.01_255)]">
            {locale} · demo
          </span>
          <span className="meta-caps text-[oklch(0.6_0.01_255)]">
            inertia-sfra
          </span>
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
