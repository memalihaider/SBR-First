'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  categories?: string[];
  onCreate: (i: Invoice) => void;
  children: React.ReactNode;
}

export default function EmployeeInvoiceFormDialog({ categories = [], onCreate, children }: Props) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState(categories[0] ?? 'Other');
  const [dueDate, setDueDate] = useState<string>(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  const handleSubmit = () => {
    if (!description || Number(amount) <= 0) return toast.error('Please enter description and valid amount');
    const invoice: Invoice = {
      id: Date.now(),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      description,
      amount: Number(amount).toFixed(2),
      status: 'pending',
      dueDate,
      issuedDate: new Date().toISOString(),
      category,
    };
    onCreate(invoice);
    toast.success('Expense submitted (mock)');
    setOpen(false);
    setDescription('');
    setAmount('0');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-xs">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Amount</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
