'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MoreVertical, Eye, Edit, Trash2, Calendar, User, Clock, FileText, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface Task {
  id?: string;
  title: string;
  description?: string;
  projectName: string;
  projectId: string;
  status: 'pending' | 'in progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  completedPercentage: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

interface Project {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
}

export default function ProjectTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'in progress' | 'completed'>('pending');

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    dueDate: '',
    estimatedHours: '',
    tags: [] as string[]
  });

  // Fetch projects from Firebase
  useEffect(() => {
    const fetchProjects = async () => {
      const snapshot = await getDocs(collection(db, 'projects'));
      const projectList: Project[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setProjects(projectList);
    };
    fetchProjects();
  }, []);

  // Fetch employees from employeeList collection
  const fetchEmployees = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'employeeList'));
      const employeeList: Employee[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name // Name field fetch karna
      }));
      setEmployees(employeeList);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch tasks from Firebase
  useEffect(() => {
    const fetchTasks = async () => {
      const snapshot = await getDocs(collection(db, 'tasks'));
      const taskList: Task[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Task)
      }));
      setTasks(taskList);
    };
    fetchTasks();
  }, []);

  // Create dialog open hone par employees fetch karo
  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      fetchEmployees();
    }
  }, [isCreateDialogOpen, isEditDialogOpen]);

  // Edit task ke liye form populate karo
  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours?.toString() || '',
      tags: task.tags || []
    });
    setIsEditDialogOpen(true);
  };

  // View task ke liye set karo
  const handleViewClick = (task: Task) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  // Delete task ke liye set karo
  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  // Status update ke liye set karo
  const handleStatusClick = (task: Task) => {
    setSelectedTask(task);
    setSelectedStatus(task.status);
    setIsStatusDialogOpen(true);
  };

  // Status update karo
  const handleStatusUpdate = async () => {
    if (!selectedTask?.id) return;

    const updatedTask = {
      ...selectedTask,
      status: selectedStatus,
      completedPercentage: selectedStatus === 'completed' ? 100 : selectedStatus === 'in progress' ? 50 : 0,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'tasks', selectedTask.id), updatedTask as any);
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id ? { ...updatedTask, id: selectedTask.id } : task
      ));
      setIsStatusDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Quick status update functions
  const handleQuickStatusUpdate = async (task: Task, newStatus: 'pending' | 'in progress' | 'completed') => {
    const updatedTask = {
      ...task,
      status: newStatus,
      completedPercentage: newStatus === 'completed' ? 100 : newStatus === 'in progress' ? 50 : 0,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'tasks', task.id!), updatedTask as any);
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...updatedTask, id: task.id } : t
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    const matchStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'in-progress'
        ? task.status === 'in progress'
        : task.status === filterStatus;
    const matchSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Stats
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (statusLower === 'in progress') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-800 border-red-200';
    if (priority === 'medium') return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="h-4 w-4" />;
    if (status === 'in progress') return <PlayCircle className="h-4 w-4" />;
    return <PauseCircle className="h-4 w-4" />;
  };

  // Create task
  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.projectId) return;

    const project = projects.find(p => p.id === taskForm.projectId);
    const newTask: Task = {
      ...taskForm,
      projectName: project?.name || '',
      status: 'pending',
      completedPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedHours: Number(taskForm.estimatedHours) || 0
    };

    const docRef = await addDoc(collection(db, 'tasks'), newTask);
    setTasks(prev => [...prev, { ...newTask, id: docRef.id }]);
    setIsCreateDialogOpen(false);

    setTaskForm({
      title: '',
      description: '',
      projectId: '',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      estimatedHours: '',
      tags: []
    });
  };

  // Update task
  const handleUpdateTask = async () => {
    if (!selectedTask?.id || !taskForm.title || !taskForm.projectId) return;

    const project = projects.find(p => p.id === taskForm.projectId);
    const updatedTask: Task = {
      ...selectedTask,
      ...taskForm,
      projectName: project?.name || '',
      updatedAt: new Date().toISOString(),
      estimatedHours: Number(taskForm.estimatedHours) || 0
    };

    try {
      await updateDoc(doc(db, 'tasks', selectedTask.id), updatedTask as any);
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id ? { ...updatedTask, id: selectedTask.id } : task
      ));
      setIsEditDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!selectedTask?.id) return;

    try {
      await deleteDoc(doc(db, 'tasks', selectedTask.id));
      setTasks(prev => prev.filter(task => task.id !== selectedTask.id));
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + Create Task */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600 mt-1">Manage tasks across all projects</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsCreateDialogOpen(true)}>
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Task Title *</Label>
                  <Input
                    placeholder="Enter task title"
                    value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={taskForm.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      setTaskForm({ ...taskForm, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter task description"
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project *</Label>
                  <Select
                    value={taskForm.projectId}
                    onValueChange={v => setTaskForm({ ...taskForm, projectId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Select 
                    value={taskForm.assignee} 
                    onValueChange={(value) => setTaskForm({ ...taskForm, assignee: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.name}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    placeholder="Enter hours"
                    value={taskForm.estimatedHours}
                    onChange={e => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} className="bg-red-600 hover:bg-red-700 text-white">
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <PauseCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Search */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 pt-6">
          <Input
            placeholder="Search tasks by title, project, or assignee..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            {['all', 'pending', 'in-progress', 'completed'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status as any)}
                className={
                  filterStatus === status 
                    ? status === 'completed' ? 'bg-green-600 hover:bg-green-700' 
                    : status === 'in-progress' ? 'bg-blue-600 hover:bg-blue-700'
                    : status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                    : ''
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredTasks.map(task => (
            <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                          <Badge className={getStatusBadge(task.status)}>{task.status}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Quick Status Updates */}
                        <DropdownMenuItem onClick={() => handleQuickStatusUpdate(task, 'pending')}>
                          <PauseCircle className="h-4 w-4 mr-2 text-yellow-600" />
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleQuickStatusUpdate(task, 'in progress')}>
                          <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleQuickStatusUpdate(task, 'completed')}>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Mark as Completed
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => handleViewClick(task)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(task)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => handleStatusClick(task)}
                          className="text-blue-600 focus:text-blue-600"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Change Status
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(task)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 ml-7">{task.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 ml-7">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{task.projectName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{task.estimatedHours}h</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 ml-7">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{task.completedPercentage}%</span>
                    </div>
                    <Progress 
                      value={task.completedPercentage} 
                      className={`h-2 ${
                        task.status === 'completed' ? 'bg-green-200' : 
                        task.status === 'in progress' ? 'bg-blue-200' : 'bg-yellow-200'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* View Task Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Task Title</Label>
                  <p className="text-sm text-gray-900">{selectedTask.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Priority</Label>
                  <Badge className={getPriorityBadge(selectedTask.priority)}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Badge className={getStatusBadge(selectedTask.status)}>
                    {selectedTask.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Project</Label>
                  <p className="text-sm text-gray-900">{selectedTask.projectName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Assignee</Label>
                  <p className="text-sm text-gray-900">{selectedTask.assignee}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <p className="text-sm text-gray-900">
                    {selectedTask.dueDate ? formatDate(selectedTask.dueDate) : 'Not set'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Estimated Hours</Label>
                  <p className="text-sm text-gray-900">{selectedTask.estimatedHours || 0} hours</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Progress</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedTask.completedPercentage} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{selectedTask.completedPercentage}%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedTask.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created At</Label>
                  <p className="text-gray-900">{formatDate(selectedTask.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <p className="text-gray-900">{formatDate(selectedTask.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Task Title *</Label>
                <Input
                  placeholder="Enter task title"
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setTaskForm({ ...taskForm, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Enter task description"
                value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project *</Label>
                <Select
                  value={taskForm.projectId}
                  onValueChange={v => setTaskForm({ ...taskForm, projectId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assignee</Label>
                <Select 
                  value={taskForm.assignee} 
                  onValueChange={(value) => setTaskForm({ ...taskForm, assignee: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  placeholder="Enter hours"
                  value={taskForm.estimatedHours}
                  onChange={e => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTask} className="bg-red-600 hover:bg-red-700 text-white">
                Update Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Update Task Status</DialogTitle>
            <DialogDescription>
              Change the status of this task
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{selectedTask.title}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedTask.projectName} • {selectedTask.assignee}</p>
              </div>
              
              <div className="space-y-3">
                <Label>Select Status</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                    onClick={() => setSelectedStatus('pending')}
                    className="justify-start h-12"
                  >
                    <PauseCircle className="h-4 w-4 mr-2 text-yellow-600" />
                    <div className="text-left">
                      <div className="font-medium">Pending</div>
                      <div className="text-xs text-gray-500">Task has not been started</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={selectedStatus === 'in progress' ? 'default' : 'outline'}
                    onClick={() => setSelectedStatus('in progress')}
                    className="justify-start h-12"
                  >
                    <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">In Progress</div>
                      <div className="text-xs text-gray-500">Task is currently being worked on</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={selectedStatus === 'completed' ? 'default' : 'outline'}
                    onClick={() => setSelectedStatus('completed')}
                    className="justify-start h-12"
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Completed</div>
                      <div className="text-xs text-gray-500">Task has been finished</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-800">{selectedTask.title}</p>
              <p className="text-sm text-red-600 mt-1">{selectedTask.projectName} • {selectedTask.assignee}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}