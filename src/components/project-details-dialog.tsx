'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FolderOpen } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: string;
  dueDate: string;
  teamSize: number;
  priority: string;
  manager: string;
}

interface Props {
  project: Project;
  children: React.ReactNode;
}

export default function ProjectDetailsDialog({ project, children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-gray-700" />
            <span>Project Details</span>
          </DialogTitle>
          <DialogDescription>{project.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600">{project.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Manager</p>
              <p className="font-medium">{project.manager}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Team Size</p>
              <p className="font-medium">{project.teamSize}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Priority</p>
              <p className="font-medium">{project.priority}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Progress</p>
              <p className="font-semibold">{project.progress}%</p>
            </div>
            <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => window.alert('Open in full page (not implemented)')}>
              Open Full Page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
