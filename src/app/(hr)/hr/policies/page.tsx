'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Users, Clock, CheckCircle, AlertTriangle, Shield, Plus, Eye, Edit, Download } from 'lucide-react';

export default function HRPoliciesPage() {
  const policyStats = [
    {
      title: 'Active Policies',
      value: '28',
      change: '+2',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Employees Acknowledged',
      value: '134',
      change: '+8',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending Reviews',
      value: '5',
      change: '-2',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Compliance Rate',
      value: '96%',
      change: '+2%',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const activePolicies = [
    {
      id: 1,
      title: 'Code of Conduct',
      category: 'Ethics & Compliance',
      version: '2.1',
      lastUpdated: '2024-10-15',
      acknowledged: 142,
      totalEmployees: 142,
      status: 'active',
      reviewDue: '2025-10-15',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Remote Work Policy',
      category: 'Workplace',
      version: '1.3',
      lastUpdated: '2024-09-20',
      acknowledged: 138,
      totalEmployees: 142,
      status: 'active',
      reviewDue: '2025-09-20',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Data Security Policy',
      category: 'Security',
      version: '3.0',
      lastUpdated: '2024-11-01',
      acknowledged: 135,
      totalEmployees: 142,
      status: 'active',
      reviewDue: '2025-11-01',
      priority: 'high',
    },
    {
      id: 4,
      title: 'Anti-Harassment Policy',
      category: 'HR',
      version: '2.2',
      lastUpdated: '2024-08-30',
      acknowledged: 140,
      totalEmployees: 142,
      status: 'active',
      reviewDue: '2025-08-30',
      priority: 'high',
    },
  ];

  const pendingReviews = [
    {
      id: 1,
      title: 'Travel & Expense Policy',
      category: 'Finance',
      currentVersion: '1.8',
      reviewDue: '2024-12-15',
      daysLeft: 7,
      status: 'review-due',
      changes: 'Update mileage rates and hotel allowances',
    },
    {
      id: 2,
      title: 'Social Media Guidelines',
      category: 'Communications',
      currentVersion: '1.5',
      reviewDue: '2024-12-20',
      daysLeft: 12,
      status: 'review-due',
      changes: 'Include AI content guidelines',
    },
    {
      id: 3,
      title: 'Performance Management Policy',
      category: 'HR',
      currentVersion: '2.0',
      reviewDue: '2025-01-15',
      daysLeft: 38,
      status: 'upcoming',
      changes: 'Annual review cycle updates',
    },
  ];

  const policyCategories = [
    {
      name: 'HR Policies',
      count: 8,
      acknowledged: 139,
      compliance: '98%',
      color: 'bg-blue-500',
    },
    {
      name: 'Security Policies',
      count: 6,
      acknowledged: 136,
      compliance: '96%',
      color: 'bg-red-500',
    },
    {
      name: 'Workplace Policies',
      count: 7,
      acknowledged: 141,
      compliance: '99%',
      color: 'bg-green-500',
    },
    {
      name: 'Compliance Policies',
      count: 7,
      acknowledged: 134,
      compliance: '94%',
      color: 'bg-yellow-500',
    },
  ];

  const recentUpdates = [
    {
      id: 1,
      policy: 'Remote Work Policy',
      updateType: 'Revision',
      date: '2024-11-15',
      changes: 'Updated hybrid work guidelines',
      affected: 45,
    },
    {
      id: 2,
      policy: 'IT Security Policy',
      updateType: 'New Version',
      date: '2024-11-10',
      changes: 'Added zero-trust framework requirements',
      affected: 142,
    },
    {
      id: 3,
      policy: 'Benefits Policy',
      updateType: 'Minor Update',
      date: '2024-11-05',
      changes: 'Updated health insurance options',
      affected: 138,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'review-due':
        return <Badge className="bg-red-100 text-red-800">Review Due</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-slate-600 to-slate-700 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Policy Management</h1>
        <p className="text-slate-100 mt-1 text-lg">Manage company policies, compliance, and employee acknowledgments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {policyStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm mt-1">
                  <span
                    className={
                      stat.change.startsWith('+') && !stat.change.includes('-')
                        ? 'text-green-600 font-semibold'
                        : stat.change.startsWith('-')
                        ? 'text-red-600 font-semibold'
                        : 'text-gray-600 font-semibold'
                    }
                  >
                    {stat.change}
                  </span>{' '}
                  <span className="text-gray-500">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Policies */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl text-gray-900">Active Policies</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Current company policies and acknowledgment status
                </CardDescription>
              </div>
              <Button className="bg-slate-600 hover:bg-slate-700 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {activePolicies.map((policy) => (
                <div key={policy.id} className="p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FileText className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {policy.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {policy.category} • v{policy.version}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(policy.priority)}
                      {getStatusBadge(policy.status)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-600">Acknowledgment</p>
                      <p className="font-semibold text-gray-900">
                        {policy.acknowledged}/{policy.totalEmployees} employees
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Review Due</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(policy.reviewDue).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" className="text-slate-600 border-slate-300 hover:bg-slate-50">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="text-slate-600 border-slate-300 hover:bg-slate-50">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-slate-600 border-slate-300 hover:bg-slate-50">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Pending Reviews</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Policies requiring review and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {review.category} • v{review.currentVersion}
                        </p>
                        <p className="text-xs text-gray-400">
                          Due: {new Date(review.reviewDue).toLocaleDateString()} ({review.daysLeft} days)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(review.status)}
                    <Button variant="outline" size="sm" className="text-slate-600 border-slate-300 hover:bg-slate-50">
                      <Edit className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy Categories */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Policy Categories</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Compliance overview by policy category
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {policyCategories.map((category, index) => (
              <div key={index} className="p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                </div>
                <p className="text-lg font-bold text-gray-900 mb-1">{category.count} policies</p>
                <p className="text-xs text-gray-500 mb-2">
                  {category.acknowledged}/142 acknowledged
                </p>
                <p className="text-xs text-green-600 font-semibold">
                  {category.compliance} compliance rate
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Recent Policy Updates</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Latest policy changes and modifications
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {recentUpdates.map((update) => (
              <div key={update.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {update.policy}
                      </p>
                      <p className="text-xs text-gray-500">
                        {update.updateType} • {update.changes}
                      </p>
                      <p className="text-xs text-gray-400">
                        Updated: {new Date(update.date).toLocaleDateString()} • {update.affected} employees affected
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    {update.updateType}
                  </Badge>
                  <Button variant="outline" size="sm" className="text-slate-600 border-slate-300 hover:bg-slate-50">
                    <Eye className="h-4 w-4 mr-1" />
                    View Changes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-slate-50 to-gray-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Policy Actions</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Common policy management tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="p-5 border-2 border-slate-200 rounded-xl hover:bg-linear-to-br hover:from-slate-50 hover:to-gray-50 hover:border-slate-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Create Policy</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Draft new company policies
              </p>
            </Button>
            <Button className="p-5 border-2 border-blue-200 rounded-xl hover:bg-linear-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Send Acknowledgments</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Request policy acknowledgments
              </p>
            </Button>
            <Button className="p-5 border-2 border-green-200 rounded-xl hover:bg-linear-to-br hover:from-green-50 hover:to-emerald-50 hover:border-green-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Compliance Reports</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Generate policy compliance reports
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}