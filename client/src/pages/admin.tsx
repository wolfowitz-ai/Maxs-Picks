import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProducts, useDeleteProduct, useCategories, useCreateCategory, useDeleteCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ImportModal } from "@/components/ImportModal";
import { ProductFormModal } from "@/components/ProductFormModal";
import { PawPrint, Plus, Pencil, Trash2, Package, Settings, Loader2, LogOut, Tags, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Product } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("products");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    createCategory.mutate(
      { name: newCategoryName.trim() },
      {
        onSuccess: () => {
          toast({
            title: "Category added",
            description: `"${newCategoryName}" has been created.`,
          });
          setNewCategoryName("");
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
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <PawPrint className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-lg text-gray-900">
            Max's <span className="text-primary">Admin</span>
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button 
            variant={activeTab === "products" ? "secondary" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("products")}
          >
            <Package className="w-4 h-4 mr-2" />
            Products
          </Button>
          <Button 
            variant={activeTab === "categories" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab("categories")}
          >
            <Tags className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button 
            variant={activeTab === "settings" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <div className="pt-4 border-t border-gray-100 mt-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-500"
              onClick={() => setLocation("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              View Site
            </Button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                M
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Max</p>
                <p className="text-xs text-gray-500">Chief Tasting Officer</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {activeTab === "products" && (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-heading text-3xl font-bold text-gray-900">Product Management</h1>
                  <p className="text-gray-500">Manage Max's curated list and affiliate links.</p>
                </div>
                <div className="flex gap-3">
                  <ImportModal />
                  <Button className="gap-2" onClick={handleAddProduct} data-testid="button-add-product">
                    <Plus className="w-4 h-4" />
                    Add Manually
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory ({products?.length || 0} products)</CardTitle>
                  <CardDescription>
                    Review and edit currently live products.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : products && products.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                            <TableCell>
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-50 border border-gray-100">
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{product.title}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {product.category}
                              </span>
                            </TableCell>
                            <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <PawPrint className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="text-sm">{parseFloat(product.rating).toFixed(1)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-gray-500 hover:text-primary"
                                  onClick={() => handleEditProduct(product)}
                                  data-testid={`button-edit-${product.id}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                                  onClick={() => setDeleteProductId(product.id)}
                                  data-testid={`button-delete-${product.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No products yet. Add your first product!</p>
                      <Button className="mt-4" onClick={handleAddProduct}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "categories" && (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-heading text-3xl font-bold text-gray-900">Category Management</h1>
                  <p className="text-gray-500">Organize products into categories.</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Category</CardTitle>
                  <CardDescription>
                    Create a new category for organizing products.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Category name (e.g., Toys, Treats)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                      className="max-w-sm"
                      data-testid="input-category-name"
                    />
                    <Button 
                      onClick={handleAddCategory} 
                      disabled={!newCategoryName.trim() || createCategory.isPending}
                      data-testid="button-add-category"
                    >
                      {createCategory.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Add Category
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Categories ({categories?.length || 0})</CardTitle>
                  <CardDescription>
                    Manage your product categories.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {categoriesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => {
                          const productCount = products?.filter(p => p.category === category.name).length || 0;
                          return (
                            <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell>
                                <span className="text-gray-500">{productCount} products</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                                  onClick={() => setDeleteCategoryId(category.id)}
                                  disabled={productCount > 0}
                                  title={productCount > 0 ? "Cannot delete category with products" : "Delete category"}
                                  data-testid={`button-delete-category-${category.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Tags className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No categories yet. Add your first category above!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Configure global site parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="title">Site Title</Label>
                  <Input type="text" id="title" placeholder="Max's Top Picks" />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="insta">Instagram Handle</Label>
                  <Input type="text" id="insta" placeholder="@max_maltipoo" />
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this product from Max's recommendations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (deleteProductId) {
                  deleteProduct.mutate(deleteProductId, {
                    onSuccess: () => {
                      toast({
                        title: "Product deleted",
                        description: "The product has been removed from your catalog.",
                      });
                      setDeleteProductId(null);
                    },
                    onError: () => {
                      toast({
                        title: "Error",
                        description: "Failed to delete product. Please try again.",
                        variant: "destructive",
                      });
                    },
                  });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Make sure no products are using this category before deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (deleteCategoryId) {
                  deleteCategory.mutate(deleteCategoryId, {
                    onSuccess: () => {
                      toast({
                        title: "Category deleted",
                        description: "The category has been removed.",
                      });
                      setDeleteCategoryId(null);
                    },
                    onError: (error) => {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to delete category.",
                        variant: "destructive",
                      });
                    },
                  });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
