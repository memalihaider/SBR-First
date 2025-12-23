'use client';

import { useState, useEffect ,useMemo} from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, getMonth, getYear, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Clock, 
  CheckCircle, 
  Plus, 
  Eye, 
  Edit, 
  BarChart3, 
  Calendar as CalendarIcon, 
  Star, 
  Trophy, 
  Gift, 
  UserPlus,
  UserMinus,
  DollarSign,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  TrendingDown,
  FileText,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  email: string;
  phone: string;
  joinDate: string;
  manager: string;
  status: string;
  address: string;
  skills: string[];
  createdAt: Timestamp;
}

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // Format: YYYY-MM
  year: number;
  quarter: string; // Q1, Q2, Q3, Q4
  overallRating: number;
  communication: number;
  teamwork: number;
  leadership: number;
  technicalSkills: number;
  achievements: string[];
  areasForImprovement: string[];
  developmentPlan: string[];
  reviewerComments: string;
  reviewer: string;
  reviewDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  salaryIncrease?: number;
  promotion?: string;
  goals: PerformanceGoal[];
}

interface PerformanceGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  progress: number;
  status: 'on-track' | 'behind' | 'completed' | 'cancelled';
  weight: number;
  createdAt: string;
  updatedAt: string;
}

interface MonthlyStats {
  month: string; // Format: YYYY-MM
  totalEmployees: number;
  newEmployees: number;
  departedEmployees: number;
  avgSalary: number;
  totalSalary: number;
  avgPerformance: number;
  topPerformer?: string;
  departmentBreakdown: {
    [key: string]: number;
  };
}

