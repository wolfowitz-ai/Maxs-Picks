import { Link } from "wouter";
import { PawPrint, Instagram, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-100 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-white p-2 rounded-lg">
                <PawPrint className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-xl text-gray-900 tracking-tight">
                Max's<span className="text-primary">Picks</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              Hi, I'm Max! I personally test and curate every product on this site. 
              Only the best makes it onto my favorites list.
            </p>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-sm">Follow @MaxTheMaltipoo</span>
            </a>
          </div>

          <div>
            <h4 className="font-heading font-bold text-gray-900 mb-4">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products/all">
                  <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">All Products</span>
                </Link>
              </li>
              <li>
                <Link href="/products/toys">
                  <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Toys</span>
                </Link>
              </li>
              <li>
                <Link href="/products/treats">
                  <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Treats</span>
                </Link>
              </li>
              <li>
                <Link href="/products/gear">
                  <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Gear</span>
                </Link>
              </li>
              <li>
                <Link href="/products/grooming">
                  <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Grooming</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-gray-900 mb-4">More</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about">
                  <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">About Max</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Home</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Max's Picks. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 fill-red-400 text-red-400" /> by Max & Family
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            As an Amazon Associate, we earn from qualifying purchases. Product prices and availability are subject to change.
          </p>
        </div>
      </div>
    </footer>
  );
}
