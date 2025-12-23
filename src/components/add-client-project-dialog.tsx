'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  children: React.ReactNode;
  onCreate: (project: any) => void;
}

export default function AddClientProjectDialog({ children, onCreate }: Props) {
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [value, setValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a project name.');
      return;
    }

    const project = {
      id: Date.now(),
      name: name.trim(),
      manager: manager || 'Unassigned',
      value: value || '$0',
      startDate: startDate || new Date().toISOString().slice(0, 10),
      completionDate: completionDate || '',
      status: 'planning',
      progress: 0,
    };

    onCreate(project);
    setName('');
    setManager('');
    setValue('');
    setStartDate('');
    setCompletionDate('');
    alert('Project created (mock).');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-3">
          <div>
            <label className="text-sm font-medium">Project Name</label>
            <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Project Manager</label>
            <Input value={manager} onChange={(e) => setManager((e.target as HTMLInputElement).value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Value</label>
            <Input value={value} onChange={(e) => setValue((e.target as HTMLInputElement).value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate((e.target as HTMLInputElement).value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Completion Date</label>
              <Input type="date" value={completionDate} onChange={(e) => setCompletionDate((e.target as HTMLInputElement).value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
