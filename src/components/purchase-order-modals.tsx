'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryStore } from '@/stores/inventory';
import { useCurrencyStore } from '@/stores/currency';
import mockData from '@/lib/mock-data';
import { Product } from '@/types';

interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDelivery: Date;
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
}

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (order: PurchaseOrder) => void;
}

export function CreatePurchaseOrderModal({ isOpen, onClose, onOrderCreated }: CreatePurchaseOrderModalProps) {
  const { addPurchaseOrder, getSuppliers } = useInventoryStore();
  const { formatAmount } = useCurrencyStore();
  const suppliers = getSuppliers();

  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    expectedDelivery: '',
    taxRate: '10',
    notes: '',
  });

  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setFormData(prev => ({
      ...prev,
      supplierId,
      supplierName: supplier?.name || '',
    }));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Update product name if productId changed
    if (field === 'productId') {
      const product = mockData.products.find(p => p.id === value);
      updatedItems[index].productName = product?.name || '';
    }

    // Recalculate total price
    updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice;

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = parseFloat(formData.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.expectedDelivery || items.some(item => !item.productId || item.quantity <= 0)) {
      return;
    }

    const { subtotal, taxAmount, totalAmount } = calculateTotals();

    const newOrder: Omit<PurchaseOrder, 'id' | 'poNumber' | 'orderDate'> = {
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      expectedDelivery: new Date(formData.expectedDelivery),
      status: 'draft',
      items,
      subtotal,
      taxRate: parseFloat(formData.taxRate),
      taxAmount,
      totalAmount,
      notes: formData.notes || undefined,
    };

    addPurchaseOrder(newOrder);

    // Reset form
    setFormData({
      supplierId: '',
      supplierName: '',
      expectedDelivery: '',
      taxRate: '10',
      notes: '',
    });
    setItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
    onClose();
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier and Delivery Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={formData.supplierId} onValueChange={handleSupplierChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expectedDelivery">Expected Delivery</Label>
              <Input
                id="expectedDelivery"
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-4">
                    <Label>Product</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => handleItemChange(index, 'productId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockData.products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <Input
                      value={formatAmount(item.totalPrice)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="w-full"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax and Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
              />
            </div>
            <div></div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any special instructions or notes..."
              rows={3}
            />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatAmount(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({formData.taxRate}%):</span>
                <span className="font-medium">{formatAmount(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">{formatAmount(totalAmount)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.supplierId || !formData.expectedDelivery || items.some(item => !item.productId)}>
              Create Purchase Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface PurchaseOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: PurchaseOrder;
}

export function PurchaseOrderDetailsModal({ isOpen, onClose, order }: PurchaseOrderDetailsModalProps) {
  const { formatAmount } = useCurrencyStore();

  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-cyan-100 text-cyan-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Purchase Order Details - {order.poNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Information</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">PO Number</Label>
                  <p className="text-sm font-medium">{order.poNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusBadge(order.status)}>{order.status.toUpperCase()}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Order Date</Label>
                  <p className="text-sm">{order.orderDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Expected Delivery</Label>
                  <p className="text-sm">{order.expectedDelivery.toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Supplier Information</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Supplier</Label>
                  <p className="text-sm font-medium">{order.supplierName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                  <p className="text-lg font-bold text-green-600">{formatAmount(order.totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × {formatAmount(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">{formatAmount(item.totalPrice)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatAmount(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({order.taxRate}%):</span>
                  <span className="font-medium">{formatAmount(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{formatAmount(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
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