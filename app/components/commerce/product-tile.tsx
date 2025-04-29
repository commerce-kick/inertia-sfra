import type { Product } from "@/types/productFactory";
import { Heart, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Image from "../ui/image";
import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  createRouteHelpers,
  getUrl,
  Product_Show,
  Wishlist_AddProduct,
} from "@/generated/routes";

export default function ProductTile({
  images,
  productName,
  price,
  selectedProductUrl,
  variationAttributes,
  rating,
  id,
  isBundle,
  className,
  ...rest
}: Product & {
  isBundle?: boolean;
  className?: string;
}) {
  const routes = createRouteHelpers({
    "Product-Show": Product_Show,
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.postForm(getUrl(Wishlist_AddProduct), {
        pid: id,
        optionId: null,
        optionVal: null,
      });

      console.log(data);
      return data;
    },
    onSuccess: () => {
      toast.success("Product Added");
    },
    onError: console.log,
  });

  const handleAddToWish = useCallback(() => {
    mutate({});
  }, []);

  const hasDiscount = price.list?.value && price.sales?.value;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((Number(price.list?.value) - Number(price.sales?.value)) /
          Number(price.list?.value)) *
          100
      )
    : 0;

  return (
    <div className={cn('group space-y-3', className)}>
      <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square relative">
        <Image
          src={images.large?.[0].absURL}
          alt={productName}
          width={300}
          height={300}
          className="object-cover w-full aspect-square group-hover:scale-105 transition-transform"
        />
        {isBundle && (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-500 border-red-100 absolute top-2 left-2"
          >
            Included in bundle
          </Badge>
        )}
      </div>
      <h3 className="font-medium truncate pr-4">
        <Link href={routes.url("Product-Show", { pid: id })}>
          {productName}
        </Link>
      </h3>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-1 my-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                />
              ))}
          </div>
          <div
            className={cn(
              "flex items-center gap-2",
              isBundle && "line-through"
            )}
          >
            <span className="font-semibold">{price.sales?.formatted}</span>
            {hasDiscount && (
              <>
                <span className="text-gray-400 line-through text-sm">
                  {price.list?.formatted}
                </span>
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-500 border-red-100"
                >
                  {discountPercentage}%
                </Badge>
              </>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => handleAddToWish()} size="icon">
          <Heart />
        </Button>
      </div>
    </div>
  );
}
