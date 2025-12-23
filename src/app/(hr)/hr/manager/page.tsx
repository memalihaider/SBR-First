'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { format, parseISO, startOfMonth, endOfMonth, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  Briefcase,
  Phone,
  Mail,
  Eye,
  UserPlus,
  Calendar as CalendarIcon,
  BarChart3,
  Filter,
  Search,
  Download,
  Building,
  Plus,
  Users2,
  Target,
  Award,
  Star
} from 'lucide-react';
import { collection, getDocs, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Department {
  id: string;
  name: string;
  head: string;
  email: string;
  phone: string;
  budget: string;
  employees: number;
  growth: string;
  description: string;
  createdAt: Timestamp;
}

interface DepartmentHeadHistory {
  id: string;
  departmentId: string;
  departmentName: string;
  headName: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  isCurrent: boolean;
}

export default function DepartmentsPage() {
  // State variables
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentHistory, setDepartmentHistory] = useState<DepartmentHeadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected month for filtering
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  
  // Dialog states
  const [viewDepartmentDetailsOpen, setViewDepartmentDetailsOpen] = useState(false);
  const [viewHeadHistoryOpen, setViewHeadHistoryOpen] = useState(false);
  
  // Selected items
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  // Form states
  const [addDepartmentForm, setAddDepartmentForm] = useState({
    name: '',
    head: '',
    email: '',
    phone: '',
    budget: '',
    employees: 0,
    growth: '+0%',
    description: '',
  });

  const availableMonths = useMemo(() => {
    const months = Array.from(
      new Set([
        ...departments.map(dept => format(dept.createdAt?.toDate?.() || new Date(), 'yyyy-MM')),
        ...departmentHistory.map(hist => format(hist.startDate?.toDate?.() || new Date(), 'yyyy-MM'))
      ])
    ).sort().reverse();
    
    return months.length > 0 ? months : [format(new Date(), 'yyyy-MM')];
  }, [departments, departmentHistory]);

  // Format month for display
  const formatMonthDisplay = (monthStr: string) => {
    const date = parseISO(monthStr + '-01');
    return format(date, 'MMMM yyyy');
  };

// Get available months for filtering - January 2025 to December 2025

  // Fetch data from Firebase
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch departments
      const departmentsSnapshot = await getDocs(query(collection(db, 'departments'), orderBy('createdAt', 'desc')));
      const departmentsData: Department[] = [];
      departmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        departmentsData.push({
          id: doc.id,
          name: data.name || '',
          head: data.head || '',
          email: data.email || '',
          phone: data.phone || '',
          budget: data.budget || '',
          employees: data.employees || 0,
          growth: data.growth || '+0%',
          description: data.description || '',
          createdAt: data.createdAt || Timestamp.now(),
        });
      });
      setDepartments(departmentsData);

      // Fetch department head history (if you have a collection for this)
      // If not, we can generate from departments data
      const historyData: DepartmentHeadHistory[] = [];
      departmentsData.forEach(dept => {
        historyData.push({
          id: dept.id + '-current',
          departmentId: dept.id,
          departmentName: dept.name,
          headName: dept.head,
          startDate: dept.createdAt,
          isCurrent: true,
        });
      });
      setDepartmentHistory(historyData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load departments data');
    } finally {
      setLoading(false);
    }
  };

  // Get departments created in selected month
  const getNewDepartmentsForMonth = () => {
    return departments.filter(dept => {
      const createdDate = dept.createdAt?.toDate?.();
      if (!createdDate) return false;
      return format(createdDate, 'yyyy-MM') === selectedMonth;
    });
  };

  // Get departments updated in selected month
  const getUpdatedDepartmentsForMonth = () => {
    return departments.filter(dept => {
      // For now, using creation date as update date
      // You would need an 'updatedAt' field for accurate data
      const createdDate = dept.createdAt?.toDate?.();
      if (!createdDate) return false;
      return format(createdDate, 'yyyy-MM') === selectedMonth;
    });
  };

  // Get new heads in selected month
  const getNewHeadsForMonth = () => {
    return departmentHistory.filter(hist => {
      const startDate = hist.startDate?.toDate?.();
      if (!startDate) return false;
      return format(startDate, 'yyyy-MM') === selectedMonth;
    });
  };

  // Calculate department statistics
  const calculateDepartmentStats = () => {
    const totalDepartments = departments.length;
    const totalEmployees = departments.reduce((sum, dept) => sum + dept.employees, 0);
    const avgEmployeesPerDept = totalDepartments > 0 ? Math.round(totalEmployees / totalDepartments) : 0;
    
    const totalBudget = departments.reduce((sum, dept) => {
      const budget = parseInt(dept.budget) || 0;
      return sum + budget;
    }, 0);
    
    const newThisMonth = getNewDepartmentsForMonth().length;
    const newHeadsThisMonth = getNewHeadsForMonth().length;
    
    return {
      totalDepartments,
      totalEmployees,
      avgEmployeesPerDept,
      totalBudget,
      newThisMonth,
      newHeadsThisMonth
    };
  };

  // Get departments sorted by creation date
  const getDepartmentsSortedByDate = () => {
    return [...departments].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Get growth status color
  const getGrowthColor = (growth: string) => {
    if (growth.includes('+')) return 'text-green-600 bg-green-100';
    if (growth.includes('-')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  // Handle view department details
  const handleViewDepartmentDetails = (department: Department) => {
    setSelectedDepartment(department);
    setViewDepartmentDetailsOpen(true);
  };

  // Handle view head history
  const handleViewHeadHistory = (department: Department) => {
    setSelectedDepartment(department);
    setViewHeadHistoryOpen(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Get department stats
  const stats = calculateDepartmentStats();

  // Department stats cards
  const departmentStats = [
    {
      title: 'Total Departments',
      value: stats.totalDepartments.toString(),
      change: stats.newThisMonth,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `Active departments in organization`
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toLocaleString(),
      change: 0,
      icon: Users2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Across all departments'
    },
    
    {
      title: 'Total Budget',
      value: `$${stats.totalBudget.toLocaleString()}`,
      change: 0,
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Combined department budgets'
    },
  ];

  // Monthly activity stats
  const monthlyStats: any[] = [
    
    
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Departments Dashboard</h1>
            <p className="text-blue-100 mt-1 text-lg">Department management and tracking system</p>
          </div>
          <div className="flex items-center space-x-4">
           
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Department Overview</h2>
              <p className="text-sm text-gray-600">Select month to view department statistics</p>
            </div>
            <div className="flex items-center space-x-4">
              
              
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - Department Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departmentStats.map((stat, index) => {
          const IconComponent = stat.icon;
          const changeValue = stat.change;
          const isPositive = changeValue > 0;
          
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
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
                <p className="text-sm text-gray-600 mt-1">{stat.description}</p>
                {changeValue !== 0 && (
                  <p className="text-sm mt-2">
                    <span className={isPositive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {isPositive ? `+${changeValue}` : changeValue}
                    </span>{' '}
                    <span className="text-gray-500">this month</span>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Grid - Monthly Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {monthlyStats.map((stat, index) => {
          const IconComponent = stat.icon;
          
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200">
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
                <p className="text-sm text-gray-600 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Departments List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl text-gray-900">All Departments</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                {departments.length} departments in total
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              
             
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {getDepartmentsSortedByDate().map((dept) => (
              <div key={dept.id} className="p-6 rounded-lg border hover:bg-gray-50 transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-gray-900">{dept.name}</h3>
                          <Badge className={`${getGrowthColor(dept.growth)} px-3 py-1`}>
                            {dept.growth}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{dept.employees} employees</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Budget: {dept.budget}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              Created: {dept.createdAt?.toDate?.() 
                                ? format(dept.createdAt.toDate(), 'dd MMM yyyy')
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-12 space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Users className="h-3 w-3 mr-1" />
                            Head: {dept.head}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{dept.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{dept.phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      {dept.description && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {dept.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 lg:flex-col lg:items-end lg:space-x-0 lg:space-y-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {dept.employees}
                      </p>
                      <p className="text-sm text-gray-500">Employees</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => handleViewDepartmentDetails(dept)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="ml-2">Details</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                        onClick={() => handleViewHeadHistory(dept)}
                      >
                        <Users className="h-4 w-4" />
                        <span className="ml-2">History</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {departments.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No departments found</h3>
                <p className="text-gray-600 mt-1">Add your first department to get started</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Department
                </Button>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading departments...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Departments This Month */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">New Departments This Month</CardTitle>
            <CardDescription className="text-gray-600">
              Departments created in {formatMonthDisplay(selectedMonth)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getNewDepartmentsForMonth().map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{dept.name}</p>
                      <p className="text-xs text-gray-500">Head: {dept.head}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{dept.employees} employees</p>
                    <p className="text-xs text-gray-500">
                      Created {dept.createdAt?.toDate?.() 
                        ? format(dept.createdAt.toDate(), 'dd MMM')
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
              {getNewDepartmentsForMonth().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No new departments this month
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* New Department Heads This Month */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">New Department Heads This Month</CardTitle>
            <CardDescription className="text-gray-600">
              Heads assigned in {formatMonthDisplay(selectedMonth)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getNewHeadsForMonth().map((hist) => (
                <div key={hist.id} className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{hist.headName}</p>
                      <p className="text-xs text-gray-500">{hist.departmentName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      New Head
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Assigned {hist.startDate?.toDate?.() 
                        ? format(hist.startDate.toDate(), 'dd MMM')
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
              {getNewHeadsForMonth().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No new department heads this month
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Growth Timeline */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Departments Growth Timeline</CardTitle>
          <CardDescription className="text-gray-600">
            Departments created over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Budget</TableHead>
                 
                </TableRow>
              </TableHeader>
              <TableBody>
                {getDepartmentsSortedByDate().map((dept) => {
                  const createdDate = dept.createdAt?.toDate?.() || new Date();
                  const monthsActive = differenceInMonths(new Date(), createdDate);
                  
                  return (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                          <span>{dept.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{dept.head}</TableCell>
                      <TableCell>
                        {format(createdDate, 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">
                          {dept.employees}
                        </Badge>
                      </TableCell>
                      <TableCell>{dept.budget}</TableCell>
                      
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Department Details Dialog */}
      <Dialog open={viewDepartmentDetailsOpen} onOpenChange={setViewDepartmentDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedDepartment?.name} department
            </DialogDescription>
          </DialogHeader>
          
          {selectedDepartment && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-100 rounded-xl">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedDepartment.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    
                    <span className="text-sm text-gray-500">
                      Created: {selectedDepartment.createdAt?.toDate?.() 
                        ? format(selectedDepartment.createdAt.toDate(), 'dd MMMM yyyy')
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Department Head</p>
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                      <p className="text-lg font-semibold text-gray-900">{selectedDepartment.head}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Contact Information</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{selectedDepartment.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{selectedDepartment.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Resources</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Employees</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{selectedDepartment.employees}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Budget</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{selectedDepartment.budget}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                   
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                      
                        <Progress 
                          value={parseInt(selectedDepartment.growth) + 50 || 50} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedDepartment.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedDepartment.description}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setViewDepartmentDetailsOpen(false)}>
                  Close
                </Button>
                
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Head History Dialog */}
      <Dialog open={viewHeadHistoryOpen} onOpenChange={setViewHeadHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Department Head History</DialogTitle>
            <DialogDescription>
              Historical record of department heads for {selectedDepartment?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDepartment && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedDepartment.name}</h3>
                  <p className="text-sm text-gray-600">Department Head Timeline</p>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {departmentHistory
                  .filter(hist => hist.departmentId === selectedDepartment.id)
                  .map((hist, index) => (
                    <div key={hist.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{hist.headName}</p>
                          <p className="text-sm text-gray-500">
                            {hist.isCurrent ? 'Current Head' : 'Previous Head'}
                          </p>
                        </div>
                        <Badge className={hist.isCurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {hist.isCurrent ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="text-gray-900">
                            {hist.startDate?.toDate?.() 
                              ? format(hist.startDate.toDate(), 'dd MMM yyyy')
                              : 'N/A'}
                          </p>
                        </div>
                        {hist.endDate && (
                          <div>
                            <p className="text-gray-500">End Date</p>
                            <p className="text-gray-900">
                              {format(hist.endDate.toDate(), 'dd MMM yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {index < departmentHistory.length - 1 && (
                        <div className="h-4 w-0.5 bg-gray-200 mx-auto mt-2"></div>
                      )}
                    </div>
                  ))}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setViewHeadHistoryOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}