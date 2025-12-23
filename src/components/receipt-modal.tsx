'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrencyStore } from '@/stores/currency';

interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrder: string;
  projectName: string;
  amount: number;
  dueDate: string;
  submittedDate: string;
  paymentMethod: string;
  status: string;
  notes?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function ReceiptModal({ isOpen, onClose, invoice }: ReceiptModalProps) {
  const { formatAmount } = useCurrencyStore();

  if (!invoice) return null;

  // Mock receipt data
  const receiptData = {
    receiptNumber: `RCP-${invoice.id.split('-')[1]}`,
    paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    paymentMethod: invoice.paymentMethod,
    transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    paidAmount: invoice.amount,
    referenceNumber: invoice.purchaseOrder,
    processedBy: 'SBR 360ERP System'
  };

  const handleDownloadReceipt = () => {
    // In a real application, this would generate and download a PDF
    const receiptContent = `
PAYMENT RECEIPT
================

Receipt Number: ${receiptData.receiptNumber}
Invoice Number: ${invoice.invoiceNumber}
Purchase Order: ${invoice.purchaseOrder}
Project: ${invoice.projectName}

Payment Details:
- Amount Paid: ${formatAmount(receiptData.paidAmount)}
- Payment Date: ${receiptData.paymentDate}
- Payment Method: ${receiptData.paymentMethod}
- Transaction ID: ${receiptData.transactionId}
- Reference: ${receiptData.referenceNumber}

Status: PAID IN FULL

Processed by: ${receiptData.processedBy}
Generated on: ${new Date().toLocaleDateString()}

Thank you for your business!
SBR 360ERP System
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${invoice.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Payment Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Receipt Header */}
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <h2 className="text-xl font-semibold text-green-600">Payment Successful</h2>
            <p className="text-gray-600">Receipt #{receiptData.receiptNumber}</p>
          </div>

          {/* Receipt Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">Payment Receipt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Invoice Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Invoice Number</p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchase Order</p>
                  <p className="font-medium">{invoice.purchaseOrder}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Project</p>
                  <p className="font-medium">{invoice.projectName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Status</p>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    PAID
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatAmount(receiptData.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Date</p>
                    <p className="font-medium">{receiptData.paymentDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Method</p>
                    <p className="font-medium">{receiptData.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                    <p className="font-medium font-mono text-sm">{receiptData.transactionId}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reference Number</p>
                    <p className="font-medium">{receiptData.referenceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processed By</p>
                    <p className="font-medium">{receiptData.processedBy}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Invoice Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{invoice.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Footer Message */}
          <div className="text-center text-sm text-gray-600">
            <p>Thank you for your business!</p>
            <p className="mt-1">This receipt was generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 pt-4">
            <Button variant="outline" onClick={handlePrintReceipt}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </Button>
            <Button onClick={handleDownloadReceipt} className="bg-pink-600 hover:bg-pink-700 text-white">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Receipt
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}