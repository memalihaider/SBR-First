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
import { FileText, DollarSign, Clock, CheckCircle, XCircle, TrendingUp, Eye, Edit, Plus, Calendar, User, Building, Receipt, CreditCard } from 'lucide-react';
import { mockData } from '@/lib/mock-data';
import { Expense, Project, Vendor } from '@/types';
import { useCurrencyStore } from '@/stores/currency';

export default function AdminFinanceExpensesPage() {
  const { formatAmount } = useCurrencyStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    category: '',
    description: '',
    amount: '',
    expenseDate: '',
    projectId: '',
    vendorId: '',
    paymentMethod: '',
    receiptUrl: ''
  });

  const [editForm, setEditForm] = useState({
    category: '',
    description: '',
    amount: '',
    expenseDate: '',
    projectId: '',
    vendorId: '',
    paymentMethod: '',
    receiptUrl: ''
  });

  // Mock expense data with proper typing
  const expenses: Expense[] = mockData.expenses.map(expense => ({
    ...expense,
    expenseDate: new Date(expense.expenseDate),
    approvedAt: expense.approvedAt ? new Date(expense.approvedAt) : undefined,
    createdAt: new Date(expense.createdAt)
  }));

  const projects: Project[] = mockData.projects;
  const vendors: Vendor[] = []; // We'll use mock vendor data if available

  const expenseStats = [
    { title: 'Total Expenses', value: expenses.length.toString(), change: '+12%', icon: FileText, color: 'red' },
    { title: 'Approved', value: expenses.filter(e => e.approvedBy).length.toString(), change: '+8%', icon: CheckCircle, color: 'red' },
    { title: 'Pending Approval', value: expenses.filter(e => !e.approvedBy).length.toString(), change: '+3', icon: Clock, color: 'red' },
    { title: 'This Month', value: expenses.filter(e => {
      const now = new Date();
      return e.expenseDate.getMonth() === now.getMonth() && e.expenseDate.getFullYear() === now.getFullYear();
    }).length.toString(), change: '+15%', icon: TrendingUp, color: 'red' },
  ];

  const getStatusBadge = (expense: Expense) => {
    if (expense.approvedBy) {
      return { variant: 'default' as const, label: 'APPROVED', color: 'bg-red-100 text-red-800' };
    }
    return { variant: 'secondary' as const, label: 'PENDING', color: 'bg-red-200 text-red-900' };
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsViewDialogOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditForm({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      expenseDate: expense.expenseDate.toISOString().split('T')[0],
      projectId: expense.projectId || '',
      vendorId: expense.vendorId || '',
      paymentMethod: 'Company Card', // Default
      receiptUrl: expense.receiptUrl || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleApproveExpense = (expense: Expense) => {
    // In a real app, this would make an API call
    console.log('Approving expense:', expense.id);
  };

  const handleRejectExpense = (expense: Expense) => {
    // In a real app, this would make an API call
    console.log('Rejecting expense:', expense.id);
  };

  const handleCreateExpense = () => {
    // Reset form
    setCreateForm({
      category: '',
      description: '',
      amount: '',
      expenseDate: '',
      projectId: '',
      vendorId: '',
      paymentMethod: '',
      receiptUrl: ''
    });
    setIsCreateDialogOpen(true);
  };

  const expenseCategories = [
    'Office Supplies',
    'Travel',
    'Software',
    'Marketing',
    'Utilities',
    'Equipment',
    'Professional Services',
    'Training',
    'Entertainment',
    'Miscellaneous'
  ];

  const paymentMethods = [
    'Company Card',
    'Corporate Account',
    'Bank Transfer',
    'Purchase Order',
    'Auto-Pay',
    'Check'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">All Expenses</h1>
            <p className="text-red-100 mt-1 text-lg">Complete expense tracking and approval management</p>
          </div>
          <Button onClick={handleCreateExpense} className="bg-white text-red-600 hover:bg-red-50">
            <Plus className="h-5 w-5 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {expenseStats.map((stat, index) => {
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

      {/* Expenses List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Expense Records</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            {expenses.length} expenses across all categories
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {expenses.slice(0, 20).map((expense) => {
              const statusBadge = getStatusBadge(expense);
              return (
                <div
                  key={expense.id}
                  className="p-5 rounded-lg border-2 border-gray-200 bg-white hover:border-red-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{expense.description}</h4>
                        <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Category: {expense.category}</p>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Expense Date</p>
                          <p className="text-sm font-semibold text-gray-700">{expense.expenseDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-sm font-semibold text-red-600">{formatAmount(expense.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Approved By</p>
                          <p className="text-sm font-semibold text-gray-700">{expense.approvedBy || 'Pending'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 text-right">
                      <div className="flex items-center space-x-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => handleViewExpense(expense)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditExpense(expense)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {!expense.approvedBy && (
                          <>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleApproveExpense(expense)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectExpense(expense)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Expense Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-2xl font-bold text-gray-900">Create New Expense</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new expense for approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {expenseCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the expense..."
                className="bg-white border-gray-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Expense Date *</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={createForm.expenseDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={createForm.paymentMethod} onValueChange={(value) => setCreateForm(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt URL</Label>
                <Input
                  id="receipt"
                  value={createForm.receiptUrl}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, receiptUrl: e.target.value }))}
                  placeholder="https://..."
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Create Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Expense Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-2xl font-bold text-gray-900">Expense Details</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedExpense?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-semibold">{selectedExpense.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Expense Date</p>
                      <p className="font-semibold">{selectedExpense.expenseDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-semibold">Company Card</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadge(selectedExpense).variant}>
                      {getStatusBadge(selectedExpense).label}
                    </Badge>
                  </div>
                  {selectedExpense.projectId && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Project</p>
                        <p className="font-semibold">{mockData.getProjectById(selectedExpense.projectId)?.name}</p>
                      </div>
                    </div>
                  )}
                  {selectedExpense.approvedBy && (
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Approved By</p>
                        <p className="font-semibold">{selectedExpense.approvedBy}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedExpense.description}</p>
              </div>

              <div className="border-t pt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Amount:</span>
                    <span className="text-2xl font-bold text-red-600">{formatAmount(selectedExpense.amount)}</span>
                  </div>
                </div>
              </div>

              {selectedExpense.receiptUrl && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Receipt</h3>
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5 text-gray-500" />
                    <a
                      href={selectedExpense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Receipt
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-2xl font-bold text-gray-900">Edit Expense</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedExpense?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {expenseCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount *</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the expense..."
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-expenseDate">Expense Date *</Label>
                  <Input
                    id="edit-expenseDate"
                    type="date"
                    value={editForm.expenseDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-paymentMethod">Payment Method</Label>
                  <Select value={editForm.paymentMethod} onValueChange={(value) => setEditForm(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="edit-receipt">Receipt URL</Label>
                  <Input
                    id="edit-receipt"
                    value={editForm.receiptUrl}
                    onChange={(e) => setEditForm(prev => ({ ...prev, receiptUrl: e.target.value }))}
                    placeholder="https://..."
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Update Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
