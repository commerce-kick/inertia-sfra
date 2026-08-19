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

/** The collection title at architectural scale, with its breadcrumb and count. */
function SearchHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="border-b">
      <div className="container flex flex-col gap-5 pb-8 pt-10">
        <Breadcrumb>
          <BreadcrumbList className="meta-caps">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={homeShow({})}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="display-caps text-[clamp(2.75rem,7vw,6rem)]">
            {title}
          </h1>
          <span className="meta-caps pb-2 text-muted-foreground">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>
      </div>
    </div>
  );
}

export { SearchHeader };
