import { CategoryCard } from "@/components/commerce/category-card";
import { Section } from "@/components/commerce/section";
import type { CategoryShowcaseEntry } from "@/types/home";

/** The eager category grid — the one commerce block present at first paint. */
function CollectionsGrid({
  categories,
}: {
  categories: CategoryShowcaseEntry[];
}) {
  return (
    <Section
      title="Collections"
      meta={`${categories.length} lines · eager`}
      className="pt-12"
      rule={false}
      reveal
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </Section>
  );
}

export { CollectionsGrid };
