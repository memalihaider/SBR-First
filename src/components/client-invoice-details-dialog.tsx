'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Invoice } from '@/types';

interface Props {
  children: React.ReactNode;
  invoice: Invoice;
}

export default function ClientInvoiceDetailsDialog({ children, invoice }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice.invoiceNumber} — {invoice.projectName || 'No Project'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <p className="text-sm text-gray-600">Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Status: {invoice.status}</p>
            {invoice.paidDate && <p className="text-sm text-gray-600">Paid Date: {new Date(invoice.paidDate).toLocaleDateString()}</p>}
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-gray-700">Items</p>
            <div className="mt-2 space-y-2">
              {invoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{it.description} x{it.quantity}</span>
                  <span className="font-medium">${it.totalPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-sm font-medium">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Tax:</span>
            <span>${invoice.totalTaxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${invoice.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}