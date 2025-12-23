'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryStore } from '@/stores/inventory';
import { Product } from '@/types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onStockUpdate?: (productId: string, newStock: number) => void;
}

export function StockAdjustmentModal({ isOpen, onClose, product, onStockUpdate }: StockAdjustmentModalProps) {
  const [type, setType] = useState<'increase' | 'decrease' | 'transfer'>('increase');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const { addStockAdjustment, updateProductStock } = useInventoryStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!product || !quantity || !reason) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) return;

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
      adjustedBy: 'Current User', // In a real app, this would come from auth
      reference: reference || undefined,
    });

    // Update product stock
    updateProductStock(product.id, newStock);
    onStockUpdate?.(product.id, newStock);

    // Reset form
    setType('increase');
    setQuantity('');
    setReason('');
    setReference('');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock - {product?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current-stock">Current Stock</Label>
              <Input
                id="current-stock"
                value={product?.currentStock || 0}
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
                  <SelectItem value="increase">Increase</SelectItem>
                  <SelectItem value="decrease">Decrease</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
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
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for adjustment"
              required
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!quantity || !reason}>
              Adjust Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

export function StockHistoryModal({ isOpen, onClose, product }: StockHistoryModalProps) {
  const { getStockAdjustments } = useInventoryStore();
  const adjustments = product ? getStockAdjustments(product.id) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Stock Adjustment History - {product?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {adjustments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No stock adjustments found for this product.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {adjustments
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((adjustment) => (
                  <div key={adjustment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        adjustment.type === 'increase' ? 'bg-green-100' : adjustment.type === 'decrease' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {adjustment.type === 'increase' ? (
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        ) : adjustment.type === 'decrease' ? (
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{adjustment.reason}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>By: {adjustment.adjustedBy}</span>
                          <span>•</span>
                          <span>{adjustment.date.toLocaleDateString()}</span>
                          {adjustment.reference && (
                            <>
                              <span>•</span>
                              <span>Ref: {adjustment.reference}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        adjustment.type === 'increase' ? 'text-green-600' :
                        adjustment.type === 'decrease' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {adjustment.type === 'increase' ? '+' : adjustment.type === 'decrease' ? '-' : ''}
                        {adjustment.quantity}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{adjustment.id}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}