'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import mockData from '@/lib/mock-data';
import { QuotationItemDialog } from './quotation-item-dialog';
import { ProductSelectWithImages } from './product-select-with-images';
import { Product, ProductService } from '@/types';

interface QuotationItemWithServices {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  selectedServices: Array<{
    serviceId: string;
    serviceName: string;
    servicePrice: number;
  }>;
}

interface Props {
  children: React.ReactNode;
  onCreate: (q: any) => void;
}

export default function AddClientQuotationDialogV2({ children, onCreate }: Props) {
  const [projectName, setProjectName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState('');
  
  // Items state
  const [items, setItems] = useState<QuotationItemWithServices[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  
  // Service selection dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedProductForDialog, setSelectedProductForDialog] = useState<Product | null>(null);

  // Get available products
  const availableProducts = mockData.products.slice(0, 20).map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    sellingPrice: product.sellingPrice,
    services: product.services || [],
  }));

  const handleProductSelect = (productId: string) => {
    if (!productId) return;
    
    // Find product from availableProducts first (faster)
    const availableProduct = availableProducts.find(p => p.id === productId);
    if (availableProduct) {
      // Convert availableProduct to full Product object for the dialog
      const product = {
        ...availableProduct,
        // Ensure all required Product fields exist
        id: productId
      } as Product;
      setSelectedProductForDialog(product);
      setItemDialogOpen(true);
      return;
    }
    
    // Fallback to mockData if not found
    const mockProduct = mockData.products.find(p => p.id === productId) as any;
    if (mockProduct) {
      setSelectedProductForDialog(mockProduct);
      setItemDialogOpen(true);
    }
  };

  const handleAddItem = (quantity: number, selectedServices: any[]) => {
    if (!selectedProductForDialog) return;

    const product = availableProducts.find(p => p.id === selectedProductForDialog.id);
    if (!product) return;

    const productAmount = quantity * product.sellingPrice;
    const servicesAmount = selectedServices.reduce((sum, s) => sum + s.servicePrice, 0);
    const totalAmount = productAmount + servicesAmount;

    const newItem: QuotationItemWithServices = {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.sellingPrice,
      amount: totalAmount,
      selectedServices
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setItemDialogOpen(false);
    toast.success(`${product.name} added to quotation with ${selectedServices.length} service(s)`);
  };

  const handleRemoveItem = (index: number) => {
    const item = items[index];
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    toast.success(`${item.productName} removed from quotation`);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    return { subtotal, taxAmount, totalAmount };
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  const handleSubmit = () => {
    if (!projectName.trim()) {
      toast.error('Please provide a project name');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item to the quotation');
      return;
    }

    const quotation = {
      id: `QUOT-${Date.now()}`,
      quotationNumber: `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      projectName: projectName.trim(),
      projectTitle: projectTitle.trim(),
      description: description.trim(),
      issueDate: new Date(issueDate),
      validUntil: new Date(validUntil),
      subtotal,
      taxAmount,
      totalAmount,
      status: 'draft',
      items,
      notes,
    };

    onCreate(quotation);
    toast.success('Quotation created successfully!');
    
    // Reset form
    setProjectName('');
    setProjectTitle('');
    setDescription('');
    setItems([]);
    setNotes('');
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Quotation with Services</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Project Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quotation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="projectTitle">Project Title</Label>
                  <Input
                    id="projectTitle"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter project description"
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Products */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add Products & Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="productSelect">Select Product</Label>
                  <div className="flex gap-2 mt-1">
                    <ProductSelectWithImages
                      products={availableProducts}
                      value={selectedProduct}
                      onValueChange={handleProductSelect}
                      placeholder="Choose a product..."
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select a product to add it with optional services</p>
                </div>
              </CardContent>
            </Card>

            {/* Items List */}
            {items.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quotation Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-600">SKU: {item.productName} | Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <p className="font-semibold text-blue-600">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-600 hover:text-red-700 h-6 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Services in same row */}
                      {item.selectedServices.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                          <span className="text-xs font-medium text-gray-700">Services:</span>
                          <div className="flex flex-wrap gap-2">
                            {item.selectedServices.map((service) => (
                              <Badge key={service.serviceId} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                {service.serviceName}
                                <span className="ml-1 font-semibold">${service.servicePrice.toFixed(2)}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Item Total */}
                      <div className="pt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-600">
                          Product: ${(item.quantity * item.unitPrice).toFixed(2)}
                          {item.selectedServices.length > 0 && ` + Services: $${item.selectedServices.reduce((sum, s) => sum + s.servicePrice, 0).toFixed(2)}`}
                        </span>
                        <span className="font-semibold text-green-600">Total: ${item.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-300 flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes for the quotation"
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                Close
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={items.length === 0}>
                Create Quotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Selection Dialog */}
      <QuotationItemDialog
        isOpen={itemDialogOpen}
        onClose={() => {
          setItemDialogOpen(false);
          setSelectedProductForDialog(null);
        }}
        product={selectedProductForDialog}
        onConfirm={handleAddItem}
        productServices={selectedProductForDialog?.services || []}
        allServices={[]}
      />
    </>
  );
}
