import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useProduct, useCategories } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { PawPrint, ExternalLink, ArrowLeft, Loader2, Menu, Lock, Bone, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { ImageCarousel } from "@/components/ImageCarousel";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id || "");
  const { data: categories } = useCategories();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const getCategoryIcon = (categoryName: string) => {
    const category = categories?.find(c => c.name === categoryName);
    return category?.icon || "package";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="bg-primary text-white p-2 rounded-lg">
                  <PawPrint className="w-5 h-5" />
                </div>
                <span className="font-heading font-bold text-xl text-gray-900 tracking-tight">
                  Max's<span className="text-primary">Picks</span>
                </span>
              </div>
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-500 mb-6">Sorry, we couldn't find the product you're looking for.</p>
            <Link href="/">
              <Button className="gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasPrice = product.price && parseFloat(product.price) > 0;
  
  const allImages = [
    product.image,
    ...(product.images || [])
  ].filter((img, index, arr) => img && arr.indexOf(img) === index) as string[];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-primary text-white p-2 rounded-lg">
                <PawPrint className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-xl text-gray-900 tracking-tight">
                Max's<span className="text-primary">Picks</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Home</Link>
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Categories</Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">About Max</Link>
            <Link href="/admin">
              <Button variant="ghost" size="icon" title="Admin">
                <Lock className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="text-lg font-medium">Home</Link>
                  <Link href="/products" className="text-lg font-medium">Categories</Link>
                  <Link href="/about" className="text-lg font-medium">About Max</Link>
                  <Link href="/admin" className="text-lg font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Admin
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 md:py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2 text-gray-600 hover:text-primary" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl md:rounded-3xl shadow-lg overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative bg-gray-50 h-[300px] md:h-[500px] overflow-hidden">
              {product.featured && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                  <Bone className="w-4 h-4" />
                  Featured
                </div>
              )}
              <ImageCarousel
                images={allImages}
                alt={product.title}
                showDots={allImages.length > 1}
                showArrows={allImages.length > 1}
                maxHeight="100%"
                className="h-full"
              />
            </div>

            <div className="p-6 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1 text-amber-400">
                  <PawPrint className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold text-gray-700">{parseFloat(product.rating).toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-400">({product.reviews.toLocaleString()} reviews)</span>
              </div>

              <h1 className="font-heading text-2xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="text-product-title">
                {product.title}
              </h1>

              <div className="flex items-center gap-4 mb-6 flex-wrap">
                {hasPrice && (
                  <span className="text-3xl md:text-4xl font-bold text-primary" data-testid="text-product-price">
                    ${parseFloat(product.price!).toFixed(2)}
                  </span>
                )}
                <Button
                  className="bg-gradient-to-r from-primary to-blue-400 hover:to-blue-500 text-white font-semibold shadow-md hover:shadow-blue-200 transition-all h-10 px-4 rounded-lg text-sm group"
                  onClick={() => window.open(product.amazonUrl, '_blank')}
                  data-testid="button-buy-amazon"
                >
                  Buy on Amazon
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6" data-testid="text-product-description">
                {product.description}
              </p>

              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-primary text-white p-1.5 rounded-full">
                    <PawPrint className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-blue-900">Max's Take</span>
                </div>
                <p className="text-blue-800 italic leading-relaxed" data-testid="text-maxs-take">
                  "{product.maxsTake}"
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
