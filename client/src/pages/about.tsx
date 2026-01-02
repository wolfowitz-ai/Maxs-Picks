import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, Bone, ArrowLeft, Instagram, PawPrint } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { maxPortrait } from "@/lib/data";
import { getSiteSettings, type SiteSettings } from "@/lib/siteSettings";

export default function About() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings);

  useEffect(() => {
    const handleStorage = () => setSiteSettings(getSiteSettings());
    if (typeof window !== 'undefined') {
      window.addEventListener("storage", handleStorage);
    }
    const interval = setInterval(() => {
      setSiteSettings(getSiteSettings());
    }, 1000);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("storage", handleStorage);
      }
      clearInterval(interval);
    };
  }, []);

  const instagramUrl = siteSettings.instagramHandle
    ? `https://instagram.com/${siteSettings.instagramHandle.replace('@', '')}`
    : "https://instagram.com";

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Picks
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-100 to-blue-50">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-white shadow-2xl overflow-hidden"
                >
                  <img
                    src={maxPortrait}
                    alt="Max the Maltipoo"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                <span className="text-sm font-medium text-gray-700">Chief Product Tester</span>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              <div className="text-center">
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  Hi, I'm Max!
                </h1>
                <p className="text-lg text-gray-500">Maltipoo • Product Enthusiast • Professional Treat Tester</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 py-6">
                <div className="text-center p-6 bg-blue-50 rounded-2xl">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <PawPrint className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mb-1">Age</h3>
                  <p className="text-gray-600">3 years young</p>
                </div>
                <div className="text-center p-6 bg-amber-50 rounded-2xl">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bone className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mb-1">Favorite Color</h3>
                  <p className="text-gray-600">Blue (obviously!)</p>
                </div>
                <div className="text-center p-6 bg-pink-50 rounded-2xl">
                  <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mb-1">Superpower</h3>
                  <p className="text-gray-600">Finding the best toys</p>
                </div>
              </div>

              <div className="space-y-6 text-gray-700 leading-relaxed">
                <h2 className="font-heading text-2xl font-bold text-gray-900">My Story</h2>
                <p>
                  I was born on a sunny day in California, the fluffiest of my litter. From day one, 
                  I knew I was destined for great things – specifically, testing every toy, treat, 
                  and cozy bed I could get my paws on.
                </p>
                <p>
                  My humans noticed pretty quickly that I have very particular tastes. Not every 
                  squeaky toy passes my rigorous testing protocol (which involves lots of chewing, 
                  throwing, and napping). Only the best make it onto my favorites list!
                </p>
                <p>
                  When I'm not conducting important product research, you can find me:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Chasing squirrels (I've never caught one, but I remain optimistic)</li>
                  <li>Perfecting my "treat please" face</li>
                  <li>Supervising my humans while they work</li>
                  <li>Taking strategic naps in sunny spots</li>
                </ul>
                <p>
                  I started this website because my doggy friends kept asking what products I recommend. 
                  Rather than bark the same answers over and over, I decided to put together this 
                  curated collection of my absolute favorites. Every single product here has been 
                  personally tested and approved by yours truly!
                </p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  Follow My Adventures
                </h3>
                <p className="text-gray-600 mb-4">
                  Want to see more of my daily life? Follow me on Instagram where I share my 
                  product testing sessions, nap updates, and important squirrel sightings!
                </p>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" data-testid="link-instagram-about">
                  <Button data-testid="button-follow-instagram" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                    <Instagram className="w-4 h-4 mr-2" />
                    Follow {siteSettings.instagramHandle || "@MaxTheMaltipoo"}
                  </Button>
                </a>
              </div>

              <div className="text-center pt-6">
                <a href="/#featured-products">
                  <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-blue-200">
                    <PawPrint className="w-5 h-5 mr-2" />
                    Browse My Picks
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
