import { CollectionsGrid } from "@/components/commerce/home/collections-grid";
import { Hero } from "@/components/commerce/home/hero";
import { MarqueeStrip } from "@/components/commerce/home/marquee-strip";
import { ShowcaseRows } from "@/components/commerce/home/showcase-rows";
import { StackSection } from "@/components/commerce/home/stack-section";
import type { HomeShowProps } from "@/types/home";
import { Head, usePage } from "@inertiajs/react";

export default function Show() {
  const { categoryShowcase, showcases, locale } =
    usePage<HomeShowProps>().props;
  const [firstCategory, secondCategory] = categoryShowcase;

  return (
    <>
      <Head title="Meridian — storefront" />

      <Hero
        firstCategory={firstCategory}
        secondCategory={secondCategory}
        categoryCount={categoryShowcase.length}
        locale={locale}
      />

      <MarqueeStrip />

      <CollectionsGrid categories={categoryShowcase} />

      <ShowcaseRows categories={categoryShowcase} showcases={showcases} />

      {/* THE STACK — the honest pitch to the storefront's real audience */}
      <StackSection resolved={showcases !== undefined} />
    </>
  );
}
