'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building2, TrendingUp, AlertTriangle, UserCheck, Calendar, DollarSign, Briefcase, RefreshCw, Package, FolderPlus, Users2 } from 'lucide-react';
import { useCurrency } from '@/lib/currency';
import { CurrencySelector } from '@/components/currency-selector';
import { toast } from 'sonner';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types for Firebase Data
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  status: string;
  joinDate: string;
  address: string;
  manager: string;
  skills: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Timestamp;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  budgetAmount: number;
  actualCost: number;
  completionPercentage: number;
  startDate: Timestamp;
  endDate: Timestamp;
  projectManager: string;
  teamMembers: string[];
  customerName: string;
  customerId: string;
  profitMargin: number;
  type: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: { type: string; amount: number }[];
  deductions: { type: string; amount: number }[];
  netPay: number;
  status: string;
  paymentDate: string;
  paymentMethod: string;
  createdAt: Timestamp;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  status: string;
  manufacturer: string;
  description: string;
  margin: number;
  isBatchTracked: boolean;
  isSerialTracked: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Department {
  id: string;
  name: string;
  manager: string;
  totalEmployees: number;
  budget: number;
  createdAt: Timestamp;
}

interface RecentActivity {
  id: string;
  type: 'product' | 'project' | 'department' | 'employee' | 'system';
  title: string;
  description: string;
  timestamp: Timestamp;
  user?: string;
  metadata?: {
    productName?: string;
    projectName?: string;
    departmentName?: string;
    employeeName?: string;
    amount?: number;
  };
}

