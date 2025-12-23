'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth';
import mockData from '@/lib/mock-data';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  description: string;
  relatedTo: { type: string; name: string };
  status: 'pending' | 'completed' | 'cancelled';
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export default function MyActivitiesPage() {
  const { user } = useAuthStore();
  const [filterType, setFilterType] = useState<'all' | 'call' | 'email' | 'meeting' | 'note' | 'task'>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // Mock activities data (in a real app, this would be fetched from API)
  const myActivities: Activity[] = [
    {
      id: '1',
      type: 'call',
      subject: 'Follow-up call with Tech Corp',
      description: 'Discuss pricing for enterprise plan',
      relatedTo: { type: 'lead', name: 'Tech Corp' },
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'email',
      subject: 'Send quotation to Acme Industries',
      description: 'Send revised quotation with 10% discount',
      relatedTo: { type: 'customer', name: 'Acme Industries' },
      status: 'completed',
      completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'meeting',
      subject: 'Demo presentation for Global Solutions',
      description: 'Product demo and Q&A session',
      relatedTo: { type: 'lead', name: 'Global Solutions' },
      status: 'pending',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      type: 'task',
      subject: 'Update CRM records',
      description: 'Update contact information for all new leads',
      relatedTo: { type: 'lead', name: 'Multiple' },
      status: 'pending',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '5',
      type: 'note',
      subject: 'Client feedback from Beta Corp',
      description: 'Positive feedback on product features, requested integration with Salesforce',
      relatedTo: { type: 'customer', name: 'Beta Corp' },
      status: 'completed',
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const getFilteredActivities = () => {
    let filtered = myActivities;

    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    if (!showCompleted) {
      filtered = filtered.filter(a => a.status !== 'completed');
    }

    return filtered.sort((a, b) => {
      // Sort by due date (pending first, then by date)
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };

  const activities = getFilteredActivities();
  const totalActivities = myActivities.length;
  const pendingActivities = myActivities.filter(a => a.status === 'pending').length;
  const completedToday = myActivities.filter(a => 
    a.status === 'completed' && 
    a.completedAt && 
    new Date(a.completedAt).toDateString() === new Date().toDateString()
  ).length;
  const overdue = myActivities.filter(a => 
    a.status === 'pending' && 
    a.dueDate && 
    a.dueDate < new Date()
  ).length;

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      call: { color: 'bg-blue-100 text-blue-800', icon: '📞' },
      email: { color: 'bg-purple-100 text-purple-800', icon: '📧' },
      meeting: { color: 'bg-green-100 text-green-800', icon: '📅' },
      note: { color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
      task: { color: 'bg-orange-100 text-orange-800', icon: '✓' },
    };
    return badges[type] || badges.note;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Activities</h1>
          <p className="text-gray-600 mt-1">Track tasks, calls, meetings, and notes</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Activity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalActivities}</div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingActivities}</div>
            <p className="text-sm text-gray-500 mt-1">Action required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedToday}</div>
            <p className="text-sm text-gray-500 mt-1">Great progress!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdue}</div>
            <p className="text-sm text-gray-500 mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'task' ? 'default' : 'outline'}
                onClick={() => setFilterType('task')}
              >
                ✓ Tasks
              </Button>
              <Button
                variant={filterType === 'call' ? 'default' : 'outline'}
                onClick={() => setFilterType('call')}
              >
                📞 Calls
              </Button>
              <Button
                variant={filterType === 'email' ? 'default' : 'outline'}
                onClick={() => setFilterType('email')}
              >
                📧 Emails
              </Button>
              <Button
                variant={filterType === 'meeting' ? 'default' : 'outline'}
                onClick={() => setFilterType('meeting')}
              >
                📅 Meetings
              </Button>
              <Button
                variant={filterType === 'note' ? 'default' : 'outline'}
                onClick={() => setFilterType('note')}
              >
                📝 Notes
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showCompleted}
                onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
                id="show-completed"
              />
              <label htmlFor="show-completed" className="text-sm font-medium cursor-pointer">
                Show completed
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Timeline */}
      <div className="space-y-4">
        {activities.map((activity) => {
          const typeBadge = getTypeBadge(activity.type);
          const isOverdue = activity.status === 'pending' && activity.dueDate && activity.dueDate < new Date();
          
          return (
            <Card key={activity.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${typeBadge.color} text-2xl`}>
                    {typeBadge.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{activity.subject}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                      <Badge className={getStatusBadge(activity.status)}>
                        {activity.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>{activity.relatedTo.type}: {activity.relatedTo.name}</span>
                      </div>

                      {activity.dueDate && (
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Due: {activity.dueDate.toLocaleDateString()}</span>
                          {isOverdue && <span className="ml-1">(Overdue)</span>}
                        </div>
                      )}

                      {activity.completedAt && (
                        <div className="flex items-center gap-1 text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Completed: {activity.completedAt.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {activity.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                          Mark Complete
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">No activities found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
