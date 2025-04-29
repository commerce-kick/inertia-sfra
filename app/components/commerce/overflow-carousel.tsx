import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ReactNode } from "react";

export function EmblaCarousel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [emblaRef] = useEmblaCarousel();

  return (
    <div className={cn("container px-0 overflow-hidden", className)} ref={emblaRef}>
      {children}
    </div>
  );
}
