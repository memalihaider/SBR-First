'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import mockData from '@/lib/mock-data';

export default function MyPerformancePage() {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Get my assigned data
  const myLeads = mockData.getLeadsByAssignee(user?.id || '');
  const myCustomers = mockData.customers.filter(c => c.assignedSalesRep === user?.id);

  // Calculate performance metrics
  const wonDeals = myLeads.filter(l => l.status === 'closed_won');
  const lostDeals = myLeads.filter(l => l.status === 'closed_lost');
  const activeLeads = myLeads.filter(l => !['closed_won', 'closed_lost'].includes(l.status));
  
  const totalRevenue = wonDeals.reduce((sum, l) => sum + l.estimatedValue, 0);
  const pipelineValue = activeLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const winRate = myLeads.length > 0 ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;
  const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
  const conversionRate = myLeads.length > 0 ? (wonDeals.length / myLeads.length) * 100 : 0;

  // Targets (mock data - in a real app these would be from the backend)
  const targets = {
    revenue: 500000,
    deals: 15,
    newLeads: 30,
    customers: 10,
  };

  const achievements = {
    revenue: totalRevenue,
    deals: wonDeals.length,
    newLeads: myLeads.length,
    customers: myCustomers.length,
  };

  const getPercentage = (actual: number, target: number) => {
    return target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-600';
    if (percentage >= 75) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  // Monthly performance data (mock - should be real data)
  const monthlyPerformance = [
    { month: 'Jan', revenue: 45000, deals: 3, target: 50000 },
    { month: 'Feb', revenue: 52000, deals: 4, target: 50000 },
    { month: 'Mar', revenue: 38000, deals: 2, target: 50000 },
    { month: 'Apr', revenue: 61000, deals: 5, target: 50000 },
    { month: 'May', revenue: 48000, deals: 3, target: 50000 },
    { month: 'Jun', revenue: totalRevenue, deals: wonDeals.length, target: targets.revenue },
  ];

  const leaderboardData = [
    { rank: 1, name: 'Sarah Johnson', revenue: 680000, deals: 18, avatar: '👩' },
    { rank: 2, name: 'Mike Chen', revenue: 650000, deals: 17, avatar: '👨' },
    { rank: 3, name: 'Emily Davis', revenue: 620000, deals: 16, avatar: '👩' },
    { rank: 4, name: user ? `${user.firstName} ${user.lastName}` : 'You', revenue: totalRevenue, deals: wonDeals.length, avatar: '👤', isMe: true },
    { rank: 5, name: 'John Smith', revenue: 480000, deals: 12, avatar: '👨' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>
          <p className="text-gray-600 mt-1">Track your goals and achievements</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedPeriod === 'month'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedPeriod('month')}
          >
            This Month
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedPeriod === 'quarter'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedPeriod('quarter')}
          >
            This Quarter
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedPeriod === 'year'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedPeriod('year')}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Won deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{winRate.toFixed(1)}%</div>
            <p className="text-sm text-gray-500 mt-1">
              {wonDeals.length} won / {lostDeals.length} lost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">${Math.round(avgDealSize).toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Per closed deal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">${pipelineValue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">{activeLeads.length} active leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Targets Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Revenue Target */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">Revenue Target</p>
                <p className="text-sm text-gray-600">
                  ${achievements.revenue.toLocaleString()} / ${targets.revenue.toLocaleString()}
                </p>
              </div>
              <Badge className={`${getProgressColor(getPercentage(achievements.revenue, targets.revenue))} text-white`}>
                {getPercentage(achievements.revenue, targets.revenue).toFixed(0)}%
              </Badge>
            </div>
            <Progress value={getPercentage(achievements.revenue, targets.revenue)} className="h-3" />
          </div>

          {/* Deals Target */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">Deals Closed</p>
                <p className="text-sm text-gray-600">
                  {achievements.deals} / {targets.deals} deals
                </p>
              </div>
              <Badge className={`${getProgressColor(getPercentage(achievements.deals, targets.deals))} text-white`}>
                {getPercentage(achievements.deals, targets.deals).toFixed(0)}%
              </Badge>
            </div>
            <Progress value={getPercentage(achievements.deals, targets.deals)} className="h-3" />
          </div>

          {/* New Leads Target */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">New Leads</p>
                <p className="text-sm text-gray-600">
                  {achievements.newLeads} / {targets.newLeads} leads
                </p>
              </div>
              <Badge className={`${getProgressColor(getPercentage(achievements.newLeads, targets.newLeads))} text-white`}>
                {getPercentage(achievements.newLeads, targets.newLeads).toFixed(0)}%
              </Badge>
            </div>
            <Progress value={getPercentage(achievements.newLeads, targets.newLeads)} className="h-3" />
          </div>

          {/* Customers Target */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">Active Customers</p>
                <p className="text-sm text-gray-600">
                  {achievements.customers} / {targets.customers} customers
                </p>
              </div>
              <Badge className={`${getProgressColor(getPercentage(achievements.customers, targets.customers))} text-white`}>
                {getPercentage(achievements.customers, targets.customers).toFixed(0)}%
              </Badge>
            </div>
            <Progress value={getPercentage(achievements.customers, targets.customers)} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyPerformance.map((month) => {
                const percentage = getPercentage(month.revenue, month.target);
                return (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{month.month}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">${month.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{month.deals} deals</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="h-2 flex-1" />
                      <span className="text-xs text-gray-600 w-12 text-right">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Team Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboardData.map((person) => (
                <div
                  key={person.rank}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    person.isMe ? 'bg-teal-50 border-2 border-teal-600' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 font-bold text-gray-700">
                    #{person.rank}
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 text-2xl">
                    {person.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {person.name}
                      {person.isMe && <Badge className="ml-2 bg-teal-600 text-white">You</Badge>}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${person.revenue.toLocaleString()} • {person.deals} deals
                    </p>
                  </div>
                  {person.rank <= 3 && (
                    <div className="text-2xl">
                      {person.rank === 1 && '🥇'}
                      {person.rank === 2 && '🥈'}
                      {person.rank === 3 && '🥉'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{conversionRate.toFixed(1)}%</div>
              <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
              <p className="text-xs text-gray-500 mt-2">Leads to customers</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {wonDeals.length > 0 ? Math.round(totalRevenue / wonDeals.length / 1000) : 0}K
              </div>
              <p className="text-sm text-gray-600 mt-1">Avg Deal Value</p>
              <p className="text-xs text-gray-500 mt-2">Per closed deal</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{activeLeads.length}</div>
              <p className="text-sm text-gray-600 mt-1">Active Pipeline</p>
              <p className="text-xs text-gray-500 mt-2">Opportunities in progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
