'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, DollarSign, Clock, CheckCircle, XCircle, TrendingUp, Eye, Edit, Send, Plus, Calendar, User, Building } from 'lucide-react';
import { mockData } from '@/lib/mock-data';
import { Invoice, Customer, Project } from '@/types';
import { useCurrencyStore } from '@/stores/currency';
import { useInvoicesStore } from '@/stores/invoices';

export default function AdminFinanceInvoicesPage() {
  const { formatAmount } = useCurrencyStore();
  const { invoices } = useInvoicesStore();

  const customers: Customer[] = mockData.customers;
  const projects: Project[] = mockData.projects;

  // State definitions
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isFormattedInvoiceOpen, setIsFormattedInvoiceOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerId: '',
    projectId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    taxAmount: 0,
    dueDate: '',
    notes: ''
  });
  const [editForm, setEditForm] = useState({
    customerId: '',
    projectId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    taxAmount: 0,
    dueDate: '',
    notes: ''
  });

  const invoiceStats = [
    { title: 'Total Invoices', value: invoices.length.toString(), change: '+24', icon: FileText, color: 'blue' },
    { title: 'Paid', value: invoices.filter(i => i.status === 'paid').length.toString(), change: '+18', icon: CheckCircle, color: 'green' },
    { title: 'Pending', value: invoices.filter(i => i.status === 'sent').length.toString(), change: '+6', icon: Clock, color: 'yellow' },
    { title: 'Total Revenue', value: formatAmount(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0)), change: '+22%', icon: DollarSign, color: 'purple' },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', label: string }> = {
      draft: { variant: 'secondary', label: 'DRAFT' },
      sent: { variant: 'default', label: 'SENT' },
      paid: { variant: 'default', label: 'PAID' },
      partially_paid: { variant: 'outline', label: 'PARTIALLY PAID' },
      overdue: { variant: 'destructive', label: 'OVERDUE' },
      cancelled: { variant: 'outline', label: 'CANCELLED' },
    };
    return statusMap[status] || statusMap.draft;
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditForm({
      customerId: invoice.customerId,
      projectId: invoice.projectId || '',
      items: invoice.items,
      taxAmount: invoice.totalTaxAmount,
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      notes: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleViewFormattedInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormattedInvoiceOpen(true);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsSendDialogOpen(true);
  };

  const handleCreateInvoice = () => {
    // Reset form
    setCreateForm({
      customerId: '',
      projectId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      taxAmount: 0,
      dueDate: '',
      notes: ''
    });
    setIsCreateDialogOpen(true);
  };

  const addItem = (formType: 'create' | 'edit') => {
    if (formType === 'create') {
      setCreateForm(prev => ({
        ...prev,
        items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
      }));
    }
  };

  const updateItem = (index: number, field: string, value: any, formType: 'create' | 'edit') => {
    if (formType === 'create') {
      setCreateForm(prev => ({
        ...prev,
        items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
      }));
    }
  };

  const removeItem = (index: number, formType: 'create' | 'edit') => {
    if (formType === 'create') {
      setCreateForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateSubtotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = (subtotal: number, taxAmount: number) => {
    return subtotal + taxAmount;
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">All Invoices</h1>
            <p className="text-red-100 mt-1 text-lg">Complete invoice management and tracking</p>
          </div>
          <Button onClick={handleCreateInvoice} className="bg-white text-red-600 hover:bg-red-50">
            <FileText className="h-5 w-5 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {invoiceStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
                <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                  <IconComponent className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm mt-1">
                  <span className="text-green-600 font-semibold">{stat.change}</span>
                  <span className="text-gray-500"> this month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Invoices List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Invoice List</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            {invoices.length} invoices across all customers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {invoices.slice(0, 20).map((invoice) => {
              const statusBadge = getStatusBadge(invoice.status);
              const isOverdue = invoice.status === 'overdue';
              const customer = mockData.getCustomerById(invoice.customerId);
              return (
                <div
                  key={invoice.id}
                  className={`p-5 rounded-lg border-2 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'} hover:border-red-300 transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{invoice.invoiceNumber}</h4>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        {invoice.status === 'paid' && (
                          <Badge variant="default" className="bg-red-600">PAID</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Customer: {customer?.companyName || 'Unknown Customer'}</p>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Issue Date</p>
                          <p className="text-sm font-semibold text-gray-700">{invoice.issueDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className="text-sm font-semibold text-gray-700">{invoice.dueDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Days {isOverdue ? 'Overdue' : 'Remaining'}</p>
                          <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                            {Math.abs(Math.floor((invoice.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 text-right">
                      <p className="text-2xl font-bold text-red-600">{formatAmount(invoice.totalAmount)}</p>
                      <p className="text-xs text-gray-500 mt-1">Amount</p>
                      <div className="flex items-center space-x-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewFormattedInvoice(invoice)}>
                          <FileText className="h-4 w-4 mr-1" />
                          Format
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => invoice.status === 'draft' ? handleSendInvoice(invoice) : handleEditInvoice(invoice)}
                        >
                          {invoice.status === 'draft' ? <Send className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
                          {invoice.status === 'draft' ? 'Send' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-2xl font-bold text-gray-900">Create New Invoice</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new invoice for a customer
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
              <TabsTrigger value="details" className="data-[state=active]:bg-white">Invoice Details</TabsTrigger>
              <TabsTrigger value="items" className="data-[state=active]:bg-white">Items</TabsTrigger>
              <TabsTrigger value="summary" className="data-[state=active]:bg-white">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={createForm.customerId} onValueChange={(value) => setCreateForm(prev => ({ ...prev, customerId: value }))}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Select value={createForm.projectId} onValueChange={(value) => setCreateForm(prev => ({ ...prev, projectId: value }))}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={createForm.notes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  className="bg-white border-gray-300"
                />
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4 mt-6">
              {createForm.items.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value, 'create')}
                        placeholder="Item description"
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1, 'create')}
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Unit Price *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0, 'create')}
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <Input
                        value={formatAmount(item.quantity * item.unitPrice)}
                        readOnly
                        className="bg-gray-100 border-gray-300"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index, 'create')}
                        disabled={createForm.items.length === 1}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={() => addItem('create')} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Invoice Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatAmount(calculateSubtotal(createForm.items))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatAmount(createForm.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatAmount(calculateTotal(calculateSubtotal(createForm.items), createForm.taxAmount))}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Create Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-2xl font-bold text-gray-900">Invoice Details</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-semibold">{mockData.getCustomerById(selectedInvoice.customerId)?.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-semibold">{selectedInvoice.issueDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-semibold">{selectedInvoice.dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadge(selectedInvoice.status).variant}>
                      {getStatusBadge(selectedInvoice.status).label}
                    </Badge>
                  </div>
                  {selectedInvoice.projectId && (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Project</p>
                        <p className="font-semibold">{mockData.getProjectById(selectedInvoice.projectId)?.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Items</h3>
                <div className="space-y-3">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatAmount(item.unitPrice)}</p>
                      </div>
                      <p className="font-semibold">{formatAmount(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatAmount(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatAmount(selectedInvoice.totalTaxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatAmount(selectedInvoice.totalAmount)}</span>
                    </div>
                    {selectedInvoice.paidAmount > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Paid:</span>
                          <span className="text-green-600">-{formatAmount(selectedInvoice.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Remaining:</span>
                          <span className={selectedInvoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatAmount(selectedInvoice.remainingAmount)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-2xl font-bold text-gray-900">Edit Invoice</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="details" className="data-[state=active]:bg-white">Invoice Details</TabsTrigger>
                <TabsTrigger value="items" className="data-[state=active]:bg-white">Items</TabsTrigger>
                <TabsTrigger value="summary" className="data-[state=active]:bg-white">Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-customer">Customer *</Label>
                    <Select value={editForm.customerId} onValueChange={(value) => setEditForm(prev => ({ ...prev, customerId: value }))}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-project">Project (Optional)</Label>
                    <Select value={editForm.projectId} onValueChange={(value) => setEditForm(prev => ({ ...prev, projectId: value }))}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Due Date *</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="bg-white border-gray-300"
                  />
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4 mt-6">
                {editForm.items.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-5">
                        <Label>Description *</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value, 'edit')}
                          placeholder="Item description"
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1, 'edit')}
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0, 'edit')}
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Total</Label>
                        <Input
                          value={formatAmount(item.quantity * item.unitPrice)}
                          readOnly
                          className="bg-gray-100 border-gray-300"
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(index, 'edit')}
                          disabled={editForm.items.length === 1}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={() => addItem('edit')} className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Invoice Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatAmount(calculateSubtotal(editForm.items))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatAmount(editForm.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatAmount(calculateTotal(calculateSubtotal(editForm.items), editForm.taxAmount))}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Update Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Invoice Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-2xl font-bold text-gray-900">Send Invoice</DialogTitle>
            <DialogDescription className="text-gray-600">
              Send invoice {selectedInvoice?.invoiceNumber} to customer
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Invoice Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Customer:</strong> {mockData.getCustomerById(selectedInvoice.customerId)?.companyName}</p>
                  <p><strong>Amount:</strong> {formatAmount(selectedInvoice.totalAmount)}</p>
                  <p><strong>Due Date:</strong> {selectedInvoice.dueDate.toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-subject">Email Subject</Label>
                <Input
                  id="email-subject"
                  defaultValue={`Invoice ${selectedInvoice.invoiceNumber} from ${mockData.getCustomerById(selectedInvoice.customerId)?.companyName}`}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message">Email Message</Label>
                <Textarea
                  id="email-message"
                  rows={4}
                  defaultValue={`Dear ${mockData.getCustomerById(selectedInvoice.customerId)?.primaryContact.name},

Please find attached invoice ${selectedInvoice.invoiceNumber} for ${formatAmount(selectedInvoice.totalAmount)}.

Invoice Details:
- Issue Date: ${selectedInvoice.issueDate.toLocaleDateString()}
- Due Date: ${selectedInvoice.dueDate.toLocaleDateString()}
- Amount: ${formatAmount(selectedInvoice.totalAmount)}

Please remit payment by the due date.

Best regards,
Finance Team`}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="attach-pdf" defaultChecked className="rounded" />
                <Label htmlFor="attach-pdf">Attach PDF invoice</Label>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formatted Invoice Dialog */}
      <Dialog open={isFormattedInvoiceOpen} onOpenChange={setIsFormattedInvoiceOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-2xl font-bold text-gray-900">Formatted Invoice</DialogTitle>
            <DialogDescription className="text-gray-600">
              Professional invoice format{selectedInvoice ? ` for ${selectedInvoice.invoiceNumber}` : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="border-b-2 border-gray-300 pb-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <img
                      src={mockData.companySettings.logoUrl}
                      alt={mockData.companySettings.companyName}
                      className="h-16 w-32 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/128x64?text=LOGO';
                      }}
                    />
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{mockData.companySettings.companyName}</h1>
                      {mockData.companySettings.tagline && (
                        <p className="text-gray-600">{mockData.companySettings.tagline}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-red-600">INVOICE</h2>
                    <p className="text-gray-600">#{selectedInvoice.invoiceNumber}</p>
                  </div>
                </div>
              </div>

              {/* Company & Customer Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">From:</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-semibold">{mockData.companySettings.companyName}</p>
                    <p>{mockData.companySettings.address.street}</p>
                    <p>{mockData.companySettings.address.city}, {mockData.companySettings.address.state} {mockData.companySettings.address.zipCode}</p>
                    <p>{mockData.companySettings.address.country}</p>
                    <p>Phone: {mockData.companySettings.contact.phone}</p>
                    <p>Email: {mockData.companySettings.contact.email}</p>
                    {mockData.companySettings.contact.website && (
                      <p>Web: {mockData.companySettings.contact.website}</p>
                    )}
                    <p>Tax ID: {mockData.companySettings.taxInfo.taxId}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Bill To:</h3>
                  {(() => {
                    const customer = mockData.getCustomerById(selectedInvoice.customerId);
                    return customer ? (
                      <div className="text-sm text-gray-700 space-y-1">
                        <p className="font-semibold">{customer.companyName}</p>
                        <p>{customer.primaryContact.name}</p>
                        <p>{customer.primaryContact.designation}</p>
                        <p>{customer.address.street}</p>
                        <p>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</p>
                        <p>{customer.address.country}</p>
                        <p>Phone: {customer.primaryContact.phone}</p>
                        <p>Email: {customer.primaryContact.email}</p>
                        <p>Tax ID: {customer.taxId}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Customer information not available</p>
                    );
                  })()}
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice Date</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice.issueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice.dueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                  <Badge variant={getStatusBadge(selectedInvoice.status).variant}>
                    {getStatusBadge(selectedInvoice.status).label}
                  </Badge>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatAmount(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatAmount(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatAmount(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatAmount(selectedInvoice.totalTaxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatAmount(selectedInvoice.totalAmount)}</span>
                  </div>
                  {selectedInvoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Paid:</span>
                        <span>-{formatAmount(selectedInvoice.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span className={selectedInvoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                          {selectedInvoice.remainingAmount > 0 ? 'Balance Due:' : 'Paid in Full:'}
                        </span>
                        <span className={selectedInvoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatAmount(Math.abs(selectedInvoice.remainingAmount))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Payment Terms</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {mockData.companySettings.invoiceSettings.paymentTerms}
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Terms and Conditions</h3>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {mockData.companySettings.invoiceSettings.termsAndConditions}
                </div>
              </div>

              {/* Banking Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Payment Information</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Bank:</strong> {mockData.companySettings.banking.bankName}</p>
                  <p><strong>Account:</strong> {mockData.companySettings.banking.accountNumber}</p>
                  <p><strong>Routing:</strong> {mockData.companySettings.banking.routingNumber}</p>
                  {mockData.companySettings.banking.swiftCode && (
                    <p><strong>SWIFT:</strong> {mockData.companySettings.banking.swiftCode}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              {mockData.companySettings.invoiceSettings.footerText && (
                <div className="text-center text-gray-600 italic border-t pt-4">
                  {mockData.companySettings.invoiceSettings.footerText}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsFormattedInvoiceOpen(false)} className="bg-white border-gray-300">
              Close
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
