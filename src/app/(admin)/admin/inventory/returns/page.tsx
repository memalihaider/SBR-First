'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Package,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ReturnRequest, ReturnStatus, ReturnType, ReturnReason } from '@/types';
import { toast } from 'sonner';
import { returnsService, productsService, generateReturnNumber, Product } from '@/lib/returns';

export default function AdminInventoryReturnsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReturnType | 'all'>('all');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [expandedReturns, setExpandedReturns] = useState<Set<string>>(new Set());
  
  // Real-time data states
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    processed: 0,
    totalValue: 0
  });

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Create return form state
  const [createForm, setCreateForm] = useState({
    type: '' as ReturnType,
    customerId: '',
    vendorId: '',
    referenceType: 'none' as 'none' | 'sales_order' | 'purchase_order' | '',
    referenceId: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    returnMethod: 'drop_off' as 'pickup' | 'drop_off' | 'mail',
    customerNotes: '',
    items: [] as Array<{
      productId: string;
      quantity: number;
      reason: ReturnReason;
      condition: 'new' | 'used' | 'damaged' | 'defective';
      notes: string;
    }>
  });

  // Process form state
  const [processForm, setProcessForm] = useState({
    status: '' as ReturnStatus,
    refundAmount: 0,
    restockingFee: 0,
    resolutionNotes: '',
    trackingNumber: ''
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    returnMethod: 'drop_off' as 'pickup' | 'drop_off' | 'mail',
    customerNotes: '',
    items: [] as Array<{
      productId: string;
      quantity: number;
      reason: ReturnReason;
      condition: 'new' | 'used' | 'damaged' | 'defective';
      notes: string;
    }>
  });

  // Load real-time data
  useEffect(() => {
    // Real-time returns listener
    const unsubscribeReturns = returnsService.getReturnsRealTime((returnsData) => {
      setReturns(returnsData);
    });

    // Real-time products listener for dropdown
    const unsubscribeProducts = productsService.getProductsRealTime((productsData) => {
      setProducts(productsData);
    });

    // Real-time stats listener
    const unsubscribeStats = returnsService.getReturnsStatsRealTime((statsData) => {
      setStats(statsData);
    });

    return () => {
      unsubscribeReturns();
      unsubscribeProducts();
      unsubscribeStats();
    };
  }, []);

  // Filter returns based on search and filters
  const filteredReturns = useMemo(() => {
    return returns.filter(returnRequest => {
      const matchesSearch = returnRequest.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          returnRequest.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || returnRequest.status === statusFilter;
      const matchesType = typeFilter === 'all' || returnRequest.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [returns, searchTerm, statusFilter, typeFilter]);

  const toggleReturnExpansion = (returnId: string) => {
    const newExpanded = new Set(expandedReturns);
    if (newExpanded.has(returnId)) {
      newExpanded.delete(returnId);
    } else {
      newExpanded.add(returnId);
    }
    setExpandedReturns(newExpanded);
  };

  const handleCreateReturn = () => {
    setCreateForm({
      type: '' as ReturnType,
      customerId: '',
      vendorId: '',
      referenceType: 'none' as 'none' | 'sales_order' | 'purchase_order' | '',
      referenceId: '',
      priority: 'normal',
      returnMethod: 'drop_off',
      customerNotes: '',
      items: []
    });
    setIsCreateDialogOpen(true);
  };

  const handleAddReturnItem = () => {
    setCreateForm({
      ...createForm,
      items: [...createForm.items, {
        productId: '',
        quantity: 1,
        reason: 'defective' as ReturnReason,
        condition: 'new',
        notes: ''
      }]
    });
  };

  const handleRemoveReturnItem = (index: number) => {
    setCreateForm({
      ...createForm,
      items: createForm.items.filter((_, i) => i !== index)
    });
  };

  const handleUpdateReturnItem = (index: number, field: string, value: any) => {
    const updatedItems = [...createForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setCreateForm({ ...createForm, items: updatedItems });
  };

  const handleSaveCreateReturn = async () => {
    try {
      if (!createForm.type) {
        toast.error('Please select return type');
        return;
      }

      if (createForm.items.length === 0) {
        toast.error('Please add at least one item to return');
        return;
      }

      // Validate all items have required fields
      for (const item of createForm.items) {
        if (!item.productId || item.quantity <= 0) {
          toast.error('Please fill in all required fields for return items');
          return;
        }

        // Check stock availability
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          toast.error(`Product not found: ${item.productId}`);
          return;
        }

        if (product.currentStock < item.quantity) {
          toast.error(`Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
          return;
        }
      }

      // Calculate totals and create return request
      let totalQuantity = 0;
      let totalValue = 0;
      const returnItems = await Promise.all(
        createForm.items.map(async (item) => {
          const product = products.find(p => p.id === item.productId);
          if (!product) return null;

          const quantity = item.quantity;
          const unitPrice = product.sellingPrice;
          const itemTotal = quantity * unitPrice;

          totalQuantity += quantity;
          totalValue += itemTotal;

          // Update product stock in Firebase
          const newStock = product.currentStock - quantity;
          await productsService.updateProductStock(item.productId, newStock);

          return {
            productId: item.productId,
            productName: product.name,
            productSku: product.sku,
            quantity,
            unitPrice,
            totalValue: itemTotal,
            reason: item.reason,
            condition: item.condition,
            notes: item.notes,
            serialNumbers: product.isSerialTracked ? Array.from({ length: quantity }, () => 
              Math.random().toString(36).substr(2, 10).toUpperCase()
            ) : undefined,
            batchNumber: product.isBatchTracked ? 
              `BATCH-${Math.random().toString(36).substr(2, 8).toUpperCase()}` : undefined
          };
        })
      );

      const validReturnItems = returnItems.filter(Boolean) as any[];

      const returnRequest: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt'> = {
        returnNumber: generateReturnNumber(),
        type: createForm.type,
        referenceType: createForm.referenceType === 'none' ? undefined : createForm.referenceType || undefined,
        referenceId: createForm.referenceId || undefined,
        customerId: createForm.type === 'customer_return' ? createForm.customerId || undefined : undefined,
        vendorId: createForm.type === 'vendor_return' ? createForm.vendorId || undefined : undefined,
        items: validReturnItems,
        totalQuantity,
        totalValue,
        status: 'pending',
        priority: createForm.priority,
        requestedDate: new Date(),
        returnMethod: createForm.returnMethod,
        customerNotes: createForm.customerNotes || undefined,
        createdBy: 'current-user-id' // In real app, get from auth
      };

      await returnsService.createReturn(returnRequest);
      
      toast.success(`Return request ${returnRequest.returnNumber} created successfully! Stock has been reduced.`);

      setIsCreateDialogOpen(false);
      setCreateForm({
        type: '' as ReturnType,
        customerId: '',
        vendorId: '',
        referenceType: 'none' as 'none' | 'sales_order' | 'purchase_order' | '',
        referenceId: '',
        priority: 'normal',
        returnMethod: 'drop_off',
        customerNotes: '',
        items: []
      });
    } catch (error) {
      console.error('Error creating return:', error);
      toast.error('Failed to create return request');
    }
  };

  const handleViewReturn = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setIsViewDialogOpen(true);
  };

  const handleEditReturn = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setEditForm({
      priority: returnRequest.priority,
      returnMethod: returnRequest.returnMethod,
      customerNotes: returnRequest.customerNotes || '',
      items: returnRequest.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        reason: item.reason,
        condition: item.condition as 'new' | 'used' | 'damaged' | 'defective',
        notes: item.notes || ''
      }))
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEditReturn = async () => {
    if (!selectedReturn) return;

    try {
      await returnsService.updateReturn(selectedReturn.id, {
        priority: editForm.priority,
        returnMethod: editForm.returnMethod,
        customerNotes: editForm.customerNotes || undefined
      });

      toast.success(`Return ${selectedReturn.returnNumber} updated successfully!`);
      setIsEditDialogOpen(false);
      setSelectedReturn(null);
    } catch (error) {
      console.error('Error updating return:', error);
      toast.error('Failed to update return');
    }
  };

  const handleDeleteReturn = async (returnRequest: ReturnRequest) => {
    if (!confirm(`Are you sure you want to delete return ${returnRequest.returnNumber}?`)) {
      return;
    }

    try {
      await returnsService.deleteReturn(returnRequest.id);
      toast.success(`Return ${returnRequest.returnNumber} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting return:', error);
      toast.error('Failed to delete return');
    }
  };

  const handleProcessReturn = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setProcessForm({
      status: returnRequest.status,
      refundAmount: returnRequest.refundAmount || 0,
      restockingFee: returnRequest.restockingFee || 0,
      resolutionNotes: returnRequest.resolutionNotes || '',
      trackingNumber: returnRequest.trackingNumber || ''
    });
    setIsProcessDialogOpen(true);
  };

  const handleRejectReturn = (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setIsRejectDialogOpen(true);
  };

  const handleSaveProcess = async () => {
    if (!processForm.status || !selectedReturn) {
      toast.error('Please select a status');
      return;
    }

    try {
      const updates: Partial<ReturnRequest> = {
        status: processForm.status,
        resolutionNotes: processForm.resolutionNotes || undefined,
        trackingNumber: processForm.trackingNumber || undefined
      };

      // Handle financial fields
      if (processForm.status === 'refunded' || processForm.status === 'replaced') {
        updates.refundAmount = processForm.refundAmount;
        updates.restockingFee = processForm.restockingFee;
        updates.finalRefundAmount = processForm.refundAmount - processForm.restockingFee;
      }

      // Handle stock changes based on status
      if (processForm.status === 'received' || processForm.status === 'replaced') {
        // When items are received back or replaced, add stock back
        for (const item of selectedReturn.items) {
          const product = await productsService.getProduct(item.productId);
          if (product) {
            const newStock = product.currentStock + item.quantity;
            await productsService.updateProductStock(item.productId, newStock);
          }
        }
      }

      if (processForm.status === 'received') {
        updates.actualReturnDate = new Date();
      }

      await returnsService.updateReturn(selectedReturn.id, updates);

      let message = `Return ${selectedReturn.returnNumber} status updated to ${processForm.status}.`;
      if (processForm.status === 'received' || processForm.status === 'replaced') {
        message += ' Stock has been added back to inventory.';
      } else if (processForm.status === 'refunded') {
        message += ' Refund processed successfully!';
      }

      toast.success(message);
      setIsProcessDialogOpen(false);
      setSelectedReturn(null);
      setProcessForm({
        status: '' as ReturnStatus,
        refundAmount: 0,
        restockingFee: 0,
        resolutionNotes: '',
        trackingNumber: ''
      });
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error('Failed to process return');
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedReturn) return;

    try {
      await returnsService.updateReturn(selectedReturn.id, {
        status: 'rejected',
        updatedAt: new Date()
      });

      toast.success(`Return ${selectedReturn.returnNumber} rejected successfully!`);
      setIsRejectDialogOpen(false);
      setSelectedReturn(null);
    } catch (error) {
      console.error('Error rejecting return:', error);
      toast.error('Failed to reject return');
    }
  };

  const getStatusBadge = (status: ReturnStatus) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-blue-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      received: { variant: 'outline' as const, icon: Package, color: 'text-purple-600' },
      inspected: { variant: 'outline' as const, icon: Eye, color: 'text-indigo-600' },
      refunded: { variant: 'default' as const, icon: DollarSign, color: 'text-green-600' },
      replaced: { variant: 'default' as const, icon: RefreshCw, color: 'text-teal-600' },
      cancelled: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTypeBadge = (type: ReturnType) => {
    const typeConfig = {
      customer_return: { color: 'bg-blue-100 text-blue-800', label: 'Customer Return' },
      vendor_return: { color: 'bg-green-100 text-green-800', label: 'Vendor Return' },
      internal_return: { color: 'bg-purple-100 text-purple-800', label: 'Internal Return' }
    };

    const config = typeConfig[type];

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Return Management</h1>
            <p className="text-red-100 mt-1 text-lg">Manage product returns and stock recovery</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-white text-red-600 hover:bg-red-50" onClick={handleCreateReturn}>
              <Plus className="h-5 w-5 mr-2" />
              New Return Request
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Returns</CardTitle>
            <Package className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Pending</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
            <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Approved</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.approved}</div>
            <p className="text-sm text-gray-500 mt-1">Ready for processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Processed</CardTitle>
            <RefreshCw className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.processed}</div>
            <p className="text-sm text-gray-500 mt-1">Completed returns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Value</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Return value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search returns by number or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReturnStatus | 'all')}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="inspected">Inspected</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="replaced">Replaced</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ReturnType | 'all')}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer_return">Customer Return</SelectItem>
                <SelectItem value="vendor_return">Vendor Return</SelectItem>
                <SelectItem value="internal_return">Internal Return</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl text-gray-900">Return Requests</CardTitle>
          <CardDescription className="text-gray-600">
            {filteredReturns.length} return requests found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Return Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.map((returnRequest) => {
                const isExpanded = expandedReturns.has(returnRequest.id);

                return (
                  <React.Fragment key={returnRequest.id}>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReturnExpansion(returnRequest.id)}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{returnRequest.returnNumber}</TableCell>
                      <TableCell>{getTypeBadge(returnRequest.type)}</TableCell>
                      <TableCell>{getStatusBadge(returnRequest.status)}</TableCell>
                      <TableCell>{getPriorityBadge(returnRequest.priority)}</TableCell>
                      <TableCell>{returnRequest.totalQuantity} items</TableCell>
                      <TableCell>${returnRequest.totalValue.toLocaleString()}</TableCell>
                      <TableCell>{returnRequest.requestedDate.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReturn(returnRequest)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReturn(returnRequest)}
                            className="h-8 w-8 p-0 text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {returnRequest.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleProcessReturn(returnRequest)}
                                className="h-8 w-8 p-0 text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRejectReturn(returnRequest)}
                                className="h-8 w-8 p-0 text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReturn(returnRequest)}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-gray-50 p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Return Items</h4>
                                <div className="space-y-2">
                                  {returnRequest.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                      <div>
                                        <p className="font-medium text-sm">{item.productName}</p>
                                        <p className="text-xs text-gray-600">SKU: {item.productSku} | Qty: {item.quantity}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-sm">${item.totalValue.toLocaleString()}</p>
                                        <Badge variant="outline" className="text-xs">{item.reason}</Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Return Details</h4>
                                <div className="space-y-2 text-sm">
                                  {returnRequest.customerNotes && (
                                    <div>
                                      <span className="font-medium">Customer Notes:</span>
                                      <p className="text-gray-600 mt-1">{returnRequest.customerNotes}</p>
                                    </div>
                                  )}
                                  {returnRequest.trackingNumber && (
                                    <div>
                                      <span className="font-medium">Tracking:</span>
                                      <p className="text-gray-600">{returnRequest.trackingNumber}</p>
                                    </div>
                                  )}
                                  {returnRequest.actualReturnDate && (
                                    <div>
                                      <span className="font-medium">Return Date:</span>
                                      <p className="text-gray-600">{returnRequest.actualReturnDate.toLocaleDateString()}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>

          {filteredReturns.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No return requests found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Return Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Return Request Details - {selectedReturn?.returnNumber}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Complete details for this return request
            </DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-6 bg-white max-h-96 overflow-y-auto">
              {/* Return Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedReturn.status)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Type:</span>
                  {getTypeBadge(selectedReturn.type)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Priority:</span>
                  {getPriorityBadge(selectedReturn.priority)}
                </div>
              </div>

              {/* Return Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Return Items</h3>
                <div className="space-y-3">
                  {selectedReturn.items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productName}</h4>
                            <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm">Qty: {item.quantity}</span>
                              <span className="text-sm">Unit Price: ${item.unitPrice}</span>
                              <Badge variant="outline">{item.condition}</Badge>
                              <Badge variant="secondary">{item.reason}</Badge>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-2">Notes: {item.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${item.totalValue.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Return Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Return Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Quantity:</span>
                      <span className="font-medium">{selectedReturn.totalQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-medium">${selectedReturn.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requested Date:</span>
                      <span>{selectedReturn.requestedDate.toLocaleDateString()}</span>
                    </div>
                    {selectedReturn.actualReturnDate && (
                      <div className="flex justify-between">
                        <span>Return Date:</span>
                        <span>{selectedReturn.actualReturnDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Return Method:</span>
                      <span className="capitalize">{selectedReturn.returnMethod.replace('_', ' ')}</span>
                    </div>
                    {selectedReturn.trackingNumber && (
                      <div className="flex justify-between">
                        <span>Tracking Number:</span>
                        <span>{selectedReturn.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Processing Information</h3>
                  <div className="space-y-2 text-sm">
                    {selectedReturn.refundAmount && (
                      <div className="flex justify-between">
                        <span>Refund Amount:</span>
                        <span className="font-medium text-green-600">${selectedReturn.refundAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedReturn.restockingFee && (
                      <div className="flex justify-between">
                        <span>Restocking Fee:</span>
                        <span className="font-medium text-red-600">${selectedReturn.restockingFee.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedReturn.finalRefundAmount && (
                      <div className="flex justify-between">
                        <span>Final Refund:</span>
                        <span className="font-medium text-green-600">${selectedReturn.finalRefundAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedReturn.customerNotes && (
                      <div>
                        <span className="font-medium">Customer Notes:</span>
                        <p className="text-gray-600 mt-1">{selectedReturn.customerNotes}</p>
                      </div>
                    )}
                    {selectedReturn.resolutionNotes && (
                      <div>
                        <span className="font-medium">Resolution Notes:</span>
                        <p className="text-gray-600 mt-1">{selectedReturn.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Return Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Edit Return - {selectedReturn?.returnNumber}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Update return details and information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPriority">Priority</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(value) => setEditForm({ ...editForm, priority: value as 'low' | 'normal' | 'high' | 'urgent' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editReturnMethod">Return Method</Label>
                <Select
                  value={editForm.returnMethod}
                  onValueChange={(value) => setEditForm({ ...editForm, returnMethod: value as 'pickup' | 'drop_off' | 'mail' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select return method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drop_off">Drop Off</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="mail">Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCustomerNotes">Customer Notes</Label>
              <Textarea
                id="editCustomerNotes"
                value={editForm.customerNotes}
                onChange={(e) => setEditForm({ ...editForm, customerNotes: e.target.value })}
                placeholder="Enter any customer notes or reason for return"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditReturn} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Edit className="h-4 w-4 mr-2" />
              Update Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Return Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Process Return - {selectedReturn?.returnNumber}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Update the status and processing details for this return
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 bg-white">
            <div className="space-y-2">
              <Label htmlFor="processStatus">Status *</Label>
              <Select
                value={processForm.status}
                onValueChange={(value) => setProcessForm({ ...processForm, status: value as ReturnStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="inspected">Inspected</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="replaced">Replaced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(processForm.status === 'refunded' || processForm.status === 'replaced') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="refundAmount">Refund Amount</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    value={processForm.refundAmount}
                    onChange={(e) => setProcessForm({ ...processForm, refundAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter refund amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restockingFee">Restocking Fee</Label>
                  <Input
                    id="restockingFee"
                    type="number"
                    step="0.01"
                    value={processForm.restockingFee}
                    onChange={(e) => setProcessForm({ ...processForm, restockingFee: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter restocking fee"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                value={processForm.trackingNumber}
                onChange={(e) => setProcessForm({ ...processForm, trackingNumber: e.target.value })}
                placeholder="Enter tracking number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolutionNotes">Resolution Notes</Label>
              <Textarea
                id="resolutionNotes"
                value={processForm.resolutionNotes}
                onChange={(e) => setProcessForm({ ...processForm, resolutionNotes: e.target.value })}
                placeholder="Enter resolution notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProcess} className="bg-red-600 hover:bg-red-700 text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Process Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Return Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              Reject Return Request
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to reject return "{selectedReturn?.returnNumber}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 bg-white">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Rejecting this return will prevent any refund or replacement. The customer/vendor will be notified of the rejection.
              </p>
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReject} className="bg-red-600 hover:bg-red-700 text-white">
              <XCircle className="h-4 w-4 mr-2" />
              Reject Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Return Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Create New Return Request
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Create a new return request and reduce stock accordingly
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 bg-white max-h-96 overflow-y-auto">
            {/* Return Type and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="returnType">Return Type *</Label>
                <Select
                  value={createForm.type}
                  onValueChange={(value) => setCreateForm({ ...createForm, type: value as ReturnType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select return type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_return">Customer Return</SelectItem>
                    <SelectItem value="vendor_return">Vendor Return</SelectItem>
                    <SelectItem value="internal_return">Internal Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={createForm.priority}
                  onValueChange={(value) => setCreateForm({ ...createForm, priority: value as 'low' | 'normal' | 'high' | 'urgent' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnMethod">Return Method</Label>
                <Select
                  value={createForm.returnMethod}
                  onValueChange={(value) => setCreateForm({ ...createForm, returnMethod: value as 'pickup' | 'drop_off' | 'mail' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select return method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drop_off">Drop Off</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="mail">Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceType">Reference Type</Label>
                <Select
                  value={createForm.referenceType}
                  onValueChange={(value) => setCreateForm({ ...createForm, referenceType: value as 'none' | 'sales_order' | 'purchase_order' | '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reference type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sales_order">Sales Order</SelectItem>
                    <SelectItem value="purchase_order">Purchase Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createForm.referenceType && createForm.referenceType !== 'none' && (
                <div className="space-y-2">
                  <Label htmlFor="referenceId">Reference ID</Label>
                  <Input
                    id="referenceId"
                    value={createForm.referenceId}
                    onChange={(e) => setCreateForm({ ...createForm, referenceId: e.target.value })}
                    placeholder={`Enter ${createForm.referenceType.replace('_', ' ')} ID`}
                  />
                </div>
              )}

              {createForm.type === 'customer_return' && (
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input
                    id="customerId"
                    value={createForm.customerId}
                    onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                    placeholder="Enter customer ID"
                  />
                </div>
              )}

              {createForm.type === 'vendor_return' && (
                <div className="space-y-2">
                  <Label htmlFor="vendorId">Vendor ID</Label>
                  <Input
                    id="vendorId"
                    value={createForm.vendorId}
                    onChange={(e) => setCreateForm({ ...createForm, vendorId: e.target.value })}
                    placeholder="Enter vendor ID"
                  />
                </div>
              )}
            </div>

            {/* Customer Notes */}
            <div className="space-y-2">
              <Label htmlFor="customerNotes">Customer Notes</Label>
              <Textarea
                id="customerNotes"
                value={createForm.customerNotes}
                onChange={(e) => setCreateForm({ ...createForm, customerNotes: e.target.value })}
                placeholder="Enter any customer notes or reason for return"
                rows={3}
              />
            </div>

            {/* Return Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Return Items</h3>
                <Button onClick={handleAddReturnItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {createForm.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label>Product *</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => handleUpdateReturnItem(index, 'productId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} (SKU: {product.sku}) - Stock: {product.currentStock}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateReturnItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Reason</Label>
                          <Select
                            value={item.reason}
                            onValueChange={(value) => handleUpdateReturnItem(index, 'reason', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="defective">Defective</SelectItem>
                              <SelectItem value="wrong_item">Wrong Item</SelectItem>
                              <SelectItem value="not_as_described">Not as Described</SelectItem>
                              <SelectItem value="customer_dissatisfaction">Customer Dissatisfaction</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Condition</Label>
                          <Select
                            value={item.condition}
                            onValueChange={(value) => handleUpdateReturnItem(index, 'condition', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="used">Used</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                              <SelectItem value="defective">Defective</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end space-x-2">
                          <div className="flex-1 space-y-2">
                            <Label>Notes</Label>
                            <Input
                              value={item.notes}
                              onChange={(e) => handleUpdateReturnItem(index, 'notes', e.target.value)}
                              placeholder="Optional notes"
                            />
                          </div>
                          <Button
                            onClick={() => handleRemoveReturnItem(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {createForm.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No items added yet</p>
                  <p className="text-sm">Click "Add Item" to start adding products to return</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCreateReturn} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Return Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}