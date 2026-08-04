import type { Page, PageProps } from "@inertiajs/core";

/** One nav category from the shareData middleware. */
export type NavCategory = {
  id: string;
  name: string;
  url: string;
  subCategories?: NavCategory[];
};

/** Props every page receives (shareData middleware + initInertia errors). */
export interface SharedProps extends PageProps {
  auth: {
    user: { firstName: string; lastName: string; email: string } | null;
  };
  locale: string;
  navBar: { categories?: NavCategory[] };
  errors: Record<string, string>;
}

/**
 * The adapter emits flash as a top-level page key (not a prop) — cast
 * usePage() through this to read it.
 */
export type PageWithFlash<P extends SharedProps = SharedProps> = Page<P> & {
  flash?: Record<string, string>;
};

/** Wire shape of a res.inertia.scroll() paginator prop. */
export type ScrollPaginator<T> = {
  data: T[];
  meta: {
    pageName: string;
    previousPage: number | null;
    nextPage: number | null;
    currentPage: number;
  };
};
