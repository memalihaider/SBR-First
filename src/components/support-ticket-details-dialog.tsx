'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: string;
  category?: string;
  createdDate?: string;
  lastUpdate?: string;
  assignedTo?: string;
  responses?: number;
  messages?: {
    id: string;
    from: string;
    message: string;
    timestamp: Date;
    isClient: boolean;
  }[];
}

interface Props {
  ticket: Ticket;
  children: React.ReactNode;
  onAddComment?: (ticketId: number, comment: string) => void;
}

export default function SupportTicketDetailsDialog({ ticket, children, onAddComment }: Props) {
  const handleAddComment = () => {
    const comment = prompt('Add a comment (mock):');
    if (comment && onAddComment) {
      onAddComment(ticket.id, comment);
      alert('Comment added (mock).');
    }
  };

  const handleCloseTicket = () => {
    // in this mock dialog we simply alert — page should provide handler to actually change status
    alert('Close ticket action (mock) — implement server call to close.');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600">Category: {ticket.category}</p>
          <p className="text-sm text-gray-600">Priority: {ticket.priority}</p>
          <p className="text-sm text-gray-600">Assigned to: {ticket.assignedTo}</p>
          <p className="text-sm text-gray-600">Status: {ticket.status}</p>
          <Separator />
          <p className="text-sm text-gray-800">{ticket.description}</p>
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">Created: {ticket.createdDate ? new Date(ticket.createdDate).toLocaleString() : ''}</div>
            <div className="text-xs text-gray-500">Last update: {ticket.lastUpdate ? new Date(ticket.lastUpdate).toLocaleString() : ''}</div>
          </div>

          {/* Messages/Conversation */}
          {ticket.messages && ticket.messages.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <h4 className="text-sm font-medium text-gray-700">Conversation</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {ticket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.isClient ? 'bg-indigo-50 border border-indigo-200 ml-4' : 'bg-gray-100 mr-4'
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

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleAddComment}>Add Comment</Button>
            <Button onClick={handleCloseTicket}>Close Ticket</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
