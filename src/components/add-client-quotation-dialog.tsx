'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Item {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Props {
  children: React.ReactNode;
  onCreate: (q: any) => void;
}

export default function AddClientQuotationDialog({ children, onCreate }: Props) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Item[]>([{
    description: 'Installation and Setup',
    quantity: 1,
    unitPrice: 10000,
    amount: 10000,
  }]);

  const totalAmount = items.reduce((s, it) => s + (it.amount || it.quantity * it.unitPrice), 0);

  const addItem = () => setItems((i) => [...i, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);

  const updateItem = (idx: number, patch: Partial<Item>) =>
    setItems((i) => i.map((it, j) => (j === idx ? { ...it, ...patch, amount: (patch.quantity ?? it.quantity) * (patch.unitPrice ?? it.unitPrice) } : it)));

  const handleSubmit = () => {
    if (!projectName.trim()) {
      alert('Please provide a project name');
      return;
    }

    const quotation = {
      id: `QUOT-${Date.now()}`,
      quotationNumber: `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      projectName: projectName.trim(),
      description: description.trim(),
      issueDate: new Date(issueDate),
      validUntil: new Date(validUntil),
      amount: totalAmount,
      status: 'draft',
      items,
      notes,
    };

    onCreate(quotation);
    alert('Quotation created (mock).');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Request Quotation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-3">
          <div>
            <label className="text-sm font-medium">Project</label>
            <Input value={projectName} onChange={(e) => setProjectName((e.target as HTMLInputElement).value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Issue Date</label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate((e.target as HTMLInputElement).value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Valid Until</label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil((e.target as HTMLInputElement).value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Items</label>
            <div className="space-y-2 mt-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <Input placeholder="Description" value={it.description} onChange={(e) => updateItem(idx, { description: (e.target as HTMLInputElement).value })} />
                  <Input type="number" value={String(it.quantity)} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                  <Input type="number" value={String(it.unitPrice)} onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} />
                </div>
              ))}
              <div className="pt-2">
                <Button variant="ghost" onClick={addItem}>Add Item</Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Notes</div>
            <div className="font-semibold">Total: ${totalAmount.toLocaleString()}</div>
          </div>
          <Textarea value={notes} onChange={(e) => setNotes((e.target as HTMLTextAreaElement).value)} />

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Create Quotation</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
