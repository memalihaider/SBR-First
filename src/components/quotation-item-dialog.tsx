'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Product, Service, ProductService } from '@/types';

interface SelectedService {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
}

interface QuotationItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (quantity: number, selectedServices: SelectedService[]) => void;
  productServices: ProductService[]; // Services linked to the product
  allServices: Service[]; // All available services for reference
}

export function QuotationItemDialog({
  isOpen,
  onClose,
  product,
  onConfirm,
  productServices,
  allServices
}: QuotationItemDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // When dialog opens with a new product, reset selections
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedServices([]);
    }
  }, [isOpen, product?.id]);

  const handleServiceToggle = (serviceId: string, serviceName: string, servicePrice: number) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.serviceId === serviceId);
      if (exists) {
        return prev.filter(s => s.serviceId !== serviceId);
      } else {
        return [...prev, { serviceId, serviceName, servicePrice }];
      }
    });
  };

  const handleConfirm = () => {
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    onConfirm(quantity, selectedServices);
    onClose();
  };

  const calculateServiceTotal = () => {
    return selectedServices.reduce((sum, service) => sum + service.servicePrice, 0);
  };

  const productTotal = (product?.sellingPrice || 0) * quantity;
  const servicesTotal = calculateServiceTotal();
  const grandTotal = productTotal + servicesTotal;

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {product.name} to Quotation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">SKU</Label>
                  <p className="font-semibold">{product.sku}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Unit Price</Label>
                  <p className="font-semibold">${product.sellingPrice.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-xs text-gray-600">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1"
                />
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Product Total:</span>
                  <span>${productTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Services */}
          {productServices && productServices.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Available Services</CardTitle>
                <p className="text-xs text-gray-600 mt-1">{productServices.length} services available for this product</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {productServices.map((service) => (
                  <div
                    key={service.serviceId}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={service.serviceId}
                      checked={selectedServices.some(s => s.serviceId === service.serviceId)}
                      onCheckedChange={() =>
                        handleServiceToggle(service.serviceId, service.serviceName, service.price)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={service.serviceId} className="font-medium cursor-pointer">
                        {service.serviceName}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">${service.price.toFixed(2)}</p>
                    </div>
                    {selectedServices.some(s => s.serviceId === service.serviceId) && (
                      <Badge variant="secondary" className="whitespace-nowrap mt-1">Selected</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">No services linked to this product</p>
            </div>
          )}

          {/* Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Product Subtotal:</span>
                  <span>${productTotal.toFixed(2)}</span>
                </div>
                {selectedServices.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Services ({selectedServices.length}):</span>
                    <span>${servicesTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-blue-300 flex justify-between font-semibold">
                  <span>Item Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Add to Quotation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
