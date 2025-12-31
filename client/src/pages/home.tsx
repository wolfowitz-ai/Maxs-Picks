import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilter } from "@/components/ProductFilter";
import { Footer } from "@/components/Footer";
import { useProducts, useFeaturedProducts } from "@/lib/api";
import { PawPrint, Menu, Lock, Loader2, Bone, Search, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
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

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const filteredFeatured = useMemo(() => {
    if (!allFeaturedProducts) return [];
    if (!searchQuery.trim()) return allFeaturedProducts;
    
    const query = searchQuery.toLowerCase();
    return allFeaturedProducts.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }, [allFeaturedProducts, searchQuery]);

  const featuredProducts = filteredFeatured.slice(0, layoutSettings.featuredTotal);
  const curatedProducts = filteredProducts.slice(0, layoutSettings.curatedTotal);

  const getGridClass = (columns: number) => {
    switch (columns) {
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-2 lg:grid-cols-4";
      case 5: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
      case 6: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
      default: return "grid-cols-2 lg:grid-cols-4";
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 w-64"
                    autoFocus
                    data-testid="input-search"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <a href="/" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Home</a>
                <a href="/products" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Categories</a>
                <a href="/about" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">About Max</a>
                <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)} data-testid="button-search">
                  <Search className="w-4 h-4" />
                </Button>
                <a href="/admin">
                  <Button variant="ghost" size="icon" title="Admin">
                    <Lock className="w-4 h-4" />
                  </Button>
                </a>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
              <Search className="w-5 h-5" />
            </Button>
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <a href="/" className="text-lg font-medium">Home</a>
                  <a href="/products" className="text-lg font-medium">Categories</a>
                  <a href="/about" className="text-lg font-medium">About Max</a>
                  <a href="/admin" className="text-lg font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Admin
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 w-full"
                autoFocus
                data-testid="input-search-mobile"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pb-20">
        <Hero />

        {/* Search Results Indicator */}
        {searchQuery && (
          <div className="container mx-auto px-4 mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <p className="text-blue-800">
                Showing results for "<span className="font-medium">{searchQuery}</span>"
                {" "}({filteredProducts.length + filteredFeatured.length} products found)
              </p>
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="text-blue-600 hover:text-blue-800">
                Clear search
              </Button>
            </div>
          </div>
        )}
        
        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div id="featured-products" className="container mx-auto px-4 mt-12 scroll-mt-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Bone className="w-4 h-4" />
                Pawfect Picks
              </div>
              <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-500">Hand-picked favorites that Max absolutely loves.</p>
            </div>
            
            <div className={`grid ${getGridClass(layoutSettings.featuredColumns)} gap-6`}>
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} featured />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/products">
                <Button variant="outline" className="rounded-full px-6 gap-2">
                  View All Products
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
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
              
              {curatedProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-lg">
                    {searchQuery ? "No products match your search." : "No products found in this category yet!"}
                  </p>
                  {searchQuery ? (
                    <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2 text-primary">
                      Clear search
                    </Button>
                  ) : (
                    <Button variant="link" onClick={() => setCategory("All")} className="mt-2 text-primary">
                      View all products
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center mt-8">
                  <Link href="/products">
                    <Button variant="outline" className="rounded-full px-6 gap-2">
                      View All Products
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
