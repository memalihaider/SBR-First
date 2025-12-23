'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';

interface QuotationItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
}

interface Quotation {
  id: number;
  title: string;
  client: string;
  items: QuotationItem[];
  totalAmount: number;
  status: string;
  submittedDate: string;
  validUntil: string;
}

interface Props {
  quotation: Quotation;
  children: React.ReactNode;
}

export default function QuotationDetailsDialog({ quotation, children }: Props) {
  const handleDownload = () => {
    // simple mocked download
    const blob = new Blob([`Quotation: ${quotation.title}\nClient: ${quotation.client}\nTotal: ${quotation.totalAmount}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quotation.title.replace(/\s+/g, '_')}_quotation.txt`;
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
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quotation.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <p className="text-sm text-gray-600">Client</p>
            <p className="font-medium">{quotation.client}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            {quotation.items.map((it) => (
              <div key={it.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{it.description}</p>
                  <p className="text-xs text-gray-500">{it.qty} × ${it.unitPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(it.qty * it.unitPrice - it.discount + ((it.qty * it.unitPrice - it.discount) * it.tax) / 100).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">Submitted: {new Date(quotation.submittedDate).toLocaleDateString()}</p>
              <p className="text-sm">Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleDownload} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
