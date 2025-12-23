'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Award, 
  Plus, 
  FileText, 
  Target,
  Building,
  User,
  DollarSign,
  Briefcase,
  Clock,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  onSnapshot,
  limit,
  startAfter,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Interfaces
interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  phone: string;
  joinDate: string;
  manager: string;
  status: string;
  address: string;
  skills: string[];
  createdAt: Timestamp;
}

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

// Dialogs (Same as before)
interface NewHireDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PerformanceReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JobPostingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function NewHireDialog({ isOpen, onClose }: NewHireDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    startDate: '',
    manager: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.position || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(`New hire onboarding initiated for ${formData.name}`);
    setFormData({
      name: '',
      email: '',
      position: '',
      department: '',
      startDate: '',
      manager: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Hire Onboarding</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter employee name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Enter job position"
            />
          </div>
          <div>
            <Label htmlFor="department">Department *</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="manager">Manager</Label>
            <Input
              id="manager"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              placeholder="Enter manager name"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">Start Onboarding</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PerformanceReviewDialog({ isOpen, onClose }: PerformanceReviewDialogProps) {
  const [formData, setFormData] = useState({
    employee: '',
    reviewType: '',
    dueDate: '',
    reviewer: '',
    notes: '',
  });

  const handleSubmit = () => {
    if (!formData.employee || !formData.reviewType || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(`Performance review scheduled for ${formData.employee}`);
    setFormData({
      employee: '',
      reviewType: '',
      dueDate: '',
      reviewer: '',
      notes: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Performance Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="employee">Employee Name *</Label>
            <Input
              id="employee"
              value={formData.employee}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              placeholder="Enter employee name"
            />
          </div>
          <div>
            <Label htmlFor="reviewType">Review Type *</Label>
            <Select value={formData.reviewType} onValueChange={(value) => setFormData({ ...formData, reviewType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select review type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarterly">Quarterly Review</SelectItem>
                <SelectItem value="annual">Annual Review</SelectItem>
                <SelectItem value="probation">Probation Review</SelectItem>
                <SelectItem value="promotion">Promotion Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="reviewer">Reviewer</Label>
            <Input
              id="reviewer"
              value={formData.reviewer}
              onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })}
              placeholder="Enter reviewer name"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">Schedule Review</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function JobPostingDialog({ isOpen, onClose }: JobPostingDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: '',
    salary: '',
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.department || !formData.location || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(`Job posting created: ${formData.title}`);
    setFormData({
      title: '',
      department: '',
      location: '',
      type: '',
      salary: '',
      description: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Job Posting</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter job title"
            />
          </div>
          <div>
            <Label htmlFor="department">Department *</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter job location"
            />
          </div>
          <div>
            <Label htmlFor="type">Employment Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="salary">Salary Range</Label>
            <Input
              id="salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="e.g., $50,000 - $70,000"
            />
          </div>
          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter job description"
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">Create Posting</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HRDashboard() {
  const router = useRouter();
  const [isNewHireDialogOpen, setIsNewHireDialogOpen] = useState(false);
  const [isPerformanceReviewDialogOpen, setIsPerformanceReviewDialogOpen] = useState(false);
  const [isJobPostingDialogOpen, setIsJobPostingDialogOpen] = useState(false);
  
  // State for real-time data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [newHiresThisMonth, setNewHiresThisMonth] = useState(0);
  const [newDepartmentHeads, setNewDepartmentHeads] = useState(0);
  const [averageSalary, setAverageSalary] = useState(0);
  const [totalSalaryExpense, setTotalSalaryExpense] = useState(0);

  // Fetch real-time data
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        setLoading(true);
        
        // Listen for employees changes
        const employeesQuery = query(collection(db, 'employeeList'), orderBy('createdAt', 'desc'));
        const employeesUnsubscribe = onSnapshot(employeesQuery, (snapshot) => {
          const employeesData: Employee[] = [];
          let totalSalary = 0;
          let newHiresCount = 0;
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            const employee = {
              id: doc.id,
              name: data.name || '',
              email: data.email || '',
              position: data.position || '',
              department: data.department || '',
              salary: data.salary || 0,
              phone: data.phone || '',
              joinDate: data.joinDate || '',
              manager: data.manager || '',
              status: data.status || 'active',
              address: data.address || '',
              skills: data.skills || [],
              createdAt: data.createdAt || Timestamp.now(),
            };
            
            employeesData.push(employee);
            totalSalary += employee.salary;
            
            // Count new hires this month
            const joinDate = new Date(employee.joinDate);
            if (joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear) {
              newHiresCount++;
            }
          });
          
          setEmployees(employeesData);
          setTotalEmployees(employeesData.length);
          setNewHiresThisMonth(newHiresCount);
          setAverageSalary(employeesData.length > 0 ? Math.round(totalSalary / employeesData.length) : 0);
          setTotalSalaryExpense(totalSalary);
        });

        // Listen for departments changes
        const departmentsQuery = query(collection(db, 'departments'), orderBy('createdAt', 'desc'));
        const departmentsUnsubscribe = onSnapshot(departmentsQuery, (snapshot) => {
          const departmentsData: Department[] = [];
          let newHeadsCount = 0;
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            const department = {
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
            };
            
            departmentsData.push(department);
            
            // Count new department heads this month
            const createdDate = department.createdAt?.toDate?.();
            if (createdDate && 
                createdDate.getMonth() === currentMonth && 
                createdDate.getFullYear() === currentYear) {
              newHeadsCount++;
            }
          });
          
          setDepartments(departmentsData);
          setTotalDepartments(departmentsData.length);
          setNewDepartmentHeads(newHeadsCount);
        });

        // Cleanup function
        return () => {
          employeesUnsubscribe();
          departmentsUnsubscribe();
        };

      } catch (error) {
        console.error('Error fetching real-time data:', error);
        toast.error('Failed to load HR data');
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeData();
  }, []);

  // Calculate metrics from real-time data
  const calculateMetrics = () => {
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const pendingReviews = Math.floor(employees.length * 0.15); // 15% of employees need reviews
    const openPositions = Math.max(0, 12 - newHiresThisMonth); // Assuming 12 total positions
    const employeeSatisfaction = 94; // You can calculate this from performance reviews
    
    return {
      activeEmployees,
      openPositions,
      employeeSatisfaction,
      pendingReviews
    };
  };

  const metricsData = calculateMetrics();

  // Real-time metrics
  const metrics = [
    {
      title: 'Total Employees',
      value: totalEmployees.toString(),
      change: `+${newHiresThisMonth}`,
      changeType: newHiresThisMonth > 0 ? 'positive' as const : 'neutral' as const,
      icon: Users,
      description: 'Active employees in organization',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Departments',
      value: totalDepartments.toString(),
      change: `+${newDepartmentHeads}`,
      changeType: newDepartmentHeads > 0 ? 'positive' as const : 'neutral' as const,
      icon: Building,
      description: 'Active departments',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'New Hires This Month',
      value: newHiresThisMonth.toString(),
      change: '+0',
      changeType: 'positive' as const,
      icon: UserPlus,
      description: 'Employees joined this month',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'New Department Heads',
      value: newDepartmentHeads.toString(),
      change: '+0',
      changeType: 'positive' as const,
      icon: User,
      description: 'New heads assigned this month',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    
    {
      title: 'Total Payroll',
      value: `$${(totalSalaryExpense / 1000).toFixed(1)}K`,
      change: '+8%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Monthly salary expenditure',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
  ];

  // Recent activities from real data
  const recentActivities = employees.slice(0, 4).map((employee, index) => ({
    id: employee.id,
    user: employee.name,
    action: 'Joined the company',
    project: `${employee.position} - ${employee.department}`,
    timestamp: employee.createdAt?.toDate ? 
      `${Math.floor((new Date().getTime() - employee.createdAt.toDate().getTime()) / (1000 * 60 * 60))} hours ago` : 
      'Recently',
  }));

  const upcomingEvents = [
    { event: 'Performance Reviews Due', date: 'Dec 15, 2025', type: 'deadline' },
    { event: 'Holiday Party', date: 'Dec 20, 2025', type: 'event' },
    { event: 'New Employee Orientation', date: 'Dec 22, 2025', type: 'training' },
    { event: 'Year-end Reviews', date: 'Jan 5, 2026', type: 'deadline' },
  ];

  // Latest employees and departments
  const latestEmployees = employees.slice(0, 5);
  const latestDepartments = departments.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">HR Management Dashboard</h1>
            <p className="text-purple-100 mt-1 text-lg">Real-time employee and department management</p>
            
          </div>
         
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border hover:border-gray-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-gray-700">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                  <IconComponent className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">{metric.value}</div>
                <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                {metric.change !== '+0' && (
                  <p className="text-xs mt-2">
                    <span className={
                      metric.changeType === 'positive' 
                        ? 'text-green-600 font-semibold' 
                        : 'text-gray-600 font-semibold'
                    }>
                      {metric.change}
                    </span>{' '}
                    <span className="text-gray-500">this month</span>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Employees */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Latest Employees</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Recently joined team members
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {latestEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {employee.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {employee.position} • {employee.department}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined: {new Date(employee.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              ))}
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Departments */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Latest Departments</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Recently added departments
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {latestDepartments.map((department) => (
                <div key={department.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{department.name}</span>
                      <p className="text-xs text-gray-500">Head: {department.head}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-800">
                      {department.employees} employees
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">Budget: {department.budget}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      
      </div>
   
  );
}