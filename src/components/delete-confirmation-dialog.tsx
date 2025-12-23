'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  title?: string;
  description?: string;
  onConfirm: () => void;
  children: React.ReactNode;
}

export default function DeleteConfirmationDialog({ title = 'Confirm delete', description = 'This action cannot be undone.', onConfirm, children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600">{description}</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => { /* dialog will close automatically */ }}>Cancel</Button>
            <Button onClick={onConfirm}>Delete</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
