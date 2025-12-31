import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, ExternalLink, Star } from "lucide-react";
import type { Product } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index: number;
  featured?: boolean;
}

export function ProductCard({ product, index, featured = false }: ProductCardProps) {
  const [showMaxsTake, setShowMaxsTake] = useState(false);
  const hasPrice = product.price && parseFloat(product.price) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className={`group overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white h-full flex flex-col ${featured ? "border-2 border-amber-300 ring-2 ring-amber-100" : "border-none"}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {featured && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 flex items-center gap-1 bg-amber-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-medium shadow-sm">
              <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-white" />
              <span className="hidden sm:inline">Featured</span>
            </div>
          )}
          <img
            src={product.image}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          {hasPrice && (
            <Badge className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 text-primary backdrop-blur-sm shadow-sm hover:bg-white text-xs md:text-sm font-bold px-2 py-0.5 md:px-3 md:py-1">
              ${parseFloat(product.price!).toFixed(2)}
            </Badge>
          )}
        </div>

        <CardHeader className="p-3 md:p-5 pb-1 md:pb-2">
          <div className="flex justify-between items-center mb-1 md:mb-2">
            <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 md:gap-1 text-amber-400">
              <PawPrint className="w-3 h-3 md:w-4 md:h-4 fill-current" />
              <span className="text-xs md:text-sm font-semibold text-gray-700">{parseFloat(product.rating).toFixed(1)}</span>
            </div>
          </div>
          <h3 className="font-heading text-sm md:text-xl font-bold text-gray-800 leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {product.title}
          </h3>
        </CardHeader>

        <CardContent className="p-3 md:p-5 pt-1 md:pt-2 flex-grow relative">
          <p className="text-gray-500 text-[11px] md:text-sm mb-2 md:mb-4 line-clamp-1 sm:line-clamp-2">{product.description}</p>
          
          {/* Max's Take - Interactive Paw */}
          <div className="relative">
            <button
              onClick={() => setShowMaxsTake(!showMaxsTake)}
              onMouseEnter={() => setShowMaxsTake(true)}
              onMouseLeave={() => setShowMaxsTake(false)}
              className="relative bg-primary text-white p-1.5 md:p-2.5 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110 cursor-pointer"
              aria-label="See what Max says"
              data-testid={`paw-button-${product.id}`}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              >
                <PawPrint className="w-3 h-3 md:w-4 md:h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showMaxsTake && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 right-0 mb-2 z-20"
                >
                  <div className="bg-blue-50 rounded-lg md:rounded-xl p-2 md:p-4 border border-blue-200 shadow-lg">
                    <p className="text-[10px] md:text-sm text-blue-900 italic leading-relaxed line-clamp-3 md:line-clamp-none">
                      "<span className="font-semibold not-italic">Max:</span> {product.maxsTake}"
                    </p>
                  </div>
                  <div className="absolute left-3 md:left-4 bottom-0 transform translate-y-1/2 rotate-45 w-2 h-2 md:w-3 md:h-3 bg-blue-50 border-r border-b border-blue-200"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>

        <CardFooter className="p-3 md:p-5 pt-0">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-blue-400 hover:to-blue-500 text-white font-semibold md:font-bold shadow-lg hover:shadow-blue-200 transition-all h-9 md:h-12 rounded-lg md:rounded-xl group/btn text-xs md:text-base"
            size="lg"
            onClick={() => window.open(product.amazonUrl, '_blank')}
            data-testid={`buy-button-${product.id}`}
          >
            Buy on Amazon
            <ExternalLink className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
