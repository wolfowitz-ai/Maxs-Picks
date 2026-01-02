import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { useProducts, useCategories } from "@/lib/api";
import { Menu, Lock, Loader2, Search, X, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";
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

export default function Products() {
  const params = useParams<{ category?: string }>();
  const [, setLocation] = useLocation();
  const categoryParam = params.category || "all";
  const { data: categories } = useCategories();
  
  const resolvedCategory = useMemo(() => {
    if (categoryParam === "all") return "All";
    const match = categories?.find(c => c.name.toLowerCase() === categoryParam.toLowerCase());
    return match ? match.name : categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
  }, [categoryParam, categories]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT);
  const { data: products, isLoading, error } = useProducts(resolvedCategory);

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

  const categoryList = [
    { name: "All", slug: "all" },
    ...(categories?.map(c => ({ name: c.name, slug: c.name.toLowerCase() })) || [])
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />

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
                <Button variant="ghost" size="sm" onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)} data-testid="button-search-toggle">
                  <Search className="w-5 h-5" />
                </Button>
                <Link href="/about">
                  <Button variant="ghost">About Max</Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" size="icon">
                    <Lock className="w-5 h-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              data-testid="button-search-toggle-mobile"
            >
              {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-start">Home</Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="ghost" className="w-full justify-start">About Max</Button>
                  </Link>
                  <Link href="/admin">
                    <Button variant="ghost" className="w-full justify-start">
                      <Lock className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

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

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/">
            <span className="hover:text-primary cursor-pointer">Home</span>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">
            {resolvedCategory === "All" ? "All Products" : resolvedCategory}
          </span>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-gray-900 mb-2">
            {resolvedCategory === "All" ? "All Products" : resolvedCategory}
          </h1>
          <p className="text-gray-500">
            {resolvedCategory === "All" 
              ? "Browse all of Max's curated favorites."
              : `Max's favorite ${resolvedCategory.toLowerCase()} picks.`}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categoryList.map((cat) => (
            <Button
              key={cat.slug}
              variant={resolvedCategory.toLowerCase() === cat.name.toLowerCase() ? "default" : "outline"}
              onClick={() => setLocation(`/products/${cat.slug}`)}
              className="rounded-full"
              data-testid={`filter-${cat.slug}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {searchQuery && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between mb-6">
            <p className="text-blue-800">
              Showing results for "<span className="font-medium">{searchQuery}</span>"
              {" "}({filteredProducts.length} products found)
            </p>
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="text-blue-600 hover:text-blue-800">
              Clear search
            </Button>
          </div>
        )}
        
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

        {!isLoading && !error && filteredProducts && (
          <>
            <div className={`grid ${getGridClass(layoutSettings.curatedColumns)} gap-6`}>
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-lg">
                  {searchQuery ? "No products match your search." : "No products found in this category yet!"}
                </p>
                {searchQuery ? (
                  <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2 text-primary">
                    Clear search
                  </Button>
                ) : (
                  <Link href="/products/all">
                    <Button variant="link" className="mt-2 text-primary">
                      View all products
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
