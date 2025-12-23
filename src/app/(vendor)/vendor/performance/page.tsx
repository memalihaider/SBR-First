'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import mockData from '@/lib/mock-data';
import { useCurrency } from '@/lib/currency';

export default function VendorPerformancePage() {
  const { formatAmount } = useCurrency();

  // Mock performance data
  const performanceMetrics = {
    overallRating: 4.7,
    totalOrders: 142,
    completedOrders: 138,
    onTimeDeliveryRate: 96.5,
    qualityScore: 94,
    responseTime: '2.3 hours',
    activeContracts: 8,
  };

  const monthlyStats = [
    { month: 'Oct', orders: 18, revenue: 125000, rating: 4.8 },
    { month: 'Sep', orders: 22, revenue: 145000, rating: 4.6 },
    { month: 'Aug', orders: 19, revenue: 132000, rating: 4.7 },
    { month: 'Jul', orders: 25, revenue: 168000, rating: 4.9 },
    { month: 'Jun', orders: 21, revenue: 142000, rating: 4.5 },
    { month: 'May', orders: 17, revenue: 118000, rating: 4.6 },
  ];

  const categories = [
    { name: 'Electronics', orders: 45, revenue: 245000, rating: 4.8, trend: 'up' },
    { name: 'Hardware', orders: 38, revenue: 198000, rating: 4.6, trend: 'up' },
    { name: 'Components', orders: 32, revenue: 165000, rating: 4.7, trend: 'stable' },
    { name: 'Tools', orders: 27, revenue: 142000, rating: 4.5, trend: 'down' },
  ];

  const recentFeedback = mockData.customers.slice(0, 6).map((customer, index) => ({
    id: index + 1,
    customer: customer.companyName,
    rating: Math.floor(Math.random() * 2) + 4,
    comment: [
      'Excellent quality and fast delivery!',
      'Very reliable vendor, highly recommended.',
      'Good products but could improve packaging.',
      'Outstanding service and communication.',
      'Quality products, consistent performance.',
      'Great value for money, will order again.',
    ][index],
    date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    orderNumber: `PO-${1000 + index}`,
  }));

  const kpiMetrics = [
    { label: 'Overall Rating', value: performanceMetrics.overallRating, max: 5, unit: '/ 5', color: 'text-pink-600', icon: '⭐' },
    { label: 'On-Time Delivery', value: performanceMetrics.onTimeDeliveryRate, max: 100, unit: '%', color: 'text-green-600', icon: '🚚' },
    { label: 'Quality Score', value: performanceMetrics.qualityScore, max: 100, unit: '%', color: 'text-blue-600', icon: '✨' },
    { label: 'Avg Response Time', value: performanceMetrics.responseTime, max: 0, unit: '', color: 'text-purple-600', icon: '⚡' },
  ];

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Performance</h1>
          <p className="text-gray-600 mt-1">Track your performance metrics and customer feedback</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => (
          <Card key={index} className="border-t-4 border-pink-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <div className="text-3xl">{metric.icon}</div>
              </div>
              <p className={`text-4xl font-bold ${metric.color}`}>
                {metric.value}{metric.unit}
              </p>
              {metric.max > 0 && (
                <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-pink-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(Number(metric.value) / metric.max) * 100}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Order Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.totalOrders}</p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Completed Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.completedOrders}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Active Contracts</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.activeContracts}</p>
                </div>
                <div className="text-4xl">📄</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{stat.month} 2024</span>
                      <span className="text-sm text-gray-600">{getRatingStars(stat.rating)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{stat.orders} orders</span>
                      <span className="font-semibold text-green-600">{formatAmount(stat.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{category.name}</h4>
                  <Badge className={
                    category.trend === 'up' ? 'bg-green-100 text-green-800' :
                    category.trend === 'down' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {category.trend === 'up' ? '↑' : category.trend === 'down' ? '↓' : '→'}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Orders</span>
                    <span className="font-semibold text-gray-900">{category.orders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-semibold text-pink-600">{formatAmount(category.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-semibold text-gray-900">{category.rating} ⭐</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customer Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFeedback.map((feedback) => (
              <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900">{feedback.customer}</h4>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{feedback.comment}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{feedback.orderNumber}</span>
                      <span>•</span>
                      <span>{feedback.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Areas */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Suggested Improvements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-700 text-sm font-bold">1</div>
              <div>
                <p className="font-semibold text-gray-900">Reduce Response Time</p>
                <p className="text-sm text-gray-600">Average response time is 2.3 hours. Target: under 2 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-700 text-sm font-bold">2</div>
              <div>
                <p className="font-semibold text-gray-900">Improve Packaging Quality</p>
                <p className="text-sm text-gray-600">Some customers mentioned packaging improvements needed</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-700 text-sm font-bold">3</div>
              <div>
                <p className="font-semibold text-gray-900">Expand Product Range</p>
                <p className="text-sm text-gray-600">Consider adding more variety in the Tools category</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
