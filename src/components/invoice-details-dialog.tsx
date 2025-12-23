'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  description: string;
  amount: string;
  status: string;
  dueDate: string;
  issuedDate: string;
  category: string;
}

interface Props {
  invoice: Invoice;
  children: React.ReactNode;
}

export default function InvoiceDetailsDialog({ invoice, children }: Props) {
  const handleDownload = () => {
    const content = `Invoice: ${invoice.invoiceNumber}\nDescription: ${invoice.description}\nAmount: $${invoice.amount}\nIssued: ${new Date(invoice.issuedDate).toLocaleDateString()}\nDue: ${new Date(invoice.dueDate).toLocaleDateString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <p className="text-sm text-gray-600">{invoice.description}</p>
            <p className="text-sm text-gray-600">Category: {invoice.category}</p>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">Issued: {new Date(invoice.issuedDate).toLocaleDateString()}</p>
              <p className="text-sm">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">${Number(invoice.amount).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleDownload} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
