'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import mockData from '@/lib/mock-data';
import { useCurrencyStore } from '@/stores/currency';
import { useInvoicesStore } from '@/stores/invoices';
import { Invoice, InvoiceItem, InvoiceTax, InvoiceServiceCharge, MainCategory, SubCategory, Product } from '@/types';

export default function InvoicesPage() {
  const { formatAmount } = useCurrencyStore();
  const { invoices } = useInvoicesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'>('all');
  
  // Dialog states
  const [createInvoiceDialog, setCreateInvoiceDialog] = useState(false);
  const [viewInvoiceDialog, setViewInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Form states
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    projectId: '',
    quotationId: '',
    paymentTerms: 'Net 30 days',
    deliveryTerms: '',
    warrantyTerms: '',
    notes: '',
    items: [] as InvoiceItem[],
    taxes: [] as InvoiceTax[],
    serviceCharges: [] as InvoiceServiceCharge[],
  });

  // Product selection states
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Load available products on component mount
  useEffect(() => {
    setAvailableProducts(mockData.products.filter(p => p.status === 'active'));
  }, []);

  // Filter products based on category selection
  const filteredProducts = availableProducts.filter(product => {
    const matchesMainCategory = !selectedMainCategory || selectedMainCategory === 'all' || product.mainCategoryId === selectedMainCategory;
    const matchesSubCategory = !selectedSubCategory || selectedSubCategory === 'all' || product.subCategoryId === selectedSubCategory;
    const matchesSearch = !productSearchTerm || 
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(productSearchTerm.toLowerCase());
    
    return matchesMainCategory && matchesSubCategory && matchesSearch;
  });

  const getFilteredInvoices = () => {
    let filtered = invoices;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(i => i.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredInvoices = getFilteredInvoices();
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);
  const pendingAmount = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.totalAmount, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Add product to invoice
  const addProductToInvoice = (product: Product) => {
    const mainCategory = mockData.mainCategories.find(mc => mc.id === product.mainCategoryId);
    const subCategory = mockData.subCategories.find(sc => sc.id === product.subCategoryId);
    
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      mainCategoryId: product.mainCategoryId,
      mainCategoryName: mainCategory?.name || 'Unknown',
      subCategoryId: product.subCategoryId,
      subCategoryName: subCategory?.name || 'Unknown',
      manufacturer: product.manufacturer,
      modelNumber: product.modelNumber,
      description: product.description,
      specifications: product.specifications,
      quantity: 1,
      unitPrice: product.sellingPrice,
      discount: 0,
      discountAmount: 0,
      taxRate: 8, // Default VAT rate
      taxAmount: (product.sellingPrice * 8) / 100,
      serviceCharge: 0,
      serviceChargeAmount: 0,
      totalPrice: product.sellingPrice * 1.08, // Including 8% VAT
      stockAvailable: product.currentStock,
      isStockTracked: product.isSerialTracked || product.isBatchTracked,
    };

    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Update invoice item
  const updateInvoiceItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate amounts
          const subtotal = updatedItem.unitPrice * updatedItem.quantity;
          updatedItem.discountAmount = (subtotal * updatedItem.discount) / 100;
          const afterDiscount = subtotal - updatedItem.discountAmount;
          updatedItem.taxAmount = (afterDiscount * updatedItem.taxRate) / 100;
          updatedItem.serviceChargeAmount = (afterDiscount * updatedItem.serviceCharge) / 100;
          updatedItem.totalPrice = afterDiscount + updatedItem.taxAmount + updatedItem.serviceChargeAmount;
          
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  // Remove invoice item
  const removeInvoiceItem = (itemId: string) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  // Add tax
  const addTax = () => {
    const newTax: InvoiceTax = {
      id: `tax-${Date.now()}`,
      name: 'Custom Tax',
      rate: 0,
      amount: 0,
      type: 'custom',
      isInclusive: false,
    };
    setInvoiceForm(prev => ({
      ...prev,
      taxes: [...prev.taxes, newTax],
    }));
  };

  // Add service charge
  const addServiceCharge = () => {
    const newServiceCharge: InvoiceServiceCharge = {
      id: `service-${Date.now()}`,
      name: 'Custom Service',
      rate: 0,
      amount: 0,
      type: 'custom',
    };
    setInvoiceForm(prev => ({
      ...prev,
      serviceCharges: [...prev.serviceCharges, newServiceCharge],
    }));
  };

  // Calculate invoice totals
  const calculateTotals = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity - item.discountAmount), 0);
    const totalTaxAmount = invoiceForm.items.reduce((sum, item) => sum + item.taxAmount, 0) + 
                          invoiceForm.taxes.reduce((sum, tax) => sum + tax.amount, 0);
    const totalServiceChargeAmount = invoiceForm.items.reduce((sum, item) => sum + item.serviceChargeAmount, 0) + 
                                    invoiceForm.serviceCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const totalAmount = subtotal + totalTaxAmount + totalServiceChargeAmount;
    
    return { subtotal, totalTaxAmount, totalServiceChargeAmount, totalAmount };
  };

  const { subtotal, totalTaxAmount, totalServiceChargeAmount, totalAmount } = calculateTotals();

  // Handler functions
  const handleCreateInvoice = () => {
    if (!invoiceForm.customerId) {
      toast.error('Please select a customer');
      return;
    }
    
    if (invoiceForm.items.length === 0) {
      toast.error('Please add at least one item to the invoice');
      return;
    }

    // Validate stock availability
    const insufficientStock = invoiceForm.items.filter(item => 
      item.quantity > item.stockAvailable && item.isStockTracked
    );
    
    if (insufficientStock.length > 0) {
      toast.error(`Insufficient stock for: ${insufficientStock.map(item => item.productName).join(', ')}`);
      return;
    }

    // Create new invoice
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `INV-2025-${String(invoices.length + 1).padStart(4, '0')}`,
      customerId: invoiceForm.customerId,
      customerName: mockData.getCustomerById(invoiceForm.customerId)?.companyName || 'Unknown',
      projectId: invoiceForm.projectId || undefined,
      projectName: invoiceForm.projectId ? mockData.getProjectById(invoiceForm.projectId)?.name : undefined,
      quotationId: invoiceForm.quotationId || undefined,
      status: 'draft',
      items: invoiceForm.items,
      subtotal,
      discountAmount: invoiceForm.items.reduce((sum, item) => sum + item.discountAmount, 0),
      discountPercentage: 0,
      taxes: invoiceForm.taxes,
      totalTaxAmount,
      serviceCharges: invoiceForm.serviceCharges,
      totalServiceChargeAmount,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      stockReserved: false,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentTerms: invoiceForm.paymentTerms,
      deliveryTerms: invoiceForm.deliveryTerms,
      warrantyTerms: invoiceForm.warrantyTerms,
      notes: invoiceForm.notes,
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real app, this would be saved to the database
    console.log('Creating invoice:', newInvoice);
    toast.success(`Invoice ${newInvoice.invoiceNumber} created successfully!`);

    // Reset form
    setInvoiceForm({
      customerId: '',
      projectId: '',
      quotationId: '',
      paymentTerms: 'Net 30 days',
      deliveryTerms: '',
      warrantyTerms: '',
      notes: '',
      items: [],
      taxes: [],
      serviceCharges: [],
    });
    setCreateInvoiceDialog(false);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewInvoiceDialog(true);
  };

  const handleSendInvoice = (invoiceId: string) => {
    // In a real app, this would update the invoice status in the database
    console.log('Sending invoice:', invoiceId);
    toast.success('Invoice sent to customer successfully!');
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    // In a real app, this would update the invoice status in the database
    console.log('Marking invoice as paid:', invoiceId);
    toast.success('Invoice marked as paid!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage detailed customer invoices with product tracking and tax calculations</p>
        </div>
        <Dialog open={createInvoiceDialog} onOpenChange={setCreateInvoiceDialog}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Create a detailed invoice with product selection, tax calculations, and service charges
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer and Project Selection */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={invoiceForm.customerId} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, customerId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Select value={invoiceForm.projectId} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, projectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quotation">Quotation (Optional)</Label>
                  <Select value={invoiceForm.quotationId} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, quotationId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quotation" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.quotations.map((quotation) => (
                        <SelectItem key={quotation.id} value={quotation.id}>
                          {quotation.quotationNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Product Selection</Label>
                </div>
                
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label>Main Category</Label>
                    <Select value={selectedMainCategory} onValueChange={setSelectedMainCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {mockData.mainCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sub Category</Label>
                    <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All subcategories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All subcategories</SelectItem>
                        {mockData.subCategories
                          .filter(sub => !selectedMainCategory || selectedMainCategory === 'all' || sub.mainCategoryId === selectedMainCategory)
                          .map((subCategory) => (
                          <SelectItem key={subCategory.id} value={subCategory.id}>
                            {subCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Search Products</Label>
                    <Input
                      placeholder="Search by name, SKU, or manufacturer"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <div className="text-sm text-gray-500">
                      {filteredProducts.length} products available
                    </div>
                  </div>
                </div>

                {/* Product List */}
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  <div className="grid grid-cols-1 gap-2 p-2">
                    {filteredProducts.slice(0, 10).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.name}</span>
                            <Badge variant="outline">{product.sku}</Badge>
                            <Badge variant="secondary">{product.manufacturer}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {product.mainCategoryId && mockData.mainCategories.find(mc => mc.id === product.mainCategoryId)?.name} › 
                            {product.subCategoryId && mockData.subCategories.find(sc => sc.id === product.subCategoryId)?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Stock: {product.currentStock} | Price: {formatAmount(product.sellingPrice)}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => addProductToInvoice(product)}
                          disabled={product.currentStock <= 0}
                        >
                          Add to Invoice
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Invoice Items ({invoiceForm.items.length})</Label>
                </div>
                
                {invoiceForm.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No items added yet. Select products above to add them to the invoice.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoiceForm.items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-3">
                            <Label className="text-xs text-gray-600">Product</Label>
                            <div className="font-medium text-sm">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.productSku}</div>
                            <div className="text-xs text-gray-500">{item.mainCategoryName} › {item.subCategoryName}</div>
                          </div>
                          <div className="col-span-1">
                            <Label className="text-xs text-gray-600">Stock</Label>
                            <div className={`text-xs ${item.quantity > item.stockAvailable ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                              {item.stockAvailable}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Label className="text-xs text-gray-600">Qty</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-1">
                            <Label className="text-xs text-gray-600">Unit Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-1">
                            <Label className="text-xs text-gray-600">Discount %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e) => updateInvoiceItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-1">
                            <Label className="text-xs text-gray-600">Tax %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.taxRate}
                              onChange={(e) => updateInvoiceItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-1">
                            <Label className="text-xs text-gray-600">Service %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.serviceCharge}
                              onChange={(e) => updateInvoiceItem(item.id, 'serviceCharge', parseFloat(e.target.value) || 0)}
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-gray-600">Total</Label>
                            <div className="font-bold text-sm">{formatAmount(item.totalPrice)}</div>
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeInvoiceItem(item.id)}
                              className="text-red-600 hover:text-red-700 h-8"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Taxes and Service Charges */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Additional Taxes</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addTax}>
                      Add Tax
                    </Button>
                  </div>
                  {invoiceForm.taxes.map((tax) => (
                    <div key={tax.id} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input placeholder="Tax name" value={tax.name} onChange={(e) => {
                          const updatedTaxes = invoiceForm.taxes.map(t => 
                            t.id === tax.id ? { ...t, name: e.target.value } : t
                          );
                          setInvoiceForm(prev => ({ ...prev, taxes: updatedTaxes }));
                        }} />
                      </div>
                      <div className="w-20">
                        <Input type="number" placeholder="%" value={tax.rate} onChange={(e) => {
                          const rate = parseFloat(e.target.value) || 0;
                          const updatedTaxes = invoiceForm.taxes.map(t => 
                            t.id === tax.id ? { ...t, rate, amount: (subtotal * rate) / 100 } : t
                          );
                          setInvoiceForm(prev => ({ ...prev, taxes: updatedTaxes }));
                        }} />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setInvoiceForm(prev => ({ ...prev, taxes: prev.taxes.filter(t => t.id !== tax.id) }));
                      }}>×</Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Service Charges</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addServiceCharge}>
                      Add Charge
                    </Button>
                  </div>
                  {invoiceForm.serviceCharges.map((charge) => (
                    <div key={charge.id} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input placeholder="Service name" value={charge.name} onChange={(e) => {
                          const updatedCharges = invoiceForm.serviceCharges.map(c => 
                            c.id === charge.id ? { ...c, name: e.target.value } : c
                          );
                          setInvoiceForm(prev => ({ ...prev, serviceCharges: updatedCharges }));
                        }} />
                      </div>
                      <div className="w-20">
                        <Input type="number" placeholder="%" value={charge.rate} onChange={(e) => {
                          const rate = parseFloat(e.target.value) || 0;
                          const updatedCharges = invoiceForm.serviceCharges.map(c => 
                            c.id === charge.id ? { ...c, rate, amount: (subtotal * rate) / 100 } : c
                          );
                          setInvoiceForm(prev => ({ ...prev, serviceCharges: updatedCharges }));
                        }} />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setInvoiceForm(prev => ({ ...prev, serviceCharges: prev.serviceCharges.filter(c => c.id !== charge.id) }));
                      }}>×</Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms and Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select value={invoiceForm.paymentTerms} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, paymentTerms: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15 days">Net 15 days</SelectItem>
                      <SelectItem value="Net 30 days">Net 30 days</SelectItem>
                      <SelectItem value="Net 45 days">Net 45 days</SelectItem>
                      <SelectItem value="Net 60 days">Net 60 days</SelectItem>
                      <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                  <Input
                    id="deliveryTerms"
                    value={invoiceForm.deliveryTerms}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                    placeholder="EXW, FOB, CIF, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the invoice..."
                  rows={3}
                />
              </div>

              {/* Invoice Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatAmount(subtotal)}</span>
                  </div>
                  {invoiceForm.items.some(item => item.discountAmount > 0) && (
                    <div className="flex justify-between text-green-600">
                      <span>Total Discount:</span>
                      <span>-{formatAmount(invoiceForm.items.reduce((sum, item) => sum + item.discountAmount, 0))}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Item Taxes:</span>
                    <span>{formatAmount(invoiceForm.items.reduce((sum, item) => sum + item.taxAmount, 0))}</span>
                  </div>
                  {invoiceForm.taxes.length > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Taxes:</span>
                      <span>{formatAmount(invoiceForm.taxes.reduce((sum, tax) => sum + tax.amount, 0))}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service Charges:</span>
                    <span>{formatAmount(totalServiceChargeAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">{formatAmount(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setCreateInvoiceDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInvoice} className="bg-yellow-600 hover:bg-yellow-700">
                Create Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Invoice Dialog */}
        <Dialog open={viewInvoiceDialog} onOpenChange={setViewInvoiceDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
              <DialogDescription>
                Status: {selectedInvoice?.status} | Customer: {selectedInvoice?.customerName}
              </DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Customer</h3>
                    <p className="text-sm text-gray-600">{selectedInvoice.customerName}</p>
                    <p className="text-xs text-gray-500">ID: {selectedInvoice.customerId}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Project</h3>
                    <p className="text-sm text-gray-600">{selectedInvoice.projectName || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Payment Terms</h3>
                    <p className="text-sm text-gray-600">{selectedInvoice.paymentTerms}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Issue Date</h3>
                    <p className="text-sm text-gray-600">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Due Date</h3>
                    <p className="text-sm text-gray-600">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Status</h3>
                    <Badge className={getStatusBadge(selectedInvoice.status)}>
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Invoice Items ({selectedInvoice.items.length})</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Product Details</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Category</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Qty</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Unit Price</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Discount</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Tax</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Service</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-sm">{item.productName}</div>
                                <div className="text-xs text-gray-500">SKU: {item.productSku}</div>
                                <div className="text-xs text-gray-500">Manufacturer: {item.manufacturer}</div>
                                {item.modelNumber && <div className="text-xs text-gray-500">Model: {item.modelNumber}</div>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="text-xs">
                                <div className="font-medium">{item.mainCategoryName}</div>
                                <div className="text-gray-500">{item.subCategoryName}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-sm">{formatAmount(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-right text-sm">
                              {item.discount > 0 && (
                                <div>
                                  <div>{item.discount}%</div>
                                  <div className="text-xs text-green-600">-{formatAmount(item.discountAmount)}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              <div>{item.taxRate}%</div>
                              <div className="text-xs text-blue-600">{formatAmount(item.taxAmount)}</div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {item.serviceCharge > 0 && (
                                <div>
                                  <div>{item.serviceCharge}%</div>
                                  <div className="text-xs text-purple-600">{formatAmount(item.serviceChargeAmount)}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold">{formatAmount(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Invoice Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold">{formatAmount(selectedInvoice.subtotal)}</span>
                      </div>
                      {selectedInvoice.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Total Discount:</span>
                          <span>-{formatAmount(selectedInvoice.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Item Taxes:</span>
                        <span>{formatAmount(selectedInvoice.items.reduce((sum, item) => sum + item.taxAmount, 0))}</span>
                      </div>
                      {selectedInvoice.taxes.length > 0 && (
                        <div className="flex justify-between">
                          <span>Additional Taxes:</span>
                          <span>{formatAmount(selectedInvoice.taxes.reduce((sum, tax) => sum + tax.amount, 0))}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Service Charges:</span>
                        <span>{formatAmount(selectedInvoice.totalServiceChargeAmount)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xl font-bold border-t pt-2">
                        <span>Total Amount:</span>
                        <span className="text-green-600">{formatAmount(selectedInvoice.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paid Amount:</span>
                        <span className="text-blue-600">{formatAmount(selectedInvoice.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Remaining Amount:</span>
                        <span className={selectedInvoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatAmount(selectedInvoice.remainingAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Notes */}
                {(selectedInvoice.deliveryTerms || selectedInvoice.warrantyTerms || selectedInvoice.notes) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Terms & Notes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedInvoice.deliveryTerms && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900">Delivery Terms</h4>
                          <p className="text-sm text-blue-700">{selectedInvoice.deliveryTerms}</p>
                        </div>
                      )}
                      {selectedInvoice.warrantyTerms && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900">Warranty Terms</h4>
                          <p className="text-sm text-green-700">{selectedInvoice.warrantyTerms}</p>
                        </div>
                      )}
                    </div>
                    {selectedInvoice.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Notes</h4>
                        <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewInvoiceDialog(false)}>
                    Close
                  </Button>
                  <Button variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </Button>
                  {selectedInvoice.status === 'draft' && (
                    <Button onClick={() => handleSendInvoice(selectedInvoice.id)} className="bg-blue-600 hover:bg-blue-700">
                      Send Invoice
                    </Button>
                  )}
                  {selectedInvoice.status === 'sent' && (
                    <Button onClick={() => handleMarkAsPaid(selectedInvoice.id)} className="bg-green-600 hover:bg-green-700">
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{invoices.length}</div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatAmount(totalRevenue)}</div>
            <p className="text-sm text-gray-500 mt-1">Paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{formatAmount(pendingAmount)}</div>
            <p className="text-sm text-gray-500 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-sm text-gray-500 mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by invoice number, customer, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>
                All
              </Button>
              <Button variant={filterStatus === 'draft' ? 'default' : 'outline'} onClick={() => setFilterStatus('draft')}>
                Draft
              </Button>
              <Button variant={filterStatus === 'sent' ? 'default' : 'outline'} onClick={() => setFilterStatus('sent')}>
                Sent
              </Button>
              <Button variant={filterStatus === 'paid' ? 'default' : 'outline'} onClick={() => setFilterStatus('paid')}>
                Paid
              </Button>
              <Button variant={filterStatus === 'overdue' ? 'default' : 'outline'} onClick={() => setFilterStatus('overdue')}>
                Overdue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List ({filteredInvoices.length} invoices)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Invoice #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Issue Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.customerName}</p>
                        <p className="text-sm text-gray-500">ID: {invoice.customerId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{invoice.projectName || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{invoice.issueDate.toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{invoice.dueDate.toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div>
                        <p className="font-semibold text-gray-900">{formatAmount(invoice.totalAmount)}</p>
                        {invoice.status === 'paid' && invoice.paidAmount && (
                          <p className="text-xs text-green-600">Paid: {formatAmount(invoice.paidAmount)}</p>
                        )}
                        {invoice.remainingAmount > 0 && (
                          <p className="text-xs text-red-600">Due: {formatAmount(invoice.remainingAmount)}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusBadge(invoice.status)}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice)}>View</Button>
                        {invoice.status === 'draft' && (
                          <Button size="sm" variant="outline" onClick={() => handleSendInvoice(invoice.id)}>Send</Button>
                        )}
                        {invoice.status === 'sent' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleMarkAsPaid(invoice.id)}>
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
