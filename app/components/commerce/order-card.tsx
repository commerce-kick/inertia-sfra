import { format } from "date-fns"
import { Package, ExternalLink, Calendar, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Image from "../ui/image"
import type { OrderCardProps } from "@/types/order"


export function OrderCard({ order, resources }: OrderCardProps) {
  // Format the date
  const orderDate = new Date(order.creationDate)
  const formattedDate = format(orderDate, "MMM d, yyyy")

  // Determine if we should use singular or plural for items
  const itemText = order.productQuantityTotal === 1 ? resources.item : resources.items

  return (
    <Card className="overflow-hidden border-2 shadow-sm hover:shadow-md transition-shadow py-0">
      <CardHeader className="bg-muted/30 pb-2 pt-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-medium">Order #{order.orderNumber}</span>
            <Badge variant="outline" className="ml-2">
              {order.orderStatus?.label || "Processing"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          {order.firstLineItem && (
            <div className="flex-shrink-0">
              <div className="relative h-20 w-20 rounded-md border overflow-hidden bg-muted/50">
                <Image
                  src={order.firstLineItem.imageURL || "/placeholder.svg"}
                  alt={order.firstLineItem.alt}
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-medium line-clamp-1">{order.firstLineItem?.title || "Order Items"}</h3>
              <p className="text-sm text-muted-foreground">
                {order.productQuantityTotal} {itemText}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{order.orderEmail}</span>
              </div>

              <div className="text-muted-foreground">
                Shipped to: {order.shippedToFirstName} {order.shippedToLastName}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 flex flex-col items-end justify-between">
            <div className="font-medium text-lg">{order.priceTotal}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-3 bg-muted/10">
        <Button variant="outline" size="sm">
          Track Order
        </Button>
        <Button variant="default" size="sm" className="gap-1">
          <span>View Details</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}

