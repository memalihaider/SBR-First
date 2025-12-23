'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Doc {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  shared: boolean;
  category: string;
}

interface Props {
  categories?: string[];
  onUpload: (d: Doc) => void;
  children: React.ReactNode;
}

export default function UploadDocumentDialog({ categories = [], onUpload, children }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Document');
  const [size, setSize] = useState('0.0');
  const [category, setCategory] = useState(categories[0] ?? 'Other');
  const [shared, setShared] = useState(false);

  const handleUpload = () => {
    if (!name) return toast.error('Please provide a file name');
    const doc: Doc = {
      id: Date.now(),
      name,
      type,
      size: `${Number(size).toFixed(2)} MB`,
      uploadedBy: 'You',
      uploadedDate: new Date().toISOString(),
      shared,
      category,
    };
    onUpload(doc);
    toast.success('Document uploaded (mock)');
    setOpen(false);
    setName(''); setSize('0.0'); setShared(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-xs">File name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Project Plan.pdf" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Type</Label>
              <Input value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Size (MB)</Label>
              <Input type="number" value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center">
            <Checkbox checked={shared} onCheckedChange={(v) => setShared(Boolean(v))} />
            <Label className="ml-2 text-sm">Share with team</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
