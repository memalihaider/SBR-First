'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, UserPlus, Shield, Mail, Phone, Calendar, Search, Filter, Download, Edit, UserCheck, UserX, MoreHorizontal, Eye, Trash2, Save, X, Settings, Ban, CheckCircle } from 'lucide-react';
import { User, UserRole, Module, Permission } from '@/types';

// Mock user data - in a real app, this would come from an API
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@largify.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'super_admin',
    department: 'Administration',
    phone: '+1 (555) 001-0001',
    isActive: true,
    lastLogin: new Date('2024-12-01T10:30:00'),
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date('2024-12-01'),
    permissions: {
      role: 'super_admin',
      modules: {
        dashboard: ['read', 'write', 'admin'],
        users: ['read', 'write', 'admin', 'delete'],
        crm: ['read', 'write', 'admin'],
        inventory: ['read', 'write', 'admin'],
        projects: ['read', 'write', 'admin'],
        finance: ['read', 'write', 'admin'],
        hr: ['read', 'write', 'admin'],
        quotations: ['read', 'write', 'admin'],
        reports: ['read', 'write', 'admin'],
        settings: ['read', 'write', 'admin']
      },
      dataScope: 'global'
    }
  },
  {
    id: '2',
    email: 'sarah.sales@largify.com',
    firstName: 'Sarah',
    lastName: 'Sales',
    role: 'sales_manager',
    department: 'Sales',
    phone: '+1 (555) 001-0002',
    isActive: true,
    lastLogin: new Date('2024-12-01T14:15:00'),
    createdAt: new Date('2021-03-20'),
    updatedAt: new Date('2024-12-01'),
    permissions: {
      role: 'sales_manager',
      modules: {
        dashboard: ['read', 'write'],
        users: ['read'],
        crm: ['read', 'write', 'admin'],
        inventory: ['read'],
        projects: ['read', 'write'],
        finance: ['read'],
        hr: ['read'],
        quotations: ['read', 'write', 'approve'],
        reports: ['read'],
        settings: ['read']
      },
      dataScope: 'department'
    }
  },
  {
    id: '3',
    email: 'sales.rep@largify.com',
    firstName: 'Mike',
    lastName: 'Rep',
    role: 'sales_rep',
    department: 'Sales',
    phone: '+1 (555) 001-0003',
    isActive: true,
    lastLogin: new Date('2024-12-01T11:00:00'),
    createdAt: new Date('2021-06-10'),
    updatedAt: new Date('2024-12-01'),
    permissions: {
      role: 'sales_rep',
      modules: {
        dashboard: ['read'],
        users: ['read'],
        crm: ['read', 'write'],
        inventory: ['read'],
        projects: ['read'],
        finance: ['read'],
        hr: ['read'],
        quotations: ['read', 'write'],
        reports: ['read'],
        settings: ['read']
      },
      dataScope: 'assigned'
    }
  },
  {
    id: '4',
    email: 'inventory@largify.com',
    firstName: 'Lisa',
    lastName: 'Inventory',
    role: 'inventory_manager',
    department: 'Inventory',
    phone: '+1 (555) 001-0004',
    isActive: true,
    lastLogin: new Date('2024-12-01T09:30:00'),
    createdAt: new Date('2020-08-05'),
    updatedAt: new Date('2024-12-01'),
    permissions: {
      role: 'inventory_manager',
      modules: {
        dashboard: ['read', 'write'],
        users: ['read'],
        crm: ['read'],
        inventory: ['read', 'write', 'admin'],
        projects: ['read'],
        finance: ['read'],
        hr: ['read'],
        quotations: ['read'],
        reports: ['read'],
        settings: ['read']
      },
      dataScope: 'department'
    }
  },
  {
    id: '5',
    email: 'project@largify.com',
    firstName: 'David',
    lastName: 'Project',
    role: 'project_manager',
    department: 'Projects',
    phone: '+1 (555) 001-0005',
    isActive: true,
    lastLogin: new Date('2024-12-01T13:45:00'),
    createdAt: new Date('2021-01-12'),
    updatedAt: new Date('2024-12-01'),
    permissions: {
      role: 'project_manager',
      modules: {
        dashboard: ['read', 'write'],
        users: ['read'],
        crm: ['read'],
        inventory: ['read'],
        projects: ['read', 'write', 'admin'],
        finance: ['read', 'write'],
        hr: ['read'],
        quotations: ['read', 'write'],
        reports: ['read'],
        settings: ['read']
      },
      dataScope: 'department'
    }
  },
  {
    id: '6',
    email: 'finance@largify.com',
    firstName: 'Emma',
    lastName: 'Finance',
    role: 'finance_manager',
    department: 'Finance',
    phone: '+1 (555) 001-0006',
    isActive: true,
    lastLogin: new Date('2024-12-01T08:15:00'),
    createdAt: new Date('2020-05-18'),
    updatedAt: new Date('2024-12-01'),
    permissions: {
      role: 'finance_manager',
      modules: {
        dashboard: ['read', 'write'],
        users: ['read'],
        crm: ['read'],
        inventory: ['read'],
        projects: ['read'],
        finance: ['read', 'write', 'admin', 'approve'],
        hr: ['read'],
        quotations: ['read'],
        reports: ['read', 'write'],
        settings: ['read']
      },
      dataScope: 'department'
    }
  },
  {
    id: '7',
    email: 'client@largify.com',
    firstName: 'Robert',
    lastName: 'Client',
    role: 'client',
    department: 'External',
    phone: '+1 (555) 001-0007',
    isActive: true,
    lastLogin: new Date('2024-11-28T16:20:00'),
    createdAt: new Date('2022-02-28'),
    updatedAt: new Date('2024-11-28'),
    permissions: {
      role: 'client',
      modules: {
        dashboard: ['read'],
        users: [],
        crm: [],
        inventory: [],
        projects: ['read'],
        finance: ['read'],
        hr: [],
        quotations: ['read'],
        reports: [],
        settings: []
      },
      dataScope: 'own'
    }
  },
  {
    id: '8',
    email: 'vendor@largify.com',
    firstName: 'Maria',
    lastName: 'Vendor',
    role: 'vendor',
    department: 'External',
    phone: '+1 (555) 001-0008',
    isActive: true,
    lastLogin: new Date('2024-11-30T12:00:00'),
    createdAt: new Date('2021-11-08'),
    updatedAt: new Date('2024-11-30'),
    permissions: {
      role: 'vendor',
      modules: {
        dashboard: ['read'],
        users: [],
        crm: [],
        inventory: ['read'],
        projects: [],
        finance: ['read'],
        hr: [],
        quotations: [],
        reports: [],
        settings: []
      },
      dataScope: 'own'
    }
  }
];

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  sales_manager: 'Sales Manager',
  sales_rep: 'Sales Rep',
  inventory_manager: 'Inventory Manager',
  project_manager: 'Project Manager',
  finance_manager: 'Finance Manager',
  hr_manager: 'HR Manager',
  employee: 'Employee',
  client: 'Client',
  vendor: 'Vendor'
};

