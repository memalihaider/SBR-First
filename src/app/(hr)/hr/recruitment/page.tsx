'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Users, Plus, TrendingUp, Eye, Edit2, User, DollarSign, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

import type { Department } from '@/lib/department';
import {
  subscribeDepartments,
  addDepartment as addDepartmentFn,
  updateDepartment as updateDepartmentFn,
  deleteDepartment as deleteDepartmentFn,
} from '@/lib/department';

export default function DepartmentsPage() {
  // departments state driven by Firestore
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modal states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Form states
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    head: '',
    email: '',
    phone: '',
    employees: '',
    budget: '',
    description: '',
  });

  const [editDepartment, setEditDepartment] = useState({
    name: '',
    head: '',
    email: '',
    phone: '',
    employees: '',
    budget: '',
    description: '',
  });

  // Stats state (computed from departments)
  const [stats, setStats] = useState([
    {
      title: 'Total Departments',
      value: '0',
      change: '+0',
      icon: Building2,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Total Employees',
      value: '0',
      change: '+0%',
      icon: Users,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Avg Department Size',
      value: '0',
      change: '+0%',
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]);

  // keep previous values to compute "change" for a basic delta comparison
  const prevTotalsRef = useRef({ totalDepartments: 0, totalEmployees: 0, avgSize: 0 });

  // Subscribe to Firestore departments collection in real time
  useEffect(() => {
    const unsub = subscribeDepartments(
      (deps) => {
        setDepartments(deps);
      },
      (err) => {
        console.error('Failed to subscribe to departments:', err);
        toast.error('Failed to load departments');
      }
    );
    return () => unsub();
  }, []);

  // Recompute stats whenever departments change
  useEffect(() => {
    const totalDepartments = departments.length;
    const totalEmployees = departments.reduce((s, d) => s + (Number(d.employees) || 0), 0);
    const avgSize = totalDepartments > 0 ? totalEmployees / totalDepartments : 0;

    // compute simple change vs previous snapshot (absolute & percent)
    const prev = prevTotalsRef.current;

    const deptChange = totalDepartments - prev.totalDepartments;
    const empPercentChange = prev.totalEmployees === 0 ? (totalEmployees === 0 ? 0 : 100) : ((totalEmployees - prev.totalEmployees) / Math.abs(prev.totalEmployees)) * 100;
    const avgPercentChange = prev.avgSize === 0 ? (avgSize === 0 ? 0 : 100) : ((avgSize - prev.avgSize) / Math.abs(prev.avgSize)) * 100;

    const newStats = [
      {
        title: 'Total Departments',
        value: String(totalDepartments),
        change: (deptChange >= 0 ? `+${deptChange}` : `${deptChange}`),
        icon: Building2,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
      {
        title: 'Total Employees',
        value: String(totalEmployees),
        change: (empPercentChange >= 0 ? `+${empPercentChange.toFixed(0)}%` : `${empPercentChange.toFixed(0)}%`),
        icon: Users,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
      {
        title: 'Avg Department Size',
        value: avgSize % 1 === 0 ? String(avgSize) : String(avgSize.toFixed(1)),
        change: (avgPercentChange >= 0 ? `+${avgPercentChange.toFixed(0)}%` : `${avgPercentChange.toFixed(0)}%`),
        icon: TrendingUp,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
    ];

    // update prev ref
    prevTotalsRef.current = { totalDepartments, totalEmployees, avgSize };
    setStats(newStats);
  }, [departments]);

  // Handlers - Add
  const handleAddDepartment = async () => {
    if (!newDepartment.name || !newDepartment.head || !newDepartment.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    if (newDepartment.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newDepartment.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone number format
    if (newDepartment.phone && !/^[\d\s\-\+\(\)]+$/.test(newDepartment.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      await addDepartmentFn({
        name: newDepartment.name,
        head: newDepartment.head,
        email: newDepartment.email || '',
        phone: newDepartment.phone || '',
        employees: Number(newDepartment.employees || 0),
        budget: newDepartment.budget || '$0',
        description: newDepartment.description,
      });
      setNewDepartment({ 
        name: '', 
        head: '', 
        email: '', 
        phone: '', 
        employees: '', 
        budget: '', 
        description: '' 
      });
      setAddDialogOpen(false);
      toast.success('Department added successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add department');
    }
  };

  // View
  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setViewDialogOpen(true);
  };

  // Edit open
  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setEditDepartment({
      name: department.name,
      head: department.head,
      email: department.email || '',
      phone: department.phone || '',
      employees: String(department.employees ?? 0),
      budget: department.budget ?? '$0',
      description: department.description ?? '',
    });
    setEditDialogOpen(true);
  };

  // Update
  const handleUpdateDepartment = async () => {
    if (!selectedDepartment) return;

    if (!editDepartment.name || !editDepartment.head || !editDepartment.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    if (editDepartment.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editDepartment.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone number format
    if (editDepartment.phone && !/^[\d\s\-\+\(\)]+$/.test(editDepartment.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      // selectedDepartment.id comes from Firestore doc id (string)
      await updateDepartmentFn(String(selectedDepartment.id), {
        name: editDepartment.name,
        head: editDepartment.head,
        email: editDepartment.email || '',
        phone: editDepartment.phone || '',
        employees: Number(editDepartment.employees || 0),
        budget: editDepartment.budget || '$0',
        description: editDepartment.description,
      });
      setEditDialogOpen(false);
      setSelectedDepartment(null);
      toast.success('Department updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update department');
    }
  };

  // Delete (called from edit dialog or wherever you wire it in)
  const handleDeleteDepartment = async (id?: string | number) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;

    try {
      await deleteDepartmentFn(String(id));
      toast.success('Department deleted');
      setEditDialogOpen(false);
      setSelectedDepartment(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Department Management</h1>
        <p className="text-red-100 mt-1 text-lg">Organize and manage company departments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm mt-1">
                  <span
                    className={
                      stat.change.startsWith('+') && !stat.change.includes('-')
                        ? 'text-green-600 font-semibold'
                        : stat.change.startsWith('-')
                        ? 'text-red-600 font-semibold'
                        : 'text-gray-600 font-semibold'
                    }
                  >
                    {stat.change}
                  </span>{' '}
                  <span className="text-gray-500">from last snapshot</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Departments Grid */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl text-gray-900">Departments</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Overview of all company departments
              </CardDescription>
            </div>
            <Button className="bg-purple-600  text-white shadow-md" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={String(dept.id)} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">{dept.name}</CardTitle>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                      {dept.growth}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-600">
                    {dept.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Department Head:</span>
                    <span className="text-sm font-semibold text-gray-900">{dept.head}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Employees:</span>
                    <span className="text-sm font-semibold text-gray-900">{dept.employees}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="text-sm font-semibold text-gray-900">{dept.budget}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleViewDepartment(dept)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50" onClick={() => handleEditDepartment(dept)}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-white border-2 border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new department in your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name *</Label>
              <Input
                id="dept-name"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter department name"
                className="bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-head">Department Head *</Label>
              <Input
                id="dept-head"
                value={newDepartment.head}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, head: e.target.value }))}
                placeholder="Enter department head name"
                className="bg-white border-gray-300"
              />
            </div>
            
            {/* New Fields: Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dept-email">Head Email</Label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <Input
                    id="dept-email"
                    type="email"
                    value={newDepartment.email}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="head@company.com"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-phone">Head Phone</Label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <Input
                    id="dept-phone"
                    value={newDepartment.phone}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+92 300 1234567"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dept-employees">Number of Employees</Label>
                <Input
                  id="dept-employees"
                  type="number"
                  value={newDepartment.employees}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, employees: e.target.value }))}
                  placeholder="0"
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-budget">Budget</Label>
                <Input
                  id="dept-budget"
                  value={newDepartment.budget}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="$0"
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-description">Description *</Label>
              <Textarea
                id="dept-description"
                value={newDepartment.description}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter department description"
                rows={3}
                className="bg-white border-gray-300"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button onClick={handleAddDepartment} className="bg-purple-600 text-white">
              Add Department
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Department Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-white border-2 border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-red-600" />
              {selectedDepartment?.name}
            </DialogTitle>
            <DialogDescription>
              Department details and information
            </DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Head:</span>
                  <span className="font-semibold">{selectedDepartment.head}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Employees:</span>
                  <span className="font-semibold">{selectedDepartment.employees}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Budget:</span>
                  <span className="font-semibold">{selectedDepartment.budget}</span>
                </div>
                
              </div>
              
              {/* Display Email and Phone if available */}
              {(selectedDepartment.email || selectedDepartment.phone) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedDepartment.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-semibold">{selectedDepartment.email}</span>
                    </div>
                  )}
                  {selectedDepartment.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="font-semibold">{selectedDepartment.phone}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Description</Label>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {selectedDepartment.description}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={() => setViewDialogOpen(false)} className="bg-red-600 hover:bg-red-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white border-2 border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dept-name">Department Name *</Label>
              <Input
                id="edit-dept-name"
                value={editDepartment.name}
                onChange={(e) => setEditDepartment(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-head">Department Head *</Label>
              <Input
                id="edit-dept-head"
                value={editDepartment.head}
                onChange={(e) => setEditDepartment(prev => ({ ...prev, head: e.target.value }))}
                className="bg-white border-gray-300"
              />
            </div>
            
            {/* New Fields: Email and Phone in Edit Dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dept-email">Head Email</Label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <Input
                    id="edit-dept-email"
                    type="email"
                    value={editDepartment.email}
                    onChange={(e) => setEditDepartment(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="head@company.com"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dept-phone">Head Phone</Label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <Input
                    id="edit-dept-phone"
                    value={editDepartment.phone}
                    onChange={(e) => setEditDepartment(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+92 300 1234567"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dept-employees">Number of Employees</Label>
                <Input
                  id="edit-dept-employees"
                  type="number"
                  value={editDepartment.employees}
                  onChange={(e) => setEditDepartment(prev => ({ ...prev, employees: e.target.value }))}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dept-budget">Budget</Label>
                <Input
                  id="edit-dept-budget"
                  value={editDepartment.budget}
                  onChange={(e) => setEditDepartment(prev => ({ ...prev, budget: e.target.value }))}
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-description">Description *</Label>
              <Textarea
                id="edit-dept-description"
                value={editDepartment.description}
                onChange={(e) => setEditDepartment(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="bg-white border-gray-300"
              />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex items-center space-x-2">
              {/* Delete button — intentionally subtle to avoid accidental deletes */}
              <Button variant="outline" onClick={() => handleDeleteDepartment(selectedDepartment?.id)} className="bg-white border-gray-300 text-red-600">
                Delete
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-white border-gray-300">
                Cancel
              </Button>
              <Button onClick={handleUpdateDepartment} className="bg-red-600 hover:bg-red-700">
                Update Department
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}