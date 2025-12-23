'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import mockData from '@/lib/mock-data';
import { useCurrencyStore } from '@/stores/currency';

interface ReportData {
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  profitMargin: number;
  cashFlow: number;
}

interface DetailData {
  type: 'period' | 'category';
  month?: string;
  revenue?: number;
  expenses?: number;
  category?: string;
  amount?: number;
  percentage?: number;
}

export default function ReportsPage() {
  const { formatAmount } = useCurrencyStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<DetailData | null>(null);

  // Generate mock financial data using useMemo to avoid Math.random during render
  const reportData: ReportData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      revenueByMonth: months.map((month, idx) => ({
        month,
        revenue: 200000 + (idx * 15000) + (Math.sin(idx * 0.5) * 50000), // Deterministic pattern
        expenses: 100000 + (idx * 8000) + (Math.cos(idx * 0.3) * 30000), // Deterministic pattern
      })),
      expensesByCategory: [
        { category: 'Salaries', amount: 850000, percentage: 45 },
        { category: 'Operations', amount: 380000, percentage: 20 },
        { category: 'Marketing', amount: 285000, percentage: 15 },
        { category: 'Technology', amount: 190000, percentage: 10 },
        { category: 'Travel', amount: 95000, percentage: 5 },
        { category: 'Other', amount: 95000, percentage: 5 },
      ],
      profitMargin: 23.5,
      cashFlow: 1250000,
    };
  }, []);

  // Filter data based on selected period and year
  const filteredData = useMemo(() => {
    let data = reportData.revenueByMonth;
    
    if (selectedPeriod === 'quarter') {
      // Group by quarters
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      data = quarters.map((quarter, idx) => {
        const quarterMonths = data.slice(idx * 3, (idx + 1) * 3);
        return {
          month: quarter,
          revenue: quarterMonths.reduce((sum, m) => sum + m.revenue, 0),
          expenses: quarterMonths.reduce((sum, m) => sum + m.expenses, 0),
        };
      });
    } else if (selectedPeriod === 'year') {
      // Aggregate for the year
      data = [{
        month: selectedYear.toString(),
        revenue: data.reduce((sum, m) => sum + m.revenue, 0),
        expenses: data.reduce((sum, m) => sum + m.expenses, 0),
      }];
    }
    
    return data;
  }, [reportData, selectedPeriod, selectedYear]);

  const totalRevenue = filteredData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = filteredData.reduce((sum, m) => sum + m.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // Export functionality
  const handleExportReport = () => {
    if (exportFormat === 'pdf') {
      // In a real app, this would generate a PDF report
      toast.success('PDF report generated successfully!');
      // Simulate download
      const link = document.createElement('a');
      link.href = '#'; // Would be actual PDF URL
      link.download = `financial-report-${selectedYear}-${selectedPeriod}.pdf`;
      link.click();
    } else {
      // In a real app, this would generate an Excel report
      toast.success('Excel report generated successfully!');
      // Simulate download
      const link = document.createElement('a');
      link.href = '#'; // Would be actual Excel URL
      link.download = `financial-report-${selectedYear}-${selectedPeriod}.xlsx`;
      link.click();
    }
    setExportDialogOpen(false);
  };

  // Show detailed information
  const handleShowDetails = (data: any, type: 'period' | 'category') => {
    setSelectedDetail({ ...data, type });
    setDetailDialogOpen(true);
  };

  // Project financial data
  const projectFinancials = useMemo(() => mockData.projects.map(project => ({
    id: project.id,
    name: project.name,
    budget: project.budgetAmount,
    spent: project.actualCost,
    remaining: project.budgetAmount - project.actualCost,
    variance: project.budgetAmount > 0 ? ((project.actualCost / project.budgetAmount) * 100).toFixed(1) : '0.0',
  })), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial analysis and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Export Financial Report</DialogTitle>
                <DialogDescription>
                  Choose the format for your financial report export.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Export Format</label>
                  <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Report Period: {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} {selectedYear}</p>
                  <p>Total Revenue: {formatAmount(totalRevenue)}</p>
                  <p>Net Profit: {formatAmount(netProfit)}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExportReport} className="bg-yellow-600 hover:bg-yellow-700">
                  Export
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatAmount(totalRevenue)}</div>
            <p className="text-sm text-gray-500 mt-1">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatAmount(totalExpenses)}</div>
            <p className="text-sm text-gray-500 mt-1">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatAmount(netProfit)}</div>
            <p className="text-sm text-gray-500 mt-1">{profitMargin}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{formatAmount(reportData.cashFlow)}</div>
            <p className="text-sm text-gray-500 mt-1">Positive</p>
          </CardContent>
        </Card>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button variant={selectedPeriod === 'month' ? 'default' : 'outline'} onClick={() => setSelectedPeriod('month')}>
              Monthly
            </Button>
            <Button variant={selectedPeriod === 'quarter' ? 'default' : 'outline'} onClick={() => setSelectedPeriod('quarter')}>
              Quarterly
            </Button>
            <Button variant={selectedPeriod === 'year' ? 'default' : 'outline'} onClick={() => setSelectedPeriod('year')}>
              Yearly
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.map((data, idx) => {
              const maxValue = Math.max(...filteredData.map(d => Math.max(d.revenue, d.expenses)));
              const revenueWidth = (data.revenue / maxValue) * 100;
              const expensesWidth = (data.expenses / maxValue) * 100;
              
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{data.month} {selectedPeriod === 'year' ? '' : selectedYear}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-green-600">Revenue: {formatAmount(data.revenue)}</span>
                      <span className="text-red-600">Expenses: {formatAmount(data.expenses)}</span>
                      <span className="text-blue-600 font-semibold">
                        Net: {formatAmount(data.revenue - data.expenses)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                         onClick={() => handleShowDetails(data, 'period')}>
                      <div
                        className="bg-green-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${revenueWidth}%` }}
                      />
                      <div
                        className="bg-red-500 h-full rounded-full absolute top-0 transition-all duration-300"
                        style={{ width: `${expensesWidth}%`, opacity: 0.7 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expenses by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.expensesByCategory.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleShowDetails(category, 'category')}>
                    {category.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">{formatAmount(category.amount)}</span>
                    <span className="text-gray-500">{category.percentage}%</span>
                  </div>
                </div>
                <div className="cursor-pointer" onClick={() => handleShowDetails(category, 'category')}>
                  <Progress value={category.percentage} className="h-2 hover:opacity-80 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Financial Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Project Financial Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Budget</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Spent</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Remaining</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Variance</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectFinancials.map((project) => {
                  const isOverBudget = project.spent > project.budget;
                  const utilizationRate = Number(project.variance);
                  
                  return (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{project.name}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-gray-700">{formatAmount(project.budget)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={isOverBudget ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {formatAmount(project.spent)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={project.remaining < 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                          {formatAmount(Math.abs(project.remaining))}
                          {project.remaining < 0 && ' (over)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={utilizationRate > 100 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {project.variance}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            utilizationRate > 100 ? 'bg-red-500' : 
                            utilizationRate > 90 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`} />
                          <span className="text-sm text-gray-700">
                            {utilizationRate > 100 ? 'Over Budget' : 
                             utilizationRate > 90 ? 'At Risk' : 
                             'On Track'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDetail?.type === 'period' ? 'Period Details' : 'Category Details'}
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of {selectedDetail?.type === 'period' ? selectedDetail?.month : selectedDetail?.category}
            </DialogDescription>
          </DialogHeader>

          {selectedDetail && (
            <div className="space-y-6">
              {selectedDetail.type === 'period' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900">Revenue</h3>
                    <p className="text-2xl font-bold text-green-600">{formatAmount(selectedDetail.revenue || 0)}</p>
                    <p className="text-sm text-green-700">Total income for {selectedDetail.month}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="font-semibold text-red-900">Expenses</h3>
                    <p className="text-2xl font-bold text-red-600">{formatAmount(selectedDetail.expenses || 0)}</p>
                    <p className="text-sm text-red-700">Total costs for {selectedDetail.month}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg col-span-2">
                    <h3 className="font-semibold text-blue-900">Net Profit</h3>
                    <p className="text-2xl font-bold text-blue-600">{formatAmount((selectedDetail.revenue || 0) - (selectedDetail.expenses || 0))}</p>
                    <p className="text-sm text-blue-700">Revenue minus expenses</p>
                  </div>
                </div>
              )}

              {selectedDetail.type === 'category' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">{selectedDetail.category} Expenses</h3>
                    <p className="text-3xl font-bold text-gray-600">{formatAmount(selectedDetail.amount || 0)}</p>
                    <p className="text-sm text-gray-700">{selectedDetail.percentage || 0}% of total expenses</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Expense Breakdown</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-700">Monthly Average</p>
                        <p className="font-semibold text-blue-900">{formatAmount((selectedDetail.amount || 0) / 12)}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-sm text-green-700">Per Employee</p>
                        <p className="font-semibold text-green-900">{formatAmount((selectedDetail.amount || 0) / 50)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Trend Analysis</h4>
                    <div className="p-3 bg-yellow-50 rounded">
                      <p className="text-sm text-yellow-800">
                        This category represents {selectedDetail.percentage || 0}% of total expenses.
                        {(selectedDetail.percentage || 0) > 20 ? ' Consider reviewing for cost optimization opportunities.' : ' Expense ratio is within acceptable range.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