export default function AdminDashboard() {
  const { formatAmount, currency } = useCurrency();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isProcessPayrollOpen, setIsProcessPayrollOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Real-time Data States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate metrics from real-time data
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const activeProjects = projects.filter(proj => 
    ['planning', 'active', 'in_progress'].includes(proj.status)
  ).length;
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyPayroll = payrolls
    .filter(p => p.month === currentMonth && p.status === 'paid')
    .reduce((sum, p) => sum + p.netPay, 0);

  const lowStockItems = products.filter(
    product => product.currentStock <= product.reorderPoint
  ).length;

  const totalRevenue = projects.reduce((sum, project) => {
    return sum + (project.actualCost || 0);
  }, 0);

  const totalUsers = employees.length;

  // Function to calculate time ago
  const getTimeAgo = (timestamp: Timestamp) => {
    const now = new Date();
    const date = timestamp.toDate();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Function to get icon based on activity type
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'product': return <Package className="h-4 w-4" />;
      case 'project': return <FolderPlus className="h-4 w-4" />;
      case 'department': return <Users2 className="h-4 w-4" />;
      case 'employee': return <UserCheck className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
  };

  // Function to get color based on activity type
  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'product': return 'text-blue-600 bg-blue-100';
      case 'project': return 'text-green-600 bg-green-100';
      case 'department': return 'text-purple-600 bg-purple-100';
      case 'employee': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Fetch Real-time Data from Firebase and generate activities
  useEffect(() => {
    setLoading(true);
    
    const unsubscribes: (() => void)[] = [];
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    try {
      // Employees Collection - Last 5 days
      const employeesQuery = query(
        collection(db, 'employeeList'), 
        where('createdAt', '>=', Timestamp.fromDate(fiveDaysAgo)),
        orderBy('createdAt', 'desc')
      );
      const unsubscribeEmployees = onSnapshot(employeesQuery, 
        (snapshot) => {
          const employeesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Employee[];
          setEmployees(employeesData);

          // Generate employee activities
          const employeeActivities: RecentActivity[] = employeesData.map(emp => ({
            id: `emp-${emp.id}`,
            type: 'employee',
            title: 'New Employee Added',
            description: `${emp.name} joined as ${emp.position}`,
            timestamp: emp.createdAt,
            user: 'HR Manager',
            metadata: {
              employeeName: emp.name,
            }
          }));
          setRecentActivities(prev => [...prev, ...employeeActivities]);
        },
        (error) => {
          console.error('Error fetching employees:', error);
        }
      );
      unsubscribes.push(unsubscribeEmployees);

      // Projects Collection - Last 5 days
      const projectsQuery = query(
        collection(db, 'projects'),
        where('createdAt', '>=', Timestamp.fromDate(fiveDaysAgo)),
        orderBy('createdAt', 'desc')
      );
      const unsubscribeProjects = onSnapshot(projectsQuery, 
        (snapshot) => {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];
          setProjects(projectsData);

          // Generate project activities
          const projectActivities: RecentActivity[] = projectsData.map(proj => ({
            id: `proj-${proj.id}`,
            type: 'project',
            title: 'New Project Created',
            description: `${proj.name} - Budget: ${formatAmount(proj.budgetAmount)}`,
            timestamp: proj.createdAt,
            user: proj.projectManager,
            metadata: {
              projectName: proj.name,
              amount: proj.budgetAmount
            }
          }));
          setRecentActivities(prev => [...prev, ...projectActivities]);
        },
        (error) => {
          console.error('Error fetching projects:', error);
        }
      );
      unsubscribes.push(unsubscribeProjects);

      // Products Collection - Last 5 days
      const productsQuery = query(
        collection(db, 'products'),
        where('createdAt', '>=', Timestamp.fromDate(fiveDaysAgo)),
        orderBy('createdAt', 'desc')
      );
      const unsubscribeProducts = onSnapshot(productsQuery, 
        (snapshot) => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          setProducts(productsData);

          // Generate product activities
          const productActivities: RecentActivity[] = productsData.map(product => ({
            id: `prod-${product.id}`,
            type: 'product',
            title: 'New Product Added',
            description: `${product.name} (SKU: ${product.sku}) - Stock: ${product.currentStock}`,
            timestamp: product.createdAt,
            user: 'Inventory Manager',
            metadata: {
              productName: product.name
            }
          }));
          setRecentActivities(prev => [...prev, ...productActivities]);
        },
        (error) => {
          console.error('Error fetching products:', error);
        }
      );
      unsubscribes.push(unsubscribeProducts);

      // Departments Collection - Last 5 days
      const departmentsQuery = query(
        collection(db, 'departments'),
        where('createdAt', '>=', Timestamp.fromDate(fiveDaysAgo)),
        orderBy('createdAt', 'desc')
      );
      const unsubscribeDepartments = onSnapshot(departmentsQuery, 
        (snapshot) => {
          const departmentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Department[];
          setDepartments(departmentsData);

          // Generate department activities
          const departmentActivities: RecentActivity[] = departmentsData.map(dept => ({
            id: `dept-${dept.id}`,
            type: 'department',
            title: 'New Department Created',
            description: `${dept.name} - Manager: ${dept.manager}`,
            timestamp: dept.createdAt,
            user: 'Admin',
            metadata: {
              departmentName: dept.name
            }
          }));
          setRecentActivities(prev => [...prev, ...departmentActivities]);
        },
        (error) => {
          console.error('Error fetching departments:', error);
        }
      );
      unsubscribes.push(unsubscribeDepartments);

      // Payroll Collection
      const payrollQuery = query(
        collection(db, 'salaryManagement'),
        where('month', '==', currentMonth)
      );
      const unsubscribePayroll = onSnapshot(payrollQuery, 
        (snapshot) => {
          const payrollData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Payroll[];
          setPayrolls(payrollData);
        },
        (error) => {
          console.error('Error fetching payroll:', error);
        }
      );
      unsubscribes.push(unsubscribePayroll);

    } catch (error) {
      console.error('Error setting up Firebase listeners:', error);
      toast.error('Failed to initialize dashboard data');
    }

    setLoading(false);

    // Cleanup subscriptions
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [currentMonth, formatAmount]);

  // Sort activities by timestamp (newest first) and remove duplicates
  const sortedActivities = recentActivities
    .filter((activity, index, self) => 
      index === self.findIndex(a => a.id === activity.id)
    )
    .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
    .slice(0, 10); // Show last 10 activities

  // Refresh Data Function
  const refreshData = () => {
    setLastRefresh(new Date());
    toast.success('Dashboard refreshed successfully');
  };

  // Chart Data based on real data
  const revenueData = [
    { month: 'Jan', revenue: Math.round(totalRevenue * 0.07) },
    { month: 'Feb', revenue: Math.round(totalRevenue * 0.08) },
    { month: 'Mar', revenue: Math.round(totalRevenue * 0.09) },
    { month: 'Apr', revenue: Math.round(totalRevenue * 0.1) },
    { month: 'May', revenue: Math.round(totalRevenue * 0.11) },
    { month: 'Jun', revenue: Math.round(totalRevenue * 0.12) },
    { month: 'Jul', revenue: Math.round(totalRevenue * 0.13) },
    { month: 'Aug', revenue: Math.round(totalRevenue * 0.12) },
    { month: 'Sep', revenue: Math.round(totalRevenue * 0.11) },
    { month: 'Oct', revenue: Math.round(totalRevenue * 0.1) },
    { month: 'Nov', revenue: Math.round(totalRevenue * 0.09) },
    { month: 'Dec', revenue: Math.round(totalRevenue * 0.08) },
  ];

  const userGrowthData = [
    { month: 'Jan', employees: Math.round(activeEmployees * 0.3) },
    { month: 'Feb', employees: Math.round(activeEmployees * 0.4) },
    { month: 'Mar', employees: Math.round(activeEmployees * 0.5) },
    { month: 'Apr', employees: Math.round(activeEmployees * 0.6) },
    { month: 'May', employees: Math.round(activeEmployees * 0.7) },
    { month: 'Jun', employees: Math.round(activeEmployees * 0.8) },
    { month: 'Jul', employees: Math.round(activeEmployees * 0.9) },
    { month: 'Aug', employees: activeEmployees },
    { month: 'Sep', employees: activeEmployees },
    { month: 'Oct', employees: activeEmployees },
    { month: 'Nov', employees: activeEmployees },
    { month: 'Dec', employees: activeEmployees },
  ];

  const systemPerformanceData = [
    { service: 'API Gateway', uptime: 99.9, responseTime: 120 },
    { service: 'Database', uptime: 99.8, responseTime: 85 },
    { service: 'File Storage', uptime: 100, responseTime: 95 },
    { service: 'Email Service', uptime: 98.5, responseTime: 150 },
  ];

  const projectStatusData = [
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#10B981' },
    { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#3B82F6' },
    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: '#8B5CF6' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, color: '#F59E0B' },
  ];

  const metrics = [
    {
      title: 'Total Users',
      value: loading ? '...' : totalUsers.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Active system users'
    },
    {
      title: 'Active Employees',
      value: loading ? '...' : activeEmployees.toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: UserCheck,
      description: 'Currently employed staff'
    },
    {
      title: 'Active Projects',
      value: loading ? '...' : activeProjects.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: Building2,
      description: 'Ongoing project engagements'
    },
    {
      title: 'Monthly Payroll',
      value: loading ? '...' : formatAmount(monthlyPayroll),
      change: '+3%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'Monthly salary expenses'
    },
    {
      title: 'Total Revenue',
      value: loading ? '...' : formatAmount(totalRevenue),
      change: '+15%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Annual revenue generated'
    },
    {
      title: 'Low Stock Items',
      value: loading ? '...' : lowStockItems.toString(),
      change: lowStockItems > 5 ? '+2' : '-3',
      changeType: lowStockItems > 5 ? 'negative' as const : 'positive' as const,
      icon: AlertTriangle,
      description: 'Items needing restock'
    },
  ];

  const systemHealth = [
    { service: 'API Gateway', status: 'healthy', uptime: '99.9%' },
    { service: 'Database', status: 'healthy', uptime: '99.8%' },
    { service: 'File Storage', status: 'healthy', uptime: '100%' },
    { service: 'Real-time Sync', status: 'healthy', uptime: '100%' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-red-600" />
          <p className="mt-2 text-gray-600">Loading real-time dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Currency Selector */}
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-4 lg:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-white truncate">Real-time System Overview</h1>
            <p className="text-red-100 mt-1 text-base lg:text-lg">Live ERP Dashboard with Last 5 Days Activity</p>
          </div>
          <div className="flex items-center space-x-3 lg:space-x-4 shrink-0">
            <CurrencySelector />
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshData}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 whitespace-nowrap"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="mt-3 lg:mt-4 text-xs lg:text-sm text-red-200">
          Last updated: {lastRefresh.toLocaleString()} • Live Data: Active • Currency: {currency}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200 group min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-red-700 transition-colors leading-tight">
                  {metric.title}
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors shrink-0">
                  <IconComponent className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 break-all">
                  {metric.value}
                </div>
                <p className="text-xs text-gray-500 mb-2 leading-tight">{metric.description}</p>
                <p className="text-sm leading-tight">
                  <span
                    className={
                      metric.changeType === 'positive'
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    }
                  >
                    {metric.change}
                  </span>{' '}
                  <span className="text-gray-500 text-xs">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Revenue Trend Chart */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-red-50 to-red-100 rounded-t-lg p-4 lg:p-6">
            <CardTitle className="text-lg lg:text-xl text-gray-900">Revenue Trend</CardTitle>
            <CardDescription className="text-gray-600 font-medium text-sm">
              Monthly revenue projection ({currency})
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 lg:pt-6 px-4 lg:px-6">
            <ResponsiveContainer width="100%" height={280} className="min-h-[280px]">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis tickFormatter={(value) => `${currency === 'AED' ? 'د.إ' : '$'}${(value / 1000).toFixed(0)}k`} fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [formatAmount(value), 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#DC2626"
                  fill="#FEE2E2"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Growth Chart */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-red-50 to-red-100 rounded-t-lg p-4 lg:p-6">
            <CardTitle className="text-lg lg:text-xl text-gray-900">Employee Growth</CardTitle>
            <CardDescription className="text-gray-600 font-medium text-sm">
              Monthly employee acquisition trends
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 lg:pt-6 px-4 lg:px-6">
            <ResponsiveContainer width="100%" height={280} className="min-h-[280px]">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="employees"
                  stroke="#DC2626"
                  strokeWidth={3}
                  name="Employees"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* System Performance Chart */}
        

        
      </div>

      {/* Recent Activities & System Health */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Activities */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-red-50 to-red-100 rounded-t-lg p-4 lg:p-6">
            <CardTitle className="text-lg lg:text-xl text-gray-900">Recent Activities (Last 5 Days)</CardTitle>
            <CardDescription className="text-gray-600 font-medium text-sm">
              New products, projects, departments and employees added
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 lg:pt-6 px-4 lg:px-6">
            <div className="space-y-3 max-h-80 lg:max-h-96 overflow-y-auto">
              {sortedActivities.length > 0 ? (
                sortedActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-red-200 hover:border-red-400">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} shrink-0`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5 leading-tight">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">
                          By: {activity.user || 'System'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {getTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activities in the last 5 days</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        </div>
  </div>
  )}
