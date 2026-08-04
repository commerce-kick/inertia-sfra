import { Link } from "@/components/link";
import type { CategoryShowcaseEntry } from "@/types/home";
import { ArrowRight, Package, Watch } from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof Watch> = {
  relojes: Watch,
  accesorios: Package,
};

/**
 * Category card: clean bordered card with a tinted icon plate, category
 * name, and a link affordance that slides on hover.
 */
export function CategoryCard({ category }: { category: CategoryShowcaseEntry }) {
  const Icon = CATEGORY_ICONS[category.id] ?? Package;

  return (
    <Link
      href={category.url}
      className="group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      {category.image && (
        <img
          src={category.image.url}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-10 transition-opacity duration-200 group-hover:opacity-20"
        />
      )}
      <div className="relative flex items-start justify-between gap-4">
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <div className="relative flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold tracking-tight">
            {category.name}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-link">
            Ver la colección
            <ArrowRight
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
