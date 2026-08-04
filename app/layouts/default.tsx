/**
 * Storefront shell — Hangtag & Garment Bag world (direction contract lives
 * as the first child of <body> in components/layout/inertia.isml).
 * Header: stamped brand, category tickets, search, account/bag. Footer:
 * kraft field. Flash entries surface as toasts.
 */
import { Barcode } from "@/components/commerce/barcode";
import { Stamp } from "@/components/commerce/stamp";
import { Ticket } from "@/components/commerce/ticket";
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
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={phrase}
        onChange={(event) => setPhrase(event.target.value)}
        placeholder="Buscar en el catálogo"
        aria-label="Buscar productos"
        className="h-8 w-44 rounded-none border-dashed pl-8 font-mono text-xs md:w-56"
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
    <header className="sticky top-0 z-40 border-b border-dashed border-secondary-foreground/25 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center gap-5">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="stamp-display text-left text-lg">
                Meridian
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Categorías" className="flex flex-col gap-3 px-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.url}
                  onClick={() => setMobileOpen(false)}
                  className="ticket-caps border-b border-dashed border-border pb-3 text-sm"
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
          <Stamp tilt={-2} className="text-sm">
            Meridian
          </Stamp>
        </Link>

        <nav
          aria-label="Categorías"
          className="hidden items-center gap-2 md:flex"
        >
          {categories.map((category) => (
            <Link key={category.id} href={category.url}>
              <Ticket className="transition-colors hover:text-primary">
                {category.name}
              </Ticket>
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
              auth.user
                ? `Cuenta de ${auth.user.firstName}`
                : "Iniciar sesión"
            }
            title={auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : undefined}
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
    <footer className="mt-24 bg-secondary text-secondary-foreground">
      <div className="container grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-4">
          <span className="stamp-display text-2xl">Meridian</span>
          <p className="max-w-sm text-sm leading-relaxed opacity-80">
            Cada buen objeto llega envuelto: papel de seda, cordel y una
            etiqueta con tu nombre.
          </p>
        </div>
        <nav aria-label="Categorías" className="flex flex-col gap-2.5">
          <span className="ticket-caps text-xs opacity-70">Colecciones</span>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.url}
              className="w-fit text-sm underline-offset-4 hover:underline"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2.5">
          <span className="ticket-caps text-xs opacity-70">El proyecto</span>
          <p className="text-sm leading-relaxed opacity-80">
            Escaparate de referencia del adaptador Inertia.js para Salesforce
            B2C Commerce (SFRA).
          </p>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/20">
        <div className="container flex items-center justify-between gap-4 py-4">
          <span className="font-mono text-[11px] uppercase tracking-widest opacity-70">
            {locale} · demo
          </span>
          <Barcode value="MERIDIAN-STORE" className="w-28 opacity-50" />
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
