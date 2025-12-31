import { useState, useEffect } from "react";
import { getSiteSettings, saveSiteSettings, type SiteSettings } from "@/lib/siteSettings";
import { useLocation } from "wouter";
import { useProducts, useDeleteProduct, useCategories, useCreateCategory, useDeleteCategory, useUpdateProduct, useUpdateCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ImportModal } from "@/components/ImportModal";
import { ProductFormModal } from "@/components/ProductFormModal";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { PawPrint, Plus, Pencil, Trash2, Package, Settings, Loader2, LogOut, Tags, Home, Star, Menu, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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

function saveLayoutSettings(settings: LayoutSettings) {
  localStorage.setItem("layoutSettings", JSON.stringify(settings));
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("products");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(getLayoutSettings);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings);
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const updateProduct = useUpdateProduct();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleToggleFeatured = (product: Product) => {
    updateProduct.mutate(
      { id: product.id, data: { featured: !product.featured } },
      {
        onSuccess: () => {
          toast({
            title: product.featured ? "Removed from Featured" : "Added to Featured",
            description: `"${product.title}" has been ${product.featured ? "removed from" : "added to"} the featured section.`,
          });
        },
      }
    );
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

  const updateLayoutSetting = (key: keyof LayoutSettings, value: number) => {
    const newSettings = { ...layoutSettings, [key]: value };
    setLayoutSettings(newSettings);
    saveLayoutSettings(newSettings);
  };

  const updateSiteSetting = (key: keyof SiteSettings, value: string) => {
    const newSettings = saveSiteSettings({ [key]: value });
    setSiteSettings(newSettings);
  };

  const handleStartEditCategory = (category: { id: string; name: string }) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveCategory = () => {
    if (!editingCategoryId || !editingCategoryName.trim()) return;
    
    updateCategory.mutate(
      { id: editingCategoryId, data: { name: editingCategoryName.trim() } },
      {
        onSuccess: () => {
          toast({
            title: "Category renamed",
            description: `Category has been renamed to "${editingCategoryName.trim()}".`,
          });
          setEditingCategoryId(null);
          setEditingCategoryName("");
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

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const NavContent = () => (
    <>
      <Button 
        variant={activeTab === "products" ? "secondary" : "ghost"} 
        className="w-full justify-start" 
        onClick={() => { setActiveTab("products"); setMobileMenuOpen(false); }}
      >
        <Package className="w-4 h-4 mr-2" />
        Products
      </Button>
      <Button 
        variant={activeTab === "categories" ? "secondary" : "ghost"} 
        className="w-full justify-start"
        onClick={() => { setActiveTab("categories"); setMobileMenuOpen(false); }}
      >
        <Tags className="w-4 h-4 mr-2" />
        Categories
      </Button>
      <Button 
        variant={activeTab === "settings" ? "secondary" : "ghost"} 
        className="w-full justify-start"
        onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
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
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <PawPrint className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-lg text-gray-900">
            Max's <span className="text-primary">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-40 bg-white p-4 space-y-2">
          <NavContent />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <PawPrint className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-lg text-gray-900">
            Max's <span className="text-primary">Admin</span>
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavContent />
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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
          
          {activeTab === "products" && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">Product Management</h1>
                  <p className="text-gray-500 text-sm md:text-base">Manage Max's curated list and affiliate links.</p>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <ImportModal />
                  <Button className="gap-2 flex-1 sm:flex-none" onClick={handleAddProduct} data-testid="button-add-product">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Manually</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory ({products?.length || 0} products)</CardTitle>
                  <CardDescription>
                    Review and edit currently live products. Toggle the star to feature a product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                  {productsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : products && products.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">
                              <Star className="w-4 h-4" />
                            </TableHead>
                            <TableHead className="w-[60px] md:w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Category</TableHead>
                            <TableHead className="hidden sm:table-cell">Price</TableHead>
                            <TableHead className="hidden lg:table-cell">Rating</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                              <TableCell>
                                <button
                                  onClick={() => handleToggleFeatured(product)}
                                  className={`p-1 rounded transition-colors ${
                                    product.featured 
                                      ? "text-amber-500 hover:text-amber-600" 
                                      : "text-gray-300 hover:text-amber-400"
                                  }`}
                                  title={product.featured ? "Remove from featured" : "Add to featured"}
                                >
                                  <Star className={`w-5 h-5 ${product.featured ? "fill-current" : ""}`} />
                                </button>
                              </TableCell>
                              <TableCell>
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-50 border border-gray-100">
                                  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <span className="font-medium text-sm md:text-base">{product.title}</span>
                                  <div className="md:hidden text-xs text-gray-500 mt-0.5">
                                    {product.category}{product.price ? ` • $${parseFloat(product.price).toFixed(2)}` : ""}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                  {product.category}
                                </span>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {product.price ? `$${parseFloat(product.price).toFixed(2)}` : <span className="text-gray-400">—</span>}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                  <PawPrint className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span className="text-sm">{parseFloat(product.rating).toFixed(1)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1 md:gap-2">
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
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
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
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">Category Management</h1>
                  <p className="text-gray-500 text-sm md:text-base">Organize products into categories.</p>
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
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Category name (e.g., Toys, Treats)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                      className="flex-1 sm:max-w-sm"
                      data-testid="input-category-name"
                    />
                    <Button 
                      onClick={handleAddCategory} 
                      disabled={!newCategoryName.trim() || createCategory.isPending}
                      className="w-full sm:w-auto"
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
                <CardContent className="p-0 md:p-6">
                  {categoriesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <div className="overflow-x-auto">
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
                            const isEditing = editingCategoryId === category.id;
                            return (
                              <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                                <TableCell className="font-medium">
                                  {isEditing ? (
                                    <Input
                                      value={editingCategoryName}
                                      onChange={(e) => setEditingCategoryName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveCategory();
                                        if (e.key === "Escape") handleCancelEditCategory();
                                      }}
                                      className="h-8 w-40"
                                      autoFocus
                                      data-testid={`input-rename-category-${category.id}`}
                                    />
                                  ) : (
                                    category.name
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-gray-500">{productCount} products</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {isEditing ? (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-green-600 hover:text-green-700"
                                          onClick={handleSaveCategory}
                                          disabled={updateCategory.isPending}
                                          title="Save"
                                          data-testid={`button-save-category-${category.id}`}
                                        >
                                          {updateCategory.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Check className="w-4 h-4" />
                                          )}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                          onClick={handleCancelEditCategory}
                                          title="Cancel"
                                          data-testid={`button-cancel-category-${category.id}`}
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-gray-500 hover:text-primary"
                                          onClick={() => handleStartEditCategory(category)}
                                          title="Rename category"
                                          data-testid={`button-rename-category-${category.id}`}
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
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
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <Tags className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No categories yet. Add your first category above!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "settings" && (
            <>
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm md:text-base">Configure site display and layout options.</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Homepage Layout</CardTitle>
                  <CardDescription>Control how products are displayed on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Star className="w-5 h-5 fill-amber-500" />
                      <h3 className="font-semibold text-lg">Featured Section</h3>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Items Per Row</Label>
                          <span className="text-sm font-medium text-primary">{layoutSettings.featuredColumns}</span>
                        </div>
                        <Slider
                          value={[layoutSettings.featuredColumns]}
                          onValueChange={([value]) => updateLayoutSetting("featuredColumns", value)}
                          min={2}
                          max={6}
                          step={1}
                        />
                        <p className="text-xs text-muted-foreground">Number of products shown per row</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Total Products</Label>
                          <span className="text-sm font-medium text-primary">{layoutSettings.featuredTotal}</span>
                        </div>
                        <Slider
                          value={[layoutSettings.featuredTotal]}
                          onValueChange={([value]) => updateLayoutSetting("featuredTotal", value)}
                          min={1}
                          max={12}
                          step={1}
                        />
                        <p className="text-xs text-muted-foreground">Maximum featured products to display</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-6">
                    <div className="flex items-center gap-2 text-primary">
                      <PawPrint className="w-5 h-5" />
                      <h3 className="font-semibold text-lg">Curated With Love Section</h3>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Items Per Row</Label>
                          <span className="text-sm font-medium text-primary">{layoutSettings.curatedColumns}</span>
                        </div>
                        <Slider
                          value={[layoutSettings.curatedColumns]}
                          onValueChange={([value]) => updateLayoutSetting("curatedColumns", value)}
                          min={2}
                          max={6}
                          step={1}
                        />
                        <p className="text-xs text-muted-foreground">Number of products shown per row</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Total Products</Label>
                          <span className="text-sm font-medium text-primary">{layoutSettings.curatedTotal}</span>
                        </div>
                        <Slider
                          value={[layoutSettings.curatedTotal]}
                          onValueChange={([value]) => updateLayoutSetting("curatedTotal", value)}
                          min={4}
                          max={24}
                          step={1}
                        />
                        <p className="text-xs text-muted-foreground">Maximum products to display</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Site Information</CardTitle>
                  <CardDescription>Configure basic site details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="title">Site Title</Label>
                    <Input 
                      type="text" 
                      id="title" 
                      placeholder="Max's Top Picks" 
                      value={siteSettings.siteTitle}
                      onChange={(e) => updateSiteSetting("siteTitle", e.target.value)}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="insta">Instagram Handle</Label>
                    <Input 
                      type="text" 
                      id="insta" 
                      placeholder="@MaxTheMaltipoo" 
                      value={siteSettings.instagramHandle}
                      onChange={(e) => updateSiteSetting("instagramHandle", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Include the @ symbol (e.g., @MaxTheMaltipoo)</p>
                  </div>
                </CardContent>
              </Card>
            </>
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
