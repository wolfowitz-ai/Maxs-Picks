import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories, useCreateProduct, useUpdateProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { SortableImageList } from "./SortableImageList";

interface SpinRequest {
  field: "title" | "description" | "maxsTake";
  existingText?: string;
  productContext: {
    title?: string;
    description?: string;
    category?: string;
    price?: string;
  };
}

async function spinTextApi(request: SpinRequest): Promise<string> {
  const response = await fetch("/api/admin/spin-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate text");
  }
  
  const data = await response.json();
  return data.text;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const isEditing = !!product;
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxsTake: "",
    price: "",
    rating: "",
    reviews: 0,
    allImages: [] as string[],
    category: "",
    amazonUrl: "",
    asin: "",
    featured: false,
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (product) {
      const allImages = product.image 
        ? [product.image, ...(product.images || [])]
        : (product.images || []);
      setFormData({
        title: product.title,
        description: product.description,
        maxsTake: product.maxsTake,
        price: product.price || "",
        rating: product.rating,
        reviews: product.reviews,
        allImages,
        category: product.category,
        amazonUrl: product.amazonUrl,
        asin: product.asin || "",
        featured: product.featured || false,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        maxsTake: "",
        price: "",
        rating: "4.5",
        reviews: 0,
        allImages: [],
        category: categories?.[0]?.name || "Toys",
        amazonUrl: "",
        asin: "",
        featured: false,
      });
    }
  }, [product, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.allImages.length === 0) {
      toast({
        title: "Image required",
        description: "Please add at least one product image.",
        variant: "destructive",
      });
      return;
    }
    
    const [primaryImage, ...secondaryImages] = formData.allImages;
    
    const productData = {
      title: formData.title,
      description: formData.description,
      maxsTake: formData.maxsTake,
      price: formData.price || null,
      rating: formData.rating,
      reviews: Number(formData.reviews),
      image: primaryImage,
      images: secondaryImages,
      category: formData.category,
      amazonUrl: formData.amazonUrl,
      asin: formData.asin,
      featured: formData.featured,
    };

    if (isEditing && product) {
      updateProduct.mutate(
        { id: product.id, data: productData },
        {
          onSuccess: () => {
            toast({
              title: "Product updated",
              description: "The product has been updated successfully.",
            });
            onClose();
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createProduct.mutate(productData, {
        onSuccess: () => {
          toast({
            title: "Product created",
            description: "The product has been added to your catalog.",
          });
          onClose();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  const [spinningField, setSpinningField] = useState<"description" | "maxsTake" | null>(null);
  const [undoHistory, setUndoHistory] = useState<{ description?: string; maxsTake?: string }>({});

  const spinMutation = useMutation({
    mutationFn: spinTextApi,
    onSuccess: (text, variables) => {
      setFormData(prev => ({ ...prev, [variables.field]: text }));
      toast({
        title: "Text generated!",
        description: `${variables.field === "maxsTake" ? "Max's Take" : "Description"} has been updated.`,
      });
      setSpinningField(null);
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
      setSpinningField(null);
    },
  });

  const handleSpin = (field: "description" | "maxsTake") => {
    // Save current value for undo
    setUndoHistory(prev => ({ ...prev, [field]: formData[field] }));
    setSpinningField(field);
    spinMutation.mutate({
      field,
      existingText: formData[field] || undefined,
      productContext: {
        title: formData.title || undefined,
        description: formData.description || undefined,
        category: formData.category || undefined,
        price: formData.price || undefined,
      },
    });
  };

  const handleUndo = (field: "description" | "maxsTake") => {
    if (undoHistory[field] !== undefined) {
      setFormData(prev => ({ ...prev, [field]: undoHistory[field]! }));
      setUndoHistory(prev => ({ ...prev, [field]: undefined }));
      toast({
        title: "Reverted",
        description: "Text has been restored to previous version.",
      });
    }
  };

  const SpinButton = ({ field, disabled }: { field: "description" | "maxsTake"; disabled?: boolean }) => (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => handleSpin(field)}
        disabled={disabled || spinningField !== null}
        className="h-7 px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
        data-testid={`button-spin-${field}`}
      >
        {spinningField === field ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs">{formData[field] ? "Rewrite" : "Generate"}</span>
      </Button>
      {undoHistory[field] !== undefined && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleUndo(field)}
          className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          data-testid={`button-undo-${field}`}
        >
          <span className="text-xs">Undo</span>
        </Button>
      )}
    </div>
  );

  const addImageToForm = useCallback((imagePath: string) => {
    setFormData(prev => ({ ...prev, allImages: [...prev.allImages, imagePath] }));
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        credentials: "include",
        body: arrayBuffer,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      addImageToForm(data.localPath);
      toast({
        title: "Image uploaded",
        description: "Image has been processed and added.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [addImageToForm, toast]);

  const handleImageUrl = useCallback(async (url: string) => {
    setIsUploading(true);
    try {
      const response = await fetch("/api/admin/save-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageUrl: url, filename: formData.title || "product" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save image");
      }

      const data = await response.json();
      addImageToForm(data.localPath);
      toast({
        title: "Image saved",
        description: "Image has been downloaded and processed.",
      });
    } catch (error) {
      toast({
        title: "Failed to save image",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [addImageToForm, formData.title, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Indestructible Blue Ball"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Description *</Label>
                <SpinButton field="description" />
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the product..."
                rows={2}
                required
                disabled={spinningField === "description"}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="maxsTake">Max's Take *</Label>
                  <SpinButton field="maxsTake" />
                </div>
                <span className={`text-xs ${formData.maxsTake.length > 180 ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {formData.maxsTake.length}/180
                </span>
              </div>
              <Textarea
                id="maxsTake"
                value={formData.maxsTake}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= 180 || newValue.length < formData.maxsTake.length) {
                    setFormData({ ...formData, maxsTake: newValue.slice(0, 180) });
                  }
                }}
                placeholder="What does Max think about this product?"
                rows={2}
                required
                disabled={spinningField === "maxsTake"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Leave blank if unknown"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <>
                      <SelectItem value="Toys">Toys</SelectItem>
                      <SelectItem value="Treats">Treats</SelectItem>
                      <SelectItem value="Gear">Gear</SelectItem>
                      <SelectItem value="Grooming">Grooming</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5) *</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                placeholder="4.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviews">Number of Reviews</Label>
              <Input
                id="reviews"
                type="number"
                min="0"
                value={formData.reviews}
                onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value) || 0 })}
                placeholder="100"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Product Images *</Label>
              <div className="space-y-3">
                {formData.allImages.length > 0 && (
                  <SortableImageList
                    images={formData.allImages}
                    onReorder={(newImages) => setFormData({ ...formData, allImages: newImages })}
                    onRemove={(idx) => {
                      const newImages = formData.allImages.filter((_, i) => i !== idx);
                      setFormData({ ...formData, allImages: newImages });
                    }}
                  />
                )}

                {/* Upload area */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith("image/")) {
                        await handleImageUpload(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                      isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleImageUpload(file);
                          e.target.value = "";
                        }
                      }}
                    />
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload className="w-8 h-8" />
                        <span className="text-sm">Drop image here or click to upload</span>
                        <span className="text-xs text-gray-400">JPG, PNG, WebP (max 10MB)</span>
                      </div>
                    )}
                  </div>

                {/* URL input fallback */}
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    value=""
                    onChange={() => {}}
                    placeholder="Or paste image URL..."
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const url = input.value.trim();
                        if (url) {
                          await handleImageUrl(url);
                          input.value = "";
                        }
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const input = document.getElementById("imageUrl") as HTMLInputElement;
                      const url = input?.value?.trim();
                      if (url) {
                        await handleImageUrl(url);
                        input.value = "";
                      }
                    }}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="amazonUrl">Amazon Affiliate URL *</Label>
              <Input
                id="amazonUrl"
                value={formData.amazonUrl}
                onChange={(e) => setFormData({ ...formData, amazonUrl: e.target.value })}
                placeholder="https://amazon.com/dp/B08..."
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="asin">ASIN (optional)</Label>
              <Input
                id="asin"
                value={formData.asin}
                onChange={(e) => setFormData({ ...formData, asin: e.target.value })}
                placeholder="B08EXAMPLE1"
              />
            </div>

            <div className="col-span-2 flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <div>
                  <Label htmlFor="featured" className="text-base font-medium cursor-pointer">Featured Product</Label>
                  <p className="text-sm text-muted-foreground">Show in the Featured section on homepage</p>
                </div>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
