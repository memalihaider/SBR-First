'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';

interface Doc {
  id: number;
  name: string;
  url: string;
  type: string;
  size?: string;
  uploadedBy?: string;
  uploadedDate?: string;
  shared?: boolean;
  category?: string;
}

interface Props {
  doc: Doc;
  children: React.ReactNode;
}

export default function DocumentDetailsDialog({ doc, children }: Props) {
  const handleOpen = () => {
    window.open(doc.url, '_blank');
  };

  const handleDownload = () => {
    // attempt to download via anchor (may be cross-origin)
    const a = document.createElement('a');
    a.href = doc.url;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{doc.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600">Category: {doc.category}</p>
          <p className="text-sm text-gray-600">Uploaded by: {doc.uploadedBy}</p>
          <p className="text-sm text-gray-600">Uploaded: {new Date(doc.uploadedDate || '').toLocaleDateString()}</p>
          <Separator />
          <div className="flex justify-end space-x-2">
            <Button onClick={handleOpen} className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4" />
              <span>Open</span>
            </Button>
            <Button onClick={handleDownload} className="flex items-center space-x-2">
              <span>Download</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

