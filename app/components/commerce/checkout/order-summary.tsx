import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CheckoutResponse } from "@/types/response/checkout"

type OrderSummaryProps = {
  order: CheckoutResponse["order"]
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  if (!order) return null

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {order.items.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                <img
                  src={item.images.small[0].absURL || "/placeholder.svg?height=80&width=80"}
                  alt={item.images.small[0].alt}
                  className="object-cover h-full w-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-2">{item.productName}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.price.sales.formatted}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm">Qty: {item.quantity}</span>
                </div>
              </div>
              <div className="text-sm font-medium">{item.priceTotal.price}</div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{order.totals.subTotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{order.totals.totalShippingCost}</span>
        </div>
        {order.totals.totalTax !== "$0.00" && (
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{order.totals.totalTax}</span>
          </div>
        )}
        {order.totals.orderLevelDiscountTotal.value > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{order.totals.orderLevelDiscountTotal.formatted}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{order.totals.grandTotal}</span>
        </div>
      </div>
    </div>
  )
}
