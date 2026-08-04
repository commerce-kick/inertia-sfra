import { Barcode } from "@/components/commerce/barcode";
import { Link } from "@/components/link";
import type { CategoryShowcaseEntry } from "@/types/home";
import { ArrowRight } from "lucide-react";

/**
 * A category as an oversized kraft ticket: notched edges, the name in
 * stamped caps, its ID as the barcode. Image when Business Manager
 * provides one, plain ticket stock otherwise.
 */
export function CategoryCard({ category }: { category: CategoryShowcaseEntry }) {
  return (
    <Link
      href={category.url}
      className="group ticket-notch relative flex min-h-44 flex-col justify-between overflow-hidden bg-secondary p-6 text-secondary-foreground shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      {category.image && (
        <img
          src={category.image.url}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-25 transition-opacity duration-300 group-hover:opacity-40"
        />
      )}
      <div className="relative flex items-start justify-between gap-4">
        <h3 className="stamp-display text-3xl leading-none">{category.name}</h3>
        <ArrowRight className="mt-1 size-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
      </div>
      <div className="relative flex items-end justify-between gap-4">
        <span className="ticket-caps text-xs opacity-80">
          Ver la colección
        </span>
        <Barcode value={category.id} className="w-20 opacity-50" />
      </div>
    </Link>
  );
}
