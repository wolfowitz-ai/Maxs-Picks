import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories, useCreateProduct, useUpdateProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Product } from "@shared/schema";

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
    image: "",
    category: "",
    amazonUrl: "",
    asin: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        maxsTake: product.maxsTake,
        price: product.price,
        rating: product.rating,
        reviews: product.reviews,
        image: product.image,
        category: product.category,
        amazonUrl: product.amazonUrl,
        asin: product.asin || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        maxsTake: "",
        price: "",
        rating: "4.5",
        reviews: 0,
        image: "",
        category: categories?.[0]?.name || "Toys",
        amazonUrl: "",
        asin: "",
      });
    }
  }, [product, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      reviews: Number(formData.reviews),
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the product..."
                rows={2}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="maxsTake">Max's Take *</Label>
              <Textarea
                id="maxsTake"
                value={formData.maxsTake}
                onChange={(e) => setFormData({ ...formData, maxsTake: e.target.value })}
                placeholder="What does Max think about this product?"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="12.99"
                required
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
              <Label htmlFor="image">Image URL *</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                required
              />
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
