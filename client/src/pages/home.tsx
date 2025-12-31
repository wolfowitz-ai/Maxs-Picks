import { useState } from "react";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilter } from "@/components/ProductFilter";
import { ScraperModal } from "@/components/ScraperModal";
import { products } from "@/lib/data";
import { PawPrint, ShoppingBag, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Home() {
  const [category, setCategory] = useState("All");

  const filteredProducts = category === "All" 
    ? products 
    : products.filter(p => p.category === category);

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
            <ScraperModal />
            <Button size="icon" variant="ghost" className="relative text-gray-600 hover:text-primary hidden md:flex">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
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
                  <hr className="my-2"/>
                  <ScraperModal />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <main className="pb-20">
        <Hero />
        
        <div className="container mx-auto px-4 mt-12">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">Curated With Love</h2>
            <p className="text-gray-500">Only the best for the goodest boys and girls.</p>
          </div>

          <ProductFilter currentCategory={category} onSelectCategory={setCategory} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-lg">No products found in this category yet!</p>
              <Button variant="link" onClick={() => setCategory("All")} className="mt-2 text-primary">
                View all products
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
            <PawPrint className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Max's Top Picks. All rights reserved.<br/>
            Prices and availability subject to change. As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>
      </footer>
    </div>
  );
}
