'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Calendar,
  Phone,
  Mail,
  Activity,
  Award,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useCurrencyStore } from '@/stores/currency';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatAmount } = useCurrencyStore();
  const memberId = params.id as string;

  // Mock team member data - in real app, fetch by ID
  const member = {
    id: memberId,
    name: 'Sarah Johnson',
    role: 'Senior Sales Representative',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://via.placeholder.com/150',
    joinDate: '2023-03-15',
    department: 'Enterprise Sales',
    manager: 'Mike Davis',
    location: 'San Francisco, CA',
    tenure: '1.5 years',

    // Performance metrics
    currentMonth: {
      revenue: 185000,
      target: 200000,
      deals: 8,
      leads: 32,
      conversion: 28,
      meetings: 24,
      calls: 156,
      emails: 89
    },

    // Overall stats
    overall: {
      totalRevenue: 1250000,
      totalDeals: 45,
      avgDealSize: 27778,
      conversionRate: 32,
      customerSatisfaction: 4.8,
      tenure: '1.5 years'
    }
  };

  // Monthly performance data
  const monthlyData = [
    { month: 'Jan', revenue: 165000, target: 180000, deals: 7 },
    { month: 'Feb', revenue: 175000, target: 185000, deals: 8 },
    { month: 'Mar', revenue: 160000, target: 175000, deals: 6 },
    { month: 'Apr', revenue: 180000, target: 190000, deals: 9 },
    { month: 'May', revenue: 195000, target: 195000, deals: 10 },
    { month: 'Jun', revenue: 185000, target: 200000, deals: 8 },
  ];

  // Deal pipeline data
  const pipelineData = [
    { stage: 'New Leads', count: 12, value: 45000 },
    { stage: 'Qualified', count: 8, value: 85000 },
    { stage: 'Proposal', count: 5, value: 125000 },
    { stage: 'Negotiation', count: 3, value: 95000 },
    { stage: 'Closed Won', count: 2, value: 65000 },
  ];

  // Activity breakdown
  const activityData = [
    { name: 'Calls', value: 35, count: 156, color: '#2563eb' },
    { name: 'Emails', value: 25, count: 89, color: '#10b981' },
    { name: 'Meetings', value: 20, count: 24, color: '#f59e0b' },
    { name: 'Proposals', value: 12, count: 12, color: '#ef4444' },
    { name: 'Follow-ups', value: 8, count: 8, color: '#8b5cf6' },
  ];

  // Recent deals
  const recentDeals = [
    {
      id: 'deal-1',
      company: 'TechStart Solutions',
      value: 45000,
      stage: 'Closed Won',
      closeDate: '2024-01-20',
      probability: 100
    },
    {
      id: 'deal-2',
      company: 'Global Logistics Inc',
      value: 32000,
      stage: 'Negotiation',
      closeDate: '2024-01-25',
      probability: 85
    },
    {
      id: 'deal-3',
      company: 'Retail Plus',
      value: 28500,
      stage: 'Proposal',
      closeDate: '2024-02-01',
      probability: 60
    }
  ];

  // Calculate metrics
  const targetAchievement = (member.currentMonth.revenue / member.currentMonth.target) * 100;
  const monthlyGrowth = ((member.currentMonth.revenue - monthlyData[monthlyData.length - 2]?.revenue || 0) / (monthlyData[monthlyData.length - 2]?.revenue || 1)) * 100;

  // Format data for charts
  const formattedMonthlyData = useMemo(() => monthlyData.map(data => ({
    ...data,
    formattedRevenue: formatAmount(data.revenue),
    formattedTarget: formatAmount(data.target),
  })), [monthlyData, formatAmount]);

  const formattedPipelineData = useMemo(() => pipelineData.map(data => ({
    ...data,
    formattedValue: formatAmount(data.value),
  })), [pipelineData, formatAmount]);

  const formattedRecentDeals = useMemo(() => recentDeals.map(deal => ({
    ...deal,
    formattedValue: formatAmount(deal.value),
  })), [recentDeals, formatAmount]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-4">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-gray-600">{member.role}</p>
              <p className="text-sm text-gray-500">{member.department}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-sm">
            {member.location}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {member.tenure}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(member.currentMonth.revenue)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: {formatAmount(member.currentMonth.target)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Target Achievement</p>
                <p className="text-2xl font-bold text-blue-600">{targetAchievement.toFixed(1)}%</p>
                <Progress value={targetAchievement} className="mt-2 h-2" />
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-purple-600">{member.currentMonth.deals}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {member.currentMonth.leads} total leads
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-600">{member.currentMonth.conversion}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}% this month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Revenue vs targets over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formattedMonthlyData}>
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

            {/* Activity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
                <CardDescription>Distribution of sales activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {activityData.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: activity.color }}
                      />
                      <span className="text-sm">{activity.name}</span>
                      <span className="text-sm font-medium ml-auto">{activity.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Deals</CardTitle>
              <CardDescription>Latest deals and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formattedRecentDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{deal.company}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge variant="outline">{deal.stage}</Badge>
                        <span className="text-sm text-gray-600">
                          Close: {new Date(deal.closeDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{deal.formattedValue}</div>
                      <div className="text-sm text-gray-600">{deal.probability}% probability</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(member.overall.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Career total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{member.overall.totalDeals}</div>
                <p className="text-xs text-muted-foreground mt-1">Closed deals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Deal Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(member.overall.avgDealSize)}</div>
                <p className="text-xs text-muted-foreground mt-1">Per deal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{member.overall.customerSatisfaction}/5</div>
                <p className="text-xs text-muted-foreground mt-1">Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance History</CardTitle>
              <CardDescription>Detailed monthly breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Month</th>
                      <th className="text-left p-2 font-medium">Revenue</th>
                      <th className="text-left p-2 font-medium">Target</th>
                      <th className="text-left p-2 font-medium">Deals</th>
                      <th className="text-left p-2 font-medium">Achievement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedMonthlyData.map((data, index) => {
                      const achievement = (data.revenue / data.target) * 100;
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{data.month}</td>
                          <td className="p-2 text-green-600 font-medium">{data.formattedRevenue}</td>
                          <td className="p-2">{data.formattedTarget}</td>
                          <td className="p-2">{data.deals}</td>
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${achievement >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                                {achievement.toFixed(1)}%
                              </span>
                              <Progress value={Math.min(achievement, 100)} className="flex-1 h-2" />
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
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Pipeline</CardTitle>
              <CardDescription>Active deals by stage</CardDescription>
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

          {/* Pipeline Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formattedPipelineData.map((stage, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stage.stage}</p>
                      <p className="text-2xl font-bold">{stage.count} deals</p>
                      <p className="text-lg font-semibold text-green-600">{stage.formattedValue}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Calls Made</p>
                    <p className="text-2xl font-bold text-blue-600">{member.currentMonth.calls}</p>
                    <p className="text-xs text-gray-500 mt-1">This month</p>
                  </div>
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Emails Sent</p>
                    <p className="text-2xl font-bold text-green-600">{member.currentMonth.emails}</p>
                    <p className="text-xs text-gray-500 mt-1">This month</p>
                  </div>
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Meetings</p>
                    <p className="text-2xl font-bold text-purple-600">{member.currentMonth.meetings}</p>
                    <p className="text-xs text-gray-500 mt-1">This month</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-orange-600">2.3h</p>
                    <p className="text-xs text-gray-500 mt-1">To leads</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends</CardTitle>
              <CardDescription>Monthly activity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deals" fill="#2563eb" name="Deals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}