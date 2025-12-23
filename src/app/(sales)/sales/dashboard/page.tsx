'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target, 
  RefreshCw, 
  Download, 
  Building, 
  FileText, 
  CheckCircle, 
  XCircle,
  Calendar,
  Clock,
  BarChart3,
  Activity,
  Award,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { useCurrencyStore } from '@/stores/currency';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { collection, onSnapshot, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string;
  companyName: string;
  primaryContact: {
    name: string;
    email: string;
  };
  customerType: string;
  isActive: boolean;
  createdAt: any;
  totalRevenue: number;
  address: {
    city: string;
    country: string;
  };
  projects: string[];
}

interface Project {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  budgetAmount: number;
  completionPercentage: number;
  status: string;
  createdAt: any;
  projectManager: string;
  startDate: any;
  endDate: any;
}

export default function SalesDashboard() {
  const { formatAmount } = useCurrencyStore();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Firebase data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time data from Firebase
  useEffect(() => {
    const fetchData = () => {
      try {
        setLoading(true);
        
        // Fetch customers
        const customersQuery = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
        const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
          const customersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Customer[];
          
          setCustomers(customersData);
        }, (error) => {
          console.error('Error fetching customers:', error);
          toast.error('Failed to load customers');
        });

        // Fetch projects
        const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];
          
          setProjects(projectsData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching projects:', error);
          toast.error('Failed to load projects');
          setLoading(false);
        });

        return () => {
          unsubscribeCustomers();
          unsubscribeProjects();
        };
      } catch (error) {
        console.error('Error setting up subscriptions:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics from real data
  const calculateStats = () => {
    // Total customers
    const totalCustomers = customers.length;
    
    // Total projects
    const totalProjects = projects.length;
    
    // Completed projects
    const completedProjects = projects.filter(p => 
      p.status === 'completed' || p.completionPercentage === 100
    ).length;
    
    // Active customers (customers with isActive = true)
    const activeCustomers = customers.filter(c => c.isActive).length;
    
    // Inactive customers
    const inactiveCustomers = customers.filter(c => !c.isActive).length;
    
    // Total revenue (sum of all project budgets)
    const totalRevenue = projects.reduce((sum, project) => sum + (project.budgetAmount || 0), 0);
    
    // Revenue by customer type
    const revenueByType = customers.reduce((acc, customer) => {
      const customerProjects = projects.filter(p => p.customerId === customer.id);
      const customerRevenue = customerProjects.reduce((sum, p) => sum + (p.budgetAmount || 0), 0);
      
      if (!acc[customer.customerType]) {
        acc[customer.customerType] = 0;
      }
      acc[customer.customerType] += customerRevenue;
      
      return acc;
    }, {} as Record<string, number>);
    
    // Recently added companies (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentCompanies = customers.filter(customer => {
      const createdAt = customer.createdAt?.toDate 
        ? customer.createdAt.toDate() 
        : new Date(customer.createdAt);
      return createdAt >= weekAgo;
    }).slice(0, 5);
    
    // Recently assigned projects (last 7 days)
    const recentProjects = projects.filter(project => {
      const createdAt = project.createdAt?.toDate 
        ? project.createdAt.toDate() 
        : new Date(project.createdAt);
      return createdAt >= weekAgo;
    }).slice(0, 5);
    
    // Projects by status
    const projectsByStatus = projects.reduce((acc, project) => {
      if (!acc[project.status]) {
        acc[project.status] = 0;
      }
      acc[project.status]++;
      return acc;
    }, {} as Record<string, number>);
    
    // Average project value
    const averageProjectValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;
    
    // Customer growth rate (this month vs last month)
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    
    const currentMonthCustomers = customers.filter(customer => {
      const createdAt = customer.createdAt?.toDate 
        ? customer.createdAt.toDate() 
        : new Date(customer.createdAt);
      return createdAt >= currentMonthStart && createdAt <= currentMonthEnd;
    }).length;
    
    const lastMonthCustomers = customers.filter(customer => {
      const createdAt = customer.createdAt?.toDate 
        ? customer.createdAt.toDate() 
        : new Date(customer.createdAt);
      return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
    }).length;
    
    const customerGrowthRate = lastMonthCustomers > 0 
      ? ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 
      : currentMonthCustomers > 0 ? 100 : 0;
    
    // Monthly revenue trend (last 6 months)
    const last6Months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now
    });
    
    const monthlyRevenue = last6Months.map(monthDate => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthRevenue = projects.filter(project => {
        const createdAt = project.createdAt?.toDate 
          ? project.createdAt.toDate() 
          : new Date(project.createdAt);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).reduce((sum, p) => sum + (p.budgetAmount || 0), 0);
      
      return {
        month: format(monthDate, 'MMM'),
        revenue: monthRevenue
      };
    });

    return {
      totalCustomers,
      totalProjects,
      completedProjects,
      activeCustomers,
      inactiveCustomers,
      totalRevenue,
      revenueByType,
      recentCompanies,
      recentProjects,
      projectsByStatus,
      averageProjectValue,
      customerGrowthRate,
      currentMonthCustomers,
      lastMonthCustomers,
      monthlyRevenue
    };
  };

  const stats = calculateStats();

  // Dashboard metrics cards
  const metrics = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: `${stats.customerGrowthRate.toFixed(1)}%`,
      changeType: stats.customerGrowthRate >= 0 ? 'positive' : 'negative' as const,
      icon: Users,
      color: 'blue',
      description: `${stats.currentMonthCustomers} new this month`
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects.toString(),
      change: `${stats.completedProjects} completed`,
      changeType: 'positive' as const,
      icon: Briefcase,
      color: 'purple',
      description: `${stats.completedProjects} completed (${stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%)`
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers.toString(),
      change: `${stats.inactiveCustomers} inactive`,
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'green',
      description: `${Math.round((stats.activeCustomers / stats.totalCustomers) * 100) || 0}% of total`
    },
    {
      title: 'Total Revenue',
      value: formatAmount(stats.totalRevenue),
      change: '+15%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'yellow',
      description: `${formatAmount(stats.averageProjectValue)} avg/project`
    }
  ];

  const statusMetrics = [
    {
      title: 'SME Customers',
      value: customers.filter(c => c.customerType === 'sme').length.toString(),
      change: `${formatAmount(stats.revenueByType.sme || 0)} revenue`,
      changeType: 'positive' as const,
      icon: Building,
      color: 'blue'
    },
    
    {
      title: 'In Progress',
      value: projects.filter(p => p.status === 'in-progress' || p.completionPercentage < 100).length.toString(),
      change: 'Active projects',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'orange'
    },
   
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Data refreshed');
    }, 1000);
  };

  const handleExportData = () => {
    const exportData = {
      customers: customers.length,
      projects: projects.length,
      revenue: stats.totalRevenue,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Data exported successfully!');
  };

  const handleViewCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleViewAllCustomers = () => {
    router.push('/customers');
  };

  const handleViewAllProjects = () => {
    router.push('/projects');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600">Real-time overview of customers and projects</p>
        </div>
        
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colorClass = `text-${metric.color}-600`;
          const bgColorClass = `bg-${metric.color}-100`;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 ${bgColorClass} rounded-lg`}>
                  <IconComponent className={`h-4 w-4 ${colorClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">{metric.description}</p>
                  <span className={`text-xs font-semibold ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colorClass = `text-${metric.color}-600`;
          const bgColorClass = `bg-${metric.color}-100`;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 ${bgColorClass} rounded-lg`}>
                    <IconComponent className={`h-5 w-5 ${colorClass}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                    <div className="text-xs text-gray-500">{metric.title}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`text-xs font-semibold ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Companies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recently Added Companies</CardTitle>
                <CardDescription>New customers added in last 7 days</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleViewAllCustomers}
                className="text-blue-600 hover:text-blue-700"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentCompanies.length > 0 ? (
                stats.recentCompanies.map((company) => {
                  const createdAt = company.createdAt?.toDate 
                    ? company.createdAt.toDate() 
                    : new Date(company.createdAt);
                  const daysAgo = differenceInDays(new Date(), createdAt);
                  
                  return (
                    <div 
                      key={company.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleViewCustomer(company.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{company.companyName}</p>
                          <p className="text-sm text-gray-600">{company.primaryContact.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize">
                          {company.customerType}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No new companies added recently</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recently Assigned Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recently Assigned Projects</CardTitle>
                <CardDescription>New projects assigned in last 7 days</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleViewAllProjects}
                className="text-blue-600 hover:text-blue-700"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentProjects.length > 0 ? (
                stats.recentProjects.map((project) => {
                  const createdAt = project.createdAt?.toDate 
                    ? project.createdAt.toDate() 
                    : new Date(project.createdAt);
                  const daysAgo = differenceInDays(new Date(), createdAt);
                  
                  return (
                    <div 
                      key={project.id} 
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleViewProject(project.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{project.name}</p>
                            <p className="text-sm text-gray-600">{project.customerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <span className="text-sm font-medium text-green-600">
                              {formatAmount(project.budgetAmount || 0)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{project.completionPercentage}%</span>
                        </div>
                        <Progress value={project.completionPercentage} className="h-1" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No new projects assigned recently</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue for last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyRevenue.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-sm font-semibold text-green-600">
                      {formatAmount(month.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((month.revenue / Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Distribution of projects across different statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.projectsByStatus).map(([status, count]) => {
                const percentage = (count / stats.totalProjects) * 100;
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                        <span className="text-sm text-gray-600">{count} projects</span>
                      </div>
                      <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: status === 'completed' ? '#22c55e' : 
                                         status === 'in-progress' ? '#3b82f6' : 
                                         status === 'planning' ? '#8b5cf6' : 
                                         status === 'on-hold' ? '#eab308' : '#6b7280'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {Object.keys(stats.projectsByStatus).length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No projects found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customer Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Customer Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Customers</span>
                <span className="font-bold">{stats.totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active</span>
                <span className="font-bold text-green-600">{stats.activeCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Inactive</span>
                <span className="font-bold text-red-600">{stats.inactiveCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New This Month</span>
                <span className="font-bold text-blue-600">{stats.currentMonthCustomers}</span>
              </div>
         
            </div>
          </CardContent>
        </Card>

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Project Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Projects</span>
                <span className="font-bold">{stats.totalProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-bold text-green-600">{stats.completedProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">In Progress</span>
                <span className="font-bold text-blue-600">
                  {projects.filter(p => p.status === 'in-progress' || p.completionPercentage < 100).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Value</span>
                <span className="font-bold">{formatAmount(stats.averageProjectValue)}</span>
              </div>
              
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Customer Growth</span>
                  <span className={`text-sm font-bold ${
                    stats.customerGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.customerGrowthRate.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(Math.abs(stats.customerGrowthRate), 100)} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Project Completion</span>
                  <span className="text-sm font-bold text-green-600">
                    {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects) * 100 : 0} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Active Rate</span>
                  <span className="text-sm font-bold text-blue-600">
                    {Math.round((stats.activeCustomers / stats.totalCustomers) * 100) || 0}%
                  </span>
                </div>
                <Progress 
                  value={stats.totalCustomers > 0 ? (stats.activeCustomers / stats.totalCustomers) * 100 : 0} 
                  className="h-2"
                />
              </div>
              
              <div className="text-center mt-4">
                <p className="text-lg font-bold text-gray-900">
                  {formatAmount(stats.totalRevenue)}
                </p>
                <p className="text-sm text-gray-600">Total Revenue Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}