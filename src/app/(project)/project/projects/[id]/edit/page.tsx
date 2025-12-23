'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import mockData from '@/lib/mock-data';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    customerId: '',
    status: 'planning' as const,

    // Project Details
    type: 'installation' as const,
    priority: 'medium' as const,
    objectives: '',
    scope: '',
    deliverables: '',

    // Timeline & Budget
    startDate: '',
    endDate: '',
    budgetAmount: '',
    contingencyBudget: '',
    currency: 'AED',

    // Team & Resources
    projectManager: '',
    teamMembers: [] as string[],
    requiredSkills: [] as string[],

    // Milestones
    milestones: [] as Array<{ name: string; description: string; dueDate: string; deliverables: string }>,

    // Risk Assessment
    riskLevel: 'low' as const,
    riskDescription: '',
    mitigationPlan: '',

    // Additional Information
    tags: [] as string[],
    notes: '',
    stakeholders: '',
  });

  const [currentMilestone, setCurrentMilestone] = useState({
    name: '',
    description: '',
    dueDate: '',
    deliverables: '',
  });

  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (params.id) {
      const foundProject = mockData.projects.find(p => p.id === params.id);
      if (foundProject) {
        setProject(foundProject);
        setFormData({
          name: foundProject.name,
          description: foundProject.description,
          customerId: foundProject.customerId,
          startDate: foundProject.startDate.toISOString().split('T')[0],
          endDate: foundProject.endDate.toISOString().split('T')[0],
          budgetAmount: foundProject.budgetAmount.toString(),
          status: foundProject.status as any,

          // Default values for new fields
          type: (foundProject.type as any) || 'installation',
          priority: 'medium',
          objectives: '',
          scope: '',
          deliverables: '',
          contingencyBudget: '',
          currency: 'AED',
          projectManager: foundProject.projectManager || '',
          teamMembers: foundProject.teamMembers || [],
          requiredSkills: [],
          milestones: foundProject.milestones?.map(m => ({
            name: m.name,
            description: m.description,
            dueDate: m.dueDate.toISOString().split('T')[0],
            deliverables: m.deliverables?.join(', ') || '',
          })) || [],
          riskLevel: 'low',
          riskDescription: '',
          mitigationPlan: '',
          tags: [],
          notes: '',
          stakeholders: '',
        });
      }
    }
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the database
    console.log('Updating project:', formData);
    router.push(`/project/projects/${params.id}`);
  };

  const handleCancel = () => {
    router.push(`/project/projects/${params.id}`);
  };

  const addMilestone = () => {
    if (currentMilestone.name && currentMilestone.dueDate) {
      setFormData({
        ...formData,
        milestones: [...formData.milestones, currentMilestone],
      });
      setCurrentMilestone({ name: '', description: '', dueDate: '', deliverables: '' });
    }
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag],
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const toggleTeamMember = (employeeId: string) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.includes(employeeId)
        ? formData.teamMembers.filter(id => id !== employeeId)
        : [...formData.teamMembers, employeeId],
    });
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push('/project/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
          <p className="text-gray-600 mt-1">Update project details and information</p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer">Customer *</Label>
                <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed project description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Project Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="supply_only">Supply Only</SelectItem>
                    <SelectItem value="turnkey">Turnkey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="objectives">Project Objectives</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="What are the main objectives of this project?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scope">Project Scope</Label>
                <Textarea
                  id="scope"
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  placeholder="Define the project scope and boundaries"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="deliverables">Key Deliverables</Label>
                <Textarea
                  id="deliverables"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  placeholder="List the main deliverables"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget">Budget Amount</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                  placeholder="Enter budget amount"
                />
              </div>

              <div>
                <Label htmlFor="contingency">Contingency Budget</Label>
                <Input
                  id="contingency"
                  type="number"
                  value={formData.contingencyBudget}
                  onChange={(e) => setFormData({ ...formData, contingencyBudget: e.target.value })}
                  placeholder="Contingency amount"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="AED">AED (د.إ)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team & Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Team & Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectManager">Project Manager</Label>
              <Select value={formData.projectManager} onValueChange={(value) => setFormData({ ...formData, projectManager: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project manager" />
                </SelectTrigger>
                <SelectContent>
                  {mockData.employees.filter(e => e.isActive).map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Team Members</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {mockData.employees.filter(e => e.isActive).map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`team-${employee.id}`}
                      checked={formData.teamMembers.includes(employee.id)}
                      onCheckedChange={() => toggleTeamMember(employee.id)}
                    />
                    <Label htmlFor={`team-${employee.id}`} className="text-sm">
                      {employee.firstName} {employee.lastName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="requiredSkills">Required Skills</Label>
              <Input
                id="requiredSkills"
                value={formData.requiredSkills.join(', ')}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                placeholder="Enter required skills (comma separated)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Project Milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="milestoneName">Milestone Name</Label>
                <Input
                  id="milestoneName"
                  value={currentMilestone.name}
                  onChange={(e) => setCurrentMilestone({ ...currentMilestone, name: e.target.value })}
                  placeholder="Milestone name"
                />
              </div>
              <div>
                <Label htmlFor="milestoneDueDate">Due Date</Label>
                <Input
                  id="milestoneDueDate"
                  type="date"
                  value={currentMilestone.dueDate}
                  onChange={(e) => setCurrentMilestone({ ...currentMilestone, dueDate: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>&nbsp;</Label>
                <Button type="button" onClick={addMilestone} className="w-full">
                  Add Milestone
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="milestoneDescription">Description</Label>
              <Textarea
                id="milestoneDescription"
                value={currentMilestone.description}
                onChange={(e) => setCurrentMilestone({ ...currentMilestone, description: e.target.value })}
                placeholder="Milestone description"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="milestoneDeliverables">Deliverables</Label>
              <Input
                id="milestoneDeliverables"
                value={currentMilestone.deliverables}
                onChange={(e) => setCurrentMilestone({ ...currentMilestone, deliverables: e.target.value })}
                placeholder="Key deliverables for this milestone"
              />
            </div>

            {formData.milestones.length > 0 && (
              <div className="space-y-2">
                <Label>Added Milestones</Label>
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{milestone.name}</h4>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMilestone(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select value={formData.riskLevel} onValueChange={(value: any) => setFormData({ ...formData, riskLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="riskDescription">Risk Description</Label>
              <Textarea
                id="riskDescription"
                value={formData.riskDescription}
                onChange={(e) => setFormData({ ...formData, riskDescription: e.target.value })}
                placeholder="Describe potential risks and challenges"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="mitigationPlan">Mitigation Plan</Label>
              <Textarea
                id="mitigationPlan"
                value={formData.mitigationPlan}
                onChange={(e) => setFormData({ ...formData, mitigationPlan: e.target.value })}
                placeholder="How will you mitigate identified risks?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="stakeholders">Key Stakeholders</Label>
              <Textarea
                id="stakeholders"
                value={formData.stakeholders}
                onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
                placeholder="List key stakeholders and their roles"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes or comments"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
            Update Project
          </Button>
        </div>
      </form>
    </div>
  );
}