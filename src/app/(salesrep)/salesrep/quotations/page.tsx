'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth';
import mockData from '@/lib/mock-data';

interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  issueDate: Date;
  validUntil: Date;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
}

export default function MyQuotationsPage() {
  const { user } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'>('all');

  // Mock quotations (in a real app, this would be fetched from API)
  const myQuotations: Quotation[] = mockData.customers.slice(0, 5).map((customer, idx) => {
    const items: QuotationItem[] = [
      { description: 'Enterprise License', quantity: 10, unitPrice: 999, totalPrice: 9990 },
      { description: 'Premium Support', quantity: 1, unitPrice: 5000, totalPrice: 5000 },
    ];
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.1;
    const discountAmount = idx === 0 ? 500 : 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const statuses: ('draft' | 'sent' | 'approved' | 'rejected' | 'expired')[] = ['draft', 'sent', 'approved', 'rejected', 'expired'];
    
    return {
      id: `Q-${idx + 1}`,
      quotationNumber: `QUO-2024-${String(idx + 1).padStart(4, '0')}`,
      customerId: customer.id,
      issueDate: new Date(Date.now() - idx * 5 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + (30 - idx * 5) * 24 * 60 * 60 * 1000),
      status: statuses[idx % statuses.length],
      items,
      subtotal,
      taxRate: 10,
      taxAmount,
      discountAmount,
      totalAmount,
      notes: idx === 0 ? 'Early bird discount applied' : undefined,
    };
  });

  const getFilteredQuotations = () => {
    if (filterStatus === 'all') return myQuotations;
    return myQuotations.filter(q => q.status === filterStatus);
  };

  const quotations = getFilteredQuotations();
  const totalQuotations = myQuotations.length;
  const approvedQuotations = myQuotations.filter(q => q.status === 'approved').length;
  const totalValue = myQuotations.reduce((sum, q) => sum + q.totalAmount, 0);
  const approvedValue = myQuotations.filter(q => q.status === 'approved').reduce((sum, q) => sum + q.totalAmount, 0);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Quotations</h1>
          <p className="text-gray-600 mt-1">Create and manage quotations</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Quotation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalQuotations}</div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{approvedQuotations}</div>
            <p className="text-sm text-gray-500 mt-1">
              {totalQuotations > 0 ? Math.round((approvedQuotations / totalQuotations) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">${totalValue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Quoted amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${approvedValue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Won business</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              All ({myQuotations.length})
            </Button>
            <Button
              variant={filterStatus === 'draft' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('draft')}
            >
              Draft ({myQuotations.filter(q => q.status === 'draft').length})
            </Button>
            <Button
              variant={filterStatus === 'sent' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('sent')}
            >
              Sent ({myQuotations.filter(q => q.status === 'sent').length})
            </Button>
            <Button
              variant={filterStatus === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('approved')}
            >
              Approved ({myQuotations.filter(q => q.status === 'approved').length})
            </Button>
            <Button
              variant={filterStatus === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('rejected')}
            >
              Rejected ({myQuotations.filter(q => q.status === 'rejected').length})
            </Button>
            <Button
              variant={filterStatus === 'expired' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('expired')}
            >
              Expired ({myQuotations.filter(q => q.status === 'expired').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="space-y-4">
        {quotations.map((quotation) => {
          const customer = mockData.customers.find(c => c.id === quotation.customerId);
          
          return (
            <Card key={quotation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {quotation.quotationNumber}
                      </h3>
                      <Badge className={getStatusBadge(quotation.status)}>
                        {quotation.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium text-gray-900">{customer?.companyName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issue Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(quotation.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Valid Until</p>
                        <p className="font-medium text-gray-900">
                          {new Date(quotation.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-bold text-green-600 text-lg">
                          ${quotation.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Items ({quotation.items.length})</h4>
                      <div className="space-y-2">
                        {quotation.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">{item.description}</span>
                              <span className="text-gray-500 ml-2">
                                (Qty: {item.quantity} × ${item.unitPrice.toLocaleString()})
                              </span>
                            </div>
                            <span className="font-bold text-gray-900">
                              ${item.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="border-t mt-3 pt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">${quotation.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax ({quotation.taxRate}%):</span>
                          <span className="font-medium">${quotation.taxAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium">-${quotation.discountAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t pt-2">
                          <span>Total:</span>
                          <span className="text-green-600">${quotation.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {quotation.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Notes: </span>
                          {quotation.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    {quotation.status === 'draft' && (
                      <>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700">
                          Send
                        </Button>
                      </>
                    )}
                    {quotation.status === 'sent' && (
                      <Button variant="outline" size="sm">
                        Follow Up
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {quotations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No quotations found</p>
            <p className="text-sm">Try adjusting your filters or create a new quotation</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
