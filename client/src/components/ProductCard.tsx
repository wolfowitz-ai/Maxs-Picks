import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, ExternalLink, Star } from "lucide-react";
import type { Product } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index: number;
  featured?: boolean;
}

export function ProductCard({ product, index, featured = false }: ProductCardProps) {
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
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
              <Star className="w-3 h-3 fill-white" />
              Featured
            </div>
          )}
          <img
            src={product.image}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className="absolute top-3 right-3 bg-white/90 text-primary backdrop-blur-sm shadow-sm hover:bg-white text-sm font-bold px-3 py-1">
            ${parseFloat(product.price).toFixed(2)}
          </Badge>
        </div>

        <CardHeader className="p-5 pb-2">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              {product.category}
            </Badge>
            <div className="flex items-center gap-1 text-amber-400">
              <PawPrint className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold text-gray-700">{parseFloat(product.rating).toFixed(1)}</span>
              <span className="text-xs text-gray-400">({product.reviews})</span>
            </div>
          </div>
          <h3 className="font-heading text-xl font-bold text-gray-800 leading-tight group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </CardHeader>

        <CardContent className="p-5 pt-2 flex-grow">
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
          
          {/* Max's Take Section */}
          <div className="bg-blue-50/80 rounded-xl p-4 relative border border-blue-100 mt-auto">
            <div className="absolute -top-3 left-4 bg-primary text-white p-1.5 rounded-full shadow-sm">
              <PawPrint className="w-3 h-3" />
            </div>
            <p className="text-sm text-blue-900 italic leading-relaxed">
              "<span className="font-semibold not-italic">Max says:</span> {product.maxsTake}"
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-blue-400 hover:to-blue-500 text-white font-bold shadow-lg hover:shadow-blue-200 transition-all h-12 rounded-xl group/btn"
            size="lg"
            onClick={() => window.open(product.amazonUrl, '_blank')}
          >
            Buy on Amazon
            <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
