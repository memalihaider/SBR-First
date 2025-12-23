'use client';

import { create } from 'zustand';

export interface VendorOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  orderDate: Date;
  deliveryDate: Date;
  notes?: string;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
}

interface VendorOrdersStore {
  orders: VendorOrder[];
  invoices: VendorInvoice[];
  addOrder: (order: Omit<VendorOrder, 'id' | 'orderNumber' | 'orderDate'>) => void;
  updateOrderStatus: (id: string, status: VendorOrder['status']) => void;
  addInvoice: (invoice: Omit<VendorInvoice, 'id' | 'invoiceNumber' | 'issueDate'>) => void;
  updateInvoiceStatus: (id: string, status: VendorInvoice['status']) => void;
  getOrderById: (id: string) => VendorOrder | undefined;
  getInvoiceById: (id: string) => VendorInvoice | undefined;
}

// Generate initial mock data
const generateMockOrders = (): VendorOrder[] => {
  const clients = ['ABC Corp', 'Tech Solutions Inc', 'Global Enterprises', 'Innovate Ltd', 'Prime Industries'];
  const products = [
    { name: 'LED Panel 600x600', price: 75 },
    { name: 'Circuit Breaker 32A', price: 45 },
    { name: 'Cable Wire 2.5mm', price: 12 },
    { name: 'Junction Box IP65', price: 18 },
    { name: 'Smart Switch', price: 55 },
  ];
  const statuses: VendorOrder['status'][] = ['pending', 'confirmed', 'in_transit', 'delivered'];

  return Array.from({ length: 12 }, (_, i) => {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = Array.from({ length: numItems }, () => {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 50) + 10;
      return {
        name: product.name,
        quantity,
        unitPrice: product.price,
        totalPrice: quantity * product.price,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: `VO-${i + 1}`,
      orderNumber: `ORD-2025-${String(i + 1).padStart(4, '0')}`,
      clientName: client,
      items,
      totalAmount,
      status,
      orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
      notes: Math.random() > 0.5 ? `Special delivery instructions for ${client}` : undefined,
    };
  });
};

const generateMockInvoices = (): VendorInvoice[] => {
  return Array.from({ length: 8 }, (_, i) => {
    const amount = Math.floor(Math.random() * 10000) + 1000;
    const tax = amount * 0.1;
    const totalAmount = amount + tax;
    const statuses: VendorInvoice['status'][] = ['draft', 'sent', 'paid', 'overdue'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: `VI-${i + 1}`,
      invoiceNumber: `VIN-2025-${String(i + 1).padStart(4, '0')}`,
      orderId: `VO-${Math.floor(Math.random() * 12) + 1}`,
      orderNumber: `ORD-2025-${String(Math.floor(Math.random() * 12) + 1).padStart(4, '0')}`,
      amount,
      tax,
      totalAmount,
      status,
      issueDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      paidDate: status === 'paid' ? new Date() : undefined,
    };
  });
};

const useVendorOrdersStore = create<VendorOrdersStore>((set, get) => ({
  orders: generateMockOrders(),
  invoices: generateMockInvoices(),

  addOrder: (order) => {
    const newOrder: VendorOrder = {
      ...order,
      id: `VO-${Date.now()}`,
      orderNumber: `ORD-2025-${String(Date.now()).slice(-4)}`,
      orderDate: new Date(),
    };
    set((state) => ({
      orders: [...state.orders, newOrder],
    }));
  },

  updateOrderStatus: (id, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status } : order
      ),
    }));
  },

  addInvoice: (invoice) => {
    const newInvoice: VendorInvoice = {
      ...invoice,
      id: `VI-${Date.now()}`,
      invoiceNumber: `VIN-2025-${String(Date.now()).slice(-4)}`,
      issueDate: new Date(),
    };
    set((state) => ({
      invoices: [...state.invoices, newInvoice],
    }));
  },

  updateInvoiceStatus: (id, status) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice
      ),
    }));
  },

  getOrderById: (id) => {
    return get().orders.find((order) => order.id === id);
  },

  getInvoiceById: (id) => {
    return get().invoices.find((invoice) => invoice.id === id);
  },
}));

export default useVendorOrdersStore;