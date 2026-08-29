import type { IProductDetailData } from "@/generated/data";
import { cn } from "@/lib/utils";

/**
 * Stock state as a square dot plus the reason. Signal Red is licensed here by
 * DESIGN.md's One Red Rule — out-of-stock is exactly what it is reserved for.
 */
function ProductAvailability({
  availability,
  className,
}: {
  availability: IProductDetailData["availability"];
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "size-2 shrink-0",
          availability.available ? "bg-foreground" : "bg-destructive"
        )}
        aria-hidden
      />
      <span className="text-sm text-muted-foreground">
        {availability.available
          ? "In stock"
          : availability.messages[0] || "Unavailable"}
      </span>
    </div>
  );
}

export { ProductAvailability };
