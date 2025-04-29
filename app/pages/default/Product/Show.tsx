"use client";

import { Fragment, useCallback, useState, useEffect, memo } from "react";
import { Link } from "@inertiajs/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ArrowLeft,
  Share2,
  Info,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Layout from "@/layouts/default";
import { ImageCarousel } from "@/components/image-carousel";
import VariationAttributes from "@/components/commerce/variation-attributes";
import ProductTile from "@/components/commerce/product-tile";
import type { Product } from "@/types/productFactory";
import { cart$ } from "@/state/cart";
import useProductVariation from "@/hooks/useProductVariation";
import type { ProductShowProps } from "@/types/response/product-show";
import { Cart_AddProduct, getUrl, Home_Show } from "@/generated/routes";
import EinsteinRecs from "@/components/commerce/einstein-recs";
import { EmblaCarousel } from "@/components/commerce/overflow-carousel";

// Componente para mostrar el rating con estrellas
const ProductRating = memo(({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
    </div>
  );
});
ProductRating.displayName = "ProductRating";

// Componente para mostrar el precio
const ProductPrice = memo(({ price }: { price: Product["price"] }) => {
  return (
    <div className="flex items-center gap-2">
      <p className="text-2xl font-semibold">{price.sales?.formatted}</p>
      {price.list && (
        <div className="flex items-center gap-2">
          <p className="text-lg text-muted-foreground line-through">
            {price.list.formatted}
          </p>
          <Badge variant="destructive" className="rounded-md">
            Sale
          </Badge>
        </div>
      )}
    </div>
  );
});
ProductPrice.displayName = "ProductPrice";

// Componente para mostrar el estado de stock
const StockStatus = memo(({ isInStock }: { isInStock: boolean }) => {
  return isInStock ? (
    <Badge
      variant="outline"
      className="bg-green-50 text-green-700 border-green-200"
    >
      <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
      In Stock
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-amber-50 text-amber-700 border-amber-200"
    >
      <div className="h-2 w-2 rounded-full bg-amber-500 mr-1.5"></div>
      Limited Stock
    </Badge>
  );
});
StockStatus.displayName = "StockStatus";

// Componente para mostrar el indicador de carga
const LoadingIndicator = () => (
  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
);

