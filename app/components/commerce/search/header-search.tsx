import { Link } from "@/components/link";
import { Input } from "@/components/ui/input";
import type { ISearchSuggestionsData } from "@/generated/data";
import { searchShow } from "@/generated/routes/search-show";
import { MIN_SUGGEST_LENGTH, useSuggestions } from "@/lib/queries/search";
import { cn } from "@/lib/utils";
import { router } from "@inertiajs/react";
import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

/** One navigable row, flattened across groups so arrow keys can walk them. */
type Item = {
  id: string;
  url: string;
  label: string;
  detail?: string;
  imageUrl?: string;
};

type Group = { heading: string; items: Item[] };

/**
 * Flatten the payload into the groups the base template rendered, in its
 * order. Empty groups drop out so no heading ever stands alone.
 */
function toGroups(data: ISearchSuggestionsData | undefined): Group[] {
  if (!data) return [];

  const phraseGroup = (
    heading: string,
    prefix: string,
    phrases: { value: string; url: string }[]
  ): Group => ({
    heading,
    items: phrases.map((phrase, i) => ({
      id: `${prefix}-${i}`,
      url: phrase.url,
      label: phrase.value,
    })),
  });

  const linkGroup = (
    heading: string,
    prefix: string,
    links: { name: string; url: string; imageUrl: string; detail: string }[]
  ): Group => ({
    heading,
    items: links.map((link, i) => ({
      id: `${prefix}-${i}`,
      url: link.url,
      label: link.name,
      detail: link.detail || undefined,
      imageUrl: link.imageUrl || undefined,
    })),
  });

  return [
    phraseGroup("Did you mean", "dym", data.didYouMean),
    linkGroup("Products", "product", data.products),
    linkGroup("Categories", "category", data.categories),
    phraseGroup("Recent", "recent", data.recent),
    phraseGroup("Popular", "popular", data.popular),
    phraseGroup("Brands", "brand", data.brands),
    linkGroup("Pages", "content", data.contents),
  ].filter((group) => group.items.length > 0);
}

/** Debounce the phrase so a fast typist spends one request, not eight. */
function useDebounced(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/**
 * The header search: a combobox over SearchServices-GetSuggestions.
 *
 * Rows are real links, so pointer and screen-reader users get ordinary
 * anchors; the input keeps focus and drives an active row through
 * aria-activedescendant, which is what makes arrow keys work — the same
 * affordance base's jQuery search had.
 */
export function HeaderSearch({ onSubmitted }: { onSubmitted?: () => void }) {
  const [phrase, setPhrase] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const debounced = useDebounced(phrase, 250);
  const { data } = useSuggestions(debounced);
  const groups = useMemo(() => toGroups(data), [data]);
  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  // A new result set invalidates whatever row was highlighted.
  useEffect(() => setActive(-1), [items]);

  // Pointer-down outside closes; click would fire after a row's navigation.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const showPanel =
    open && debounced.trim().length >= MIN_SUGGEST_LENGTH && groups.length > 0;

  function go(url: string) {
    setOpen(false);
    router.visit(url);
    onSubmitted?.();
  }

  function submit() {
    const q = phrase.trim();
    if (!q) return;
    setOpen(false);
    router.get(searchShow({ q }));
    onSubmitted?.();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showPanel) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      // -1 is the input itself, so the ring runs input → rows → input.
      setActive((i) => {
        const next = i + step;
        if (next < -1) return items.length - 1;
        if (next >= items.length) return -1;
        return next;
      });
      return;
    }

    if (event.key === "Enter") {
      const item = items[active];
      if (item) {
        event.preventDefault();
        go(item.url);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Search className="pointer-events-none absolute left-0 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={phrase}
          onChange={(event) => {
            setPhrase(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 && items[active] ? `${listId}-${items[active].id}` : undefined
          }
          className="label-caps h-9 w-36 rounded-none border-0 border-b bg-transparent pl-6 shadow-none transition-[width,border-color] duration-(--motion-base) ease-(--motion-ease) placeholder:label-caps placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-0 md:w-40 md:focus:w-56"
        />
      </form>

      {showPanel && (
        <div className="absolute left-0 top-full z-50 mt-px w-full min-w-[20rem] max-w-[calc(100vw-4rem)] border bg-background">
          <ul id={listId} role="listbox" aria-label="Search suggestions">
            {groups.map((group) => (
              <li key={group.heading}>
                <p className="label-caps border-b px-3 py-2 text-muted-foreground">
                  {group.heading}
                </p>
                <ul>
                  {group.items.map((item) => {
                    const isActive = items[active]?.id === item.id;
                    return (
                      <li key={item.id}>
                        <Link
                          id={`${listId}-${item.id}`}
                          role="option"
                          aria-selected={isActive}
                          href={item.url}
                          onClick={() => {
                            setOpen(false);
                            onSubmitted?.();
                          }}
                          onMouseEnter={() =>
                            setActive(items.findIndex((i) => i.id === item.id))
                          }
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-(--motion-fast) ease-(--motion-ease)",
                            isActive
                              ? "bg-foreground text-background"
                              : "hover:bg-ground"
                          )}
                        >
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt=""
                              aria-hidden
                              className="size-8 shrink-0 object-cover"
                            />
                          )}
                          <span className="truncate">{item.label}</span>
                          {item.detail && (
                            <span
                              className={cn(
                                "meta-caps ml-auto shrink-0",
                                isActive
                                  ? "text-background/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {item.detail}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
          <p className="sr-only" aria-live="polite">
            {data?.total ?? 0} suggestions
          </p>
        </div>
      )}
    </div>
  );
}
