'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Project {
  id: number;
  name: string;
  manager?: string;
  value?: string;
  startDate?: string;
  completionDate?: string;
  status?: string;
  progress?: number;
}

interface Props {
  project: Project;
  children: React.ReactNode;
  onEdit?: (projectId: number) => void;
  onDelete?: (projectId: number) => void;
}

export default function ClientProjectDetailsDialog({ project, children, onEdit, onDelete }: Props) {
  const handleEdit = () => {
    const newName = prompt('Edit project name (mock):', project.name);
    if (newName && onEdit) {
      // caller will implement the actual edit
      onEdit(project.id);
      alert('Project edit simulated (mock).');
    }
  };

  const handleDelete = () => {
    if (confirm('Delete project? This is a mock action.')) {
      if (onDelete) onDelete(project.id);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <p className="text-sm text-gray-600">Manager: {project.manager}</p>
          <p className="text-sm text-gray-600">Value: {project.value}</p>
          <p className="text-sm text-gray-600">Start: {project.startDate}</p>
          <p className="text-sm text-gray-600">Completion: {project.completionDate}</p>
          <p className="text-sm text-gray-600">Status: {project.status}</p>
          <Separator />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleEdit}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
