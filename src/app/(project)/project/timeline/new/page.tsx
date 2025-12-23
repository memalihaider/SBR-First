'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import mockData from '@/lib/mock-data';

export default function NewMilestonePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    dueDate: '',
    deliverables: '',
    priority: 'medium' as const,
    isCompleted: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create the milestone in the database
    console.log('Creating milestone:', formData);
    router.push('/project/timeline');
  };

  const handleCancel = () => {
    router.push('/project/timeline');
  };

  const selectedProject = mockData.projects.find(p => p.id === formData.projectId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Milestone</h1>
          <p className="text-gray-600 mt-1">Create a milestone for your project timeline</p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Milestone Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project">Project *</Label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Milestone Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter milestone name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this milestone represents"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="isCompleted"
                  checked={formData.isCompleted}
                  onCheckedChange={(checked) => setFormData({ ...formData, isCompleted: checked as boolean })}
                />
                <Label htmlFor="isCompleted">Mark as completed</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="deliverables">Key Deliverables</Label>
              <Textarea
                id="deliverables"
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                placeholder="List the key deliverables for this milestone"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Project Context */}
        {selectedProject && (
          <Card>
            <CardHeader>
              <CardTitle>Project Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Project:</span>
                  <span className="text-gray-900">{selectedProject.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="text-gray-900 capitalize">{selectedProject.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Start Date:</span>
                  <span className="text-gray-900">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">End Date:</span>
                  <span className="text-gray-900">{new Date(selectedProject.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Team Members:</span>
                  <span className="text-gray-900">{selectedProject.teamMembers.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
            Create Milestone
          </Button>
        </div>
      </form>
    </div>
  );
}