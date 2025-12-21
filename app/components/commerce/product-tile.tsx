import { Link } from "@/components/link";
import { ProductShow, WishlistAddProduct } from "@/generated/routes";
import { cn } from "@/lib/utils";
import { IProductTileData } from "@/types/data/ProductTileData";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Heart, Star } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Image from "../ui/image";

export default function ProductTile({
  images,
  productName,
  id,
  isBundle,
  className,
}: IProductTileData & {
  isBundle?: boolean;
  className?: string;
}) {
  const { mutate } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.postForm(WishlistAddProduct.url(), {
        pid: id,
        optionId: null,
        optionVal: null,
      });

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

  const hasDiscount = 0;
  const discountPercentage = 0;

  return (
    <div className={cn("group space-y-3", className)}>
      <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square relative">
        <Image
          src={images?.large?.[0]?.absURL || "placeholder.svg"}
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
        <Link href={ProductShow.url({ params: { pid: id } })}>
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
                  className={`h-4 w-4 ${
                    i < Math.floor(1)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
          </div>
          <div
            className={cn(
              "flex items-center gap-2",
              isBundle && "line-through"
            )}
          >
            <span className="font-semibold">{0}</span>
            {hasDiscount && (
              <>
                <span className="text-gray-400 line-through text-sm">{0}</span>
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
