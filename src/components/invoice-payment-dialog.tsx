'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Invoice {
  id: number;
  invoiceNumber: string;
  amount: string;
  status: string;
}

interface Props {
  invoice: Invoice;
  onPay: (id: number, method: string) => void;
  children: React.ReactNode;
}

export default function InvoicePaymentDialog({ invoice, onPay, children }: Props) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState('Company Card');

  const handlePay = () => {
    onPay(invoice.id, method);
    toast.success('Payment recorded (mock)');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <p className="text-sm">Invoice: {invoice.invoiceNumber}</p>
            <p className="text-sm font-semibold">Amount: ${Number(invoice.amount).toLocaleString()}</p>
          </div>
          <div>
            <Label className="text-xs">Payment Method</Label>
            <Input value={method} onChange={(e) => setMethod(e.target.value)} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handlePay}>Record Payment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
