'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HelpCircle, MessageSquare, Clock, CheckCircle, AlertTriangle, Phone, Mail, FileText, User, Calendar, Star } from 'lucide-react';
import AddSupportTicketDialog from '@/components/add-support-ticket-dialog';
import SupportTicketDetailsDialog from '@/components/support-ticket-details-dialog';

export default function EmployeeSupportPage() {
  const supportStats = [
    {
      title: 'Open Tickets',
      value: '7',
      change: '+2',
      icon: HelpCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Avg Response Time',
      value: '2.4h',
      change: '-0.3h',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Resolved This Month',
      value: '23',
      change: '+5',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Satisfaction Rate',
      value: '94%',
      change: '+2%',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const openTicketsInitial = [
    {
      id: 1,
      title: 'Cannot access project dashboard',
      description: 'Getting 403 error when trying to view project analytics',
      status: 'in-progress',
      priority: 'high',
      category: 'Technical Issue',
      createdDate: '2024-11-30',
      lastUpdate: '2024-12-01 10:30',
      assignedTo: 'IT Support',
      responses: 3,
    },
    {
      id: 2,
      title: 'Expense reimbursement delay',
      description: 'Submitted expense report 2 weeks ago, still pending approval',
      status: 'open',
      priority: 'medium',
      category: 'Finance',
      createdDate: '2024-11-28',
      lastUpdate: '2024-11-29 14:15',
      assignedTo: 'Finance Team',
      responses: 1,
    },
    {
      id: 3,
      title: 'Software license expired',
      description: 'Design software license expired, need renewal',
      status: 'open',
      priority: 'medium',
      category: 'Software',
      createdDate: '2024-11-27',
      lastUpdate: '2024-11-27 09:45',
      assignedTo: 'IT Support',
      responses: 0,
    },
    {
      id: 4,
      title: 'Training session scheduling',
      description: 'Request for advanced project management training',
      status: 'pending-review',
      priority: 'low',
      category: 'Training',
      createdDate: '2024-11-25',
      lastUpdate: '2024-11-26 16:20',
      assignedTo: 'HR Team',
      responses: 2,
    },
  ];

  const recentUpdatesInitial = [
    {
      id: 1,
      ticket: 'Cannot access project dashboard',
      update: 'IT team is investigating the access permissions issue',
      author: 'IT Support',
      timestamp: '2024-12-01 10:30',
      type: 'progress',
    },
    {
      id: 2,
      ticket: 'Expense reimbursement delay',
      update: 'Finance team has received your request and is processing it',
      author: 'Finance Team',
      timestamp: '2024-11-29 14:15',
      type: 'acknowledgment',
    },
    {
      id: 3,
      ticket: 'Software license expired',
      update: 'License renewal request has been submitted to procurement',
      author: 'IT Support',
      timestamp: '2024-11-27 11:20',
      type: 'update',
    },
    {
      id: 4,
      ticket: 'Training session scheduling',
      update: 'HR is reviewing available training sessions for next month',
      author: 'HR Team',
      timestamp: '2024-11-26 16:20',
      type: 'review',
    },
  ];

  const knowledgeBase = [
    {
      id: 1,
      title: 'How to submit expense reports',
      category: 'Finance',
      views: 245,
      helpful: 89,
      lastUpdated: '2024-11-20',
    },
    {
      id: 2,
      title: 'Project dashboard access troubleshooting',
      category: 'Technical',
      views: 189,
      helpful: 76,
      lastUpdated: '2024-11-15',
    },
    {
      id: 3,
      title: 'Software license renewal process',
      category: 'Software',
      views: 156,
      helpful: 65,
      lastUpdated: '2024-11-10',
    },
    {
      id: 4,
      title: 'Requesting training sessions',
      category: 'HR',
      views: 134,
      helpful: 58,
      lastUpdated: '2024-11-05',
    },
  ];

  const contactMethods = [
    {
      method: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 9 AM - 6 PM EST',
      responseTime: 'Instant',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      method: 'Email Support',
      description: 'Send detailed queries via email',
      availability: '24/7',
      responseTime: 'Within 4 hours',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      method: 'Phone Support',
      description: 'Speak directly with a support specialist',
      availability: 'Mon-Fri 9 AM - 6 PM EST',
      responseTime: 'Immediate connection',
      icon: Phone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'pending-review':
        return <Badge className="bg-purple-100 text-purple-800">Pending Review</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case 'acknowledgment':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'update':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'review':
        return <User className="h-4 w-4 text-yellow-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  // make the page stateful so buttons can be functional (mocked in-memory)
  const [tickets, setTickets] = useState(openTicketsInitial);
  const [recentUpdatesState, setRecentUpdatesState] = useState(recentUpdatesInitial);

  const handleCreateTicket = (ticket: any) => {
    setTickets((t) => [ticket, ...t]);
    setRecentUpdatesState((u) => [
      {
        id: Date.now(),
        ticket: ticket.title,
        update: 'Ticket created',
        author: ticket.assignedTo || 'Support Team',
        timestamp: ticket.createdDate,
        type: 'acknowledgment',
      },
      ...u,
    ]);
  };

  const handleAddComment = (ticketId: number, comment: string) => {
    setTickets((t) =>
      t.map((tk) =>
        tk.id === ticketId
          ? { ...tk, responses: (tk.responses || 0) + 1, lastUpdate: new Date().toISOString() }
          : tk
      )
    );
    const ticket = tickets.find((x) => x.id === ticketId);
    setRecentUpdatesState((u) => [
      {
        id: Date.now(),
        ticket: ticket?.title || 'Ticket',
        update: comment,
        author: 'You',
        timestamp: new Date().toISOString(),
        type: 'progress',
      },
      ...u,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Support Center</h1>
        <p className="text-red-100 mt-1 text-lg">Get help with technical issues, policies, and general inquiries</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {supportStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
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
        {/* Open Support Tickets */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Open Support Tickets</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Your active support requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <HelpCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ticket.category} • {ticket.responses} responses
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{ticket.description}</p>
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>Created: {new Date(ticket.createdDate).toLocaleDateString()}</span>
                    <span>Last update: {new Date(ticket.lastUpdate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Assigned to: {ticket.assignedTo}</span>
                    <div className="flex space-x-2">
                      <SupportTicketDetailsDialog ticket={ticket} onAddComment={handleAddComment}>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                          View Details
                        </Button>
                      </SupportTicketDetailsDialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => {
                          const comment = prompt('Add a comment (mock):');
                          if (comment) handleAddComment(ticket.id, comment);
                        }}
                      >
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Recent Updates</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Latest responses and updates on your tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentUpdatesState.map((update) => (
                <div key={update.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getUpdateTypeIcon(update.type)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {update.ticket}
                        </p>
                        <p className="text-xs text-gray-500">
                          {update.update}
                        </p>
                        <p className="text-xs text-gray-400">
                          {update.author} • {new Date(update.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <SupportTicketDetailsDialog ticket={tickets.find((t) => t.title === update.ticket) || tickets[0]} onAddComment={handleAddComment}>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                      View Full Thread
                    </Button>
                  </SupportTicketDetailsDialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Base & Contact Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Base */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Knowledge Base</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Find answers to common questions and issues
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {knowledgeBase.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {article.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {article.category} • {article.views} views • {article.helpful}% found helpful
                        </p>
                        <p className="text-xs text-gray-400">
                          Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => window.open(`/knowledge-base/${article.id}`, '_blank')}
                  >
                    Read Article
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Methods */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Contact Support</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Get help through different channels
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <div key={index} className="p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 ${method.bgColor} rounded-lg`}>
                        <IconComponent className={`h-6 w-6 ${method.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {method.method}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          {method.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {method.availability} • {method.responseTime}
                        </p>
                      </div>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          if (method.method === 'Email Support') {
                            window.location.href = 'mailto:support@example.com?subject=Support%20Request';
                          } else if (method.method === 'Phone Support') {
                            window.location.href = 'tel:+18001234567';
                          } else {
                            alert('Open live chat (mock)');
                          }
                        }}
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-violet-50 to-purple-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Support Actions</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Common support and help tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AddSupportTicketDialog onCreate={handleCreateTicket}>
              <Button className="p-5 border-2 border-red-200 rounded-xl hover:bg-linear-to-br hover:from-red-50 hover:to-purple-50 hover:border-red-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <HelpCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Submit New Ticket</h3>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Create a new support request for any issue
                </p>
              </Button>
            </AddSupportTicketDialog>
            <Button className="p-5 border-2 border-blue-200 rounded-xl hover:bg-linear-to-br hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Browse Knowledge Base</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Search for solutions to common problems
              </p>
            </Button>
            <Button className="p-5 border-2 border-green-200 rounded-xl hover:bg-linear-to-br hover:from-green-50 hover:to-emerald-50 hover:border-green-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Schedule Callback</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Book a time for phone support assistance
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}