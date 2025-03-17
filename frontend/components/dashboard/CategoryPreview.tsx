/**
 * Category Preview Component
 * 
 * This component displays a preview of how a category will appear on the storefront.
 * It includes the category image, name, description, and a sample of products.
 */
import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Category } from '@/lib/category-api';
import { 
  ChevronRight, 
  Tag, 
  Layers, 
  ShoppingCart, 
  Eye, 
  EyeOff,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink
} from 'lucide-react';
import ImageWithFallback from '@/components/ui/image-with-fallback';
import { cn } from '@/lib/utils';

interface CategoryPreviewProps {
  category: Partial<Category>;
  className?: string;
}

/**
 * Sample product data for the preview
 */
const sampleProducts = [
  {
    id: '1',
    name: 'Sample Product 1',
    price: '$99.99',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Product+1',
  },
  {
    id: '2',
    name: 'Sample Product 2',
    price: '$149.99',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Product+2',
  },
  {
    id: '3',
    name: 'Sample Product 3',
    price: '$79.99',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Product+3',
  },
  {
    id: '4',
    name: 'Sample Product 4',
    price: '$129.99',
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Product+4',
  },
];

/**
 * Sample child categories for the preview
 */
const sampleChildCategories = [
  { id: '1', name: 'Sample Subcategory 1', totalProducts: 12 },
  { id: '2', name: 'Sample Subcategory 2', totalProducts: 8 },
  { id: '3', name: 'Sample Subcategory 3', totalProducts: 6 },
];

type ViewportType = 'desktop' | 'tablet' | 'mobile';

