import { Section } from "@/components/commerce/section";
import type { PageShowProps } from "@/types/page";
import { Head, usePage } from "@inertiajs/react";

/**
 * A content asset.
 *
 * The body is markup a merchant authored in Business Manager, so it is
 * rendered as markup — under `cms-body`, the same voice the size chart's
 * authored fragment gets, which is what keeps someone else's HTML inside this
 * design system rather than beside it.
 */
export default function Show() {
  const { content } = usePage<PageShowProps>().props;

  return (
    <>
      <Head title={`${content.pageTitle || content.name} — Meridian`} />

      <Section title={content.name} titleAs="h1" className="pb-24">
        {content.body ? (
          <div
            className="cms-body max-w-2xl"
            // Server-authored content asset body (Business Manager content).
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        ) : (
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            This page has no content yet.
          </p>
        )}
      </Section>
    </>
  );
}
