import { maxHero } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white rounded-3xl shadow-sm mx-4 mt-4 lg:mx-0 lg:mt-0">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-50" />
      
      <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1.5 px-4 rounded-full bg-secondary text-white text-sm font-bold mb-4 shadow-sm">
                🐾 Approved by Max
              </span>
              <h1 className="text-4xl lg:text-6xl font-heading font-bold text-gray-900 leading-tight">
                Max's <span className="text-primary">Favorite Things</span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Hi, I'm Max! I'm a Maltipoo with excellent taste. Here are the toys, treats, and gear that get my tail wagging every single day.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a href="#featured-products">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-blue-200">
                  Browse My Picks
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href="/about">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg border-2 hover:bg-gray-50">
                  Read My Story
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <div className="relative w-72 h-72 lg:w-96 lg:h-96 mx-auto">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-full h-full bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
              <div className="absolute -bottom-8 -left-4 w-full h-full bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
              
              <img 
                src={maxHero} 
                alt="Max the Maltipoo" 
                className="relative w-full h-full object-cover rounded-full border-8 border-white shadow-2xl z-10 mask-image-blob"
              />
              
              {/* Floating badges */}
              <motion.div 
                className="absolute -right-4 top-10 bg-white p-3 rounded-2xl shadow-lg z-20 flex items-center gap-2"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <span className="text-2xl">🎾</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-500">Play Time</span>
                  <span className="text-sm font-bold text-gray-900">Expert</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