export default function HRPerformancePage() {
  // State variables
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected month for filtering
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  
  // Dialog states
  const [scheduleReviewOpen, setScheduleReviewOpen] = useState(false);
  const [setGoalsOpen, setSetGoalsOpen] = useState(false);
  const [conductReviewOpen, setConductReviewOpen] = useState(false);
  const [viewReviewDetailsOpen, setViewReviewDetailsOpen] = useState(false);
  const [viewEmployeeDetailsOpen, setViewEmployeeDetailsOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  
  // Selected items
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPerformanceGoal, setSelectedPerformanceGoal] = useState<PerformanceGoal | null>(null);

  // Form states
  const [scheduleReviewForm, setScheduleReviewForm] = useState({
    employeeId: '',
    reviewer: '',
    reviewType: 'monthly',
    month: format(new Date(), 'yyyy-MM'),
    quarter: getQuarterFromDate(new Date()),
    notes: '',
  });

  const [setGoalsForm, setSetGoalsForm] = useState({
    employeeId: '',
    title: '',
    description: '',
    category: 'performance',
    targetDate: format(new Date(), 'yyyy-MM-dd'),
    weight: 1,
  });

  const [conductReviewForm, setConductReviewForm] = useState({
    employeeId: '',
    month: format(new Date(), 'yyyy-MM'),
    overallRating: 5,
    communication: 5,
    teamwork: 5,
    leadership: 5,
    technicalSkills: 5,
    achievements: [''],
    areasForImprovement: [''],
    developmentPlan: [''],
    reviewerComments: '',
    reviewer: 'HR Manager',
    salaryIncrease: 0,
    promotion: '',
  });

  const [addEmployeeForm, setAddEmployeeForm] = useState({
    name: '',
    position: '',
    department: '',
    salary: 0,
    email: '',
    phone: '',
    joinDate: format(new Date(), 'yyyy-MM-dd'),
    manager: '',
    address: '',
    skills: [] as string[],
    status: 'active',
  });

  // Get current month stats
  const currentMonthStats = monthlyStats.find(stat => stat.month === selectedMonth);
  
  // Get available months for filtering
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(monthlyStats.map(stat => stat.month))).sort().reverse();
    return months.length > 0 ? months : [format(new Date(), 'yyyy-MM')];
  }, [monthlyStats]);

  // Helper function to get quarter from date
  function getQuarterFromDate(date: Date): string {
    const month = date.getMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  }

  // Fetch data from Firebase
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const employeesSnapshot = await getDocs(collection(db, 'employeeList'));
      const employeesData: Employee[] = [];
      employeesSnapshot.forEach((doc) => {
        const data = doc.data();
        employeesData.push({
          id: doc.id,
          name: data.name || '',
          position: data.position || '',
          department: data.department || '',
          salary: data.salary || 0,
          email: data.email || '',
          phone: data.phone || '',
          joinDate: data.joinDate || '',
          manager: data.manager || '',
          status: data.status || 'active',
          address: data.address || '',
          skills: data.skills || [],
          createdAt: data.createdAt || Timestamp.now(),
        });
      });
      setEmployees(employeesData);

      // Calculate monthly stats
      const stats = calculateMonthlyStats(employeesData);
      setMonthlyStats(stats);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly statistics from employee data
  const calculateMonthlyStats = (employeesData: Employee[]): MonthlyStats[] => {
    const stats: MonthlyStats[] = [];
    const now = new Date();
    
    // Generate stats for last 12 months
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = format(month, 'yyyy-MM');
      
      // Filter employees active in this month
      const activeEmployees = employeesData.filter(emp => {
        const joinDate = parseISO(emp.joinDate);
        return joinDate <= endOfMonth(month) && 
               (emp.status === 'active' || emp.createdAt.toDate() <= endOfMonth(month));
      });
      
      const newEmployees = employeesData.filter(emp => {
        const joinDate = parseISO(emp.joinDate);
        return format(joinDate, 'yyyy-MM') === monthStr;
      });
      
      const avgSalary = activeEmployees.length > 0 
        ? activeEmployees.reduce((sum, emp) => sum + emp.salary, 0) / activeEmployees.length
        : 0;
      
      const departmentBreakdown: { [key: string]: number } = {};
      activeEmployees.forEach(emp => {
        departmentBreakdown[emp.department] = (departmentBreakdown[emp.department] || 0) + 1;
      });
      
      stats.push({
        month: monthStr,
        totalEmployees: activeEmployees.length,
        newEmployees: newEmployees.length,
        departedEmployees: 0, // Would need termination data
        avgSalary: Math.round(avgSalary),
        totalSalary: activeEmployees.reduce((sum, emp) => sum + emp.salary, 0),
        avgPerformance: 7.5, // Placeholder - would come from performance reviews
        departmentBreakdown,
      });
    }
    
    return stats.reverse();
  };

  // Get employees for selected month
  const getEmployeesForMonth = () => {
    return employees.filter(emp => {
      const joinDate = parseISO(emp.joinDate);
      return format(joinDate, 'yyyy-MM') <= selectedMonth;
    });
  };

  // Get new employees for selected month
  const getNewEmployeesForMonth = () => {
    return employees.filter(emp => {
      const joinDate = parseISO(emp.joinDate);
      return format(joinDate, 'yyyy-MM') === selectedMonth;
    });
  };

  // Get performance reviews for selected month
  const getReviewsForMonth = () => {
    return performanceReviews.filter(review => review.month === selectedMonth);
  };

  // Handler functions
  const handleScheduleReview = async () => {
    try {
      if (!scheduleReviewForm.employeeId || !scheduleReviewForm.reviewer) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Here you would save to Firebase
      toast.success('Performance review scheduled successfully!');
      setScheduleReviewOpen(false);
      setScheduleReviewForm({
        employeeId: '',
        reviewer: '',
        reviewType: 'monthly',
        month: format(new Date(), 'yyyy-MM'),
        quarter: getQuarterFromDate(new Date()),
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to schedule review');
    }
  };

  const handleSetGoals = async () => {
    try {
      if (!setGoalsForm.employeeId || !setGoalsForm.title) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Here you would save to Firebase
      toast.success('Performance goal set successfully!');
      setSetGoalsOpen(false);
      setSetGoalsForm({
        employeeId: '',
        title: '',
        description: '',
        category: 'performance',
        targetDate: format(new Date(), 'yyyy-MM-dd'),
        weight: 1,
      });
    } catch (error) {
      toast.error('Failed to set goal');
    }
  };

  const handleConductReview = async () => {
    try {
      if (!conductReviewForm.employeeId) {
        toast.error('Please select an employee');
        return;
      }

      // Here you would save to Firebase
      toast.success('Performance review completed successfully!');
      setConductReviewOpen(false);
      setConductReviewForm({
        employeeId: '',
        month: format(new Date(), 'yyyy-MM'),
        overallRating: 5,
        communication: 5,
        teamwork: 5,
        leadership: 5,
        technicalSkills: 5,
        achievements: [''],
        areasForImprovement: [''],
        developmentPlan: [''],
        reviewerComments: '',
        reviewer: 'HR Manager',
        salaryIncrease: 0,
        promotion: '',
      });
    } catch (error) {
      toast.error('Failed to complete review');
    }
  };

  const handleViewEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewEmployeeDetailsOpen(true);
  };

  const handleAddEmployee = async () => {
    try {
      // Validate required fields
      const requiredFields = ['name', 'position', 'department', 'email', 'phone'];
      const missingFields = requiredFields.filter(field => !addEmployeeForm[field as keyof typeof addEmployeeForm]);
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }

      // Here you would save to Firebase
      toast.success('Employee added successfully!');
      setAddEmployeeOpen(false);
      setAddEmployeeForm({
        name: '',
        position: '',
        department: '',
        salary: 0,
        email: '',
        phone: '',
        joinDate: format(new Date(), 'yyyy-MM-dd'),
        manager: '',
        address: '',
        skills: [],
        status: 'active',
      });
      
      // Refresh data
      fetchData();
    } catch (error) {
      toast.error('Failed to add employee');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Performance stats based on current month
  const performanceStats = [
    {
      title: 'Total Employees',
      value: currentMonthStats?.totalEmployees.toString() || '0',
      change: currentMonthStats?.newEmployees || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `Active in ${format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}`
    },
    {
      title: 'New Hires',
      value: currentMonthStats?.newEmployees.toString() || '0',
      change: 0,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Joined this month'
    },
    
    {
      title: 'Total Payroll',
      value: currentMonthStats ? `$${(currentMonthStats.totalSalary / 1000).toFixed(1)}K` : '$0',
      change: 0,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Monthly salary expenditure'
    },
  ];

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'on-leave':
        return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Get department breakdown
  const getDepartmentBreakdown = () => {
    if (!currentMonthStats) return [];
    return Object.entries(currentMonthStats.departmentBreakdown).map(([dept, count]) => ({
      department: dept,
      count,
      percentage: (count / currentMonthStats.totalEmployees) * 100
    }));
  };

  // Format month for display
  const formatMonthDisplay = (monthStr: string) => {
    const date = parseISO(monthStr + '-01');
    return format(date, 'MMMM yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">HR Performance Dashboard</h1>
            <p className="text-purple-100 mt-1 text-lg">Monthly employee tracking and performance management</p>
          </div>
          
        </div>
      </div>

      {/* Month Selector */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
              <p className="text-sm text-gray-600">Select month to view statistics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {formatMonthDisplay(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
             
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceStats.map((stat, index) => {
          const IconComponent = stat.icon;
          const changeValue = stat.change;
          const isPositive = changeValue > 0;
          const isNegative = changeValue < 0;
          
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200">
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
                    <span className="text-gray-500">from previous month</span>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee List for Selected Month */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl text-gray-900">
                  Employees - {formatMonthDisplay(selectedMonth)}
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  {getEmployeesForMonth().length} active employees
                </CardDescription>
              </div>
              
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {getEmployeesForMonth().map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {employee.name}
                          </p>
                          {getStatusBadge(employee.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {employee.position} • {employee.department}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined: {format(parseISO(employee.joinDate), 'dd MMM yyyy')} • Manager: {employee.manager}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${employee.salary.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Monthly</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                      onClick={() => handleViewEmployeeDetails(employee)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Breakdown & New Hires */}
        <div className="space-y-6">
          {/* Department Breakdown */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Department Breakdown</CardTitle>
              <CardDescription className="text-gray-600">
                Employee distribution by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getDepartmentBreakdown().map((dept) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{dept.department}</span>
                      <span className="text-gray-600">{dept.count} employees </span>
                    </div>
                    <Progress value={dept.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Hires This Month */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">New Hires This Month</CardTitle>
              <CardDescription className="text-gray-600">
                Employees joined in {formatMonthDisplay(selectedMonth)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getNewEmployeesForMonth().map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.position}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Joined {format(parseISO(employee.joinDate), 'dd MMM')}
                    </Badge>
                  </div>
                ))}
                {getNewEmployeesForMonth().length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No new hires this month
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Trends */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Monthly Trends</CardTitle>
          <CardDescription className="text-gray-600">
            Employee statistics over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Total Employees</TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyStats.slice(0,12).reverse().map((stat) => (
                  <TableRow key={stat.month} className={stat.month === selectedMonth ? 'bg-purple-50' : ''}>
                    <TableCell className="font-medium">
                      {formatMonthDisplay(stat.month)}
                      {stat.month === selectedMonth && (
                        <Badge className="ml-2 bg-purple-100 text-purple-800">Current</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{stat.totalEmployees}</TableCell>
                   
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      
     
      

      
    </div>
  );
}