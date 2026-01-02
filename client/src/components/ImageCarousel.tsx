import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  aspectRatio?: "square" | "4/3" | "none";
  maxHeight?: string;
}

function generateResponsiveSrcSet(imageUrl: string): { srcSet: string; sizes: string } | null {
  if (!imageUrl.includes('media-amazon.com') && !imageUrl.includes('images-amazon.com')) {
    return null;
  }
  
  const simpleModifierPattern = /\._SL[0-9]{3,4}_\./i;
  if (!simpleModifierPattern.test(imageUrl)) {
    return null;
  }
  
  const sizes = [400, 600, 800, 1000, 1500];
  const srcSetParts = sizes.map(size => {
    const modifiedUrl = imageUrl.replace(simpleModifierPattern, `._SL${size}_.`);
    return `${modifiedUrl} ${size}w`;
  });
  
  return {
    srcSet: srcSetParts.join(', '),
    sizes: '(max-width: 640px) 400px, (max-width: 1024px) 600px, 800px'
  };
}

export function ImageCarousel({ 
  images, 
  alt, 
  className = "",
  showArrows = false,
  showDots = true,
  aspectRatio = "square",
  maxHeight
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

  const containerStyle = maxHeight ? { maxHeight } : undefined;
  const aspectClass = aspectRatio === "square" 
    ? "aspect-square" 
    : aspectRatio === "4/3" 
      ? "aspect-[4/3]" 
      : "";
  const useAspectRatio = aspectRatio !== "none";

  if (images.length === 0) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${aspectClass} ${className}`}
        style={containerStyle}
      >
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  if (images.length === 1) {
    const responsive = generateResponsiveSrcSet(images[0]);
    return (
      <div 
        className={`overflow-hidden bg-gray-50 flex items-center justify-center ${useAspectRatio ? aspectClass : 'h-full'} ${className}`}
        style={containerStyle}
      >
        <img 
          src={images[0]} 
          alt={alt} 
          srcSet={responsive?.srcSet}
          sizes={responsive?.sizes}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  const heightStyle = useAspectRatio ? containerStyle : { height: '100%', ...containerStyle };

  return (
    <div className={`relative group ${useAspectRatio ? aspectClass : ''} ${className}`} style={heightStyle}>
      <div className="overflow-hidden" style={{ height: '100%' }} ref={emblaRef}>
        <div className="flex" style={{ height: '100%' }}>
          {images.map((image, index) => {
            const responsive = generateResponsiveSrcSet(image);
            return (
              <div 
                key={index} 
                className="flex-[0_0_100%] min-w-0 bg-gray-50 flex items-center justify-center"
                style={{ height: '100%' }}
              >
                <img
                  src={image}
                  alt={`${alt} - Image ${index + 1}`}
                  srcSet={responsive?.srcSet}
                  sizes={responsive?.sizes}
                  style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
                  draggable={false}
                  loading="lazy"
                />
              </div>
            );
          })}
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
