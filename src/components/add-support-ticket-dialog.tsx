'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewTicket {
  title: string;
  description: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface Props {
  children: React.ReactNode;
  onCreate: (ticket: any) => void;
}

export default function AddSupportTicketDialog({ children, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      // simple client-side validation
      alert('Please provide a title and description for the ticket.');
      return;
    }

    const ticket = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      status: 'open',
      priority,
      category,
      createdDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      assignedTo: 'Support Team',
      responses: 0,
    };

    onCreate(ticket);
    // reset form
    setTitle('');
    setDescription('');
    setCategory('General');
    setPriority('medium');
    // close dialog by clicking done: we'll rely on user closing via UI after submission
    // but since this Dialog uses DialogTrigger as child, we keep this minimal.
    alert('Ticket submitted (mock).');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input value={category} onChange={(e) => setCategory((e.target as HTMLInputElement).value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Submit Ticket</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
