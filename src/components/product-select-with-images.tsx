'use client';

import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  sku?: string;
  images?: string[];
  modelNumber?: string;
}

interface ProductSelectWithImagesProps {
  products: Product[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProductSelectWithImages({
  products,
  value,
  onValueChange,
  placeholder = 'Choose a product...',
  className = 'flex-1'
}: ProductSelectWithImagesProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-w-2xl">
        {products.map((product) => {
          const hasImage = product.images && Array.isArray(product.images) && product.images.length > 0;
          const productImage = hasImage ? product.images?.[0] : null;
          const modelNumber = product.modelNumber || 'N/A';
          
          return (
            <SelectItem key={product.id} value={product.id}>
              <div className="flex items-center gap-3 py-1">
                {/* Product Image Thumbnail */}
                {productImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={productImage}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Product Details */}
                <div className="flex-1">
                  {/* Product Name */}
                  <div className="font-medium text-sm text-gray-900">
                    {product.name}
                  </div>
                  
                  {/* Product Details Row: SKU, Price, Model Number */}
                  <div className="flex items-center gap-2 mt-0.5">
                    {product.sku && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        SKU: {product.sku}
                      </Badge>
                    )}
                    
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 font-semibold">
                      ${product.sellingPrice.toFixed(2)}
                    </Badge>
                    
                    {modelNumber !== 'N/A' && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        Model: {modelNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
