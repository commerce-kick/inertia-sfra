import { usePage } from "@inertiajs/react";

/**
 * Skeleton stub — live props inspector while the server contract lands.
 * Replaced by the real PLP in the storefront build phase.
 */
export default function Show() {
  const { props } = usePage();

  return (
    <pre className="overflow-auto p-4 text-xs">
      {JSON.stringify(props, null, 2)}
    </pre>
  );
}
