'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCurrencyStore } from '@/stores/currency';

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrder: string;
  projectName: string;
  projectId?: string;
  amount: number;
  dueDate: string;
  submittedDate: string;
  paymentMethod: string;
  status: string;
  notes?: string;
  items?: InvoiceItem[];
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
}

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function ViewInvoiceModal({ isOpen, onClose, invoice }: ViewInvoiceModalProps) {
  const { formatAmount } = useCurrencyStore();

  if (!invoice) return null;

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

  const subtotal = invoice.subtotal || invoice.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
  const taxAmount = invoice.taxAmount || (subtotal * 0.08); // Default 8% tax if not provided
  const totalAmount = invoice.totalAmount || (subtotal + taxAmount);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Invoice Details - {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                  <p className="text-gray-600">Purchase Order: {invoice.purchaseOrder}</p>
                </div>
                <Badge className={`${getStatusColor(invoice.status)} border`}>
                  {invoice.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Project</p>
                  <p className="text-sm text-gray-900">{invoice.projectName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted Date</p>
                  <p className="text-sm text-gray-900">{invoice.submittedDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Due Date</p>
                  <p className="text-sm text-gray-900">{invoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Method</p>
                  <p className="text-sm text-gray-900">{invoice.paymentMethod}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          {invoice.items && invoice.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {formatAmount(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatAmount(item.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatAmount(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{formatAmount(taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-pink-600">{formatAmount(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Status</p>
                  <Badge className={`${getStatusColor(invoice.status)} border mt-1`}>
                    {invoice.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Amount Due</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {invoice.status === 'paid' ? formatAmount(0) : formatAmount(totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {invoice.status === 'draft' && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Edit Invoice
              </Button>
            )}
            {invoice.status === 'paid' && (
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Download Receipt
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}