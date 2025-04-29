import type { TItem } from "@/types/wishlist";

export default function LineItem({ item }: { item: TItem }) {
  return (
    <div key={item.id} className="flex gap-4">
      <div className="relative h-24 w-24 rounded-md overflow-hidden border bg-muted/40">
        <img
          src={item.imageObj.small[0].absURL || "/placeholder.svg"}
          alt={item.imageObj.small[0].alt}
          className="object-cover h-full w-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {item.priceObj.sales.formatted}
        </p>
      </div>
    </div>
  );
}
