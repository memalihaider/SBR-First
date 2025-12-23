'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
  getDoc,
  runTransaction,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // make sure this path matches your project
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/types';

export default function StockManagementPage() {
  // local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');

  // products from firestore
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // per-row dialog / adjustment state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');

  // bulk adjust dialog states
  const [bulkSelectedProductId, setBulkSelectedProductId] = useState<string>('');
  const [bulkQuantity, setBulkQuantity] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');

  // fetch products real-time
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Product[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          name: data.name ?? '',
          sku: data.sku ?? '',
          category: data.category ?? data.mainCategoryId ?? '',
          sellingPrice: Number(data.sellingPrice ?? 0),
          currentStock: Number(data.currentStock ?? 0),
          minStockLevel: Number(data.minStockLevel ?? 0),
          ...data
        } as Product;
      });
      setProducts(items);
      setLoading(false);
    }, (err) => {
      console.error('Products snapshot error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // derived stats
  const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= (p.minStockLevel ?? 0)).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.sellingPrice ?? 0) * Number(p.currentStock ?? 0)), 0);

  // filtering/searching
  const getFilteredProducts = () => {
    let filtered = products.slice();

    if (filterStatus === 'low') {
      filtered = filtered.filter(p => p.currentStock > 0 && p.currentStock <= (p.minStockLevel ?? 0));
    } else if (filterStatus === 'out') {
      filtered = filtered.filter(p => p.currentStock === 0);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // helper to compute status badge
  const getStockStatus = (quantity: number, minLevel: number | undefined) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (typeof minLevel === 'number' && quantity <= minLevel) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  // API: adjust stock (used by per-row Add/Remove)
  const handleStockAdjustment = async (product: Product, type: 'add' | 'remove', quantity: number, reason = '', notes = '') => {
    if (!product || quantity <= 0) {
      // nothing to do
      return;
    }

    const productRef = doc(db, 'products', product.id);

    try {
      if (type === 'add') {
        // simple increment is fine for adding stock
        await updateDoc(productRef, {
          currentStock: increment(quantity),
          // optional: record lastAdjustment meta fields (optional)
          updatedAt: new Date()
        });
      } else {
        // removing stock — run transaction to prevent negative stock
        await runTransaction(db, async (t) => {
          const docSnap = await t.get(productRef);
          if (!docSnap.exists()) throw new Error('Product not found');
          const current = Number(docSnap.data().currentStock ?? 0);
          const newStock = current - quantity;
          if (newStock < 0) {
            throw new Error('Insufficient stock to remove');
          }
          t.update(productRef, {
            currentStock: newStock,
            updatedAt: new Date()
          });
        });
      }

      // reset UI states
      setIsAddDialogOpen(false);
      setIsRemoveDialogOpen(false);
      setIsAdjustDialogOpen(false);
      setSelectedProduct(null);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      setAdjustmentNotes('');
    } catch (err: any) {
      console.error('Stock adjustment failed:', err);
      // You may show a toast / error UI here
      alert(err?.message || 'Failed to adjust stock');
    }
  };

  // open per-row dialogs
  const openAddStockDialog = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentType('add');
    setAdjustmentQuantity('');
    setAdjustmentReason('');
    setAdjustmentNotes('');
    setIsAddDialogOpen(true);
  };

  const openRemoveStockDialog = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentType('remove');
    setAdjustmentQuantity('');
    setAdjustmentReason('');
    setAdjustmentNotes('');
    setIsRemoveDialogOpen(true);
  };

  // bulk adjust: product id selected from dropdown
  const handleBulkAdjustment = async (type: 'add' | 'remove') => {
    if (!bulkSelectedProductId) {
      alert('Please select a product');
      return;
    }
    const qty = parseInt(bulkQuantity || '0', 10);
    if (qty <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    const productRef = doc(db, 'products', bulkSelectedProductId);

    try {
      if (type === 'add') {
        await updateDoc(productRef, {
          currentStock: increment(qty),
          updatedAt: new Date()
        });
      } else {
        // remove - transaction
        await runTransaction(db, async (t) => {
          const docSnap = await t.get(productRef);
          if (!docSnap.exists()) throw new Error('Product not found');
          const current = Number(docSnap.data().currentStock ?? 0);
          const newStock = current - qty;
          if (newStock < 0) throw new Error('Insufficient stock to remove');
          t.update(productRef, {
            currentStock: newStock,
            updatedAt: new Date()
          });
        });
      }

      // reset bulk UI
      setBulkSelectedProductId('');
      setBulkQuantity('');
      setBulkReason('');
      setBulkNotes('');
      setIsAdjustDialogOpen(false);
    } catch (err: any) {
      console.error('Bulk adjustment failed:', err);
      alert(err?.message || 'Bulk adjustment failed');
    }
  };

  // Render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage inventory levels</p>
        </div>

        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsAdjustDialogOpen(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adjust Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Bulk Stock Adjustment</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <Tabs defaultValue="add" className="w-full" onValueChange={(v) => setAdjustmentType(v as 'add' | 'remove')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="add">Add Stock</TabsTrigger>
                  <TabsTrigger value="remove">Remove Stock</TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-product">Select Product</Label>
                      <Select value={bulkSelectedProductId} onValueChange={setBulkSelectedProductId}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Choose product" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 max-h-60 overflow-y-auto">
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Current: {product.currentStock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="add-quantity">Quantity to Add</Label>
                      <Input
                        id="add-quantity"
                        type="number"
                        placeholder="Enter quantity"
                        className="bg-white border-gray-300"
                        min={1}
                        value={bulkQuantity}
                        onChange={(e) => setBulkQuantity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="add-reason">Reason</Label>
                    <Select value={bulkReason} onValueChange={setBulkReason}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="purchase">New Purchase</SelectItem>
                        <SelectItem value="return">Customer Return</SelectItem>
                        <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="add-notes">Notes</Label>
                    <Textarea
                      id="add-notes"
                      placeholder="Additional notes..."
                      className="bg-white border-gray-300"
                      rows={3}
                      value={bulkNotes}
                      onChange={(e) => setBulkNotes(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="remove" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="remove-product">Select Product</Label>
                      <Select value={bulkSelectedProductId} onValueChange={setBulkSelectedProductId}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Choose product" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 max-h-60 overflow-y-auto">
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Current: {product.currentStock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="remove-quantity">Quantity to Remove</Label>
                      <Input
                        id="remove-quantity"
                        type="number"
                        placeholder="Enter quantity"
                        className="bg-white border-gray-300"
                        min={1}
                        value={bulkQuantity}
                        onChange={(e) => setBulkQuantity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="remove-reason">Reason</Label>
                    <Select value={bulkReason} onValueChange={setBulkReason}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="damage">Damaged/Lost</SelectItem>
                        <SelectItem value="return">Vendor Return</SelectItem>
                        <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="remove-notes">Notes</Label>
                    <Textarea
                      id="remove-notes"
                      placeholder="Additional notes..."
                      className="bg-white border-gray-300"
                      rows={3}
                      value={bulkNotes}
                      onChange={(e) => setBulkNotes(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)} className="bg-white border-gray-300 hover:bg-gray-50">
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleBulkAdjustment(adjustmentType)}
                >
                  Apply Adjustment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{products.length}</div>
            <p className="text-sm text-gray-500 mt-1">Active items</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{lowStockCount}</div>
            <p className="text-sm text-gray-500 mt-1">Need reorder</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{outOfStockCount}</div>
            <p className="text-sm text-gray-500 mt-1">Urgent action</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${totalValue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Inventory worth</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-gray-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}
              >
                All Products
              </Button>
              <Button
                variant={filterStatus === 'low' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('low')}
                className={filterStatus === 'low' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}
              >
                Low Stock
              </Button>
              <Button
                variant={filterStatus === 'out' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('out')}
                className={filterStatus === 'out' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}
              >
                Out of Stock
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Stock Levels ({filteredProducts.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Stock Qty</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Value</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">Loading products...</td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">No products found</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getStockStatus(product.currentStock ?? 0, product.minStockLevel);
                    const stockValue = (Number(product.sellingPrice ?? 0) * Number(product.currentStock ?? 0));

                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-gray-600">{product.sku}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{product.category}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium">${Number(product.sellingPrice ?? 0).toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-bold ${product.currentStock <= product.minStockLevel ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.currentStock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={status.color}>{status.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium text-red-600">${stockValue.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Add stock (per-row) */}
                            <Dialog
                              open={isAddDialogOpen && selectedProduct?.id === product.id}
                              onOpenChange={(open) => {
                                setIsAddDialogOpen(open);
                                if (!open) setSelectedProduct(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openAddStockDialog(product)}
                                  className="bg-white border-gray-300 hover:bg-red-50 hover:border-red-300"
                                >
                                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-lg font-semibold text-gray-900">Add Stock - {product.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="add-qty">Quantity to Add</Label>
                                    <Input
                                      id="add-qty"
                                      type="number"
                                      placeholder="Enter quantity"
                                      value={adjustmentQuantity}
                                      onChange={(e) => setAdjustmentQuantity(e.target.value)}
                                      className="bg-white border-gray-300"
                                      min={1}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="add-reason-select">Reason</Label>
                                    <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                                      <SelectTrigger className="bg-white border-gray-300">
                                        <SelectValue placeholder="Select reason" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border border-gray-200">
                                        <SelectItem value="purchase">New Purchase</SelectItem>
                                        <SelectItem value="return">Customer Return</SelectItem>
                                        <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="add-notes-input">Notes</Label>
                                    <Textarea
                                      id="add-notes-input"
                                      placeholder="Additional notes..."
                                      value={adjustmentNotes}
                                      onChange={(e) => setAdjustmentNotes(e.target.value)}
                                      className="bg-white border-gray-300"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-3">
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsAddDialogOpen(false)}
                                      className="bg-white border-gray-300 hover:bg-gray-50"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleStockAdjustment(product, 'add', parseInt(adjustmentQuantity || '0', 10), adjustmentReason, adjustmentNotes)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Add Stock
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Remove stock (per-row) */}
                            <Dialog
                              open={isRemoveDialogOpen && selectedProduct?.id === product.id}
                              onOpenChange={(open) => {
                                setIsRemoveDialogOpen(open);
                                if (!open) setSelectedProduct(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openRemoveStockDialog(product)}
                                  className="bg-white border-gray-300 hover:bg-red-50 hover:border-red-300"
                                >
                                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-lg font-semibold text-gray-900">Remove Stock - {product.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-800">
                                      Current stock: <span className="font-semibold">{product.currentStock} units</span>
                                    </p>
                                  </div>
                                  <div>
                                    <Label htmlFor="remove-qty">Quantity to Remove</Label>
                                    <Input
                                      id="remove-qty"
                                      type="number"
                                      placeholder="Enter quantity"
                                      value={adjustmentQuantity}
                                      onChange={(e) => setAdjustmentQuantity(e.target.value)}
                                      className="bg-white border-gray-300"
                                      min={1}
                                      max={product.currentStock}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="remove-reason-select">Reason</Label>
                                    <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                                      <SelectTrigger className="bg-white border-gray-300">
                                        <SelectValue placeholder="Select reason" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border border-gray-200">
                                        <SelectItem value="sale">Sale</SelectItem>
                                        <SelectItem value="damage">Damaged/Lost</SelectItem>
                                        <SelectItem value="return">Vendor Return</SelectItem>
                                        <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="remove-notes-input">Notes</Label>
                                    <Textarea
                                      id="remove-notes-input"
                                      placeholder="Additional notes..."
                                      value={adjustmentNotes}
                                      onChange={(e) => setAdjustmentNotes(e.target.value)}
                                      className="bg-white border-gray-300"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-3">
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsRemoveDialogOpen(false)}
                                      className="bg-white border-gray-300 hover:bg-gray-50"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleStockAdjustment(product, 'remove', parseInt(adjustmentQuantity || '0', 10), adjustmentReason, adjustmentNotes)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Remove Stock
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
