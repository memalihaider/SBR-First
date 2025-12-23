'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import mockData from '@/lib/mock-data';
import { useCurrencyStore } from '@/stores/currency';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoice: any) => void;
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function CreateInvoiceModal({ isOpen, onClose, onInvoiceCreated }: CreateInvoiceModalProps) {
  const { formatAmount } = useCurrencyStore();

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseOrder, setPurchaseOrder] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Items state
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  // Get available projects for selection
  const availableProjects = mockData.projects.slice(0, 10).map(project => ({
    id: project.id,
    name: project.name,
    projectNumber: project.projectNumber
  }));

  // Get available products for selection
  const availableProducts = mockData.products.slice(0, 20).map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    sellingPrice: product.sellingPrice,
    currentStock: product.currentStock
  }));

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error('Please select a product and enter a valid quantity');
      return;
    }

    const product = availableProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    if (quantity > product.currentStock) {
      toast.error('Quantity exceeds available stock');
      return;
    }

    const newItem: InvoiceItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.sellingPrice,
      totalPrice: quantity * product.sellingPrice
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setQuantity(1);
    toast.success('Item added to invoice');
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    toast.success('Item removed from invoice');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceNumber.trim()) {
      toast.error('Invoice number is required');
      return;
    }

    if (!purchaseOrder.trim()) {
      toast.error('Purchase order is required');
      return;
    }

    if (!projectId) {
      toast.error('Project selection is required');
      return;
    }

    if (!dueDate) {
      toast.error('Due date is required');
      return;
    }

    if (items.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    const selectedProject = availableProjects.find(p => p.id === projectId);

    const newInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim(),
      purchaseOrder: purchaseOrder.trim(),
      projectName: selectedProject?.name || '',
      projectId,
      amount: totalAmount,
      dueDate,
      submittedDate: new Date().toLocaleDateString(),
      paymentMethod: paymentMethod || 'Bank Transfer',
      status: 'draft' as const,
      notes: notes.trim(),
      items,
      subtotal,
      taxAmount,
      totalAmount
    };

    onInvoiceCreated(newInvoice);
    toast.success('Invoice created successfully');

    // Reset form
    setInvoiceNumber('');
    setPurchaseOrder('');
    setProjectId('');
    setDueDate('');
    setPaymentMethod('');
    setNotes('');
    setItems([]);
    setSelectedProduct('');
    setQuantity(1);

    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setInvoiceNumber('');
    setPurchaseOrder('');
    setProjectId('');
    setDueDate('');
    setPaymentMethod('');
    setNotes('');
    setItems([]);
    setSelectedProduct('');
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Create New Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g., VND-INV-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="purchaseOrder">Purchase Order *</Label>
                  <Input
                    id="purchaseOrder"
                    value={purchaseOrder}
                    onChange={(e) => setPurchaseOrder(e.target.value)}
                    placeholder="e.g., PO-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project">Project *</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.projectNumber} - {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or terms..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.sku} - {product.name} (Stock: {product.currentStock})
                        </SelectItem>
                      ))}
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
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={handleAddItem} className="w-full">
                    Add Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × {formatAmount(item.unitPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatAmount(item.totalPrice)}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Summary */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatAmount(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>{formatAmount(taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>{formatAmount(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">
              Create Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}