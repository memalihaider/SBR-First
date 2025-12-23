'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddClientQuotationDialog from '@/components/add-client-quotation-dialog';
import ClientQuotationDetailsDialog from '@/components/client-quotation-details-dialog';

interface Quotation {
  id: string;
  quotationNumber: string;
  projectName: string;
  description: string;
  issueDate: Date;
  validUntil: Date;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  notes?: string;
}

export default function ClientQuotationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'accepted' | 'rejected'>('all');

  // Generate mock quotations
  const quotationsInitial: Quotation[] = Array.from({ length: 8 }, (_, i) => {
    const statuses: ('sent' | 'accepted' | 'rejected')[] = ['sent', 'accepted', 'rejected'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = Math.floor(Math.random() * 500000) + 50000;

    return {
      id: `QUOT-${i + 1}`,
      quotationNumber: `QT-2025-${String(i + 1).padStart(4, '0')}`,
      projectName: `Project ${i + 1}`,
      description: `Comprehensive solution for business requirements ${i + 1}`,
      issueDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      amount,
      status,
      items: [
        {
          description: 'Installation and Setup',
          quantity: 1,
          unitPrice: amount * 0.4,
          amount: amount * 0.4,
        },
        {
          description: 'Configuration and Testing',
          quantity: 1,
          unitPrice: amount * 0.3,
          amount: amount * 0.3,
        },
        {
          description: 'Training and Support',
          quantity: 1,
          unitPrice: amount * 0.3,
          amount: amount * 0.3,
        },
      ],
      notes: 'This quotation is valid for 30 days from the issue date.',
    };
  });

  const [quotations, setQuotations] = useState<Quotation[]>(quotationsInitial);

  const getFilteredQuotations = () => {
    let filtered = quotations;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(q => q.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredQuotations = getFilteredQuotations();
  const totalValue = quotations.reduce((sum, q) => sum + q.amount, 0);
  const acceptedValue = quotations.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.amount, 0);
  const pendingCount = quotations.filter(q => q.status === 'sent').length;

  const handleCreateQuotation = (q: Quotation) => {
    setQuotations((s) => [q, ...s]);
  };

  const handleDownload = (q: Quotation) => {
    const content = `Quotation: ${q.quotationNumber}\nProject: ${q.projectName}\nAmount: $${q.amount.toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${q.quotationNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleAccept = (id: string) => {
    setQuotations((s) => s.map((q) => q.id === id ? { ...q, status: 'accepted' } : q));
  };

  const handleDecline = (id: string) => {
    setQuotations((s) => s.map((q) => q.id === id ? { ...q, status: 'rejected' } : q));
  };

  const handleSend = (id: string) => {
    setQuotations((s) => s.map((q) => q.id === id ? { ...q, status: 'sent' } : q));
    alert('Quotation sent (mock).');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
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
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600 mt-1">View and manage your quotation requests</p>
        </div>
        <AddClientQuotationDialog onCreate={handleCreateQuotation}>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request Quotation
          </button>
        </AddClientQuotationDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{quotations.length}</div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{pendingCount}</div>
            <p className="text-sm text-gray-500 mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">${totalValue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">All quotations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Accepted Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${acceptedValue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Converted to projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by quotation number or project..."
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
                onClick={() => setFilterStatus('sent')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'sent'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('accepted')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'accepted'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{quotation.quotationNumber}</h3>
                    <Badge className={getStatusBadge(quotation.status)}>
                      {quotation.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-base font-medium text-gray-700">{quotation.projectName}</p>
                  <p className="text-sm text-gray-600 mt-1">{quotation.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${quotation.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Issue Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {quotation.issueDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valid Until</p>
                  <p className="text-sm font-medium text-gray-900">
                    {quotation.validUntil.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Items Preview */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                <div className="space-y-1">
                  {quotation.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                      <span className="text-gray-700">{item.description}</span>
                      <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {quotation.notes && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Note:</p>
                  <p className="text-sm text-blue-800">{quotation.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <ClientQuotationDetailsDialog quotation={quotation} onAccept={handleAccept} onDecline={handleDecline} onSend={handleSend}>
                  <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
                    View Details
                  </button>
                </ClientQuotationDetailsDialog>
                <button
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium transition-colors"
                  onClick={() => handleDownload(quotation)}
                >
                  Download PDF
                </button>
                {quotation.status === 'sent' && (
                  <>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors" onClick={() => handleAccept(quotation.id)}>
                      Accept
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors" onClick={() => handleDecline(quotation.id)}>
                      Decline
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">No quotations found</p>
            <p className="text-sm">Try adjusting your filters or search term</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
