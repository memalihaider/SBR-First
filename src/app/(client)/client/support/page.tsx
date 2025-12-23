'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSupportTicketsStore, type SupportTicket } from '@/stores/support-tickets';
import AddSupportTicketDialog from '@/components/add-support-ticket-dialog';
import SupportTicketDetailsDialog from '@/components/support-ticket-details-dialog';
import { toast } from 'sonner';

export default function ClientSupportPage() {
  const { tickets, addTicket, addMessage, updateTicketStatus } = useSupportTicketsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  const getFilteredTickets = () => {
    let filtered = tickets;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTickets = getFilteredTickets();
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      waiting_response: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateTicket = (ticketData: any) => {
    addTicket({
      subject: ticketData.title,
      description: ticketData.description,
      category: ticketData.category || 'General Support',
      priority: ticketData.priority || 'medium',
      status: 'open',
    });
    toast.success('Support ticket created successfully!');
  };

  const handleAddReply = (ticketId: string, reply: string) => {
    addMessage(ticketId, reply, true);
    toast.success('Reply added successfully!');
  };

  // Adapter for dialog component types
  const adaptTicketForDialog = (ticket: SupportTicket) => ({
    id: parseInt(ticket.id.replace('TKT-', '')),
    title: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    createdDate: ticket.createdDate.toISOString(),
    lastUpdate: ticket.lastUpdated.toISOString(),
    assignedTo: ticket.assignedTo,
    responses: ticket.messages.length,
    messages: ticket.messages,
  });

  const handleDialogAddComment = (ticketId: number, comment: string) => {
    const ticket = tickets.find(t => parseInt(t.id.replace('TKT-', '')) === ticketId);
    if (ticket) {
      handleAddReply(ticket.id, comment);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-600 mt-1">Get help and submit support tickets</p>
        </div>
        <AddSupportTicketDialog onCreate={handleCreateTicket}>
          <Button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Button>
        </AddSupportTicketDialog>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{tickets.length}</div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{openTickets}</div>
            <p className="text-sm text-gray-500 mt-1">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{inProgressTickets}</div>
            <p className="text-sm text-gray-500 mt-1">Being handled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{resolvedTickets}</div>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by ticket number or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('open')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'open'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilterStatus('in_progress')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'in_progress'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'resolved'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{ticket.ticketNumber}</h3>
                    <Badge className={getStatusBadge(ticket.status)}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityBadge(ticket.priority)}>
                      {ticket.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-base font-medium text-gray-700">{ticket.subject}</p>
                  <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium text-gray-900">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.createdDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.lastUpdated.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900">{ticket.assignedTo || 'Unassigned'}</p>
                </div>
              </div>

              {/* Messages Preview */}
              {ticket.messages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recent Messages ({ticket.messages.length}):</p>
                  <div className="space-y-2">
                    {ticket.messages.slice(-2).map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.isClient ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700">{msg.from}</span>
                          <span className="text-xs text-gray-500">{msg.timestamp.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-800">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <SupportTicketDetailsDialog ticket={adaptTicketForDialog(ticket)} onAddComment={handleDialogAddComment}>
                  <Button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
                    View Conversation
                  </Button>
                </SupportTicketDetailsDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-lg font-medium">No tickets found</p>
            <p className="text-sm">Try adjusting your filters or create a new ticket</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
