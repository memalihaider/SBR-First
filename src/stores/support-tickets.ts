'use client';

import { create } from 'zustand';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  createdDate: Date;
  lastUpdated: Date;
  assignedTo?: string;
  messages: {
    id: string;
    from: string;
    message: string;
    timestamp: Date;
    isClient: boolean;
  }[];
}

interface SupportTicketsStore {
  tickets: SupportTicket[];
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdDate' | 'lastUpdated' | 'messages'>) => void;
  addMessage: (ticketId: string, message: string, isClient: boolean) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
}

// Generate initial mock data
const generateMockTickets = (): SupportTicket[] => {
  const categories = ['Technical Issue', 'Billing', 'Project Inquiry', 'General Support', 'Feature Request'];
  const priorities: ('low' | 'medium' | 'high' | 'urgent')[] = ['low', 'medium', 'high', 'urgent'];
  const statuses: ('open' | 'in_progress' | 'waiting_response' | 'resolved')[] = ['open', 'in_progress', 'waiting_response', 'resolved'];

  return Array.from({ length: 8 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    return {
      id: `TKT-${i + 1}`,
      ticketNumber: `SUPP-2025-${String(i + 1).padStart(4, '0')}`,
      subject: `Support inquiry ${i + 1}`,
      description: `Need assistance with project-related matter ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      priority,
      status,
      createdDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      assignedTo: status !== 'open' ? 'Support Team Member' : undefined,
      messages: [
        {
          id: `MSG-${i}-1`,
          from: 'You',
          message: `Initial support request for issue ${i + 1}`,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          isClient: true,
        },
        ...(status !== 'open' ? [{
          id: `MSG-${i}-2`,
          from: 'Support Team',
          message: 'We have received your request and are working on it.',
          timestamp: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
          isClient: false,
        }] : []),
      ],
    };
  });
};

export const useSupportTicketsStore = create<SupportTicketsStore>((set, get) => ({
  tickets: generateMockTickets(),

  addTicket: (ticketData) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `TKT-${Date.now()}`,
      ticketNumber: `SUPP-2025-${String(get().tickets.length + 1).padStart(4, '0')}`,
      createdDate: new Date(),
      lastUpdated: new Date(),
      status: 'open',
      messages: [{
        id: `MSG-${Date.now()}`,
        from: 'You',
        message: ticketData.description,
        timestamp: new Date(),
        isClient: true,
      }],
    };

    set((state) => ({
      tickets: [newTicket, ...state.tickets],
    }));
  },

  addMessage: (ticketId, message, isClient) => {
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              lastUpdated: new Date(),
              status: ticket.status === 'resolved' ? 'waiting_response' : ticket.status,
              messages: [
                ...ticket.messages,
                {
                  id: `MSG-${Date.now()}`,
                  from: isClient ? 'You' : 'Support Team',
                  message,
                  timestamp: new Date(),
                  isClient,
                },
              ],
            }
          : ticket
      ),
    }));
  },

  updateTicketStatus: (ticketId, status) => {
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status,
              lastUpdated: new Date(),
              assignedTo: status !== 'open' ? 'Support Team Member' : undefined,
            }
          : ticket
      ),
    }));
  },
}));