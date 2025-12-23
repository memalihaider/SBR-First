'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventoryStore } from '@/stores/inventory';
import { Product } from '@/types';
import { toast } from 'sonner';

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onStockUpdated?: (productId: string, newStock: number) => void;
}

export function UpdateStockModal({ isOpen, onClose, product, onStockUpdated }: UpdateStockModalProps) {
  const [type, setType] = useState<'increase' | 'decrease' | 'transfer'>('increase');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const { addStockAdjustment, updateProductStock } = useInventoryStore();

  useEffect(() => {
    if (!isOpen) {
      setType('increase');
      setQuantity('');
      setReason('');
      setReference('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!product || !quantity || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    // Calculate new stock level
    let newStock = product.currentStock;
    if (type === 'increase') {
      newStock += qty;
    } else if (type === 'decrease') {
      newStock = Math.max(0, newStock - qty);
    }

    // Add adjustment record
    addStockAdjustment({
      productId: product.id,
      productName: product.name,
      type,
      quantity: qty,
      reason,
      adjustedBy: 'Vendor User', // In a real app, this would come from auth
      reference: reference || undefined,
    });

    // Update product stock
    updateProductStock(product.id, newStock);
    onStockUpdated?.(product.id, newStock);

    toast.success(`Stock ${type}d successfully! New stock level: ${newStock}`);
    onClose();
  };

  const previewNewStock = () => {
    if (!product || !quantity) return product?.currentStock || 0;

    const qty = parseInt(quantity) || 0;
    if (type === 'increase') {
      return product.currentStock + qty;
    } else if (type === 'decrease') {
      return Math.max(0, product.currentStock - qty);
    }
    return product.currentStock;
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Stock - {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current-stock">Current Stock</Label>
              <Input
                id="current-stock"
                value={product.currentStock}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="new-stock">New Stock (Preview)</Label>
              <Input
                id="new-stock"
                value={previewNewStock()}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Adjustment Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase Stock</SelectItem>
                  <SelectItem value="decrease">Decrease Stock</SelectItem>
                  <SelectItem value="transfer">Transfer Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for stock adjustment"
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="PO number, invoice, etc."
            />
          </div>

          {/* Stock Level Indicators */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Stock Level Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Minimum Level:</span>
                <span className="font-medium">{product.minStockLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>Reorder Point:</span>
                <span className="font-medium">{product.reorderPoint}</span>
              </div>
              <div className="flex justify-between">
                <span>Maximum Level:</span>
                <span className="font-medium">{product.maxStockLevel}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!quantity || !reason}>
              Update Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}