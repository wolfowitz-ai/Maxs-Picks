import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useScrapeProduct } from "@/lib/api";
import { Loader2, Download } from "lucide-react";

export function ScraperModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const { toast } = useToast();
  const scrapeProduct = useScrapeProduct();

  const handleScrape = () => {
    if (!url) return;
    
    scrapeProduct.mutate(url, {
      onSuccess: (data) => {
        setIsOpen(false);
        setUrl("");
        toast({
          title: "Product Imported Successfully!",
          description: `Max has analyzed "${data.title || 'the product'}". Review and customize it before publishing.`,
          className: "bg-green-50 border-green-200 text-green-900",
        });
        console.log("Scraped product data:", data);
      },
      onError: (error) => {
        toast({
          title: "Import Failed",
          description: error instanceof Error ? error.message : "Failed to scrape product",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-gray-500 hover:text-primary gap-2">
          <Download className="w-4 h-4" />
          Import Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            Amazon Scraper <span className="text-sm bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-sans font-bold">Utility</span>
          </DialogTitle>
          <DialogDescription>
            Paste an Amazon URL or ASIN below to automatically pull product details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">Amazon URL / ASIN</Label>
            <Input 
              id="url" 
              placeholder="https://amazon.com/dp/B0..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-xl border-gray-200 focus:ring-primary"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Import Options</Label>
            <div className="grid grid-cols-2 gap-3">
              {['Images', 'Description', 'Price', 'Reviews', 'Specifications', 'Videos'].map((item) => (
                <div key={item} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <Checkbox id={item} defaultChecked />
                  <Label htmlFor={item} className="cursor-pointer">{item}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleScrape} 
            disabled={!url || scrapeProduct.isPending}
            className="rounded-xl bg-primary hover:bg-blue-600 text-white min-w-[120px]"
          >
            {scrapeProduct.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                Start Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
