'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCurrencyStore } from '@/stores/currency';

interface Expense {
  id: string;
  expenseNumber: string;
  category: string;
  description: string;
  amount: number;
  submittedBy: string;
  submittedDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: string;
  approvedDate?: Date;
  paidDate?: Date;
  projectId?: string;
  projectName?: string;
  receiptUrl?: string;
  paymentMethod?: string;
}

export default function ExpensesPage() {
  const { formatAmount } = useCurrencyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'paid'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Dialog states
  const [addExpenseDialog, setAddExpenseDialog] = useState(false);
  const [viewExpenseDialog, setViewExpenseDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    projectId: '',
    receiptUrl: '',
    paymentMethod: 'Bank Transfer',
  });

  const categories = ['Travel', 'Office Supplies', 'Equipment', 'Software', 'Marketing', 'Utilities', 'Training', 'Other'];

  // Generate mock expenses using useMemo with empty dependencies to avoid re-generation
  const expenses: Expense[] = useMemo(() => {
    const baseDate = new Date('2025-01-01');
    const mockExpenses: Expense[] = [];
    for (let i = 0; i < 50; i++) {
      const statuses: ('pending' | 'approved' | 'rejected' | 'paid')[] = ['pending', 'approved', 'rejected', 'paid'];
      const status = statuses[i % statuses.length]; // Use deterministic approach instead of Math.random
      const category = categories[i % categories.length];

      mockExpenses.push({
        id: `EXP-${i + 1}`,
        expenseNumber: `EXP-2025-${String(i + 1).padStart(4, '0')}`,
        category,
        description: `${category} expense for company operations`,
        amount: (i + 1) * 100 + 50, // Deterministic amount
        submittedBy: `Employee ${(i % 10) + 1}`,
        submittedDate: new Date(baseDate.getTime() - (i % 30) * 24 * 60 * 60 * 1000),
        status,
        approvedBy: ['approved', 'paid'].includes(status) ? 'Finance Manager' : undefined,
        approvedDate: ['approved', 'paid'].includes(status) ? new Date(baseDate.getTime() - (i % 10) * 24 * 60 * 60 * 1000) : undefined,
        paidDate: status === 'paid' ? new Date(baseDate.getTime() - (i % 5) * 24 * 60 * 60 * 1000) : undefined,
        projectId: i % 2 === 0 ? `PROJ-${(i % 10) + 1}` : undefined,
        projectName: i % 2 === 0 ? `Project ${(i % 10) + 1}` : undefined,
        receiptUrl: i % 3 === 0 ? '/receipts/receipt.pdf' : undefined,
        paymentMethod: status === 'paid' ? 'Bank Transfer' : undefined,
      });
    }
    return mockExpenses;
  }, [categories]); // Include categories in dependency array

  const getFilteredExpenses = () => {
    let filtered = expenses;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(e => e.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredExpenses = getFilteredExpenses();
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
  const approvedAmount = expenses.filter(e => ['approved', 'paid'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0);
  const paidAmount = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Handler functions
  const handleAddExpense = () => {
    if (!expenseForm.category || !expenseForm.description || !expenseForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // In a real app, this would be saved to the database
    const newExpense: Expense = {
      id: `EXP-${new Date().getTime()}`,
      expenseNumber: `EXP-2025-${String(expenses.length + 1).padStart(4, '0')}`,
      category: expenseForm.category,
      description: expenseForm.description,
      amount,
      submittedBy: 'Current User', // In a real app, this would be the logged-in user
      submittedDate: new Date(),
      status: 'pending',
      projectId: expenseForm.projectId || undefined,
      projectName: expenseForm.projectId ? `Project ${expenseForm.projectId}` : undefined,
      receiptUrl: expenseForm.receiptUrl || undefined,
      paymentMethod: expenseForm.paymentMethod,
    };

    // Add to expenses array (in a real app, this would update the database)
    expenses.unshift(newExpense);

    toast.success(`Expense ${newExpense.expenseNumber} submitted successfully!`);

    // Reset form
    setExpenseForm({
      category: '',
      description: '',
      amount: '',
      projectId: '',
      receiptUrl: '',
      paymentMethod: 'Bank Transfer',
    });
    setAddExpenseDialog(false);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setViewExpenseDialog(true);
  };

  const handleApproveExpense = (expenseId: string) => {
    // In a real app, this would update the expense status in the database
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      expense.status = 'approved';
      expense.approvedBy = 'Finance Manager';
      expense.approvedDate = new Date();
      toast.success(`Expense ${expense.expenseNumber} approved successfully!`);
    }
  };

  const handleRejectExpense = (expenseId: string) => {
    // In a real app, this would update the expense status in the database
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      expense.status = 'rejected';
      expense.approvedBy = 'Finance Manager';
      expense.approvedDate = new Date();
      toast.success(`Expense ${expense.expenseNumber} rejected.`);
    }
  };

  const handleMarkAsPaid = (expenseId: string) => {
    // In a real app, this would update the expense status in the database
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      expense.status = 'paid';
      expense.paidDate = new Date();
      toast.success(`Expense ${expense.expenseNumber} marked as paid!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and approve company expenses</p>
        </div>
        <Dialog open={addExpenseDialog} onOpenChange={setAddExpenseDialog}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit New Expense</DialogTitle>
              <DialogDescription>
                Fill in the details for your expense submission. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Category and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
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
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the expense in detail..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Project and Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Select value={expenseForm.projectId} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, projectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROJ-1">Project Alpha</SelectItem>
                      <SelectItem value="PROJ-2">Project Beta</SelectItem>
                      <SelectItem value="PROJ-3">Project Gamma</SelectItem>
                      <SelectItem value="PROJ-4">Project Delta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
                  <Select value={expenseForm.paymentMethod} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt (Optional)</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // In a real app, this would upload the file and get a URL
                      setExpenseForm(prev => ({ ...prev, receiptUrl: `/receipts/${file.name}` }));
                    }
                  }}
                />
                <p className="text-xs text-gray-500">Upload receipt image or PDF (max 5MB)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setAddExpenseDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense} className="bg-yellow-600 hover:bg-yellow-700">
                Submit Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Expense Dialog */}
        <Dialog open={viewExpenseDialog} onOpenChange={setViewExpenseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Expense Details - {selectedExpense?.expenseNumber}</DialogTitle>
              <DialogDescription>
                Submitted by {selectedExpense?.submittedBy} on {selectedExpense?.submittedDate.toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            {selectedExpense && (
              <div className="space-y-6">
                {/* Expense Header */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Category</h3>
                    <Badge variant="outline" className="mt-1">{selectedExpense.category}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Status</h3>
                    <Badge className={`${getStatusBadge(selectedExpense.status)} mt-1`}>
                      {selectedExpense.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Amount</h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">{formatAmount(selectedExpense.amount)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Payment Method</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedExpense.paymentMethod || 'Not specified'}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedExpense.description}</p>
                </div>

                {/* Project Information */}
                {selectedExpense.projectName && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Project</h3>
                    <p className="text-sm text-gray-700">{selectedExpense.projectName}</p>
                  </div>
                )}

                {/* Receipt */}
                {selectedExpense.receiptUrl && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Receipt</h3>
                    <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Receipt
                    </Button>
                  </div>
                )}

                {/* Approval Information */}
                {(selectedExpense.approvedBy || selectedExpense.approvedDate) && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Approval Information</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Approved by:</span> {selectedExpense.approvedBy}
                      </p>
                      {selectedExpense.approvedDate && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Approved on:</span> {selectedExpense.approvedDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                {selectedExpense.paidDate && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Payment Information</h3>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Paid on:</span> {selectedExpense.paidDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewExpenseDialog(false)}>
                    Close
                  </Button>
                  {selectedExpense.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          handleRejectExpense(selectedExpense.id);
                          setViewExpenseDialog(false);
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          handleApproveExpense(selectedExpense.id);
                          setViewExpenseDialog(false);
                        }}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  {selectedExpense.status === 'approved' && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        handleMarkAsPaid(selectedExpense.id);
                        setViewExpenseDialog(false);
                      }}
                    >
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
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatAmount(totalExpenses)}</div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingExpenses}</div>
            <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatAmount(approvedAmount)}</div>
            <p className="text-sm text-gray-500 mt-1">Ready for payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatAmount(paidAmount)}</div>
            <p className="text-sm text-gray-500 mt-1">Processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by expense number, description, or employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>
                All
              </Button>
              <Button variant={filterStatus === 'pending' ? 'default' : 'outline'} onClick={() => setFilterStatus('pending')}>
                Pending
              </Button>
              <Button variant={filterStatus === 'approved' ? 'default' : 'outline'} onClick={() => setFilterStatus('approved')}>
                Approved
              </Button>
              <Button variant={filterStatus === 'paid' ? 'default' : 'outline'} onClick={() => setFilterStatus('paid')}>
                Paid
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense List ({filteredExpenses.length} expenses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Expense #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted By</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{expense.expenseNumber}</p>
                        {expense.receiptUrl && (
                          <p className="text-xs text-blue-600">📎 Receipt attached</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{expense.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{expense.description}</p>
                        {expense.projectName && (
                          <p className="text-xs text-gray-500">Project: {expense.projectName}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{expense.submittedBy}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{expense.submittedDate.toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900">{formatAmount(expense.amount)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusBadge(expense.status)}>
                        {expense.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewExpense(expense)}>View</Button>
                        {expense.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApproveExpense(expense.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectExpense(expense.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {expense.status === 'approved' && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleMarkAsPaid(expense.id)}
                          >
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

          {filteredExpenses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium">No expenses found</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
