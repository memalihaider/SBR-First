'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  children: React.ReactNode;
  invoiceId: string;
  onPay: (id: string, method: string, receipt?: string) => void;
}

export default function PayInvoiceDialog({ children, invoiceId, onPay }: Props) {
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [receipt, setReceipt] = useState<File | null>(null);

  const handlePay = () => {
    const receiptName = receipt ? receipt.name : undefined;
    onPay(invoiceId, paymentMethod, receiptName);
    alert('Payment processed (mock). Receipt uploaded: ' + (receiptName || 'None'));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Pay Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-3">
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <Select onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Upload Payment Receipt (Optional)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePay}>Confirm Payment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}