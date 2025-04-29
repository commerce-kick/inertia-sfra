import { Trash, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "../ui/image";
import type { TItem } from "@/types/wishlist";

export function WishlistItem({ item }: { item: TItem }) {

  return (
    <Card className="overflow-hidden border-2 shadow-sm hover:shadow-md transition-shadow py-0">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-md border overflow-hidden bg-muted/50">
              <Image
                src={item.imageObj?.small[0].absURL || "/placeholder.svg"}
                alt={item.imageObj?.alt || item.name}
                className="object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-medium line-clamp-2">{item.name}</h3>
                {item.available ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-600 hover:bg-green-50"
                  >
                    In Stock
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-500 hover:bg-red-50"
                  >
                    Out of Stock
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ID: {item.pid}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {item.availability.messages.map((message, index) => (
                <p key={index} className="text-muted-foreground">
                  {message}
                </p>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-end gap-2">
              <span className="font-medium text-lg">
                {item.priceObj.sales.formatted}
              </span>
            {/*   {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {item.priceObj.list.formatted}
                </span>
              )} */}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-3 bg-muted/10">
        <Button variant="outline" size="sm" className="gap-1">
          <Trash className="h-3.5 w-3.5" />
          <span>Remove</span>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-1"
            disabled={!item.available}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Add to Cart</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
