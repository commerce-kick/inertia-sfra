import useProductVariation from "@/hooks/useProductVariation";
import { cn } from "@/lib/utils";
import { Product } from "@/types/productFactory";
import { useCallback, useMemo } from "react";

export default function TileSwatch({
  variationAttributes,
}: {
  variationAttributes: Product["variationAttributes"];
}) {
  const { mutate } = useProductVariation();

  const values = useMemo(() => {
    return variationAttributes?.[0]?.values || [];
  }, [variationAttributes]);

  const handleOnClick = useCallback((url: string) => {
    mutate(url);
  }, []);

  return (
    <div className="flex-row flex gap-4">
      {values
        .filter((s) => !s.images)
        .map((swatch, index) => {
          return (
            <button
              onClick={() => {
                handleOnClick(swatch.url);
              }}
              key={index}
            >
              <img
                className={cn(["rounded-full w-4 aspect-square select-none"])}
                src={
                  swatch.images?.swatch?.[0]?.url
                    ? ""
                    : swatch.images?.swatch?.[0]?.url
                }
              />
            </button>
          );
        })}
    </div>
  );
}
