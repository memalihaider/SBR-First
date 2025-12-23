'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, DollarSign, Package, Briefcase, FileText, Activity } from 'lucide-react';
import mockData from '@/lib/mock-data';

export default function AdminAnalyticsPage() {
  const systemStats = [
    { title: 'Total Revenue', value: '$' + (mockData.getTotalRevenue() / 1000000).toFixed(2) + 'M', change: '+18.2%', period: 'vs last quarter', icon: DollarSign, color: 'green' },
    { title: 'Active Projects', value: mockData.getActiveProjects().toString(), change: '+12', period: 'this month', icon: Briefcase, color: 'blue' },
    { title: 'Total Customers', value: mockData.customers.length.toString(), change: '+24', period: 'this quarter', icon: Users, color: 'purple' },
    { title: 'Products', value: mockData.products.length.toString(), change: '+42', period: 'all time', icon: Package, color: 'indigo' },
    { title: 'Low Stock Items', value: mockData.getLowStockProducts().toString(), change: '-8', period: 'improvement', icon: Package, color: 'red' },
    { title: 'Total Leads', value: mockData.leads.length.toString(), change: '+36', period: 'this month', icon: Users, color: 'yellow' },
    { title: 'Conversion Rate', value: '32.5%', change: '+4.2%', period: 'vs last month', icon: TrendingUp, color: 'green' },
    { title: 'Active Users', value: '248', change: '+12', period: 'logged in today', icon: Activity, color: 'blue' },
  ];

  const departmentPerformance = [
    { dept: 'Sales', revenue: 3.2, growth: 18, deals: 145, color: 'green' },
    { dept: 'Projects', revenue: 2.8, growth: 12, deals: 48, color: 'blue' },
    { dept: 'Services', revenue: 1.5, growth: 22, deals: 89, color: 'purple' },
    { dept: 'Consulting', revenue: 0.9, growth: 8, deals: 34, color: 'indigo' },
  ];

  const recentActivities = [
    { type: 'Sale', desc: 'New customer order #QT-2025-1245 approved', value: '$45,000', time: '5 mins ago', icon: DollarSign, color: 'green' },
    { type: 'Project', desc: 'Project "Enterprise ERP" milestone completed', value: '80%', time: '15 mins ago', icon: Briefcase, color: 'blue' },
    { type: 'User', desc: 'New sales rep "James Wilson" onboarded', value: 'Sales', time: '1 hour ago', icon: Users, color: 'purple' },
    { type: 'Inventory', desc: 'Stock alert: 12 products below minimum', value: 'Critical', time: '2 hours ago', icon: Package, color: 'red' },
    { type: 'Lead', desc: '24 new leads generated from campaign', value: '+24', time: '3 hours ago', icon: TrendingUp, color: 'yellow' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">System Analytics</h1>
            <p className="text-red-100 mt-1 text-lg">Comprehensive business intelligence and performance metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30">
              <BarChart3 className="h-5 w-5 mr-2" />
              Generate Report
            </Button>
            <Button className="bg-white text-red-600 hover:bg-red-50">
              <FileText className="h-5 w-5 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => {
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
                  <span className={stat.change.startsWith('+') ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{stat.change}</span>
                  <span className="text-gray-500"> {stat.period}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Performance */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
              <CardTitle className="text-xl text-gray-900">Department Performance</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Revenue and growth metrics by department
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {departmentPerformance.map((dept, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-50 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-lg">{dept.dept} Department</h4>
                      <Badge className={`bg-${dept.color}-100 text-${dept.color}-700`}>{dept.deals} deals</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${dept.revenue}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Growth Rate</p>
                        <p className="text-2xl font-bold text-green-600">+{dept.growth}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Deal Size</p>
                        <p className="text-2xl font-bold text-gray-900">${(dept.revenue * 1000000 / dept.deals / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-${dept.color}-500`} style={{ width: `${dept.growth * 2}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-xl text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Live system events
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-200 last:border-0">
                      <div className={`p-2 bg-${activity.color}-100 rounded-lg shrink-0`}>
                        <IconComponent className={`h-4 w-4 text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{activity.type}</p>
                        <p className="text-xs text-gray-600 mb-1">{activity.desc}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">{activity.value}</Badge>
                          <span className="text-xs text-gray-400">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Revenue Trend</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Monthly revenue performance over the last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Revenue Chart</p>
              <p className="text-sm text-gray-400">Integrate charting library for visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
