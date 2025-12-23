import { create } from 'zustand';
import mockData from '@/lib/mock-data';
import { Invoice } from '@/types';

// Generate initial mock invoices
const generateInitialInvoices = (): Invoice[] => {
  return mockData.projects.slice(0, 8).map((project, idx) => {
    const statuses: ('sent' | 'paid' | 'overdue' | 'partially_paid')[] = ['sent', 'paid', 'overdue', 'partially_paid'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const subtotal = project.budgetAmount * 0.3;
    const taxAmount = subtotal * 0.1;
    const totalAmount = subtotal + taxAmount;
    const paidAmount = status === 'paid' ? totalAmount : status === 'partially_paid' ? totalAmount * 0.5 : 0;
    const remainingAmount = totalAmount - paidAmount;

    const customer = mockData.getCustomerById(project.customerId || mockData.customers[0].id);

    return {
      id: `INV-${idx + 1}`,
      invoiceNumber: `INV-2025-${String(idx + 1).padStart(4, '0')}`,
      customerId: project.customerId || mockData.customers[0].id,
      customerName: customer?.companyName || 'Unknown Customer',
      projectId: project.id,
      projectName: project.name,
      status: status as any,
      items: [
        {
          id: `item-${idx}-1`,
          productId: '',
          productName: 'Service',
          productSku: '',
          mainCategoryId: '',
          mainCategoryName: 'Services',
          subCategoryId: '',
          subCategoryName: 'General',
          manufacturer: '',
          description: `${project.name} - Milestone 1`,
          quantity: 1,
          unitPrice: subtotal * 0.5,
          discount: 0,
          discountAmount: 0,
          taxRate: 10,
          taxAmount: (subtotal * 0.5) * 0.1,
          serviceCharge: 0,
          serviceChargeAmount: 0,
          totalPrice: subtotal * 0.5 * 1.1,
          stockAvailable: 0,
          isStockTracked: false,
        },
        {
          id: `item-${idx}-2`,
          productId: '',
          productName: 'Service',
          productSku: '',
          mainCategoryId: '',
          mainCategoryName: 'Services',
          subCategoryId: '',
          subCategoryName: 'General',
          manufacturer: '',
          description: `${project.name} - Milestone 2`,
          quantity: 1,
          unitPrice: subtotal * 0.5,
          discount: 0,
          discountAmount: 0,
          taxRate: 10,
          taxAmount: (subtotal * 0.5) * 0.1,
          serviceCharge: 0,
          serviceChargeAmount: 0,
          totalPrice: subtotal * 0.5 * 1.1,
          stockAvailable: 0,
          isStockTracked: false,
        },
      ],
      subtotal,
      discountAmount: 0,
      discountPercentage: 0,
      taxes: [{
        id: 'tax-1',
        name: 'VAT',
        rate: 10,
        amount: taxAmount,
        type: 'vat' as any,
        isInclusive: false,
      }],
      totalTaxAmount: taxAmount,
      serviceCharges: [],
      totalServiceChargeAmount: 0,
      totalAmount,
      paidAmount,
      remainingAmount,
      stockReserved: false,
      issueDate: new Date(project.startDate),
      dueDate: new Date(new Date(project.startDate).getTime() + 30 * 24 * 60 * 60 * 1000),
      paidDate: status === 'paid' ? new Date() : undefined,
      paymentTerms: 'Net 30 days',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
};

interface InvoicesStore {
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
}

export const useInvoicesStore = create<InvoicesStore>((set, get) => ({
  invoices: generateInitialInvoices(),
  setInvoices: (invoices) => set({ invoices }),
  updateInvoice: (id, updates) =>
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
    })),
}));