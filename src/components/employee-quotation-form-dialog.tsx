'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface QuotationItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number; // absolute
  tax: number; // percentage
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

interface Template {
  id: number;
  name: string;
  description?: string;
  items: QuotationItem[];
}

interface Props {
  templates?: Template[];
  onCreate: (q: Quotation) => void;
  initialTemplateId?: number | null;
  children: React.ReactNode;
}

export default function EmployeeQuotationFormDialog({ templates = [], onCreate, initialTemplateId = null, children }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('New Quotation');
  const [client, setClient] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [validDays, setValidDays] = useState(30);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(initialTemplateId ? initialTemplateId.toString() : undefined);

  useEffect(() => {
    if (selectedTemplate) {
      const t = templates.find((tpl) => tpl.id.toString() === selectedTemplate);
      if (t) setItems(t.items.map((it) => ({ ...it })));
    }
  }, [selectedTemplate, templates]);

  const addItem = () => {
    const newItem: QuotationItem = {
      id: `i-${Date.now()}`,
      description: 'New item',
      qty: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
    };
    setItems((s) => [...s, newItem]);
  };

  const updateItem = (id: string, patch: Partial<QuotationItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const totalDiscount = items.reduce((s, it) => s + it.discount, 0);
  const totalTax = items.reduce((s, it) => s + ((it.qty * it.unitPrice - it.discount) * it.tax) / 100, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  const handleCreate = () => {
    if (!client) return toast.error('Please enter client name');
    const newQuotation: Quotation = {
      id: Date.now(),
      title,
      client,
      items,
      totalAmount: Math.round(grandTotal),
      status: 'draft',
      submittedDate: new Date().toISOString(),
      validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString(),
    };
    onCreate(newQuotation);
    toast.success('Quotation created (mock)');
    setOpen(false);
    // reset
    setTitle('New Quotation');
    setClient('');
    setItems([]);
    setSelectedTemplate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quotation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Client</Label>
              <Input value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Template</Label>
              <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Items</h4>
              <div>
                <Button onClick={addItem} size="sm">Add Item</Button>
              </div>
            </div>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                  <Input value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} className="md:col-span-2" />
                  <Input type="number" value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} />
                  <Input type="number" value={it.unitPrice} onChange={(e) => updateItem(it.id, { unitPrice: Number(e.target.value) })} />
                  <Input type="number" value={it.discount} onChange={(e) => updateItem(it.id, { discount: Number(e.target.value) })} />
                  <Input type="number" value={it.tax} onChange={(e) => updateItem(it.id, { tax: Number(e.target.value) })} />
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => removeItem(it.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Validity (days)</Label>
              <Input type="number" value={validDays} onChange={(e) => setValidDays(Number(e.target.value))} />
            </div>
            <div className="text-right">
              <p className="text-sm">Subtotal: ${subtotal.toLocaleString()}</p>
              <p className="text-sm">Discount: ${totalDiscount.toLocaleString()}</p>
              <p className="text-sm">Tax: ${totalTax.toLocaleString()}</p>
              <p className="font-bold text-lg">Total: ${grandTotal.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
