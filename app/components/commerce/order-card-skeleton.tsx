import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function OrderCardSkeleton() {
  return (
    <Card className="overflow-hidden border-2 shadow-sm">
      <CardHeader className="bg-muted/30 pb-2 pt-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20 ml-2 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image Skeleton */}
          <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />

          {/* Order Details Skeleton */}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />

            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Price Skeleton */}
          <div className="flex-shrink-0">
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-3 bg-muted/10">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </CardFooter>
    </Card>
  )
}

