'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCurrencyStore } from '@/stores/currency';

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceNumber: string;
  purchaseOrder: string;
  projectName: string;
  amount: number;
  paymentDate: string;
  method: string;
  status: string;
  transactionId: string;
  bankReference: string;
}

interface ViewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function ViewPaymentModal({ isOpen, onClose, payment }: ViewPaymentModalProps) {
  const { formatAmount } = useCurrencyStore();

  if (!payment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleDownloadReceipt = () => {
    // In a real application, this would generate and download a PDF
    const receiptContent = `
PAYMENT RECEIPT
================

Payment Number: ${payment.paymentNumber}
Invoice Number: ${payment.invoiceNumber}
Purchase Order: ${payment.purchaseOrder}
Project: ${payment.projectName}

Payment Details:
- Amount: ${formatAmount(payment.amount)}
- Payment Date: ${payment.paymentDate}
- Payment Method: ${payment.method}
- Transaction ID: ${payment.transactionId}
- Bank Reference: ${payment.bankReference}

Status: ${payment.status.toUpperCase()}

Generated on: ${new Date().toLocaleDateString()}

Thank you for your business!
SBR 360ERP System
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-receipt-${payment.paymentNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Payment Details - {payment.paymentNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{payment.paymentNumber}</h3>
                  <p className="text-gray-600">Project: {payment.projectName}</p>
                </div>
                <Badge className={`${getStatusColor(payment.status)} border`}>
                  {payment.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Invoice Number</p>
                  <p className="font-medium">{payment.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchase Order</p>
                  <p className="font-medium">{payment.purchaseOrder}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Date</p>
                  <p className="font-medium">{payment.paymentDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Method</p>
                  <p className="font-medium">{payment.method}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                    <p className="font-mono text-sm font-medium bg-gray-50 p-2 rounded">{payment.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bank Reference</p>
                    <p className="font-mono text-sm font-medium bg-gray-50 p-2 rounded">{payment.bankReference}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">{formatAmount(payment.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Payment Initiated</p>
                    <p className="text-sm text-gray-600">{payment.paymentDate}</p>
                  </div>
                </div>

                {payment.status === 'processing' && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Processing Payment</p>
                      <p className="text-sm text-gray-600">Payment is being processed by the bank</p>
                    </div>
                  </div>
                )}

                {payment.status === 'completed' && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Payment Completed</p>
                      <p className="text-sm text-gray-600">Payment has been successfully processed</p>
                    </div>
                  </div>
                )}

                {payment.status === 'failed' && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Payment Failed</p>
                      <p className="text-sm text-gray-600">Payment could not be processed</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {payment.status === 'completed' && (
              <Button onClick={handleDownloadReceipt} className="bg-green-600 hover:bg-green-700 text-white">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Receipt
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}