'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Save,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Loader2,
  FileText,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';

// Firebase imports
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  taxType: 'percentage' | 'fixed';
  amount: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  status: 'draft' | 'sent' | 'under_review' | 'approved' | 'rejected' | 'expired' | 'converted';
  issueDate: string;
  validUntil: string;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  serviceCharges: number;
  grandTotal: number;
  items: QuotationItem[];
  notes?: string;
  terms?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  companyName: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
}

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  description: string;
}

// Currency formatter
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2
  }).format(amount);
};

// Calculate item amount
const calculateItemAmount = (item: QuotationItem): number => {
  const subtotal = item.quantity * item.rate;
  const discountAmount = item.discountType === 'percentage' 
    ? subtotal * (item.discount / 100)
    : item.discount;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = item.taxType === 'percentage'
    ? taxableAmount * (item.tax / 100)
    : item.tax;
  
  return taxableAmount + taxAmount;
};

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load quotation data
  useEffect(() => {
    const loadData = async () => {
      if (!quotationId) return;

      setLoading(true);
      try {
        // Load quotation
        const quotationRef = doc(db, 'quotations', quotationId);
        const quotationSnap = await getDoc(quotationRef);

        if (!quotationSnap.exists()) {
          setError('Quotation not found');
          setLoading(false);
          return;
        }

        const quotationData = { id: quotationSnap.id, ...quotationSnap.data() } as Quotation;
        setQuotation(quotationData);

        // Load customers
        const customersQuery = query(collection(db, 'customers'), where('isActive', '==', true));
        const customersSnapshot = await getDocs(customersQuery);
        const customersData: Customer[] = [];
        customersSnapshot.forEach((doc) => {
          const data = doc.data();
          customersData.push({
            id: doc.id,
            companyName: data.companyName || '',
            primaryContact: {
              name: data.primaryContact?.name || '',
              email: data.primaryContact?.email || '',
              phone: data.primaryContact?.phone || '',
              designation: data.primaryContact?.designation || ''
            }
          });
        });
        setCustomers(customersData);

        // Load products
        const productsQuery = query(collection(db, 'products'));
        const productsSnapshot = await getDocs(productsQuery);
        const productsData: Product[] = [];
        productsSnapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            name: data.name || '',
            sellingPrice: data.sellingPrice || 0,
            description: data.description || ''
          });
        });
        setProducts(productsData);

      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load quotation data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quotationId]);

  // Update quotation field
  const updateQuotationField = (field: string, value: any) => {
    if (!quotation) return;
    setQuotation({ ...quotation, [field]: value });
  };

  // Update item field
  const updateItemField = (itemId: string, field: string, value: any) => {
    if (!quotation) return;

    const updatedItems = quotation.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount if quantity, rate, discount, or tax changes
        if (['quantity', 'rate', 'discount', 'tax', 'discountType', 'taxType'].includes(field)) {
          updatedItem.amount = calculateItemAmount(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    });

    setQuotation({ ...quotation, items: updatedItems });
  };

  // Add new item
  const addItem = () => {
    if (!quotation) return;

    const newItem: QuotationItem = {
      id: `item_${Date.now()}`,
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 'percentage',
      tax: 0,
      taxType: 'percentage',
      amount: 0
    };

    setQuotation({
      ...quotation,
      items: [...quotation.items, newItem]
    });
  };

  // Remove item
  const removeItem = (itemId: string) => {
    if (!quotation) return;

    setQuotation({
      ...quotation,
      items: quotation.items.filter(item => item.id !== itemId)
    });
  };

  // Calculate totals
  useEffect(() => {
    if (!quotation) return;

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    quotation.items.forEach(item => {
      const itemSubtotal = item.quantity * item.rate;
      const itemDiscount = item.discountType === 'percentage'
        ? itemSubtotal * (item.discount / 100)
        : item.discount;
      const itemTax = item.taxType === 'percentage'
        ? (itemSubtotal - itemDiscount) * (item.tax / 100)
        : item.tax;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;
    });

    const grandTotal = subtotal - totalDiscount + totalTax + (quotation.serviceCharges || 0);

    setQuotation(prev => prev ? {
      ...prev,
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal
    } : null);
  }, [quotation?.items, quotation?.serviceCharges]);

  // Handle product selection
  const handleProductSelect = (itemId: string, productId: string) => {
    if (!quotation) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    updateItemField(itemId, 'productId', productId);
    updateItemField(itemId, 'productName', product.name);
    updateItemField(itemId, 'description', product.description);
    updateItemField(itemId, 'rate', product.sellingPrice);
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || !quotation) return;

    setQuotation({
      ...quotation,
      customerId,
      customerName: customer.primaryContact.name,
      customerCompany: customer.companyName,
      customerEmail: customer.primaryContact.email,
      customerPhone: customer.primaryContact.phone
    });
  };

  // Save quotation
  const handleSave = async () => {
    if (!quotation) return;

    setSaving(true);
    try {
      const quotationRef = doc(db, 'quotations', quotation.id);
      await updateDoc(quotationRef, {
        ...quotation,
        updatedAt: new Date().toISOString()
      });

      alert('Quotation updated successfully!');
      router.push('/admin/sales/quotations');
    } catch (error) {
      console.error('Error updating quotation:', error);
      setError('Failed to update quotation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Button onClick={() => router.push('/admin/sales/quotations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Quotation not found</div>
          <Button onClick={() => router.push('/admin/sales/quotations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Quotation</h1>
            <p className="text-red-100 mt-1 text-lg">Update quotation details and items</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => router.push('/admin/sales/quotations')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Cancel
            </Button>
            <Button 
              className="bg-white text-red-600 hover:bg-red-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Update quotation details and customer information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quotationNumber">Quotation Number</Label>
                <Input
                  id="quotationNumber"
                  value={quotation.quotationNumber}
                  onChange={(e) => updateQuotationField('quotationNumber', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select value={quotation.customerId} onValueChange={handleCustomerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.companyName} - {customer.primaryContact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={quotation.status} 
                  onValueChange={(value) => updateQuotationField('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={quotation.issueDate.split('T')[0]}
                  onChange={(e) => updateQuotationField('issueDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={quotation.validUntil.split('T')[0]}
                  onChange={(e) => updateQuotationField('validUntil', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceCharges">Service Charges</Label>
                <Input
                  id="serviceCharges"
                  type="number"
                  value={quotation.serviceCharges || 0}
                  onChange={(e) => updateQuotationField('serviceCharges', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-semibold">Customer Details</Label>
              <div className="mt-2 space-y-1 text-sm">
                <div><span className="font-medium">Name:</span> {quotation.customerName}</div>
                <div><span className="font-medium">Company:</span> {quotation.customerCompany}</div>
                <div><span className="font-medium">Email:</span> {quotation.customerEmail}</div>
                <div><span className="font-medium">Phone:</span> {quotation.customerPhone}</div>
              </div>
            </div>
            <div>
              <Label className="font-semibold">Quotation Status</Label>
              <div className="mt-2">
                <Badge 
                  variant={
                    quotation.status === 'approved' ? 'default' :
                    quotation.status === 'rejected' ? 'destructive' :
                    quotation.status === 'sent' ? 'default' : 'secondary'
                  }
                  className="text-sm"
                >
                  {quotation.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotation Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Quotation Items
              </CardTitle>
              <CardDescription>Manage products and services in this quotation</CardDescription>
            </div>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quotation.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items added to this quotation
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => handleProductSelect(item.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatAmount(product.sellingPrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {item.productName && (
                          <div className="text-sm text-gray-500 mt-1">{item.productName}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItemField(item.id, 'description', e.target.value)}
                          rows={2}
                          className="text-sm"
                          placeholder="Product description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemField(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItemField(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateItemField(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                          <Select
                            value={item.discountType}
                            onValueChange={(value: 'percentage' | 'fixed') => 
                              updateItemField(item.id, 'discountType', value)
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">%</SelectItem>
                              <SelectItem value="fixed">AED</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={item.tax}
                            onChange={(e) => updateItemField(item.id, 'tax', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                          <Select
                            value={item.taxType}
                            onValueChange={(value: 'percentage' | 'fixed') => 
                              updateItemField(item.id, 'taxType', value)
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">%</SelectItem>
                              <SelectItem value="fixed">AED</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAmount(item.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals Summary */}
              <div className="grid grid-cols-2 gap-8 p-6 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-medium">{formatAmount(quotation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Discount:</span>
                    <span className="font-medium text-red-600">-{formatAmount(quotation.totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tax:</span>
                    <span className="font-medium">{formatAmount(quotation.totalTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Service Charges:</span>
                    <span className="font-medium">{formatAmount(quotation.serviceCharges || 0)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {formatAmount(quotation.grandTotal)}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">Grand Total</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes and Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Additional Information</CardTitle>
          <CardDescription>Add notes and terms for this quotation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={quotation.notes || ''}
              onChange={(e) => updateQuotationField('notes', e.target.value)}
              rows={4}
              placeholder="Additional notes for this quotation..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={quotation.terms || ''}
              onChange={(e) => updateQuotationField('terms', e.target.value)}
              rows={4}
              placeholder="Terms and conditions for this quotation..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/sales/quotations')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotations
        </Button>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={() => {
              if (confirm('Are you sure you want to discard changes?')) {
                router.push('/admin/sales/quotations');
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}