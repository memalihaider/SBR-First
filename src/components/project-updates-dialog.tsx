'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

interface UpdateItem {
  id: number;
  project: string;
  update: string;
  author: string;
  timestamp: string;
  type: string;
}

interface Props {
  updates: UpdateItem[];
  children: React.ReactNode;
}

export default function ProjectUpdatesDialog({ updates, children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-gray-700" />
            <span>Project Updates</span>
          </DialogTitle>
          <DialogDescription>Recent updates for the selected project</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {updates.length === 0 ? (
            <p className="text-sm text-gray-600">No updates yet.</p>
          ) : (
            updates.map((u) => (
              <div key={u.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{u.project}</p>
                  <Badge className="text-xs">{u.type}</Badge>
                </div>
                <p className="text-sm text-gray-700">{u.update}</p>
                <p className="text-xs text-gray-500 mt-2">{u.author} • {new Date(u.timestamp).toLocaleString()}</p>
              </div>
            ))
          )}

          <Separator />

          <div className="flex justify-end">
            <Button onClick={() => window.alert('Open updates page (not implemented)')}>Open Updates Page</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
