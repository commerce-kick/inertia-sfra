import { InertiaLinkProps, Link as InLink } from "@inertiajs/react";
export function Link({ prefetch = "hover", ...props }: InertiaLinkProps) {
  return <InLink prefetch={prefetch} {...props} />;
}
