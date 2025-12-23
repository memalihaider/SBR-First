'use client';

import { useState, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Lock, Check, X, Plus, Edit, Settings, Save, Trash2, Eye, UserPlus, UserMinus } from 'lucide-react';
import { Module, Permission } from '@/types';

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

interface RolePermissions {
  [key: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface Role {
  id: string;
  name: string;
  key: string;
  users: number;
  color: string;
  description: string;
  permissions: RolePermissions;
  isSystem: boolean;
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      key: 'super_admin',
      users: 8,
      color: 'red',
      description: 'Full system access and control',
      isSystem: true,
      permissions: {
        users: { view: true, create: true, edit: true, delete: true },
        sales: { view: true, create: true, edit: true, delete: true },
        inventory: { view: true, create: true, edit: true, delete: true },
        projects: { view: true, create: true, edit: true, delete: true },
        finance: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
      },
    },
    {
      id: '2',
      name: 'Sales Manager',
      key: 'sales_manager',
      users: 24,
      color: 'green',
      description: 'Manage sales team and operations',
      isSystem: true,
      permissions: {
        users: { view: true, create: false, edit: false, delete: false },
        sales: { view: true, create: true, edit: true, delete: true },
        inventory: { view: true, create: false, edit: false, delete: false },
        projects: { view: true, create: false, edit: false, delete: false },
        finance: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      },
    },
    {
      id: '3',
      name: 'Sales Representative',
      key: 'sales_rep',
      users: 48,
      color: 'blue',
      description: 'Handle leads and customer relationships',
      isSystem: true,
      permissions: {
        users: { view: false, create: false, edit: false, delete: false },
        sales: { view: true, create: true, edit: true, delete: false },
        inventory: { view: true, create: false, edit: false, delete: false },
        projects: { view: true, create: false, edit: false, delete: false },
        finance: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      },
    },
    {
      id: '4',
      name: 'Inventory Manager',
      key: 'inventory_manager',
      users: 12,
      color: 'purple',
      description: 'Manage products and stock',
      isSystem: true,
      permissions: {
        users: { view: false, create: false, edit: false, delete: false },
        sales: { view: true, create: false, edit: false, delete: false },
        inventory: { view: true, create: true, edit: true, delete: true },
        projects: { view: true, create: false, edit: false, delete: false },
        finance: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      },
    },
    {
      id: '5',
      name: 'Project Manager',
      key: 'project_manager',
      users: 18,
      color: 'indigo',
      description: 'Oversee project execution',
      isSystem: true,
      permissions: {
        users: { view: true, create: false, edit: false, delete: false },
        sales: { view: true, create: false, edit: false, delete: false },
        inventory: { view: true, create: false, edit: false, delete: false },
        projects: { view: true, create: true, edit: true, delete: true },
        finance: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      },
    },
    {
      id: '6',
      name: 'Finance Manager',
      key: 'finance_manager',
      users: 8,
      color: 'yellow',
      description: 'Financial operations and reporting',
      isSystem: true,
      permissions: {
        users: { view: true, create: false, edit: false, delete: false },
        sales: { view: true, create: false, edit: false, delete: false },
        inventory: { view: true, create: false, edit: false, delete: false },
        projects: { view: true, create: false, edit: false, delete: false },
        finance: { view: true, create: true, edit: true, delete: true },
        settings: { view: false, create: false, edit: false, delete: false },
      },
    },
  ]);

  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    color: 'blue'
  });

  const handleCreateRole = () => {
    if (!newRole.name.trim()) return;

    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      key: newRole.name.toLowerCase().replace(/\s+/g, '_'),
      users: 0,
      color: newRole.color,
      description: newRole.description,
      isSystem: false,
      permissions: {
        users: { view: false, create: false, edit: false, delete: false },
        sales: { view: false, create: false, edit: false, delete: false },
        inventory: { view: false, create: false, edit: false, delete: false },
        projects: { view: false, create: false, edit: false, delete: false },
        finance: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      },
    };

    setRoles([...roles, role]);
    setNewRole({ name: '', description: '', color: 'blue' });
    setIsCreateRoleOpen(false);
  };

  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    setIsEditPermissionsOpen(true);
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    setRoles(roles.map(r => r.id === selectedRole.id ? selectedRole : r));
    setIsEditPermissionsOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(r => r.id !== roleId));
  };

  const updateRolePermission = (module: string, permission: string, value: boolean) => {
    if (!selectedRole) return;

    setSelectedRole({
      ...selectedRole,
      permissions: {
        ...selectedRole.permissions,
        [module]: {
          ...selectedRole.permissions[module],
          [permission]: value
        }
      }
    });
  };

  const PermissionIcon = ({ allowed }: { allowed: boolean }) => (
    allowed ? (
      <Check className="h-4 w-4 text-red-600" />
    ) : (
      <X className="h-4 w-4 text-red-600" />
    )
  );

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Roles & Permissions</h1>
            <p className="text-red-100 mt-1 text-lg">Configure access control for all system roles</p>
          </div>
          <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-red-600 hover:bg-red-50 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-5 w-5 mr-2" />
                Create New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white border-2 border-red-200 shadow-2xl">
              <DialogHeader className="bg-linear-to-r from-red-50 to-pink-50 -m-6 mb-4 p-6 rounded-t-lg">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <Plus className="h-6 w-6 text-red-600" />
                  </div>
                  Create New Role
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  Define a new role with custom permissions and access levels.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName" className="text-sm font-medium text-gray-700">
                    Role Name *
                  </Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="Enter role name"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleDescription" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="roleDescription"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Describe the role's responsibilities"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleColor" className="text-sm font-medium text-gray-700">
                    Theme Color
                  </Label>
                  <Select value={newRole.color} onValueChange={(value) => setNewRole({ ...newRole, color: value })}>
                    <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-red-200">
                      <SelectItem value="blue" className="cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span>Blue</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="green" className="cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span>Green</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="purple" className="cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                          <span>Purple</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="orange" className="cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                          <span>Orange</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateRoleOpen(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={!newRole.name.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
            <CardHeader className={`bg-${role.color}-50 rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${role.color}-100 rounded-lg`}>
                    <Shield className={`h-5 w-5 text-${role.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 flex items-center">
                      {role.name}
                      {role.isSystem && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          System
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-600">{role.users} users</span>
                    </div>
                  </div>
                </div>
                {!role.isSystem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">{role.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">User Management</span>
                  <PermissionIcon allowed={role.permissions.users.view} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">Sales Access</span>
                  <PermissionIcon allowed={role.permissions.sales.view} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">Inventory Access</span>
                  <PermissionIcon allowed={role.permissions.inventory.view} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">Project Access</span>
                  <PermissionIcon allowed={role.permissions.projects.view} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">Finance Access</span>
                  <PermissionIcon allowed={role.permissions.finance.view} />
                </div>
              </div>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleEditPermissions(role)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Permissions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Permissions Matrix */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Permissions Matrix</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Detailed view of all role permissions across modules
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">Module</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">Permission</th>
                  {roles.slice(0, 4).map((role) => (
                    <th key={role.key} className="text-center py-3 px-4 font-bold text-gray-900">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(roles[0].permissions).map(([module, perms]) => (
                  <Fragment key={module}>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td rowSpan={4} className="py-3 px-4 font-semibold text-gray-900 capitalize align-top">
                        {module}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-600">View</td>
                      {roles.slice(0, 4).map((role) => (
                        <td key={role.key} className="py-2 px-4 text-center">
                          <PermissionIcon allowed={role.permissions[module as keyof typeof role.permissions].view} />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 text-sm text-gray-600">Create</td>
                      {roles.slice(0, 4).map((role) => (
                        <td key={role.key} className="py-2 px-4 text-center">
                          <PermissionIcon allowed={role.permissions[module as keyof typeof role.permissions].create} />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 text-sm text-gray-600">Edit</td>
                      {roles.slice(0, 4).map((role) => (
                        <td key={role.key} className="py-2 px-4 text-center">
                          <PermissionIcon allowed={role.permissions[module as keyof typeof role.permissions].edit} />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 text-sm text-gray-600">Delete</td>
                      {roles.slice(0, 4).map((role) => (
                        <td key={role.key} className="py-2 px-4 text-center">
                          <PermissionIcon allowed={role.permissions[module as keyof typeof role.permissions].delete} />
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
        <DialogContent className="sm:max-w-[800px] bg-white border-2 border-red-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-linear-to-r from-red-50 to-pink-50 -m-6 mb-4 p-6 rounded-t-lg">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Settings className="h-6 w-6 text-red-600" />
              </div>
              Edit Permissions - {selectedRole?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Configure detailed permissions for this role across all system modules.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="dashboard" className="text-sm">Dashboard</TabsTrigger>
                <TabsTrigger value="users" className="text-sm">Users</TabsTrigger>
                <TabsTrigger value="sales" className="text-sm">Sales</TabsTrigger>
                <TabsTrigger value="inventory" className="text-sm">Inventory</TabsTrigger>
                <TabsTrigger value="projects" className="text-sm">Projects</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Dashboard Module</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dashboard-view"
                        checked={selectedRole?.permissions.dashboard?.view || false}
                        onCheckedChange={(checked) => updateRolePermission('dashboard', 'view', checked as boolean)}
                      />
                      <Label htmlFor="dashboard-view" className="text-sm">View Dashboard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dashboard-create"
                        checked={selectedRole?.permissions.dashboard?.create || false}
                        onCheckedChange={(checked) => updateRolePermission('dashboard', 'create', checked as boolean)}
                      />
                      <Label htmlFor="dashboard-create" className="text-sm">Create Widgets</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dashboard-edit"
                        checked={selectedRole?.permissions.dashboard?.edit || false}
                        onCheckedChange={(checked) => updateRolePermission('dashboard', 'edit', checked as boolean)}
                      />
                      <Label htmlFor="dashboard-edit" className="text-sm">Edit Dashboard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dashboard-delete"
                        checked={selectedRole?.permissions.dashboard?.delete || false}
                        onCheckedChange={(checked) => updateRolePermission('dashboard', 'delete', checked as boolean)}
                      />
                      <Label htmlFor="dashboard-delete" className="text-sm">Delete Widgets</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="users" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">User Management Module</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-view"
                        checked={selectedRole?.permissions.users?.view || false}
                        onCheckedChange={(checked) => updateRolePermission('users', 'view', checked as boolean)}
                      />
                      <Label htmlFor="users-view" className="text-sm">View Users</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-create"
                        checked={selectedRole?.permissions.users?.create || false}
                        onCheckedChange={(checked) => updateRolePermission('users', 'create', checked as boolean)}
                      />
                      <Label htmlFor="users-create" className="text-sm">Create Users</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-edit"
                        checked={selectedRole?.permissions.users?.edit || false}
                        onCheckedChange={(checked) => updateRolePermission('users', 'edit', checked as boolean)}
                      />
                      <Label htmlFor="users-edit" className="text-sm">Edit Users</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-delete"
                        checked={selectedRole?.permissions.users?.delete || false}
                        onCheckedChange={(checked) => updateRolePermission('users', 'delete', checked as boolean)}
                      />
                      <Label htmlFor="users-delete" className="text-sm">Delete Users</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="sales" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Sales & CRM Module</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sales-view"
                        checked={selectedRole?.permissions.sales?.view || false}
                        onCheckedChange={(checked) => updateRolePermission('sales', 'view', checked as boolean)}
                      />
                      <Label htmlFor="sales-view" className="text-sm">View Sales Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sales-create"
                        checked={selectedRole?.permissions.sales?.create || false}
                        onCheckedChange={(checked) => updateRolePermission('sales', 'create', checked as boolean)}
                      />
                      <Label htmlFor="sales-create" className="text-sm">Create Leads</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sales-edit"
                        checked={selectedRole?.permissions.sales?.edit || false}
                        onCheckedChange={(checked) => updateRolePermission('sales', 'edit', checked as boolean)}
                      />
                      <Label htmlFor="sales-edit" className="text-sm">Edit Sales Records</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sales-delete"
                        checked={selectedRole?.permissions.sales?.delete || false}
                        onCheckedChange={(checked) => updateRolePermission('sales', 'delete', checked as boolean)}
                      />
                      <Label htmlFor="sales-delete" className="text-sm">Delete Records</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="inventory" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Inventory Module</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inventory-view"
                        checked={selectedRole?.permissions.inventory?.view || false}
                        onCheckedChange={(checked) => updateRolePermission('inventory', 'view', checked as boolean)}
                      />
                      <Label htmlFor="inventory-view" className="text-sm">View Inventory</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inventory-create"
                        checked={selectedRole?.permissions.inventory?.create || false}
                        onCheckedChange={(checked) => updateRolePermission('inventory', 'create', checked as boolean)}
                      />
                      <Label htmlFor="inventory-create" className="text-sm">Add Products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inventory-edit"
                        checked={selectedRole?.permissions.inventory?.edit || false}
                        onCheckedChange={(checked) => updateRolePermission('inventory', 'edit', checked as boolean)}
                      />
                      <Label htmlFor="inventory-edit" className="text-sm">Edit Products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inventory-delete"
                        checked={selectedRole?.permissions.inventory?.delete || false}
                        onCheckedChange={(checked) => updateRolePermission('inventory', 'delete', checked as boolean)}
                      />
                      <Label htmlFor="inventory-delete" className="text-sm">Delete Products</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="projects" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Projects Module</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="projects-view"
                        checked={selectedRole?.permissions.projects?.view || false}
                        onCheckedChange={(checked) => updateRolePermission('projects', 'view', checked as boolean)}
                      />
                      <Label htmlFor="projects-view" className="text-sm">View Projects</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="projects-create"
                        checked={selectedRole?.permissions.projects?.create || false}
                        onCheckedChange={(checked) => updateRolePermission('projects', 'create', checked as boolean)}
                      />
                      <Label htmlFor="projects-create" className="text-sm">Create Projects</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="projects-edit"
                        checked={selectedRole?.permissions.projects?.edit || false}
                        onCheckedChange={(checked) => updateRolePermission('projects', 'edit', checked as boolean)}
                      />
                      <Label htmlFor="projects-edit" className="text-sm">Edit Projects</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="projects-delete"
                        checked={selectedRole?.permissions.projects?.delete || false}
                        onCheckedChange={(checked) => updateRolePermission('projects', 'delete', checked as boolean)}
                      />
                      <Label htmlFor="projects-delete" className="text-sm">Delete Projects</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button
              variant="outline"
              onClick={() => setIsEditPermissionsOpen(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
