'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
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

interface SubmitInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onInvoiceSubmitted: (invoiceId: string) => void;
}

export function SubmitInvoiceModal({ isOpen, onClose, invoice, onInvoiceSubmitted }: SubmitInvoiceModalProps) {
  const { formatAmount } = useCurrencyStore();
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      onInvoiceSubmitted(invoice.id);
      toast.success(`Invoice ${invoice.invoiceNumber} has been submitted successfully`);

      // Reset form
      setAdditionalNotes('');
      onClose();
    } catch (error) {
      toast.error('Failed to submit invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAdditionalNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Submit Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Purchase Order:</span>
                  <span className="font-medium">{invoice.purchaseOrder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Project:</span>
                  <span className="font-medium">{invoice.projectName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-lg text-pink-600">{formatAmount(invoice.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{invoice.dueDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{invoice.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                    {invoice.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">What happens when you submit?</h4>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>The invoice status will change from "Draft" to "Sent"</li>
                        <li>The client will receive a notification</li>
                        <li>The invoice will be available for payment</li>
                        <li>You can track payment status in real-time</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                <Textarea
                  id="additionalNotes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Add any additional notes or instructions for the client..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Invoice'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}