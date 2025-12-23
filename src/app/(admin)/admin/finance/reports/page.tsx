'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import mockData from '@/lib/mock-data';
import { useCurrencyStore } from '@/stores/currency';

export default function FinancialReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const { formatAmount } = useCurrencyStore();

  // Calculate financial metrics
  const totalRevenue = mockData.getTotalRevenue();
  const totalProducts = mockData.products.length;
  const totalCustomers = mockData.customers.length;
  const totalProjects = mockData.projects.length;

  // Calculate product revenue by category
  const revenueByCategory = mockData.products.reduce((acc, product) => {
    const category = product.category;
    const revenue = product.sellingPrice * product.currentStock * 0.3; // Assume 30% sold
    acc[category] = (acc[category] || 0) + revenue;
    return acc;
  }, {} as Record<string, number>);

  // Calculate project revenue
  const projectRevenue = mockData.projects.reduce((sum, p) => sum + p.budgetAmount, 0);
  const projectCosts = mockData.projects.reduce((sum, p) => sum + p.actualCost, 0);
  const projectProfit = projectRevenue - projectCosts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial analysis and insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
          >
            Monthly
          </Button>
          <Button
            variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('quarter')}
          >
            Quarterly
          </Button>
          <Button
            variant={selectedPeriod === 'year' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('year')}
          >
            Yearly
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white ml-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatAmount(totalRevenue)}</div>
            <p className="text-sm text-gray-500 mt-1">+12.5% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Project Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatAmount(projectProfit)}</div>
            <p className="text-sm text-gray-500 mt-1">
              {((projectProfit / projectRevenue) * 100).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalProjects}</div>
            <p className="text-sm text-gray-500 mt-1">{formatAmount(projectRevenue)} value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Customer Base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{totalCustomers}</div>
            <p className="text-sm text-gray-500 mt-1">+8 new this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Product Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(revenueByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, revenue]) => {
                  const percentage = (revenue / Object.values(revenueByCategory).reduce((a, b) => a + b, 0)) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{category}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatAmount(revenue)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-red-700">{formatAmount(projectRevenue)}</p>
                </div>
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Costs</p>
                  <p className="text-2xl font-bold text-red-700">{formatAmount(projectCosts)}</p>
                </div>
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-700">{formatAmount(projectProfit)}</p>
                </div>
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Projects by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Top Projects by Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Budget</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actual Cost</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Profit</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Margin %</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Progress</th>
                </tr>
              </thead>
              <tbody>
                {mockData.projects
                  .sort((a, b) => b.budgetAmount - a.budgetAmount)
                  .slice(0, 10)
                  .map((project) => {
                    const profit = project.budgetAmount - project.actualCost;
                    const margin = (profit / project.budgetAmount) * 100;
                    
                    return (
                      <tr key={project.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.projectNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatAmount(project.budgetAmount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatAmount(project.actualCost)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={profit >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {formatAmount(profit)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={margin >= 20 ? 'text-green-600 font-bold' : margin >= 10 ? 'text-blue-600' : 'text-red-600'}>
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${project.completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{project.completionPercentage}%</span>
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
    </div>
  );
}
