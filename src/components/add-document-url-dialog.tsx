'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Doc {
  id: number;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  shared: boolean;
  category: string;
}

interface Props {
  categories?: string[];
  onAdd: (d: Doc) => void;
  children: React.ReactNode;
}

export default function AddDocumentUrlDialog({ categories = [], onAdd, children }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'General');

  const handleAdd = () => {
    if (!name || !url) return toast.error('Please provide name and URL');
    const doc: Doc = {
      id: Date.now(),
      name,
      url,
      type: 'Document',
      size: '-',
      uploadedBy: 'You',
      uploadedDate: new Date().toISOString(),
      shared: false,
      category,
    };
    onAdd(doc);
    toast.success('Document added');
    setOpen(false);
    setName('');
    setUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Document by URL</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-xs">Document Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Document URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
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
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Document</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