const moduleLabels: Record<Module, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  crm: 'CRM & Sales',
  inventory: 'Inventory',
  projects: 'Projects',
  finance: 'Finance',
  hr: 'HR',
  quotations: 'Quotations',
  reports: 'Reports',
  settings: 'Settings'
};

const permissionLabels: Record<Permission, string> = {
  read: 'Read',
  write: 'Write',
  approve: 'Approve',
  admin: 'Admin',
  delete: 'Delete'
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    isActive: true
  });

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    });
  }, [users, searchTerm, roleFilter, statusFilter, departmentFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const adminUsers = users.filter(u => u.role === 'super_admin').length;
    const newThisMonth = users.filter(u =>
      new Date(u.createdAt).getMonth() === new Date().getMonth() &&
      new Date(u.createdAt).getFullYear() === new Date().getFullYear()
    ).length;

    return { totalUsers, activeUsers, adminUsers, newThisMonth };
  }, [users]);

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) return;

    const user: User = {
      id: Date.now().toString(),
      email: newUser.email!,
      firstName: newUser.firstName!,
      lastName: newUser.lastName!,
      role: newUser.role as UserRole,
      department: newUser.department,
      phone: newUser.phone,
      isActive: newUser.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: {
        role: newUser.role as UserRole,
        modules: {
          dashboard: ['read'],
          users: ['read'],
          crm: ['read'],
          inventory: ['read'],
          projects: ['read'],
          finance: ['read'],
          hr: ['read'],
          quotations: ['read'],
          reports: ['read'],
          settings: ['read']
        },
        dataScope: 'own'
      }
    };

    setUsers([...users, user]);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'employee',
      department: '',
      isActive: true
    });
    setIsAddUserOpen(false);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    setUsers(users.map(u =>
      u.id === selectedUser.id ? { ...selectedUser, updatedAt: new Date() } : u
    ));
    setIsEditUserOpen(false);
    setSelectedUser(null);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, isActive: !u.isActive, updatedAt: new Date() } : u
    ));
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleExportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Department', 'Phone', 'Status', 'Last Login', 'Created'],
      ...filteredUsers.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        roleLabels[user.role],
        user.department || '',
        user.phone || '',
        user.isActive ? 'Active' : 'Inactive',
        user.lastLogin ? user.lastLogin.toLocaleDateString() : '',
        user.createdAt.toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'sales_manager':
      case 'inventory_manager':
      case 'project_manager':
      case 'finance_manager':
      case 'hr_manager': return 'default';
      case 'sales_rep':
      case 'employee': return 'secondary';
      case 'client':
      case 'vendor': return 'outline';
      default: return 'outline';
    }
  };

  const departments = [...new Set(users.map(u => u.department).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-red-100 mt-1 text-lg">Manage all system users and permissions</p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-red-600 hover:bg-red-50 shadow-lg hover:shadow-xl transition-all duration-200">
                <UserPlus className="h-5 w-5 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-2 border-red-200 shadow-2xl">
              <DialogHeader className="bg-linear-to-r from-red-50 to-pink-50 -m-6 mb-4 p-6 rounded-t-lg">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <UserPlus className="h-6 w-6 text-red-600" />
                  </div>
                  Add New User
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  Create a new user account with appropriate role and permissions. Fill in all required fields to complete the setup.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 py-4 space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName || ''}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        placeholder="Enter first name"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName || ''}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        placeholder="Enter last name"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email || ''}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email address"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={newUser.phone || ''}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      placeholder="Enter phone number (optional)"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Role & Department Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Role & Department
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                        User Role *
                      </Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}>
                        <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500 hover:border-red-400">
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-red-200">
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <span>{label}</span>
                                {value === 'super_admin' && <Shield className="h-4 w-4 text-red-500" />}
                                {value === 'sales_manager' && <Users className="h-4 w-4 text-blue-500" />}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                        Department
                      </Label>
                      <Input
                        id="department"
                        value={newUser.department || ''}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                        placeholder="Enter department (optional)"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Settings Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Account Settings
                  </h3>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                    <Checkbox
                      id="isActive"
                      checked={newUser.isActive}
                      onCheckedChange={(checked) => setNewUser({ ...newUser, isActive: checked as boolean })}
                      className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <div className="flex-1">
                      <Label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Activate user account immediately
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        User will be able to log in and access the system right away
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role Preview */}
                {newUser.role && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Role Preview
                    </h3>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {roleLabels[newUser.role as UserRole]}
                          </p>
                          <p className="text-xs text-blue-700">
                            Default permissions will be assigned based on this role
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserOpen(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: stats.totalUsers, change: '+12', icon: Users, color: 'red' },
          { title: 'Active Today', value: stats.activeUsers, change: '+8', icon: Users, color: 'green' },
          { title: 'Admin Users', value: stats.adminUsers, change: '0', icon: Shield, color: 'purple' },
          { title: 'New This Month', value: stats.newThisMonth, change: '+4', icon: UserPlus, color: 'blue' },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
                <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                  <IconComponent className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm mt-1">
                  <span className="text-green-600 font-semibold">{stat.change}</span>
                  <span className="text-gray-500"> from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40 border-gray-300 focus:border-red-500 focus:ring-red-500 hover:border-red-400">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="bg-white border-red-200">
                  <SelectItem value="all" className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">All Roles</SelectItem>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 border-gray-300 focus:border-red-500 focus:ring-red-500 hover:border-red-400">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-red-200">
                  <SelectItem value="all" className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">All Status</SelectItem>
                  <SelectItem value="active" className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">Active</SelectItem>
                  <SelectItem value="inactive" className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40 border-gray-300 focus:border-red-500 focus:ring-red-500 hover:border-red-400">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-white border-red-200">
                  <SelectItem value="all" className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept} className="hover:bg-red-50 focus:bg-red-50 cursor-pointer">{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportUsers}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Users ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Complete list of system users with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-gray-400">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex items-center justify-end space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditUserOpen(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit user details</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsPermissionsOpen(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manage permissions</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={user.isActive ? "ghost" : "default"}
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id)}
                                className={`h-8 w-8 p-0 transition-colors duration-200 ${
                                  user.isActive
                                    ? "hover:bg-orange-50 hover:text-orange-600 text-orange-500"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                              >
                                {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.isActive ? 'Deactivate user' : 'Activate user'}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                                disabled={user.role === 'super_admin'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.role === 'super_admin' ? 'Cannot delete super admin' : 'Delete user'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-2 border-red-200 shadow-2xl">
          <DialogHeader className="bg-linear-to-r from-blue-50 to-indigo-50 -m-6 mb-4 p-6 rounded-t-lg">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              Edit User
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Update user information, role, and account settings for {selectedUser?.firstName} {selectedUser?.lastName}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="px-6 py-4 space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName" className="text-sm font-medium text-gray-700">
                      First Name *
                    </Label>
                    <Input
                      id="edit-firstName"
                      value={selectedUser.firstName}
                      onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName" className="text-sm font-medium text-gray-700">
                      Last Name *
                    </Label>
                    <Input
                      id="edit-lastName"
                      value={selectedUser.lastName}
                      onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="edit-phone"
                    value={selectedUser.phone || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Role & Department Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Role & Department
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">
                      User Role *
                    </Label>
                    <Select value={selectedUser.role} onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value as UserRole })}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-blue-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200">
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <span>{label}</span>
                              {value === 'super_admin' && <Shield className="h-4 w-4 text-red-500" />}
                              {value === 'sales_manager' && <Users className="h-4 w-4 text-blue-500" />}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-department" className="text-sm font-medium text-gray-700">
                      Department
                    </Label>
                    <Input
                      id="edit-department"
                      value={selectedUser.department || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Account Status Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Account Status
                </h3>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                  <Checkbox
                    id="edit-isActive"
                    checked={selectedUser.isActive}
                    onCheckedChange={(checked) => setSelectedUser({ ...selectedUser, isActive: checked as boolean })}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div className="flex-1">
                    <Label htmlFor="edit-isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                      User account is active
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedUser.isActive ? 'User can log in and access the system' : 'User account is deactivated'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button
              variant="outline"
              onClick={() => setIsEditUserOpen(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleEditUser}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white border-2 border-purple-200 shadow-2xl">
          <DialogHeader className="bg-linear-to-r from-purple-50 to-violet-50 -m-6 mb-4 p-6 rounded-t-lg">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              Manage Permissions
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Configure access permissions and data scope for {selectedUser?.firstName} {selectedUser?.lastName}.
              Changes will take effect immediately.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="px-6 py-4">
              <Tabs defaultValue="modules" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                  <TabsTrigger value="modules" className="text-sm font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Module Permissions
                  </TabsTrigger>
                  <TabsTrigger value="overview" className="text-sm font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="modules" className="space-y-4">
                  {Object.entries(moduleLabels).map(([module, label]) => (
                    <div key={module} className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-base">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-bold text-purple-600">
                            {label.charAt(0)}
                          </span>
                        </div>
                        {label}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        {Object.entries(permissionLabels).map(([permission, permLabel]) => (
                          <div key={permission} className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 min-h-[50px]">
                            <Checkbox
                              id={`${module}-${permission}`}
                              checked={selectedUser.permissions.modules[module as Module]?.includes(permission as Permission) || false}
                              onCheckedChange={(checked) => {
                                const currentPermissions = selectedUser.permissions.modules[module as Module] || [];
                                const newPermissions = checked
                                  ? [...currentPermissions, permission as Permission]
                                  : currentPermissions.filter(p => p !== permission);
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: {
                                    ...selectedUser.permissions,
                                    modules: {
                                      ...selectedUser.permissions.modules,
                                      [module as Module]: newPermissions
                                    }
                                  }
                                });
                              }}
                              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 shrink-0"
                            />
                            <Label htmlFor={`${module}-${permission}`} className="text-sm font-medium text-gray-700 cursor-pointer flex-1 leading-tight">
                              {permLabel}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center text-base">
                        <Settings className="h-4 w-4 mr-2" />
                        Current Role & Scope
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Role</p>
                          <p className="text-base font-bold text-blue-800">{roleLabels[selectedUser.role]}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Data Scope</p>
                          <p className="text-sm font-semibold text-blue-800 capitalize">{selectedUser.permissions.dataScope}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center text-base">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Access Summary
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {Object.entries(selectedUser.permissions.modules).map(([module, permissions]) => (
                          <div key={module} className="flex justify-between items-center py-1.5 px-2 bg-white rounded border">
                            <span className="text-xs font-medium text-green-800 truncate mr-2 flex-1">{moduleLabels[module as Module]}</span>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                              permissions.length > 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {permissions.length > 0 ? `${permissions.length}` : '0'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button
              variant="outline"
              onClick={() => setIsPermissionsOpen(false)}
              className="border-gray-300 hover:bg-gray-50 px-6 py-2"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => setIsPermissionsOpen(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2"
            >
              <Shield className="h-4 w-4 mr-2" />
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white border-2 border-red-200 shadow-2xl">
          <DialogHeader className="text-center bg-linear-to-r from-red-50 to-pink-50 -m-6 mb-4 p-6 rounded-t-lg">
            <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">Delete User Account</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you absolutely sure you want to delete <span className="font-semibold text-red-700">{userToDelete?.firstName} {userToDelete?.lastName}</span>?
              This action <span className="font-bold text-red-600">cannot be undone</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs text-white font-bold">⚠</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-900">Danger Zone</p>
                  <p className="text-xs text-red-700 mt-1">
                    This will permanently delete the user account, remove all associated data, and revoke all permissions.
                    The user will lose access to the system immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">User Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Email:</span> {userToDelete?.email}</p>
                <p><span className="font-medium">Role:</span> {userToDelete ? roleLabels[userToDelete.role] : ''}</p>
                <p><span className="font-medium">Department:</span> {userToDelete?.department || 'Not assigned'}</p>
                <p><span className="font-medium">Status:</span> {userToDelete?.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-gray-50 -m-6 mt-0 p-6 rounded-b-lg border-t">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Keep User
            </Button>
            <Button
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Yes, Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
