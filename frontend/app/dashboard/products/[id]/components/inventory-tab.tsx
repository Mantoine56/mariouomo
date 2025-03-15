/**
 * Inventory Tab Component
 * 
 * Displays inventory information for a product and its variants.
 * Shows stock levels, reorder points, and status indicators.
 */
"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle, AlertTriangle, Package, Edit, RefreshCw } from "lucide-react";
import { ProductApi, ProductVariantWithInventory, Product } from "@/lib/product-api";
import { formatCurrency } from "@/lib/utils";

interface InventoryTabProps {
  productId: string;
}

/**
 * InventoryTab component for displaying product inventory information
 */
export function InventoryTab({ productId }: InventoryTabProps) {
  // State for inventory data
  const [variants, setVariants] = useState<ProductVariantWithInventory[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const productApi = new ProductApi();

  // Fetch inventory data on component mount
  useEffect(() => {
    fetchInventoryData();
  }, [productId]);

  /**
   * Fetch inventory data for the product
   */
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the product to check if it has variants or metadata inventory
      const productData = await productApi.getProduct(productId);
      console.log("[InventoryTab] Fetched product data:", productData);
      setProduct(productData);
      
      if (productData.variants && productData.variants.length > 0) {
        // If product has variants, get inventory for them
        const data = await productApi.getProductInventory(productId);
        console.log("[InventoryTab] Fetched inventory data for variants:", data);
        setVariants(data);
      } else {
        console.log("[InventoryTab] Product has no variants, checking metadata inventory");
        // For products without variants, we'll handle inventory from product metadata
        setVariants([]);
      }
    } catch (err) {
      console.error("[InventoryTab] Error fetching inventory data:", err);
      setError("Failed to load inventory data. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load inventory data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get stock status based on quantity
   */
  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return 'out_of_stock';
    if (quantity < 5) return 'low_stock'; // Default low stock threshold
    return 'in_stock';
  };

  /**
   * Render stock status badge
   */
  const renderStockStatus = (status: string) => {
    switch (status) {
      case "in_stock":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            In Stock
          </Badge>
        );
      case "low_stock":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Low Stock
          </Badge>
        );
      case "out_of_stock":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Out of Stock
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Package className="w-3.5 h-3.5 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  /**
   * Render loading skeleton
   */
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Loading inventory information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 w-full animate-pulse rounded-md bg-muted"></div>
            <div className="h-24 w-full animate-pulse rounded-md bg-muted"></div>
            <div className="h-24 w-full animate-pulse rounded-md bg-muted"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Manage product inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load inventory data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchInventoryData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Render inventory from metadata for products without variants
   */
  if (variants.length === 0 && product?.metadata?.inventory) {
    // Get inventory from metadata
    const inventory = parseInt(product.metadata.inventory as string, 10) || 0;
    const stockStatus = getStockStatus(inventory);

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Manage product inventory and stock levels</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchInventoryData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>—</TableCell>
                <TableCell>{formatCurrency(product.price || 0)}</TableCell>
                <TableCell>{inventory}</TableCell>
                <TableCell>{renderStockStatus(stockStatus)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="mt-8 rounded-md border p-4 bg-amber-50 border-amber-200">
            <h3 className="text-lg font-medium mb-2">Legacy Inventory System</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This product is using a simplified inventory approach that stores inventory in metadata. 
              For a more robust inventory system with support for proper ordering, stock reservations, 
              and multiple locations, consider adding product variants.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = `/dashboard/products/${productId}/edit`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Render empty state
   */
  if (variants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Manage product inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No inventory data available</h3>
            <p className="text-muted-foreground mb-4">
              This product has no variants or inventory items.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = `/dashboard/products/${productId}/edit`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Add Variants
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Render inventory data
   */
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Manage product inventory and stock levels</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInventoryData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Reorder Point</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => {
              // Get the first inventory item for reorder point (if any)
              const firstInventoryItem = variant.inventory && variant.inventory.length > 0 
                ? variant.inventory[0] 
                : null;
              
              // Format option values for display
              const optionValues = variant.option_values 
                ? Object.entries(variant.option_values)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")
                : "Default";
              
              return (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{optionValues}</TableCell>
                  <TableCell>{variant.sku || "—"}</TableCell>
                  <TableCell>
                    {formatCurrency(variant.price || 0)}
                    {variant.compare_at_price && variant.compare_at_price > 0 && (
                      <span className="ml-2 text-sm line-through text-muted-foreground">
                        {formatCurrency(variant.compare_at_price)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{variant.available_quantity || 0}</TableCell>
                  <TableCell>{variant.total_quantity || 0}</TableCell>
                  <TableCell>
                    {firstInventoryItem && firstInventoryItem.reorder_point > 0
                      ? firstInventoryItem.reorder_point
                      : "—"}
                  </TableCell>
                  <TableCell>{renderStockStatus(variant.stock_status || "unknown")}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {/* Inventory locations section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Inventory by Location</h3>
          
          {variants.map((variant) => {
            // Skip if no inventory data
            if (!variant.inventory || variant.inventory.length === 0) {
              return null;
            }
            
            // Format option values for display
            const optionValues = variant.option_values 
              ? Object.entries(variant.option_values)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")
              : "Default";
            
            return (
              <div key={`location-${variant.id}`} className="mb-6">
                <h4 className="font-medium mb-2">{optionValues}</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Reorder Point</TableHead>
                      <TableHead>Reorder Quantity</TableHead>
                      <TableHead>Last Counted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variant.inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.location || "Default"}</TableCell>
                        <TableCell>{Math.max(0, item.quantity - (item.reserved_quantity || 0))}</TableCell>
                        <TableCell>{item.reserved_quantity || 0}</TableCell>
                        <TableCell>{item.reorder_point || "—"}</TableCell>
                        <TableCell>{item.reorder_quantity || "—"}</TableCell>
                        <TableCell>
                          {item.last_counted_at 
                            ? new Date(item.last_counted_at).toLocaleDateString() 
                            : "Never"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 