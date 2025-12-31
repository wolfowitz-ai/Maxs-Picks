import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProducts, useDeleteProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScraperModal } from "@/components/ScraperModal";
import { PawPrint, Plus, Pencil, Trash2, Package, Settings, Loader2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

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
            variant={activeTab === "settings" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
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
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-500">Manage Max's curated list and affiliate links.</p>
            </div>
            <div className="flex gap-3">
              <ScraperModal />
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product Manually
              </Button>
            </div>
          </div>

          <Tabs defaultValue="products" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="products" className="space-y-6">
              {/* Product List */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                  <CardDescription>
                    Review and edit currently live products.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
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
                        {products?.map((product) => (
                          <TableRow key={product.id}>
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
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                                  onClick={() => setDeleteId(product.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
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
                      if (deleteId) {
                        deleteProduct.mutate(deleteId, {
                          onSuccess: () => {
                            toast({
                              title: "Product deleted",
                              description: "The product has been removed from your catalog.",
                            });
                            setDeleteId(null);
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

            <TabsContent value="settings">
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
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}
