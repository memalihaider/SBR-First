'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { useCurrencyStore } from '@/stores/currency';
import { toast } from 'sonner';

export default function SalesReportsPage() {
  const { formatAmount } = useCurrencyStore();
  const [timeRange, setTimeRange] = useState('6months');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success('Reports refreshed successfully');
  };

  const handleExport = () => {
    const exportData = {
      summary: summaryMetrics,
      revenueData,
      leadSources,
      conversionFunnel,
      teamPerformance,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `sales-reports-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Reports exported successfully');
  };

  // Summary metrics
  const summaryMetrics = [
    {
      title: 'Total Revenue',
      value: 2456789,
      change: '+18.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'vs last period'
    },
    {
      title: 'New Leads',
      value: 1247,
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'leads generated'
    },
    {
      title: 'Conversion Rate',
      value: '24.5%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: Target,
      description: 'lead to customer'
    },
    {
      title: 'Avg Deal Size',
      value: 67500,
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'per closed deal'
    },
  ];

  // Revenue trend data
  const revenueData = [
    { month: 'Jan', revenue: 185000, target: 200000, deals: 12 },
    { month: 'Feb', revenue: 210000, target: 220000, deals: 15 },
    { month: 'Mar', revenue: 195000, target: 210000, deals: 11 },
    { month: 'Apr', revenue: 235000, target: 230000, deals: 18 },
    { month: 'May', revenue: 245000, target: 240000, deals: 19 },
    { month: 'Jun', revenue: 265000, target: 250000, deals: 21 },
    { month: 'Jul', revenue: 245678, target: 260000, deals: 20 },
  ];

  // Lead sources data
  const leadSources = [
    { name: 'Website', value: 35, count: 435, color: '#2563eb' },
    { name: 'Referral', value: 25, count: 312, color: '#10b981' },
    { name: 'Cold Call', value: 15, count: 187, color: '#f59e0b' },
    { name: 'Trade Show', value: 12, count: 149, color: '#ef4444' },
    { name: 'Social Media', value: 8, count: 99, color: '#8b5cf6' },
    { name: 'Email Campaign', value: 5, count: 62, color: '#06b6d4' },
  ];

  // Conversion funnel data
  const conversionFunnel = [
    { stage: 'Leads Generated', count: 1244, percentage: 100, color: '#2563eb' },
    { stage: 'Qualified Leads', count: 871, percentage: 70, color: '#3b82f6' },
    { stage: 'Proposals Sent', count: 436, percentage: 35, color: '#60a5fa' },
    { stage: 'Negotiations', count: 262, percentage: 21, color: '#93c5fd' },
    { stage: 'Closed Won', count: 305, percentage: 24.5, color: '#dbeafe' },
  ];

  // Team performance data
  const teamPerformance = [
    { name: 'Sarah Johnson', revenue: 185000, deals: 8, conversion: 28, target: 85 },
    { name: 'Mike Davis', revenue: 156000, deals: 6, conversion: 24, target: 92 },
    { name: 'Emma Brown', revenue: 134000, deals: 5, conversion: 22, target: 78 },
    { name: 'Tom Wilson', revenue: 98000, deals: 4, conversion: 18, target: 65 },
    { name: 'Lisa Chen', revenue: 124000, deals: 5, conversion: 26, target: 88 },
  ];

  // Pipeline by stage
  const pipelineData = [
    { stage: 'New Leads', value: 125000, count: 45, color: 'bg-blue-500' },
    { stage: 'Qualified', value: 245000, count: 32, color: 'bg-yellow-500' },
    { stage: 'Proposal', value: 430000, count: 18, color: 'bg-orange-500' },
    { stage: 'Negotiation', value: 315000, count: 12, color: 'bg-purple-500' },
    { stage: 'Closed Won', value: 185000, count: 8, color: 'bg-green-500' },
  ];

  // Format data for charts
  const formattedRevenueData = useMemo(() => revenueData.map(data => ({
    ...data,
    formattedRevenue: formatAmount(data.revenue),
    formattedTarget: formatAmount(data.target),
  })), [revenueData, formatAmount]);

  const formattedPipelineData = useMemo(() => pipelineData.map(data => ({
    ...data,
    formattedValue: formatAmount(data.value),
  })), [pipelineData, formatAmount]);

  const formattedTeamData = useMemo(() => teamPerformance.map(member => ({
    ...member,
    formattedRevenue: formatAmount(member.revenue),
  })), [teamPerformance, formatAmount]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive sales analytics and performance insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeof metric.value === 'number' && metric.icon === DollarSign
                    ? formatAmount(metric.value)
                    : metric.value.toString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                    {metric.change}
                  </span>{' '}
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue vs targets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={formattedRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatAmount(value)} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatAmount(value),
                        name === 'revenue' ? 'Revenue' : 'Target'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stackId="2"
                      stroke="#dc2626"
                      fill="#ef4444"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Distribution of leads by source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {leadSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {leadSources.map((source, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-sm">{source.name}</span>
                      <span className="text-sm font-medium ml-auto">{source.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Lead conversion through sales stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((stage, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{stage.count} leads</span>
                        <span className="text-sm font-medium">{stage.percentage}%</span>
                      </div>
                      <Progress value={stage.percentage} className="h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue breakdown by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formattedRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatAmount(value)} />
                    <Tooltip
                      formatter={(value: number) => [formatAmount(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Target</CardTitle>
                <CardDescription>Performance against targets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formattedRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatAmount(value)} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatAmount(value),
                        name === 'revenue' ? 'Revenue' : 'Target'
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={3}
                      name="revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#dc2626"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="target"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Generation Trend</CardTitle>
                <CardDescription>Monthly lead generation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis dataKey="deals" />
                    <Tooltip formatter={(value: number) => [value, 'Leads']} />
                    <Area
                      type="monotone"
                      dataKey="deals"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Sources Performance</CardTitle>
                <CardDescription>Effectiveness by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leadSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="font-medium">{source.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{source.count}</div>
                        <div className="text-sm text-gray-500">{source.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline by Stage</CardTitle>
              <CardDescription>Revenue distribution across pipeline stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={formattedPipelineData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatAmount(value)} />
                  <YAxis dataKey="stage" type="category" width={100} />
                  <Tooltip
                    formatter={(value: number) => [formatAmount(value), 'Value']}
                  />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Individual sales rep performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Sales Rep</th>
                      <th className="text-left p-2 font-medium">Revenue</th>
                      <th className="text-left p-2 font-medium">Deals Closed</th>
                      <th className="text-left p-2 font-medium">Conversion Rate</th>
                      <th className="text-left p-2 font-medium">Target Achievement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedTeamData.map((member, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{member.name}</td>
                        <td className="p-2 font-bold text-green-600">{member.formattedRevenue}</td>
                        <td className="p-2">{member.deals}</td>
                        <td className="p-2">{member.conversion}%</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <Progress value={member.target} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{member.target}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}