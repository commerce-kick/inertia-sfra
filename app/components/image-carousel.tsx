import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { LazyLoadImage } from "react-lazy-load-image-component";

export function ImageCarousel({
  images,
}: {
  images: { src: string; width?: string; height?: string; alt?: string }[];
}) {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <LazyLoadImage
              className="w-full"
              alt={image.alt}
              height={image.height}
              src={image.src} // use normal <img> attributes as props
              width={image.width}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div>
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  );
}