export default function CategoryPreview({ category, className }: CategoryPreviewProps) {
  // State to manage viewport preview size
  const [viewport, setViewport] = useState<ViewportType>('desktop');
  
  // Placeholder for missing data
  const categoryName = category.name || 'Category Name';
  const categoryDescription = category.description || 'This is where your category description will appear. Add details to help customers understand what products are included in this category.';
  const isVisible = category.isVisible !== undefined ? category.isVisible : true;
  
  // Generate a placeholder category image URL based on the category name
  const placeholderCategoryImage = `https://placehold.co/1200x600/f1f5f9/475569?text=${encodeURIComponent(categoryName || 'Category Preview')}`;
  const productPlaceholder = 'https://placehold.co/400x400/e2e8f0/1e293b?text=Product';
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">Storefront Preview</CardTitle>
            <CardDescription>
              This is how your category will appear to customers
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Viewport selection - custom button group */}
            <div className="flex rounded-md overflow-hidden border border-slate-200">
              <Button 
                variant={viewport === 'desktop' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewport('desktop')}
                title="Desktop view"
                className="rounded-none border-0"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewport === 'tablet' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewport('tablet')}
                title="Tablet view"
                className="rounded-none border-0 border-l border-r border-slate-200"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewport === 'mobile' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewport('mobile')}
                title="Mobile view"
                className="rounded-none border-0"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            
            <Badge variant={isVisible ? 'success' : 'secondary'}>
              {isVisible ? (
                <span className="flex items-center"><Eye className="h-3 w-3 mr-1" /> Visible</span>
              ) : (
                <span className="flex items-center"><EyeOff className="h-3 w-3 mr-1" /> Hidden</span>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      {/* Viewport container with responsive sizing */}
      <div 
        className={cn(
          "mx-auto border-x border-slate-200 transition-all duration-300 bg-white",
          viewport === 'desktop' ? 'w-full' : 
          viewport === 'tablet' ? 'w-[768px] max-w-full' :
          'w-[375px] max-w-full'
        )}
      >
        {/* Store header simulation */}
        <div className="h-12 bg-slate-900 text-white flex items-center px-4 justify-between">
          <div className="font-bold">MARIO UOMO</div>
          <div className="flex items-center gap-4">
            <div className="text-xs">Search</div>
            <div className="text-xs">Cart</div>
            <div className="text-xs">Account</div>
          </div>
        </div>
        
        {/* Store navigation simulation */}
        <div className="h-10 bg-slate-800 text-white text-sm flex items-center px-4 gap-4">
          <div>Home</div>
          <div className="flex items-center">
            <ChevronRight className="h-3 w-3 mr-1" />
            <span className="font-medium">{categoryName}</span>
          </div>
        </div>
        
        {/* Category hero image and title */}
        <div className="relative w-full h-64 overflow-hidden">
          {category.imageUrl ? (
            <ImageWithFallback
              src={category.imageUrl}
              alt={categoryName}
              fallbackSrc={placeholderCategoryImage}
              fill
              style={{ objectFit: 'cover' }}
              className="group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center">
              <p className="text-slate-600 text-center px-4">
                Add a category image to enhance visual appeal
              </p>
            </div>
          )}
          
          {/* Hero overlay with category name */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-white text-3xl font-bold mb-2">{categoryName}</h1>
            {category.parentId && (
              <div className="flex items-center text-white/80 text-sm mb-2">
                <span>Parent Category</span>
                <ChevronRight className="h-3 w-3 mx-1" />
                <span className="font-medium">{categoryName}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="p-6">
          {/* Category description */}
          <div className="prose prose-sm mb-8">
            <p className="text-slate-600">{categoryDescription}</p>
          </div>
          
          {/* Subcategories section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-slate-500" />
              Subcategories
            </h2>
            
            <div className={cn(
              "grid gap-3",
              viewport === 'mobile' ? 'grid-cols-1' : 
              viewport === 'tablet' ? 'grid-cols-2' : 
              'grid-cols-3'
            )}>
              {(category.children && category.children.length > 0 
                ? category.children 
                : sampleChildCategories
              ).map(childCategory => (
                <Card key={childCategory.id} className="bg-slate-50 hover:bg-slate-100 transition-colors">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{childCategory.name}</h3>
                      <p className="text-xs text-slate-500">
                        {childCategory.totalProducts || 0} products
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Featured products section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-slate-500" />
              Featured Products
            </h2>
            
            <div className={cn(
              "grid gap-4", 
              viewport === 'mobile' ? 'grid-cols-1' : 
              viewport === 'tablet' ? 'grid-cols-2' : 
              'grid-cols-4'
            )}>
              {sampleProducts.map(product => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative pt-[100%] bg-slate-100">
                    <div className="absolute inset-0 p-3">
                      <div className="relative w-full h-full">
                        <ImageWithFallback
                          src={product.imageUrl}
                          alt={product.name}
                          fallbackSrc={productPlaceholder}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-slate-900">{product.price}</span>
                      <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* SEO information */}
          {category.seoMetadata && (
            <div className="mt-8 border-t border-slate-200 pt-4">
              <h2 className="text-sm font-semibold text-slate-500 mb-2 flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                SEO Preview
              </h2>
              <div className="bg-white border border-slate-200 rounded-md p-3">
                <h3 className="text-blue-600 text-base font-medium hover:underline truncate">
                  {category.seoMetadata.title || categoryName} | Mario Uomo
                </h3>
                <p className="text-green-700 text-xs truncate">
                  www.mariouomo.com/category/{category.slug || 'category-slug'}
                </p>
                <p className="text-slate-700 text-sm line-clamp-2 mt-1">
                  {category.seoMetadata.description || categoryDescription}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Store footer simulation */}
        <div className="bg-slate-800 text-white p-6 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <h3 className="font-medium mb-2">Shop</h3>
              <ul className="space-y-1 text-slate-300">
                <li>New Arrivals</li>
                <li>Best Sellers</li>
                <li>Sale</li>
                <li>All Categories</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Customer Service</h3>
              <ul className="space-y-1 text-slate-300">
                <li>Contact Us</li>
                <li>Shipping & Returns</li>
                <li>FAQs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">About</h3>
              <ul className="space-y-1 text-slate-300">
                <li>Our Story</li>
                <li>Blog</li>
                <li>Store Locations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Follow Us</h3>
              <ul className="space-y-1 text-slate-300">
                <li>Instagram</li>
                <li>Facebook</li>
                <li>Twitter</li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-slate-700 text-slate-400">
            © {new Date().getFullYear()} Mario Uomo. All rights reserved.
          </div>
        </div>
      </div>
    </Card>
  );
} 