const ProductInfo = ({ initialProduct }: { initialProduct: Product }) => {
  const [product, setProduct] = useState<Product>(initialProduct);
  const queryClient = useQueryClient();
  const { mutate, data, isPending, isError } = useProductVariation();

  // Actualizar el producto cuando cambian los datos de la variación
  useEffect(() => {
    if (data?.product) {
      setProduct(data.product);
    }
  }, [data]);

  const addToCart = useMutation({
    mutationFn: async (variables: { pid: string; quantity: string }) => {
      const { data } = await axios.postForm(getUrl(Cart_AddProduct), variables);
      return data;
    },
    onSuccess: (data) => {
      cart$.quantity.set(data.quantityTotal);
      toast.success("Product added to cart", {
        description: "Your item has been added to your shopping bag",
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add product", {
        description: "Please try again later",
      });
    },
  });

  const handleAddToCart = useCallback(
    ({ pid, quantity }: { pid: string; quantity: string }) => {
      if (!quantity || quantity === "0") {
        toast.error("Please select a quantity", {
          description: "You must select a quantity before adding to cart",
        });
        return;
      }

      addToCart.mutate({ pid, quantity });
    },
    [addToCart]
  );

  const onQuantityChange = useCallback(
    (v: string) => {
      const quantity = product.quantities?.find((q) => q.value === v);
      if (!quantity) return;
      mutate(quantity.url);
    },
    [product.quantities, mutate]
  );

  const handleVariationChange = useCallback(
    (url: string) => {
      mutate(url);
    },
    [mutate]
  );

  const quantity = product.quantities?.find((q) => q.selected);
  const isInStock = product.readyToOrder && product.available;

  // Si hay un error al cargar las variaciones
  if (isError) {
    toast.error("Failed to load product variations", {
      description: "Please try refreshing the page",
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Product Images */}
      <div className="w-full rounded-xl overflow-hidden bg-muted/30 relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="bg-background p-4 rounded-lg shadow-lg flex items-center gap-2">
              <LoadingIndicator />
              <span>Updating product...</span>
            </div>
          </div>
        )}
        {product.images?.large ? (
          <ImageCarousel
            images={product.images.large?.map((l) => ({
              src: l.absURL,
              alt: l.alt,
            }))}
          />
        ) : (
          <div className="aspect-square bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProductRating rating={product.rating} />
              <span className="text-sm text-muted-foreground">
                (24 reviews)
              </span>
            </div>
            <div className="flex gap-4 items-center">
              {isPending && <LoadingIndicator />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this product</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            {product.productName}
          </h1>

          <ProductPrice price={product.price} />

          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Item No. {product.id}
            </p>
            {product.uuid && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">UUID: {product.uuid}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          {product.variationAttributes &&
            product.variationAttributes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Options</h3>
                <VariationAttributes
                  attributes={product.variationAttributes}
                  onVariationChange={handleVariationChange}
                />
              </div>
            )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Quantity</h3>
              <StockStatus isInStock={isInStock} />
            </div>

            {product.quantities && product.quantities.length > 0 ? (
              <Select
                onValueChange={onQuantityChange}
                value={quantity?.value}
                disabled={!isInStock || isPending}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Quantity</SelectLabel>
                    {product.quantities.map((q) => (
                      <SelectItem key={`quantity-${q.value}`} value={q.value}>
                        {q.value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No quantities available
              </p>
            )}
          </div>

          <div className="flex sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                handleAddToCart({
                  pid: product.id,
                  quantity: quantity?.value || "0",
                });
              }}
              disabled={!isInStock || addToCart.isPending || isPending}
            >
              {addToCart.isPending ? (
                <LoadingIndicator />
              ) : (
                <ShoppingBag className="mr-2 h-5 w-5" />
              )}
              <span className="ml-2">Add to Cart</span>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="lg" className="flex-none">
                    <Heart className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to wishlist</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Free shipping</p>
              <p className="text-xs text-muted-foreground">
                Delivery in 2-4 business days
              </p>
            </div>
          </div>

          {product.shortDescription && (
            <div className="text-sm text-muted-foreground">
              <p>{product.shortDescription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductComponent = ({
  product,
  breadcrumbs,
  addToCartUrl,
  ...rest
}: ProductShowProps) => {  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Back button and breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href={getUrl(Home_Show)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to shopping
          </Link>
        </Button>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs?.map((bread, i) => (
                <Fragment key={bread.url}>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={bread.url}>{bread.htmlValue}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.length - 1 !== i && <BreadcrumbSeparator />}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* Product Master Info */}
      {(product.productType === "master" ||
        product.productType === "bundle" || product.productType === 'variant') && (
        <ProductInfo initialProduct={product} />
      )}

      {product.productType === "set" &&
        product.individualProducts &&
        product.individualProducts.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Product Set</h2>
            {product.individualProducts?.map((individualProduct) => (
              <div key={individualProduct.id} className="border rounded-lg p-6">
                <ProductInfo initialProduct={individualProduct} />
              </div>
            ))}
          </div>
        )}

      {/* Product Information Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {product.longDescription ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.longDescription,
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      No description available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Material</p>
                    <p className="text-sm text-muted-foreground">
                      Premium cotton blend
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Weight</p>
                    <p className="text-sm text-muted-foreground">0.5 kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Dimensions</p>
                    <p className="text-sm text-muted-foreground">
                      10 × 5 × 2 cm
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Care Instructions</p>
                    <p className="text-sm text-muted-foreground">
                      Machine wash cold
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  No reviews yet
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bundled Products */}
      {product.productType === "bundle" &&
        product.bundledProducts &&
        product.bundledProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Bundled with</h2>
              <Button variant="link" asChild>
                <Link href="#">View all</Link>
              </Button>
            </div>
            <EmblaCarousel>
              <div className="flex gap-6">
                {product.bundledProducts?.map((p) => (
                  <ProductTile
                    key={p.id}
                    className="max-w-[300px] min-w-[300px]"
                    isBundle
                    {...p}
                  />
                ))}
              </div>
            </EmblaCarousel>
          </section>
        )}

      {/* Related Products */}
      <EinsteinRecs pid={product.id} recomender="pdp-similar-items" />
    </div>
  );
};

ProductComponent.layout = (page: any) => <Layout children={page} />;

export default ProductComponent;
