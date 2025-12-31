import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useCategories, useCreateProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon, HardDrive } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface StagedProduct {
  title: string;
  description: string;
  maxsTake: string;
  price: string;
  rating: string;
  reviews: number;
  image: string;
  images: string[];
  category: string;
  amazonUrl: string;
  asin: string;
}

export function ImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [importMethod, setImportMethod] = useState<"api" | "scraper">("scraper");
  const [url, setUrl] = useState("");
  const [imageCount, setImageCount] = useState("1");
  const [marketplace, setMarketplace] = useState("US");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stagedProduct, setStagedProduct] = useState<StagedProduct | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [saveImageLocally, setSaveImageLocally] = useState(true);
  const [isSavingImage, setIsSavingImage] = useState(false);
  
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();

  const resetState = () => {
    setUrl("");
    setError(null);
    setStagedProduct(null);
    setSelectedImageIndex(0);
    setIsSavingImage(false);
  };

  const saveImageToLocal = async (imageUrl: string, productTitle: string): Promise<string> => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch("/api/admin/save-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageUrl,
        filename: productTitle.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save image locally");
    }

    const data = await response.json();
    return data.localPath;
  };

  const handleFetch = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = importMethod === "api" ? "/api/admin/import/pa-api" : "/api/admin/import/scrape";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          url: url.trim(),
          imageCount: parseInt(imageCount),
          marketplace: importMethod === "api" ? marketplace : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch product data");
      }

      const data = await response.json();
      
      setStagedProduct({
        title: data.title || "",
        description: data.description || "",
        maxsTake: "",
        price: data.price || "",
        rating: data.rating || "4.5",
        reviews: data.reviews || 0,
        image: data.images?.[0] || data.image || "",
        images: data.images || (data.image ? [data.image] : []),
        category: categories?.[0]?.name || "Toys",
        amazonUrl: data.amazonUrl || url,
        asin: data.asin || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!stagedProduct) return;

    setIsSavingImage(true);

    try {
      let finalImageUrl = stagedProduct.images[selectedImageIndex] || stagedProduct.image;

      if (saveImageLocally && finalImageUrl && finalImageUrl.startsWith("http")) {
        try {
          finalImageUrl = await saveImageToLocal(finalImageUrl, stagedProduct.title);
        } catch (imgError) {
          console.error("Failed to save image locally, using remote URL:", imgError);
          toast({
            title: "Image save warning",
            description: "Could not save image locally, using remote URL instead.",
            variant: "default",
          });
        }
      }

      const productToSave = {
        title: stagedProduct.title,
        description: stagedProduct.description,
        maxsTake: stagedProduct.maxsTake,
        price: stagedProduct.price || null,
        rating: stagedProduct.rating,
        reviews: stagedProduct.reviews,
        image: finalImageUrl,
        category: stagedProduct.category,
        amazonUrl: stagedProduct.amazonUrl,
        asin: stagedProduct.asin,
        featured: false,
      };

      createProduct.mutate(productToSave, {
        onSuccess: () => {
          toast({
            title: "Product imported!",
            description: `"${stagedProduct.title}" has been added to your catalog.`,
          });
          resetState();
          setIsOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Import failed",
            description: error.message,
            variant: "destructive",
          });
          setIsSavingImage(false);
        },
      });
    } catch (error) {
      setIsSavingImage(false);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const updateStagedField = (field: keyof StagedProduct, value: any) => {
    if (!stagedProduct) return;
    setStagedProduct({ ...stagedProduct, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-import">
          <Download className="w-4 h-4" />
          Import from Amazon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Import Product from Amazon</DialogTitle>
        </DialogHeader>

        {!stagedProduct ? (
          <div className="space-y-6">
            <Tabs value={importMethod} onValueChange={(v) => setImportMethod(v as "api" | "scraper")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="api" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  PA-API (Official)
                </TabsTrigger>
                <TabsTrigger value="scraper" className="gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Scraper (Fallback)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="api" className="space-y-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Amazon Product Advertising API</p>
                  <p>Uses your official Amazon Associates API credentials. Most reliable method with full image access.</p>
                </div>
                <div className="space-y-2">
                  <Label>Amazon Marketplace</Label>
                  <Select value={marketplace} onValueChange={setMarketplace}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="ES">Spain</SelectItem>
                      <SelectItem value="IT">Italy</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="MX">Mexico</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Select the Amazon store where your affiliate account is registered.</p>
                </div>
              </TabsContent>

              <TabsContent value="scraper" className="space-y-4 mt-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                  <p className="font-medium mb-1">Web Scraper (Fallback)</p>
                  <p>Uses web scraping when the official API is unavailable. May have limited data or be blocked by Amazon.</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amazon-url">Amazon URL or ASIN</Label>
                <Input
                  id="amazon-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://amazon.com/dp/B08... or B08XXXXX"
                  data-testid="input-amazon-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-count">Number of Images to Import</Label>
                <Select value={imageCount} onValueChange={setImageCount}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 image</SelectItem>
                    <SelectItem value="3">3 images</SelectItem>
                    <SelectItem value="5">5 images</SelectItem>
                    <SelectItem value="10">10 images</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              )}

              <Button 
                onClick={handleFetch} 
                disabled={!url.trim() || isLoading}
                className="w-full"
                data-testid="button-fetch-product"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching product data...
                  </>
                ) : (
                  "Fetch Product Data"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Product data fetched! Review and edit before saving.</span>
            </div>

            {stagedProduct.images.length > 1 && (
              <div className="space-y-2">
                <Label>Select Primary Image</Label>
                <div className="flex gap-2 flex-wrap">
                  {stagedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImageIndex === idx 
                          ? "border-primary ring-2 ring-primary/30" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img src={img} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stagedProduct.images.length === 0 && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                <ImageIcon className="w-5 h-5" />
                <span>No images found. You'll need to add an image URL manually.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Title *</Label>
                <Input
                  value={stagedProduct.title}
                  onChange={(e) => updateStagedField("title", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={stagedProduct.description}
                  onChange={(e) => updateStagedField("description", e.target.value)}
                  rows={2}
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Max's Take * (What does Max think about this?)</Label>
                  <span className={`text-xs ${stagedProduct.maxsTake.length > 250 ? "text-red-500 font-medium" : "text-gray-400"}`}>
                    {stagedProduct.maxsTake.length}/250
                  </span>
                </div>
                <Textarea
                  value={stagedProduct.maxsTake}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= 250 || newValue.length < stagedProduct.maxsTake.length) {
                      updateStagedField("maxsTake", newValue.slice(0, 250));
                    }
                  }}
                  placeholder="Write a fun review from Max's perspective..."
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={stagedProduct.price}
                  onChange={(e) => updateStagedField("price", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={stagedProduct.category}
                  onValueChange={(value) => updateStagedField("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rating (1-5)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={stagedProduct.rating}
                  onChange={(e) => updateStagedField("rating", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Reviews</Label>
                <Input
                  type="number"
                  value={stagedProduct.reviews}
                  onChange={(e) => updateStagedField("reviews", parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Image URL *</Label>
                <Input
                  value={stagedProduct.images[selectedImageIndex] || stagedProduct.image}
                  onChange={(e) => {
                    const newImages = [...stagedProduct.images];
                    newImages[selectedImageIndex] = e.target.value;
                    updateStagedField("images", newImages);
                    updateStagedField("image", e.target.value);
                  }}
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Amazon Affiliate URL *</Label>
                <Input
                  value={stagedProduct.amazonUrl}
                  onChange={(e) => updateStagedField("amazonUrl", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-3">
                <Switch 
                  id="save-locally" 
                  checked={saveImageLocally} 
                  onCheckedChange={setSaveImageLocally}
                />
                <Label htmlFor="save-locally" className="flex items-center gap-2 text-sm cursor-pointer">
                  <HardDrive className="w-4 h-4" />
                  Save image locally
                </Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStagedProduct(null)}>
                  Back
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={!stagedProduct.title || !stagedProduct.maxsTake || createProduct.isPending || isSavingImage}
                  data-testid="button-save-import"
                >
                  {(createProduct.isPending || isSavingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save to Catalog
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
