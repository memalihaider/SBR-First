'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Search, Filter, UserCheck, UserX, Clock, Mail, Phone, MapPin, Calendar, DollarSign, Trash2, Eye, Edit } from 'lucide-react';
import { useCurrency } from '@/lib/currency';
import { toast } from 'sonner';

import type { Employee as EmployeeType } from '@/lib/employee';
import {
  subscribeEmployees,
  addEmployee as addEmployeeFn,
  updateEmployee as updateEmployeeFn,
  deleteEmployee as deleteEmployeeFn,
  subscribeDepartmentNames,
} from '@/lib/employee';

// Firebase imports add karein
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface LocalEmployee extends Omit<EmployeeType, 'id'> {
  id: string | number;
}

// Manager type define karein
interface Manager {
  id: string;
  name: string;
  department: string;
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isViewEmployeeOpen, setIsViewEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<LocalEmployee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<LocalEmployee | null>(null);

  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string }[]>([]);
  const [managersList, setManagersList] = useState<Manager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<Manager[]>([]);

  const [newEmployee, setNewEmployee] = useState<{
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    salary: number;
    address: string;
    manager: string;
    skills: string[];
  }>({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: 0,
    address: '',
    manager: '',
    skills: [],
  });

  const { formatAmount } = useCurrency();

  // employees driven by Firestore (subscribe)
  const [employees, setEmployees] = useState<LocalEmployee[]>([]);

  // Firebase se managers fetch karna - DIRECT department document se head field
  const fetchManagers = async () => {
    try {
      const departmentsCollection = collection(db, 'departments');
      const departmentSnapshot = await getDocs(departmentsCollection);
      
      const managers: Manager[] = [];
      
      // Har department document se directly head field fetch karna
      departmentSnapshot.docs.forEach((deptDoc) => {
        const deptData = deptDoc.data();
        if (deptData.head) {
          managers.push({
            id: deptDoc.id,
            name: deptData.head,
            department: deptData.name || deptDoc.id
          });
        }
      });
      
      setManagersList(managers);
      console.log('Managers fetched:', managers); // Debugging ke liye
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Failed to load managers');
    }
  };

  // Department change hone par managers filter karna
  useEffect(() => {
    if (newEmployee.department && managersList.length > 0) {
      const departmentManagers = managersList.filter(
        manager => manager.department === newEmployee.department
      );
      setFilteredManagers(departmentManagers);
      
      // Agar selected department ka koi manager hai to automatically set kar do
      if (departmentManagers.length > 0) {
        setNewEmployee(prev => ({
          ...prev,
          manager: departmentManagers[0].name
        }));
      } else {
        // Agar koi manager nahi hai to empty set kar do
        setNewEmployee(prev => ({
          ...prev,
          manager: ''
        }));
      }
    } else {
      setFilteredManagers([]);
      setNewEmployee(prev => ({
        ...prev,
        manager: ''
      }));
    }
  }, [newEmployee.department, managersList]);

  // subscribe to employees and departments on mount
  useEffect(() => {
    const unsubEmp = subscribeEmployees(
      (list) => {
        const mapped = list.map((e) => ({ ...e, id: e.id as string }));
        setEmployees(mapped);
      },
      (err) => {
        console.error('Failed to subscribe employees', err);
        toast.error('Failed to load employees');
      }
    );

    const unsubDeps = subscribeDepartmentNames(
      (list) => {
        setDepartmentsList(list);
      },
      (err) => {
        console.error('Failed to subscribe departments', err);
      }
    );

    // Managers fetch karo
    fetchManagers();

    return () => {
      try { unsubEmp(); } catch {}
      try { unsubDeps(); } catch {}
    };
  }, []);

  // Add Employee Dialog open hone par managers fetch karo
  useEffect(() => {
    if (isAddEmployeeOpen) {
      fetchManagers();
    }
  }, [isAddEmployeeOpen]);

  // Edit Employee Dialog open hone par managers fetch karo aur current employee ke department ke managers filter karo
  useEffect(() => {
    if (isEditEmployeeOpen && selectedEmployee) {
      fetchManagers().then(() => {
        const departmentManagers = managersList.filter(
          manager => manager.department === selectedEmployee.department
        );
        setFilteredManagers(departmentManagers);
      });
    }
  }, [isEditEmployeeOpen, selectedEmployee]);

  // Filters: client-side (since we have full list)
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchTerm === '' ||
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter === 'all' || (employee.department || '').toLowerCase() === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Stats computed from live employees
  const [stats, setStats] = useState([
    {
      title: 'Total Team Members',
      value: '0',
      change: '+0%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Engineers',
      value: '0',
      change: '+0%',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'On Projects',
      value: '0',
      change: '+0%',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
   
  ]);

  const prevSnapshotRef = useRef({ total: 0, activeEngineers: 0, onProjects: 0, qc: 0 });

  useEffect(() => {
    const total = employees.length;

    // Active Engineers: positions including 'engineer' OR department 'R&D'
    const activeEngineers = employees.filter((e) =>
      ((e.position || '').toLowerCase().includes('engineer') || (e.department || '').toLowerCase().includes('r&d')) &&
      e.status === 'active'
    ).length;

    // On Projects: heuristic = active employees with a manager assigned (best-effort)
    const onProjects = employees.filter((e) => e.status === 'active' && (e.manager || '').trim() !== '').length;

    // Quality Control: department includes 'quality' or position includes 'quality'
    const qc = employees.filter((e) =>
      (e.department || '').toLowerCase().includes('quality') || (e.position || '').toLowerCase().includes('quality')
    ).length;

    const prev = prevSnapshotRef.current;

    const makeChange = (curr: number, prevVal: number) => {
      if (prevVal === 0) return curr === 0 ? '+0%' : `+${Math.round((curr - prevVal) / (prevVal === 0 ? 1 : prevVal) * 100)}%`;
      const pct = Math.round(((curr - prevVal) / Math.abs(prevVal)) * 100);
      return pct >= 0 ? `+${pct}%` : `${pct}%`;
    };

    const newStats = [
      {
        title: 'Total Team Members',
        value: String(total),
        change: makeChange(total, prev.total),
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Active Engineers',
        value: String(activeEngineers),
        change: makeChange(activeEngineers, prev.activeEngineers),
        icon: UserCheck,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        title: 'On Projects',
        value: String(onProjects),
        change: makeChange(onProjects, prev.onProjects),
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      },
      
    ];

    prevSnapshotRef.current = { total, activeEngineers, onProjects, qc };
    setStats(newStats);
  }, [employees]);

  // Add employee handler → Firestore
  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department) {
      toast.error('Please fill required fields (name, email, department)');
      return;
    }

    try {
      await addEmployeeFn({
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        department: newEmployee.department,
        position: newEmployee.position,
        salary: Number(newEmployee.salary || 0),
        address: newEmployee.address,
        manager: newEmployee.manager,
        skills: newEmployee.skills ?? [],
        status: 'active',
        emergencyContact: { name: '', relationship: '', phone: '' },
      });
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        salary: 0,
        address: '',
        manager: '',
        skills: [],
      });
      setIsAddEmployeeOpen(false);
      toast.success('Team member added');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add team member');
    }
  };

  // View
  const handleViewEmployee = (employee: LocalEmployee) => {
    setSelectedEmployee(employee);
    setIsViewEmployeeOpen(true);
  };

  // Edit open
  const handleEditEmployee = (employee: LocalEmployee) => {
    setSelectedEmployee(employee);
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      phone: employee.phone ?? '',
      department: employee.department,
      position: employee.position ?? '',
      salary: Number(employee.salary || 0),
      address: employee.address ?? '',
      manager: employee.manager ?? '',
      skills: employee.skills ?? [],
    });
    setIsEditEmployeeOpen(true);
  };

  // Update → Firestore
  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department) {
      toast.error('Please fill required fields (name, email, department)');
      return;
    }
    try {
      await updateEmployeeFn(String(selectedEmployee.id), {
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        department: newEmployee.department,
        position: newEmployee.position,
        salary: Number(newEmployee.salary || 0),
        address: newEmployee.address,
        manager: newEmployee.manager,
        skills: newEmployee.skills,
      });
      setIsEditEmployeeOpen(false);
      setSelectedEmployee(null);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        salary: 0,
        address: '',
        manager: '',
        skills: [],
      });
      toast.success('Team member updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update team member');
    }
  };

  // Delete Dialog open karega
  const handleDeleteClick = (employee: LocalEmployee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  // Delete → Firestore
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      await deleteEmployeeFn(String(employeeToDelete.id));
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      toast.success('Team member deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete team member');
    }
  };

  // Department change handler - managers update karega
  const handleDepartmentChange = (value: string) => {
    setNewEmployee(prev => ({
      ...prev,
      department: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Electronics Team Management</h1>
        <p className="text-red-100 mt-1 text-lg">Manage your electronics manufacturing team and personnel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Filters and Search */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl text-gray-900">Electronics Team Directory</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                View and manage all electronics manufacturing team members
              </CardDescription>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md" onClick={() => setIsAddEmployeeOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search team members..."
                  className="pl-10 border-2 focus:border-red-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48 border-2">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentsList.map((d) => (
                  <SelectItem key={d.id} value={d.name.toLowerCase()}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-2">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={String(employee.id)} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={employee.status === 'active' ? 'default' : 'secondary'}
                        className={employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {employee.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatAmount(employee.salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => handleViewEmployee(employee)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                        
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleDeleteClick(employee)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Add New Team Member</DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter the details for the new electronics team member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={newEmployee.department} onValueChange={handleDepartmentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                placeholder="Enter position"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                value={newEmployee.salary}
                onChange={(e) => setNewEmployee({...newEmployee, salary: parseFloat(e.target.value) || 0})}
                placeholder="Enter salary"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newEmployee.address}
                onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Select 
                value={newEmployee.manager} 
                onValueChange={(value) => setNewEmployee({...newEmployee, manager: value})}
                disabled={!newEmployee.department || filteredManagers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !newEmployee.department 
                      ? "Select department first" 
                      : filteredManagers.length === 0 
                      ? "No manager available" 
                      : "Select manager"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.name}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newEmployee.department && filteredManagers.length === 0 && (
                <p className="text-sm text-yellow-600">No manager found for this department</p>
              )}
              {newEmployee.department && filteredManagers.length > 0 && (
                <p className="text-sm text-green-600">Manager automatically selected from department head</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee} className="bg-red-600 hover:bg-red-700">
              Add Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={isViewEmployeeOpen} onOpenChange={setIsViewEmployeeOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Team Member Details</DialogTitle>
            <DialogDescription className="text-gray-600">
              View detailed information about the electronics team member.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center">
                  <span className="text-xl font-semibold text-white">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h3>
                  <p className="text-gray-600">{selectedEmployee.position}</p>
                  <Badge
                    variant={selectedEmployee.status === 'active' ? 'default' : 'secondary'}
                    className={selectedEmployee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  >
                    {selectedEmployee.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium">{selectedEmployee.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Address:</span>
                    <span className="text-sm font-medium">{selectedEmployee.address || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Join Date:</span>
                    <span className="text-sm font-medium">{new Date(selectedEmployee.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Salary:</span>
                    <span className="text-sm font-medium">{formatAmount(selectedEmployee.salary)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Department:</span>
                    <span className="text-sm font-medium">{selectedEmployee.department}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Manager:</span>
                    <span className="text-sm font-medium">{selectedEmployee.manager || 'Not assigned'}</span>
                  </div>
                </div>
              </div>

              {(selectedEmployee.skills || []).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmployee.emergencyContact?.name && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Emergency Contact</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">{selectedEmployee.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{selectedEmployee.emergencyContact.relationship}</p>
                    <p className="text-sm text-gray-600">{selectedEmployee.emergencyContact.phone}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewEmployeeOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Edit Team Member</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update the electronics team member information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department *</Label>
              <Select value={newEmployee.department} onValueChange={handleDepartmentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position">Position</Label>
              <Input
                id="edit-position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                placeholder="Enter position"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-salary">Salary</Label>
              <Input
                id="edit-salary"
                value={newEmployee.salary}
                onChange={(e) => setNewEmployee({...newEmployee, salary: parseFloat(e.target.value) || 0})}
                placeholder="Enter salary"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={newEmployee.address}
                onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager">Manager</Label>
              <Select 
                value={newEmployee.manager} 
                onValueChange={(value) => setNewEmployee({...newEmployee, manager: value})}
                disabled={!newEmployee.department || filteredManagers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !newEmployee.department 
                      ? "Select department first" 
                      : filteredManagers.length === 0 
                      ? "No manager available" 
                      : "Select manager"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.name}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newEmployee.department && filteredManagers.length === 0 && (
                <p className="text-sm text-yellow-600">No manager found for this department</p>
              )}
              {newEmployee.department && filteredManagers.length > 0 && (
                <p className="text-sm text-green-600">Manager automatically selected from department head</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEmployeeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee} className="bg-red-600 hover:bg-red-700">
              Update Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-red-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Trash2 className="h-5 w-5 text-red-600 mr-2" />
              Delete Team Member
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this team member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {employeeToDelete && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {employeeToDelete.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{employeeToDelete.name}</p>
                    <p className="text-sm text-gray-600">{employeeToDelete.position} • {employeeToDelete.department}</p>
                    <p className="text-sm text-gray-500">{employeeToDelete.email}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Warning: This will permanently remove the team member from the system.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteEmployee} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}