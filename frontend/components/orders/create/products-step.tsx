'use client';

/**
 * Products Selection Step
 * 
 * Allows selecting products for an order with quantity adjustments
 * and displays the subtotal
 */

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, X, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Product type definition
export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  inventory: number;
};

// Props for the ProductsStep component
interface ProductsStepProps {
  initialData: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  onComplete: (products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>) => void;
}

// Mock product data (would be fetched from an API in a real app)
const mockProducts: Product[] = [
  { id: 'prod_1', name: 'Premium T-Shirt', price: 29.99, category: 'Apparel', inventory: 50, image: '/images/products/tshirt.jpg' },
  { id: 'prod_2', name: 'Designer Jeans', price: 89.99, category: 'Apparel', inventory: 25, image: '/images/products/jeans.jpg' },
  { id: 'prod_3', name: 'Leather Wallet', price: 49.99, category: 'Accessories', inventory: 30, image: '/images/products/wallet.jpg' },
  { id: 'prod_4', name: 'Casual Sneakers', price: 79.99, category: 'Footwear', inventory: 15, image: '/images/products/sneakers.jpg' },
  { id: 'prod_5', name: 'Classic Watch', price: 129.99, category: 'Accessories', inventory: 10, image: '/images/products/watch.jpg' },
  { id: 'prod_6', name: 'Logo Cap', price: 24.99, category: 'Accessories', inventory: 40 },
  { id: 'prod_7', name: 'Dress Shirt', price: 59.99, category: 'Apparel', inventory: 20 },
  { id: 'prod_8', name: 'Leather Belt', price: 39.99, category: 'Accessories', inventory: 35 },
];

/**
 * Format price to currency format
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * ProductsStep Component
 * 
 * Provides UI for selecting products and adjusting quantities
 */
export function ProductsStep({ initialData, onComplete }: ProductsStepProps) {
  // Track selected products with quantities
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>>(initialData || []);
  
  // Whether the product search popup is open
  const [open, setOpen] = useState(false);
  
  // Calculate subtotal
  const subtotal = selectedProducts.reduce((sum, product) => {
    return sum + (product.price * product.quantity);
  }, 0);
  
  // Track validity of the selection
  const [isValid, setIsValid] = useState(false);
  
  // Validate form when selection changes
  useEffect(() => {
    setIsValid(selectedProducts.length > 0);
    
    // Only call onComplete if the selection is valid
    if (selectedProducts.length > 0) {
      onComplete(selectedProducts);
    }
  }, [selectedProducts, onComplete]);
  
  /**
   * Add a product to the selection or increment if already selected
   */
  const addProduct = (product: Product) => {
    setSelectedProducts(prev => {
      // Check if product is already in the list
      const existingIndex = prev.findIndex(p => p.id === product.id);
      
      if (existingIndex >= 0) {
        // Increment quantity if already in list
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      } else {
        // Add new product with quantity 1
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image
        }];
      }
    });
    
    setOpen(false);
  };
  
  /**
   * Update the quantity of a selected product
   */
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setSelectedProducts(prev => {
      return prev.map(product => {
        if (product.id === productId) {
          return { ...product, quantity: newQuantity };
        }
        return product;
      });
    });
  };
  
  /**
   * Remove a product from the selection
   */
  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => {
      return prev.filter(product => product.id !== productId);
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Search/Add */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Add Products</h3>
          <span className="text-xs text-muted-foreground">
            {selectedProducts.length} {selectedProducts.length === 1 ? 'product' : 'products'} selected
          </span>
        </div>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <span>Search for products...</span>
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search products by name..." />
              <CommandEmpty>No products found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-72">
                  {mockProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => addProduct(product)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center mr-3">
                          {product.image ? (
                            <div className="w-full h-full rounded overflow-hidden">
                              {/* Using div instead of Image for this example */}
                              <div className="w-full h-full bg-secondary flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                          ) : (
                            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold">
                              {formatCurrency(product.price)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.inventory > 10 ? (
                          <span className="text-green-500">In stock</span>
                        ) : product.inventory > 0 ? (
                          <span className="text-yellow-500">Low stock ({product.inventory})</span>
                        ) : (
                          <span className="text-red-500">Out of stock</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Selected Products Table */}
      <Card>
        <CardContent className="p-0">
          {selectedProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Product</TableHead>
                  <TableHead className="w-[25%]">Price</TableHead>
                  <TableHead className="w-[25%]">Quantity</TableHead>
                  <TableHead className="w-[10%] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(product.id, product.quantity - 1)}
                          disabled={product.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center">{product.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(product.id, product.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduct(product.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Subtotal row */}
                <TableRow className="border-t border-t-primary/20">
                  <TableCell colSpan={2} className="text-right font-medium">
                    Subtotal:
                  </TableCell>
                  <TableCell colSpan={2} className="font-bold">
                    {formatCurrency(subtotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-3 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-1">No products selected</h3>
              <p className="text-sm max-w-sm">
                Search and select products to add them to this order.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Form Status */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isValid ? (
            <span className="text-green-500 flex items-center">
              <Check className="mr-1 h-4 w-4" />
              Products selected for order
            </span>
          ) : (
            <span>Please add at least one product to continue</span>
          )}
        </div>
        
        {selectedProducts.length > 0 && (
          <div className="text-sm font-medium">
            Total Items: {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}
          </div>
        )}
      </div>
    </div>
  );
} 