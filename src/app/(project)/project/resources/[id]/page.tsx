'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import mockData from '@/lib/mock-data';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  skills: string[];
  currentProjects: number;
  totalCapacity: number;
  allocatedHours: number;
  availability: 'available' | 'partial' | 'full' | 'overloaded';
  projectAssignments: {
    projectId: string;
    projectName: string;
    role: string;
    allocatedHours: number;
    startDate: Date;
    endDate: Date;
  }[];
  hourlyRate?: number;
  manager?: string;
  startDate: Date;
  isActive: boolean;
}

export default function ResourceProfilePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const resourceId = params.id as string;

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    projectId: '',
    role: '',
    allocatedHours: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  // Check if assignment action is requested in URL
  useEffect(() => {
    if (searchParams.get('action') === 'assign') {
      setIsAssignDialogOpen(true);
      // Clean up the URL
      router.replace(`/project/resources/${resourceId}`, { scroll: false });
    }
  }, [searchParams, resourceId, router]);

  // Mock data for the specific resource
  const resource: TeamMember = {
    id: resourceId,
    name: `Team Member ${resourceId.split('-')[1]}`,
    role: 'Senior Developer',
    email: `member${resourceId.split('-')[1]}@company.com`,
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    currentProjects: 2,
    totalCapacity: 40,
    allocatedHours: 32,
    availability: 'partial',
    hourlyRate: 75,
    manager: 'John Smith',
    startDate: new Date('2024-01-15'),
    isActive: true,
    projectAssignments: [
      {
        projectId: 'PROJ-001',
        projectName: 'E-commerce Platform',
        role: 'Lead Developer',
        allocatedHours: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
      },
      {
        projectId: 'PROJ-002',
        projectName: 'Mobile App',
        role: 'Senior Developer',
        allocatedHours: 12,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-05-31'),
      },
    ],
  };

  const handleAssignToProject = () => {
    // In a real app, this would assign the resource to the project
    console.log('Assigning resource to project:', assignmentForm);
    setIsAssignDialogOpen(false);
    setAssignmentForm({
      projectId: '',
      role: '',
      allocatedHours: '',
      startDate: '',
      endDate: '',
      notes: '',
    });
  };

  const handleEditResource = () => {
    router.push(`/project/resources/${resourceId}/edit`);
  };

  const handleBackToResources = () => {
    router.push('/project/resources');
  };

  const utilizationRate = Math.round((resource.allocatedHours / resource.totalCapacity) * 100);

  const getAvailabilityBadge = (availability: string) => {
    const badges: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      full: 'bg-orange-100 text-orange-800',
      overloaded: 'bg-red-100 text-red-800',
    };
    return badges[availability] || 'bg-gray-100 text-gray-800';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 50) return 'bg-green-500';
    if (utilization < 80) return 'bg-yellow-500';
    if (utilization <= 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToResources}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Resources
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{resource.name}</h1>
            <p className="text-gray-600 mt-1">{resource.role} • {resource.department}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleEditResource}>
            Edit Profile
          </Button>
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Assign to Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign {resource.name} to Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Select value={assignmentForm.projectId} onValueChange={(value) => setAssignmentForm({ ...assignmentForm, projectId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
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
                  <Label htmlFor="role">Role in Project</Label>
                  <Input
                    id="role"
                    value={assignmentForm.role}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, role: e.target.value })}
                    placeholder="e.g., Senior Developer, Lead, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="allocatedHours">Hours per Week</Label>
                    <Input
                      id="allocatedHours"
                      type="number"
                      value={assignmentForm.allocatedHours}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, allocatedHours: e.target.value })}
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={assignmentForm.startDate}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, startDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={assignmentForm.endDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, endDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={assignmentForm.notes}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                    placeholder="Additional notes or requirements"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignToProject} className="bg-purple-600 hover:bg-purple-700 text-white">
                    Assign Resource
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 bg-purple-600 text-white">
                <AvatarFallback className="text-2xl">
                  {resource.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{resource.name}</h3>
                <p className="text-gray-600">{resource.role}</p>
                <Badge className={getAvailabilityBadge(resource.availability)}>
                  {resource.availability.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{resource.email}</span>
              </div>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm">{resource.department}</span>
              </div>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Started {resource.startDate.toLocaleDateString()}</span>
              </div>

              {resource.manager && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">Reports to {resource.manager}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Capacity & Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Capacity & Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Current Utilization</p>
                <span className="text-sm font-semibold text-gray-900">{utilizationRate}%</span>
              </div>
              <Progress value={Math.min(utilizationRate, 100)} className="h-3" />
              <p className="text-xs text-gray-500 mt-1">
                {resource.allocatedHours}h / {resource.totalCapacity}h per week
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{resource.totalCapacity}</p>
                <p className="text-xs text-gray-600">Total Capacity</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{resource.totalCapacity - resource.allocatedHours}</p>
                <p className="text-xs text-gray-600">Available Hours</p>
              </div>
            </div>

            {resource.hourlyRate && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">${resource.hourlyRate}</p>
                <p className="text-xs text-gray-600">Hourly Rate</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {resource.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Project Assignments</TabsTrigger>
          <TabsTrigger value="history">Work History</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Project Assignments ({resource.currentProjects})</CardTitle>
            </CardHeader>
            <CardContent>
              {resource.projectAssignments.length > 0 ? (
                <div className="space-y-4">
                  {resource.projectAssignments.map((assignment) => (
                    <div key={assignment.projectId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{assignment.projectName}</h4>
                        <Badge variant="outline">{assignment.role}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Allocated Hours</p>
                          <p className="font-medium">{assignment.allocatedHours}h/week</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-medium">{assignment.startDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">End Date</p>
                          <p className="font-medium">{assignment.endDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Progress</p>
                          <p className="font-medium">75%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No current project assignments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium">Joined Company</h4>
                    <span className="text-sm text-gray-500">{resource.startDate.toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">Started as {resource.role} in {resource.department}</p>
                </div>

                <div className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h4 className="font-medium">First Project Assignment</h4>
                    <span className="text-sm text-gray-500">Jan 2024</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">Assigned to E-commerce Platform project</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">95%</p>
                  <p className="text-sm text-gray-600">Task Completion Rate</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">4.8</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">12</p>
                  <p className="text-sm text-gray-600">Projects Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}