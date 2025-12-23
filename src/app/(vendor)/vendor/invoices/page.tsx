'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import mockData from '@/lib/mock-data';
import { useCurrencyStore } from '@/stores/currency';
import { CreateInvoiceModal } from '@/components/create-invoice-modal';
import { ViewInvoiceModal } from '@/components/view-invoice-modal';
import { SubmitInvoiceModal } from '@/components/submit-invoice-modal';
import { ReceiptModal } from '@/components/receipt-modal';
import { toast } from 'sonner';

export default function VendorInvoicesPage() {
  const { formatAmount } = useCurrencyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal state
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false);
  const [showSubmitInvoiceModal, setShowSubmitInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Invoices state
  const [invoices, setInvoices] = useState(() => mockData.projects.slice(0, 15).map((project, index) => ({
    id: `INV-${2000 + index}`,
    invoiceNumber: `VND-INV-${2000 + index}`,
    purchaseOrder: `PO-${1000 + index}`,
    projectName: project.name,
    amount: Math.floor(Math.random() * 50000) + 5000,
    dueDate: new Date(Date.now() + Math.random() * 45 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    submittedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    paymentMethod: ['Bank Transfer', 'Check', 'Wire Transfer'][Math.floor(Math.random() * 3)],
    status: ['draft', 'sent', 'pending', 'paid', 'overdue'][Math.floor(Math.random() * 5)] as string,
    notes: index % 4 === 0 ? 'Early payment discount applied' : '',
  })));

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.purchaseOrder.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { 
      label: 'Total Invoiced', 
      value: formatAmount(invoices.reduce((sum, inv) => sum + inv.amount, 0)), 
      color: 'bg-pink-500', 
      icon: '💰' 
    },
    { 
      label: 'Paid', 
      value: formatAmount(invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)), 
      color: 'bg-green-500', 
      icon: '✅' 
    },
    { 
      label: 'Pending', 
      value: invoices.filter(i => i.status === 'pending' || i.status === 'sent').length, 
      color: 'bg-yellow-500', 
      icon: '⏳' 
    },
    { 
      label: 'Overdue', 
      value: invoices.filter(i => i.status === 'overdue').length, 
      color: 'bg-red-500', 
      icon: '⚠️' 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Modal handlers
  const handleCreateInvoice = () => {
    setShowCreateInvoiceModal(true);
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowViewInvoiceModal(true);
  };

  const handleSubmitInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowSubmitInvoiceModal(true);
  };

  const handleViewReceipt = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowReceiptModal(true);
  };

  const handleInvoiceCreated = (newInvoice: any) => {
    setInvoices(prev => [newInvoice, ...prev]);
    toast.success('Invoice created successfully');
  };

  const handleInvoiceSubmitted = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === invoiceId
        ? { ...inv, status: 'sent' as const }
        : inv
    ));
    toast.success('Invoice submitted successfully');
  };

  const handleCloseModals = () => {
    setShowCreateInvoiceModal(false);
    setShowViewInvoiceModal(false);
    setShowSubmitInvoiceModal(false);
    setShowReceiptModal(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices & Payments</h1>
          <p className="text-gray-600 mt-1">Track your submitted invoices and payment status</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleCreateInvoice}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: stat.color.replace('bg-', '#') }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Invoices</label>
              <Input
                type="text"
                placeholder="Search by invoice number or PO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Purchase Order</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                        {invoice.notes && (
                          <p className="text-xs text-green-600 mt-1">💡 {invoice.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{invoice.purchaseOrder}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{invoice.submittedDate}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{invoice.dueDate}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-lg font-bold text-pink-600">{formatAmount(invoice.amount)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {invoice.paymentMethod}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`${getStatusColor(invoice.status)} border`}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-pink-600 border-pink-600 hover:bg-pink-50" onClick={() => handleViewInvoice(invoice)}>
                          View
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => handleSubmitInvoice(invoice)}>
                            Submit
                          </Button>
                        )}
                        {invoice.status === 'paid' && (
                          <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleViewReceipt(invoice)}>
                            Receipt
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={showCreateInvoiceModal}
        onClose={handleCloseModals}
        onInvoiceCreated={handleInvoiceCreated}
      />

      <ViewInvoiceModal
        isOpen={showViewInvoiceModal}
        onClose={handleCloseModals}
        invoice={selectedInvoice}
      />

      <SubmitInvoiceModal
        isOpen={showSubmitInvoiceModal}
        onClose={handleCloseModals}
        invoice={selectedInvoice}
        onInvoiceSubmitted={handleInvoiceSubmitted}
      />

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={handleCloseModals}
        invoice={selectedInvoice}
      />
    </div>
  );
}
