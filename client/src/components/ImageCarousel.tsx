import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  aspectRatio?: "square" | "4/3";
}

export function ImageCarousel({ 
  images, 
  alt, 
  className = "",
  showArrows = false,
  showDots = true,
  aspectRatio = "square"
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (images.length === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${aspectRatio === "square" ? "aspect-square" : "aspect-[4/3]"} ${className}`}>
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={`overflow-hidden ${aspectRatio === "square" ? "aspect-square" : "aspect-[4/3]"} ${className}`}>
        <img 
          src={images[0]} 
          alt={alt} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`flex-[0_0_100%] min-w-0 ${aspectRatio === "square" ? "aspect-square" : "aspect-[4/3]"}`}
            >
              <img
                src={image}
                alt={`${alt} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {showArrows && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                emblaApi?.scrollTo(index); 
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex 
                  ? "bg-white shadow-md scale-110" 
                  : "bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
