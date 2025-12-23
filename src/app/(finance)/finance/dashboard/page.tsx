'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { useCurrencyStore } from '@/stores/currency';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

export default function FinanceDashboard() {
  const { formatAmount } = useCurrencyStore();
  const router = useRouter();
  const [buttonClicks, setButtonClicks] = useState({
    newInvoice: 0,
    recordExpense: 0,
    viewReports: 0,
  });
  const metrics = [
    {
      title: 'Total Revenue',
      value: 1200000,
      change: '+18%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Outstanding Invoices',
      value: 245000,
      change: '-8%',
      changeType: 'positive' as const,
      icon: FileText,
    },
    {
      title: 'Monthly Expenses',
      value: 185000,
      change: '+5%',
      changeType: 'negative' as const,
      icon: TrendingDown,
    },
    {
      title: 'Profit Margin',
      value: '32%',
      change: '+3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
  ];

  const recentInvoices = [
    { id: 'INV-2024-245', client: 'Tech Corp Industries', amount: 45000, status: 'paid', dueDate: '2024-10-15' },
    { id: 'INV-2024-246', client: 'MegaMart Retail', amount: 28500, status: 'overdue', dueDate: '2024-10-10' },
    { id: 'INV-2024-247', client: 'HealthCare Central', amount: 67200, status: 'pending', dueDate: '2024-10-25' },
    { id: 'INV-2024-248', client: 'LogiFlow Solutions', amount: 32800, status: 'paid', dueDate: '2024-10-18' },
  ];

  const recentExpenses = [
    { category: 'Materials & Supplies', amount: 45200, date: '2024-10-20', type: 'operational' },
    { category: 'Employee Salaries', amount: 85000, date: '2024-10-15', type: 'payroll' },
    { category: 'Equipment Purchase', amount: 18500, date: '2024-10-12', type: 'capital' },
    { category: 'Office Rent', amount: 12000, date: '2024-10-01', type: 'operational' },
  ];

  const handleNewInvoice = () => {
    console.log('New Invoice button clicked');
    setButtonClicks(prev => ({ ...prev, newInvoice: prev.newInvoice + 1 }));
    alert('New Invoice creation feature coming soon!');
    toast.info('New Invoice creation feature coming soon!');
    // router.push('/finance/invoices/new');
  };

  const handleRecordExpense = () => {
    console.log('Record Expense button clicked');
    setButtonClicks(prev => ({ ...prev, recordExpense: prev.recordExpense + 1 }));
    alert('Record Expense feature coming soon!');
    toast.info('Record Expense feature coming soon!');
    // router.push('/finance/expenses/new');
  };

  const handleViewReports = () => {
    console.log('View Reports button clicked');
    setButtonClicks(prev => ({ ...prev, viewReports: prev.viewReports + 1 }));
    alert('Financial Reports feature coming soon!');
    toast.info('Financial Reports feature coming soon!');
    // router.push('/finance/reports');
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-yellow-600 to-yellow-700 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Financial Overview</h1>
        <p className="text-yellow-100 mt-1 text-lg">Manage revenue, expenses, and budgets</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {metric.title}
                </CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <IconComponent className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {metric.title === 'Profit Margin' ? metric.value : formatAmount(metric.value as number)}
                </div>
                <p className="text-sm mt-1">
                  <span
                    className={
                      metric.changeType === 'positive'
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    }
                  >
                    {metric.change}
                  </span>{' '}
                  <span className="text-gray-500">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Recent Invoices</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Latest billing and payment status
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-bold text-gray-900">{invoice.id}</p>
                      <Badge
                        variant={
                          invoice.status === 'paid' ? 'default' :
                          invoice.status === 'overdue' ? 'destructive' : 'secondary'
                        }
                      >
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{invoice.client}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {invoice.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatAmount(invoice.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-red-50 to-orange-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Recent Expenses</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Latest business expenditures
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentExpenses.map((expense, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{expense.category}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {expense.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">{expense.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{formatAmount(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Common financial tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleNewInvoice}
              className="p-5 border-2 border-gray-200 rounded-xl hover:bg-linear-to-br hover:from-green-50 hover:to-emerald-50 hover:border-green-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">New Invoice</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Create billing invoice
              </p>
              {buttonClicks.newInvoice > 0 && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  Clicked {buttonClicks.newInvoice} time{buttonClicks.newInvoice !== 1 ? 's' : ''}
                </p>
              )}
            </button>
            <button 
              onClick={handleRecordExpense}
              className="p-5 border-2 border-gray-200 rounded-xl hover:bg-linear-to-br hover:from-red-50 hover:to-orange-50 hover:border-red-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Record Expense</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Log new expenditure
              </p>
              {buttonClicks.recordExpense > 0 && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  Clicked {buttonClicks.recordExpense} time{buttonClicks.recordExpense !== 1 ? 's' : ''}
                </p>
              )}
            </button>
            <button 
              onClick={handleViewReports}
              className="p-5 border-2 border-gray-200 rounded-xl hover:bg-linear-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">View Reports</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Financial analytics
              </p>
              {buttonClicks.viewReports > 0 && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  Clicked {buttonClicks.viewReports} time{buttonClicks.viewReports !== 1 ? 's' : ''}
                </p>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
