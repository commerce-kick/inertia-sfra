import { Link } from "@/components/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { homeShow } from "@/generated/routes/home-show";
import type { Crumb } from "@/types/product";
import { Fragment } from "react";

/** The category path the base PDP carries, rooted at Home. */
function ProductBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
<Breadcrumb>
  <BreadcrumbList className="meta-caps">
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link href={homeShow({})}>Home</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    {crumbs.map((crumb) => (
      <Fragment key={crumb.htmlValue}>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {crumb.url ? (
            <BreadcrumbLink asChild>
              <Link href={crumb.url}>{crumb.htmlValue}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{crumb.htmlValue}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
      </Fragment>
    ))}
  </BreadcrumbList>
</Breadcrumb>
  );
}

export { ProductBreadcrumbs };
