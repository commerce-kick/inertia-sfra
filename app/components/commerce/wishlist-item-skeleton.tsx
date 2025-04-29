import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function WishlistItemSkeleton() {
  return (
    <Card className="overflow-hidden border-2 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image Skeleton */}
          <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-md flex-shrink-0" />

          {/* Product Details Skeleton */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-3 bg-muted/10">
        <Skeleton className="h-9 w-24 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  )
}

