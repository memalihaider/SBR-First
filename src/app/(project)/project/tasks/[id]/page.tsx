'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import mockData from '@/lib/mock-data';

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  assignedTo: string;
  assigneeName: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  createdDate: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours?: number;
  tags?: string[];
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'medium' as const,
    status: 'todo' as const,
    dueDate: '',
    estimatedHours: '',
    actualHours: '',
    tags: [] as string[],
  });

  const [currentTag, setCurrentTag] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'John Doe',
      content: 'Task has been created and assigned.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      author: 'Jane Smith',
      content: 'Started working on the implementation.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [newComment, setNewComment] = useState('');

  // Quick action states
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [isAttachFileOpen, setIsAttachFileOpen] = useState(false);
  const [isShareTaskOpen, setIsShareTaskOpen] = useState(false);
  const [logTimeData, setLogTimeData] = useState({
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [shareEmail, setShareEmail] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (params.id) {
      // Mock task data - in a real app, this would fetch from API
      const mockTask: Task = {
        id: params.id as string,
        title: `Task ${params.id}`,
        description: 'Complete the implementation of the new feature according to specifications.',
        projectId: 'PROJ-001',
        projectName: 'Website Redesign',
        assignedTo: 'EMP-001',
        assigneeName: 'John Doe',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estimatedHours: 16,
        actualHours: 8,
        tags: ['frontend', 'ui', 'urgent'],
      };

      setTask(mockTask);
      setFormData({
        title: mockTask.title,
        description: mockTask.description,
        projectId: mockTask.projectId,
        assignedTo: mockTask.assignedTo,
        priority: mockTask.priority as any,
        status: mockTask.status as any,
        dueDate: mockTask.dueDate.toISOString().split('T')[0],
        estimatedHours: mockTask.estimatedHours.toString(),
        actualHours: mockTask.actualHours?.toString() || '',
        tags: mockTask.tags || [],
      });
    }
  }, [params.id]);

  const handleSave = () => {
    // In a real app, this would update the task
    console.log('Updating task:', formData);
    setIsEditing(false);
    // Update the task state
    if (task) {
      setTask({
        ...task,
        ...formData,
        dueDate: new Date(formData.dueDate),
        estimatedHours: parseFloat(formData.estimatedHours),
        actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined,
        tags: formData.tags,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        assignedTo: task.assignedTo,
        priority: task.priority as any,
        status: task.status as any,
        dueDate: task.dueDate.toISOString().split('T')[0],
        estimatedHours: task.estimatedHours.toString(),
        actualHours: task.actualHours?.toString() || '',
        tags: task.tags || [],
      });
    }
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

  const addComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: 'Current User',
          content: newComment,
          timestamp: new Date(),
        },
      ]);
      setNewComment('');
    }
  };

  // Quick action handlers
  const handleLogTime = () => {
    if (logTimeData.hours && logTimeData.description) {
      console.log('Logging time:', logTimeData);
      // In a real app, this would save to database
      setLogTimeData({ hours: '', description: '', date: new Date().toISOString().split('T')[0] });
      setIsLogTimeOpen(false);
      // Add to comments as well
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: 'Current User',
          content: `Logged ${logTimeData.hours} hours: ${logTimeData.description}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleAttachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments([...attachments, ...newFiles]);
      console.log('Attaching files:', newFiles);
      // In a real app, this would upload files
      setIsAttachFileOpen(false);
    }
  };

  const handleShareTask = () => {
    if (shareEmail) {
      console.log('Sharing task with:', shareEmail);
      // In a real app, this would send email
      setShareEmail('');
      setIsShareTaskOpen(false);
      // Add to comments
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: 'System',
          content: `Task shared with ${shareEmail}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleMarkComplete = () => {
    if (task) {
      const updatedTask = { ...task, status: 'done' as const, completedDate: new Date() };
      setTask(updatedTask);
      console.log('Task marked as complete:', updatedTask);
      // Add to comments
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: 'System',
          content: 'Task marked as completed',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      done: 'bg-green-100 text-green-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const getProgressPercentage = () => {
    if (!task) return 0;
    if (task.status === 'done') return 100;
    if (task.status === 'in_progress') return 50;
    if (task.status === 'review') return 75;
    return 0;
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/project/tasks')}>
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/project/tasks')}>
            ← Back to Tasks
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-600 mt-1">Task #{task.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Task
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleMarkComplete}>
                Mark Complete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{getProgressPercentage()}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Task Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="mt-1 text-gray-900">{task.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Priority</Label>
                          <div className="mt-1">
                            <Badge className={getPriorityBadge(task.priority)}>
                              {task.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Status</Label>
                          <div className="mt-1">
                            <Badge className={getStatusBadge(task.status)}>
                              {task.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                          <p className="mt-1 text-gray-900">{task.dueDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Estimated Hours</Label>
                          <p className="mt-1 text-gray-900">{task.estimatedHours}h</p>
                        </div>
                      </div>

                      {task.actualHours && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Actual Hours</Label>
                          <p className="mt-1 text-gray-900">{task.actualHours}h</p>
                        </div>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Tags</Label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-priority">Priority</Label>
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
                        <div>
                          <Label htmlFor="edit-status">Status</Label>
                          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-dueDate">Due Date</Label>
                          <Input
                            id="edit-dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-estimatedHours">Estimated Hours</Label>
                          <Input
                            id="edit-estimatedHours"
                            type="number"
                            value={formData.estimatedHours}
                            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-actualHours">Actual Hours</Label>
                        <Input
                          id="edit-actualHours"
                          type="number"
                          value={formData.actualHours}
                          onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
                        />
                      </div>

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
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">{comment.timestamp.toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <Label htmlFor="new-comment">Add Comment</Label>
                    <Textarea
                      id="new-comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                      className="mt-2"
                    />
                    <Button onClick={addComment} className="mt-2" disabled={!newComment.trim()}>
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Task created</p>
                        <p className="text-sm text-gray-500">{task.createdDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status changed to In Progress</p>
                        <p className="text-sm text-gray-500">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Comment added</p>
                        <p className="text-sm text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{task.projectName}</p>
                <Button variant="outline" size="sm" onClick={() => router.push(`/project/projects/${task.projectId}`)}>
                  View Project
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-medium">
                    {task.assigneeName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{task.assigneeName}</p>
                  <p className="text-sm text-gray-500">Team Member</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated</span>
                <span className="text-sm font-medium">{task.estimatedHours}h</span>
              </div>
              {task.actualHours && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actual</span>
                  <span className="text-sm font-medium">{task.actualHours}h</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className="text-sm font-medium">
                  {Math.max(0, task.estimatedHours - (task.actualHours || 0))}h
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Log Time
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Time</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="log-hours">Hours</Label>
                      <Input
                        id="log-hours"
                        type="number"
                        step="0.5"
                        min="0"
                        value={logTimeData.hours}
                        onChange={(e) => setLogTimeData({ ...logTimeData, hours: e.target.value })}
                        placeholder="Enter hours worked"
                      />
                    </div>
                    <div>
                      <Label htmlFor="log-date">Date</Label>
                      <Input
                        id="log-date"
                        type="date"
                        value={logTimeData.date}
                        onChange={(e) => setLogTimeData({ ...logTimeData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="log-description">Description</Label>
                      <Textarea
                        id="log-description"
                        value={logTimeData.description}
                        onChange={(e) => setLogTimeData({ ...logTimeData, description: e.target.value })}
                        placeholder="Describe the work completed"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsLogTimeOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleLogTime} disabled={!logTimeData.hours || !logTimeData.description}>
                        Log Time
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAttachFileOpen} onOpenChange={setIsAttachFileOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Attach File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Attach Files</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Select Files</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleAttachFile}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Supported formats: Images, PDF, Word documents, Text files
                      </p>
                    </div>
                    {attachments.length > 0 && (
                      <div>
                        <Label>Attached Files</Label>
                        <div className="space-y-2 mt-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{file.name}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isShareTaskOpen} onOpenChange={setIsShareTaskOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="share-email">Email Address</Label>
                      <Input
                        id="share-email"
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Task:</strong> {task.title}
                      </p>
                      <p className="text-sm text-blue-800 mt-1">
                        <strong>Project:</strong> {task.projectName}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsShareTaskOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleShareTask} disabled={!shareEmail}>
                        Share Task
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}