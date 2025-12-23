'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import mockData from '@/lib/mock-data';
import { useCurrencyStore } from '@/stores/currency';
import { ViewPaymentModal } from '@/components/view-payment-modal';
import { toast } from 'sonner';

export default function VendorPaymentsPage() {
  const { formatAmount } = useCurrencyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal state
  const [showViewPaymentModal, setShowViewPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Payments state
  const [payments] = useState(() => mockData.projects.slice(0, 20).map((project, index) => ({
    id: `PAY-${3000 + index}`,
    paymentNumber: `PAY-${3000 + index}`,
    invoiceNumber: `VND-INV-${2000 + index}`,
    purchaseOrder: `PO-${1000 + index}`,
    projectName: project.name,
    amount: Math.floor(Math.random() * 50000) + 5000,
    paymentDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    method: ['Bank Transfer', 'Wire Transfer', 'Check', 'ACH'][Math.floor(Math.random() * 4)],
    status: ['completed', 'pending', 'processing', 'failed'][Math.floor(Math.random() * 4)] as string,
    transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    bankReference: `BNK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  })));

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || payment.status === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = [
    { 
      label: 'Total Received', 
      value: formatAmount(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)), 
      color: 'text-green-600', 
      icon: '💵' 
    },
    { 
      label: 'Pending', 
      value: formatAmount(payments.filter(p => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + p.amount, 0)), 
      color: 'text-yellow-600', 
      icon: '⏳' 
    },
    { 
      label: 'This Month', 
      value: payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && p.status === 'completed';
      }).length,
      color: 'text-blue-600', 
      icon: '📊' 
    },
    { 
      label: 'Failed', 
      value: payments.filter(p => p.status === 'failed').length, 
      color: 'text-red-600', 
      icon: '❌' 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Export functionality
  const handleExportReport = () => {
    try {
      // Create CSV content
      const headers = [
        'Payment Number',
        'Invoice Number',
        'Purchase Order',
        'Project Name',
        'Amount',
        'Payment Date',
        'Payment Method',
        'Status',
        'Transaction ID',
        'Bank Reference'
      ];

      const csvContent = [
        headers.join(','),
        ...filteredPayments.map(payment => [
          payment.paymentNumber,
          payment.invoiceNumber,
          payment.purchaseOrder,
          `"${payment.projectName}"`, // Wrap in quotes to handle commas
          payment.amount,
          payment.paymentDate,
          payment.method,
          payment.status,
          payment.transactionId,
          payment.bankReference
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `payment-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Payment report exported successfully');
    } catch (error) {
      toast.error('Failed to export report. Please try again.');
    }
  };

  // Modal handlers
  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowViewPaymentModal(true);
  };

  const handleDownloadReceipt = (payment: any) => {
    // This will be handled in the modal
    handleViewPayment(payment);
  };

  const handleCloseModals = () => {
    setShowViewPaymentModal(false);
    setSelectedPayment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Transactions</h1>
          <p className="text-gray-600 mt-1">Track all payment transactions and history</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleExportReport}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Payments</label>
              <Input
                type="text"
                placeholder="Search by payment #, invoice #, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Payment Info */}
                <div className="lg:col-span-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{payment.paymentNumber}</h3>
                      <p className="text-sm text-gray-600 mt-1">{payment.projectName}</p>
                    </div>
                    <Badge className={`${getStatusColor(payment.status)} border`}>
                      {payment.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Invoice: <span className="font-semibold ml-1">{payment.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      PO: <span className="font-semibold ml-1">{payment.purchaseOrder}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Date: <span className="font-semibold ml-1">{payment.paymentDate}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="lg:col-span-4 border-l border-gray-200 pl-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Transaction Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      {payment.method}
                    </div>
                    <div className="flex items-center font-mono text-xs">
                      <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      TXN: {payment.transactionId}
                    </div>
                    <div className="flex items-center font-mono text-xs">
                      <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      REF: {payment.bankReference}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="lg:col-span-3 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatAmount(payment.amount)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={() => handleViewPayment(payment)}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Button>
                    {payment.status === 'completed' && (
                      <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50" onClick={() => handleDownloadReceipt(payment)}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Receipt
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ViewPaymentModal
        isOpen={showViewPaymentModal}
        onClose={handleCloseModals}
        payment={selectedPayment}
      />
    </div>
  );
}
