'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import mockData from '@/lib/mock-data';

export default function SalesRepDashboard() {
  const { user } = useAuthStore();
  
  // Filter data for current user (assigned to them)
  const myLeads = mockData.getLeadsByAssignee(user?.id || '');
  const myCustomers = mockData.customers.filter(c => c.assignedSalesRep === user?.id);
  
  // Calculate my metrics
  const activeLeads = myLeads.filter(l => !['closed_won', 'closed_lost'].includes(l.status)).length;
  const wonDeals = myLeads.filter(l => l.status === 'closed_won').length;
  const myPipelineValue = myLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const myRevenue = myLeads.filter(l => l.status === 'closed_won').reduce((sum, l) => sum + l.estimatedValue, 0);
  
  // Monthly target and achievement
  const monthlyTarget = 50000; // Example target
  const achievement = (myRevenue / monthlyTarget) * 100;
  
  // Recent activities
  const recentLeads = myLeads
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  // Today's tasks
  const todayTasks = [
    { id: 1, title: 'Follow up with Tech Solutions Inc.', priority: 'high', completed: false },
    { id: 2, title: 'Send quotation to Global Electronics', priority: 'high', completed: false },
    { id: 3, title: 'Schedule demo for Smart Manufacturing', priority: 'medium', completed: true },
    { id: 4, title: 'Update CRM notes for 3 leads', priority: 'low', completed: false },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      new: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      qualified: 'bg-cyan-100 text-cyan-800',
      proposal_sent: 'bg-yellow-100 text-yellow-800',
      negotiating: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-teal-600 to-teal-700 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}! 👋</h1>
        <p className="mt-2 text-teal-100">Here's what's happening with your sales today</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{activeLeads}</div>
            <p className="text-sm text-gray-500 mt-1">In pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">${myPipelineValue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Total opportunity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Won This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${myRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">{wonDeals} deals closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">My Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{myCustomers.length}</div>
            <p className="text-sm text-gray-500 mt-1">Accounts managed</p>
          </CardContent>
        </Card>
      </div>

      {/* Target Achievement */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Target Achievement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Target</p>
                <p className="text-2xl font-bold text-gray-900">${monthlyTarget.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Achieved</p>
                <p className="text-2xl font-bold text-green-600">${myRevenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-teal-600">{achievement.toFixed(1)}%</p>
              </div>
            </div>
            <div>
              <Progress value={achievement > 100 ? 100 : achievement} className="h-3" />
            </div>
            <p className="text-sm text-gray-500">
              {achievement >= 100 ? '🎉 Target achieved! Great work!' : `$${(monthlyTarget - myRevenue).toLocaleString()} remaining to hit your target`}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Recent Leads</CardTitle>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/salesrep/leads'}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="p-3 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{lead.companyName}</p>
                      <p className="text-sm text-gray-500">{lead.contactPerson}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusBadge(lead.status)}>
                          {lead.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium text-green-600">${lead.estimatedValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No leads assigned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today's Tasks</CardTitle>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/salesrep/activities'}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                    readOnly
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 text-xs ${
                        task.priority === 'high' ? 'border-red-300 text-red-700' :
                        task.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                        'border-gray-300 text-gray-700'
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => window.location.href = '/salesrep/leads'}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Lead
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => window.location.href = '/salesrep/quotations'}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create Quote
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => window.location.href = '/salesrep/activities'}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Log Activity
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => window.location.href = '/salesrep/performance'}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
