'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Item {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  projectName: string;
  description: string;
  issueDate: Date;
  validUntil: Date;
  amount: number;
  status: string;
  items: Item[];
  notes?: string;
}

interface Props {
  children: React.ReactNode;
  quotation: Quotation;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onSend?: (id: string) => void;
}

export default function ClientQuotationDetailsDialog({ children, quotation, onAccept, onDecline, onSend }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quotation.quotationNumber} — {quotation.projectName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <p className="text-sm text-gray-600">Issue Date: {new Date(quotation.issueDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Status: {quotation.status}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-gray-700">Items</p>
            <div className="mt-2 space-y-2">
              {quotation.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{it.description} x{it.quantity}</span>
                  <span className="font-medium">${it.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {quotation.notes && (
            <div className="p-3 bg-blue-50 rounded border border-blue-100">
              <p className="text-sm text-blue-700">{quotation.notes}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onSend?.(quotation.id)}>Send</Button>
            <Button variant="destructive" onClick={() => onDecline?.(quotation.id)}>Decline</Button>
            <Button onClick={() => onAccept?.(quotation.id)}>Accept</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
