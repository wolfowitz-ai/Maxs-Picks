import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilter } from "@/components/ProductFilter";
import { useProducts, useFeaturedProducts } from "@/lib/api";
import { PawPrint, Menu, Lock, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutSettings {
  featuredColumns: number;
  featuredTotal: number;
  curatedColumns: number;
  curatedTotal: number;
}

const DEFAULT_LAYOUT: LayoutSettings = {
  featuredColumns: 4,
  featuredTotal: 4,
  curatedColumns: 4,
  curatedTotal: 8,
};

function getLayoutSettings(): LayoutSettings {
  try {
    const saved = localStorage.getItem("layoutSettings");
    return saved ? { ...DEFAULT_LAYOUT, ...JSON.parse(saved) } : DEFAULT_LAYOUT;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export default function Home() {
  const [category, setCategory] = useState("All");
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT);
  const { data: products, isLoading, error } = useProducts(category);
  const { data: allFeaturedProducts } = useFeaturedProducts();

  useEffect(() => {
    setLayoutSettings(getLayoutSettings());
    
    const handleStorage = () => setLayoutSettings(getLayoutSettings());
    window.addEventListener("storage", handleStorage);
    
    const checkLayoutUpdates = () => setLayoutSettings(getLayoutSettings());
    const interval = setInterval(checkLayoutUpdates, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const featuredProducts = allFeaturedProducts?.slice(0, layoutSettings.featuredTotal) || [];
  const curatedProducts = products?.slice(0, layoutSettings.curatedTotal) || [];

  const getGridClass = (columns: number) => {
    switch (columns) {
      case 2: return "grid-cols-1 sm:grid-cols-2";
      case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      case 5: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
      case 6: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
      default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <PawPrint className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-xl text-gray-900 tracking-tight">
              Max's<span className="text-primary">Picks</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Home</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Categories</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">About Max</a>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <a href="#" className="text-lg font-medium">Home</a>
                  <a href="#" className="text-lg font-medium">Categories</a>
                  <a href="#" className="text-lg font-medium">About Max</a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <main className="pb-20">
        <Hero />
        
        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="container mx-auto px-4 mt-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4 fill-amber-500" />
                Max's Favorites
              </div>
              <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-500">Hand-picked favorites that Max absolutely loves.</p>
            </div>
            
            <div className={`grid ${getGridClass(layoutSettings.featuredColumns)} gap-6`}>
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} featured />
              ))}
            </div>
          </div>
        )}

        {/* Curated With Love Section */}
        <div className="container mx-auto px-4 mt-12">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">Curated With Love</h2>
            <p className="text-gray-500">Only the best for the goodest boys and girls.</p>
          </div>

          <ProductFilter currentCategory={category} onSelectCategory={setCategory} />
          
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 bg-white rounded-3xl border border-red-200">
              <p className="text-red-500 text-lg">Failed to load products. Please try again.</p>
            </div>
          )}

          {!isLoading && !error && curatedProducts && (
            <>
              <div className={`grid ${getGridClass(layoutSettings.curatedColumns)} gap-6`}>
                {curatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
              
              {curatedProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-lg">No products found in this category yet!</p>
                  <Button variant="link" onClick={() => setCategory("All")} className="mt-2 text-primary">
                    View all products
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
            <PawPrint className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-sm mb-4">
            © 2024 Max's Top Picks. All rights reserved.<br/>
            Prices and availability subject to change. As an Amazon Associate I earn from qualifying purchases.
          </p>
          <Link href="/admin">
            <Button variant="link" size="sm" className="text-xs text-gray-300 hover:text-gray-500 gap-1">
              <Lock className="w-3 h-3" />
              Admin Access
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
