'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrencyStore } from '@/stores/currency';
import { toast } from 'sonner';

interface Budget {
  id: string;
  category: string;
  department: string;
  period: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationRate: number;
  status: 'healthy' | 'warning' | 'critical' | 'exceeded';
  lastUpdated: Date;
  description?: string;
}

interface BudgetForm {
  category: string;
  department: string;
  period: string;
  allocatedAmount: string;
  description: string;
}

interface ViewBudgetDialogProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditBudgetDialogProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBudget: Budget) => void;
}

interface CreateBudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id' | 'spentAmount' | 'remainingAmount' | 'utilizationRate' | 'status' | 'lastUpdated'>) => void;
}

function ViewBudgetDialog({ budget, isOpen, onClose }: ViewBudgetDialogProps) {
  const { formatAmount } = useCurrencyStore();

  if (!budget) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Budget Details - {budget.category}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Department</Label>
              <p className="text-lg font-semibold">{budget.department}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Period</Label>
              <p className="text-lg font-semibold">{budget.period}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Allocated</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(budget.allocatedAmount)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Spent</p>
                  <p className="text-2xl font-bold text-blue-600">{formatAmount(budget.spentAmount)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className={`text-2xl font-bold ${budget.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(Math.abs(budget.remainingAmount))}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600">Utilization</Label>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{budget.utilizationRate}% utilized</span>
                <Badge className={budget.status === 'healthy' ? 'bg-green-100 text-green-800' :
                                budget.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                budget.status === 'critical' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'}>
                  {budget.status.toUpperCase()}
                </Badge>
              </div>
              <Progress value={Math.min(budget.utilizationRate, 100)} className="h-3" />
            </div>
          </div>

          {budget.description && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Description</Label>
              <p className="text-sm text-gray-700 mt-1">{budget.description}</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
            <p className="text-sm text-gray-700">{budget.lastUpdated.toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditBudgetDialog({ budget, isOpen, onClose, onSave }: EditBudgetDialogProps) {
  const [form, setForm] = useState<BudgetForm>({
    category: budget?.category || '',
    department: budget?.department || '',
    period: budget?.period || '',
    allocatedAmount: budget?.allocatedAmount.toString() || '',
    description: budget?.description || '',
  });

  const handleSave = () => {
    if (!budget) return;

    if (!form.category || !form.department || !form.period || !form.allocatedAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const allocatedAmount = parseFloat(form.allocatedAmount);
    if (isNaN(allocatedAmount) || allocatedAmount <= 0) {
      toast.error('Please enter a valid allocated amount');
      return;
    }

    const updatedBudget: Budget = {
      ...budget,
      category: form.category,
      department: form.department,
      period: form.period,
      allocatedAmount,
      remainingAmount: allocatedAmount - budget.spentAmount,
      utilizationRate: (budget.spentAmount / allocatedAmount) * 100,
      description: form.description,
      lastUpdated: new Date(),
    };

    // Recalculate status
    const utilizationRate = updatedBudget.utilizationRate;
    if (utilizationRate > 100) updatedBudget.status = 'exceeded';
    else if (utilizationRate > 90) updatedBudget.status = 'critical';
    else if (utilizationRate > 75) updatedBudget.status = 'warning';
    else updatedBudget.status = 'healthy';

    onSave(updatedBudget);
    onClose();
    toast.success('Budget updated successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-category">Category *</Label>
            <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Salaries & Benefits">Salaries & Benefits</SelectItem>
                <SelectItem value="Office Operations">Office Operations</SelectItem>
                <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                <SelectItem value="Technology & Software">Technology & Software</SelectItem>
                <SelectItem value="Travel & Entertainment">Travel & Entertainment</SelectItem>
                <SelectItem value="Training & Development">Training & Development</SelectItem>
                <SelectItem value="Equipment & Supplies">Equipment & Supplies</SelectItem>
                <SelectItem value="Professional Services">Professional Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-department">Department *</Label>
            <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-period">Period *</Label>
            <Select value={form.period} onValueChange={(value) => setForm({ ...form, period: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oct 2025">Oct 2025</SelectItem>
                <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-amount">Allocated Amount *</Label>
            <Input
              id="edit-amount"
              type="number"
              value={form.allocatedAmount}
              onChange={(e) => setForm({ ...form, allocatedAmount: e.target.value })}
              placeholder="Enter amount"
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter budget description"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">Save Changes</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateBudgetDialog({ isOpen, onClose, onSave }: CreateBudgetDialogProps) {
  const [form, setForm] = useState<BudgetForm>({
    category: '',
    department: '',
    period: '',
    allocatedAmount: '',
    description: '',
  });

  const handleSave = () => {
    if (!form.category || !form.department || !form.period || !form.allocatedAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const allocatedAmount = parseFloat(form.allocatedAmount);
    if (isNaN(allocatedAmount) || allocatedAmount <= 0) {
      toast.error('Please enter a valid allocated amount');
      return;
    }

    onSave({
      category: form.category,
      department: form.department,
      period: form.period,
      allocatedAmount,
      description: form.description,
    });

    setForm({
      category: '',
      department: '',
      period: '',
      allocatedAmount: '',
      description: '',
    });

    onClose();
    toast.success('Budget created successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Salaries & Benefits">Salaries & Benefits</SelectItem>
                <SelectItem value="Office Operations">Office Operations</SelectItem>
                <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                <SelectItem value="Technology & Software">Technology & Software</SelectItem>
                <SelectItem value="Travel & Entertainment">Travel & Entertainment</SelectItem>
                <SelectItem value="Training & Development">Training & Development</SelectItem>
                <SelectItem value="Equipment & Supplies">Equipment & Supplies</SelectItem>
                <SelectItem value="Professional Services">Professional Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="department">Department *</Label>
            <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="period">Period *</Label>
            <Select value={form.period} onValueChange={(value) => setForm({ ...form, period: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oct 2025">Oct 2025</SelectItem>
                <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Allocated Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={form.allocatedAmount}
              onChange={(e) => setForm({ ...form, allocatedAmount: e.target.value })}
              placeholder="Enter amount"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter budget description"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">Create Budget</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BudgetsPage() {
  const { formatAmount } = useCurrencyStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingBudget, setViewingBudget] = useState<Budget | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'];
  const categories = [
    'Salaries & Benefits',
    'Office Operations',
    'Marketing & Advertising',
    'Technology & Software',
    'Travel & Entertainment',
    'Training & Development',
    'Equipment & Supplies',
    'Professional Services',
  ];

  // Generate deterministic mock budgets using mathematical patterns instead of Math.random()
  const generateBudgets = useMemo(() => {
    return departments.flatMap((dept, deptIndex) =>
      categories.map((category, catIndex) => {
        const baseAmount = 100000;
        const deptMultiplier = (deptIndex + 1) * 0.5;
        const catMultiplier = (catIndex + 1) * 0.3;
        const allocated = Math.floor(baseAmount + (deptMultiplier * catMultiplier * 200000));

        // Use sine/cosine functions for deterministic "random" spending
        const spendingFactor = Math.sin(deptIndex * catIndex + 1) * 0.5 + 0.5; // 0-1 range
        const spent = Math.floor(allocated * spendingFactor * 1.2);

        const remaining = allocated - spent;
        const utilizationRate = Math.round((spent / allocated) * 100);

        let status: 'healthy' | 'warning' | 'critical' | 'exceeded';
        if (utilizationRate > 100) status = 'exceeded';
        else if (utilizationRate > 90) status = 'critical';
        else if (utilizationRate > 75) status = 'warning';
        else status = 'healthy';

        return {
          id: `BUD-${dept}-${catIndex}`,
          category,
          department: dept,
          period: selectedPeriod === 'monthly' ? 'Oct 2025' : selectedPeriod === 'quarterly' ? 'Q4 2025' : '2025',
          allocatedAmount: allocated,
          spentAmount: spent,
          remainingAmount: remaining,
          utilizationRate,
          status,
          lastUpdated: new Date(),
          description: `${category} budget for ${dept} department`,
        };
      })
    );
  }, [selectedPeriod]);

  // Initialize budgets on first load
  useEffect(() => {
    setBudgets(generateBudgets);
  }, []);

  // Update budgets when period changes
  useEffect(() => {
    setBudgets(generateBudgets);
  }, [generateBudgets]);

  const getFilteredBudgets = () => {
    let filtered = budgets;

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(b => b.department === selectedDepartment);
    }

    return filtered;
  };

  const filteredBudgets = getFilteredBudgets();
  const totalAllocated = filteredBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overBudgetCount = filteredBudgets.filter(b => b.status === 'exceeded').length;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-orange-100 text-orange-800',
      exceeded: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getUtilizationColor = (rate: number) => {
    if (rate > 100) return 'text-red-600';
    if (rate > 90) return 'text-orange-600';
    if (rate > 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Summary by department
  const departmentSummary = departments.map(dept => {
    const deptBudgets = budgets.filter(b => b.department === dept);
    const allocated = deptBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
    const spent = deptBudgets.reduce((sum, b) => sum + b.spentAmount, 0);
    const utilization = (spent / allocated) * 100;

    return {
      department: dept,
      allocated,
      spent,
      remaining: allocated - spent,
      utilization: Math.round(utilization),
    };
  });

  const handleCreateBudget = (newBudget: Omit<Budget, 'id' | 'spentAmount' | 'remainingAmount' | 'utilizationRate' | 'status' | 'lastUpdated'>) => {
    const budget: Budget = {
      ...newBudget,
      id: `BUD-${Date.now()}`,
      spentAmount: 0,
      remainingAmount: newBudget.allocatedAmount,
      utilizationRate: 0,
      status: 'healthy',
      lastUpdated: new Date(),
    };

    setBudgets(prev => [...prev, budget]);
  };

  const handleUpdateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1">Plan and track departmental budgets</p>
        </div>
        <Button
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Budget
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatAmount(totalAllocated)}</div>
            <p className="text-sm text-gray-500 mt-1">Budget allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatAmount(totalSpent)}</div>
            <p className="text-sm text-gray-500 mt-1">
              {Math.round((totalSpent / totalAllocated) * 100)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(Math.abs(totalRemaining))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {totalRemaining >= 0 ? 'Available' : 'Over budget'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Over Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overBudgetCount}</div>
            <p className="text-sm text-gray-500 mt-1">Categories exceeded</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <Button variant={selectedPeriod === 'monthly' ? 'default' : 'outline'} onClick={() => setSelectedPeriod('monthly')}>
                Monthly
              </Button>
              <Button variant={selectedPeriod === 'quarterly' ? 'default' : 'outline'} onClick={() => setSelectedPeriod('quarterly')}>
                Quarterly
              </Button>
              <Button variant={selectedPeriod === 'yearly' ? 'default' : 'outline'} onClick={() => setSelectedPeriod('yearly')}>
                Yearly
              </Button>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Department Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Summary by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentSummary.map((dept) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{dept.department}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Allocated: {formatAmount(dept.allocated)}
                        </span>
                        <span className="text-blue-600">
                          Spent: {formatAmount(dept.spent)}
                        </span>
                        <span className={dept.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                          Remaining: {formatAmount(Math.abs(dept.remaining))}
                        </span>
                        <span className={`font-semibold ${getUtilizationColor(dept.utilization)}`}>
                          {dept.utilization}%
                        </span>
                      </div>
                    </div>
                    <Progress value={Math.min(dept.utilization, 100)} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Details */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Details ({filteredBudgets.length} categories)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Period</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Allocated</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Spent</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Remaining</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Utilization</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.map((budget) => (
                  <tr key={budget.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{budget.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{budget.department}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{budget.period}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-700">{formatAmount(budget.allocatedAmount)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={budget.status === 'exceeded' ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                        {formatAmount(budget.spentAmount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={budget.remainingAmount < 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        {formatAmount(Math.abs(budget.remainingAmount))}
                        {budget.remainingAmount < 0 && ' (over)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-semibold ${getUtilizationColor(budget.utilizationRate)}`}>
                          {budget.utilizationRate}%
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-full rounded-full ${
                              budget.utilizationRate > 100 ? 'bg-red-500' :
                              budget.utilizationRate > 90 ? 'bg-orange-500' :
                              budget.utilizationRate > 75 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(budget.utilizationRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusBadge(budget.status)}>
                        {budget.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingBudget(budget)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingBudget(budget)}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateBudgetDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleCreateBudget}
      />

      <ViewBudgetDialog
        budget={viewingBudget}
        isOpen={!!viewingBudget}
        onClose={() => setViewingBudget(null)}
      />

      <EditBudgetDialog
        budget={editingBudget}
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        onSave={handleUpdateBudget}
      />
    </div>
  );
}
