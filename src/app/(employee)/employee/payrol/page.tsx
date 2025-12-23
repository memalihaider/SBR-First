'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Users, CheckCircle, Clock, AlertCircle, Download, FileText, Calculator, Mail, User, Phone, Briefcase, CreditCard, Plus, Minus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { fetchEmployees, fetchSalaryRecords, generatePayroll, updateSalaryStatus, getPayrollStats, type Employee, type SalaryRecord, type Allowance, type Deduction } from '@/lib/salary';
import { generateCustomInvoicePDF, downloadPDF } from '@/lib/pdf-generator';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Define Department interface based on your Firebase structure
interface Department {
  id: string;
  name: string;
  description: string;
  head: string; // Manager name
  email: string; // Manager email from departments
  phone: string; // Manager phone from departments
  budget: string;
  employees: number;
  growth: string;
  createdAt: any;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  salary: number;
  department: string;
  departmentName: string;
  position: string;
  isManager: boolean;
  role: string;
  status: string;
  budget: string;
  employeesCount: number;
  growth: string;
}

export default function PayrollPage() {
  const [selectedStaff, setSelectedStaff] = useState<Employee | Manager | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [allStaff, setAllStaff] = useState<(Employee | Manager)[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  
  const [customInvoiceData, setCustomInvoiceData] = useState({
    // Company Information
    companyName: 'TechCorp Inc.',
    companySubtitle: 'SALARY INVOICE',
    companyAddress: '123 Business Street, Lahore, Pakistan',
    companyPhone: '+92 300 1234567',
    companyEmail: 'accounts@techcorp.com',
    
    // Invoice Details
    invoiceNumber: '',
    invoiceDate: new Date().toLocaleDateString(),
    
    // Payment Information
    bankName: 'UBL Bank',
    accountNumber: '1234 5678 9012 3456',
    paymentMethod: 'Bank Transfer',
    
    // Salary Breakdown
    allowances: [
      { type: 'Basic Salary', amount: 0 },
      { type: 'House Rent', amount: 0 },
      { type: 'Medical Allowance', amount: 1500 }
    ] as Allowance[],
    deductions: [
      { type: 'Income Tax', amount: 0 },
      { type: 'Provident Fund', amount: 0 }
    ] as Deduction[],
    
    // Additional Content
    additionalNotes: 'Thank you for your hard work!',
    contactText: 'For any queries, contact',
    footerText: 'This is a computer-generated invoice. No signature is required.',
    
    // Styling
    headerColor: '#dc3545',
  });

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalManagers: 0,
    totalStaff: 0,
    processedPayrolls: 0,
    pendingPayrolls: 0,
    totalPayrollAmount: 0,
    totalMonthlySalary: 0,
    totalBudget: 0,
  });

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Fetch departments from Firebase including email and phone
  const fetchDepartments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'departments'));
      const departmentsList: Department[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        departmentsList.push({
          id: doc.id,
          name: data.name || 'Unnamed Department',
          description: data.description || 'No description',
          head: data.head || 'No Manager',
          email: data.email || '',  // Get email from department
          phone: data.phone || '',  // Get phone from department
          budget: data.budget || '0',
          employees: data.employees || 0,
          growth: data.growth || '+0%',
          createdAt: data.createdAt,
        });
      });
      
      setDepartments(departmentsList);
      return departmentsList;
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments data');
      return [];
    }
  };

  // Create managers from departments data - ONLY USE DATA FROM DEPARTMENTS
  const createManagersFromDepartments = (departmentsList: Department[]) => {
    const managersList: Manager[] = [];
    
    departmentsList.forEach((dept) => {
      if (dept.head && dept.head !== 'No Manager') {
        // Use ONLY the email and phone from departments collection
        const managerEmail = dept.email;
        const managerPhone = dept.phone;
        
        // Default salary for managers
        const managerSalary = 80000;
        
        managersList.push({
          id: `manager-${dept.id}`,
          name: dept.head,
          email: managerEmail,  // Use email from departments
          phone: managerPhone,  // Use phone from departments
          salary: managerSalary,
          department: dept.name,
          departmentName: dept.name,
          position: 'Department Manager',
          isManager: true,
          role: 'Manager',
          status: 'active',
          budget: dept.budget,
          employeesCount: dept.employees,
          growth: dept.growth,
        });
      }
    });
    
    return managersList;
  };

  // Fetch employees from Firebase employeeList collection - REAL TIME
  const fetchEmployeesRealtime = () => {
    try {
      const employeesQuery = collection(db, 'employeeList');
      
      const unsubscribe = onSnapshot(employeesQuery, (snapshot) => {
        const employeesList: Employee[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'No Name',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            salary: data.salary || 0,
            status: data.status || 'active',
            isManager: false,
            role: 'Employee',
            // Add missing properties to match Employee type
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            joinDate: data.joinDate || '',
            manager: data.manager || '',
            skills: data.skills || [],
            emergencyContact: data.emergencyContact || { name: '', phone: '', relationship: '' },
            address: data.address || ''
          };
        });
        
        setEmployees(employeesList);
        // Update all staff
        const managersData = createManagersFromDepartments(departments);
        const allStaffData = [...managersData, ...employeesList];
        setAllStaff(allStaffData);
      }, (error) => {
        console.error('Error fetching employees:', error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up employees subscription:', error);
    }
  };

  // Handle status change
  const handleStatusChange = async (staffId: string, newStatus: 'pending' | 'paid' | 'processed') => {
    try {
      await updateSalaryStatus(staffId, getCurrentMonth(), newStatus);
      await loadData();
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Get status badge with icons
  const getStatusBadge = (staff: Employee | Manager) => {
    const payroll = salaryRecords.find(record => 
      record.employeeId === staff.id && record.month === getCurrentMonth()
    );
    
    if (!payroll) {
      return (
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(staff.id, 'pending')}
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
              title="Mark as Pending"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(staff.id, 'paid')}
              className="text-green-600 border-green-300 hover:bg-green-50"
              title="Mark as Paid"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-gray-500">Not Processed</span>
        </div>
      );
    }
    
    if (payroll.status === 'pending') {
      return (
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(staff.id, 'pending')}
              className="text-yellow-600 border-yellow-300 bg-yellow-50"
              title="Currently Pending"
              disabled
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(staff.id, 'paid')}
              className="text-green-600 border-green-300 hover:bg-green-50"
              title="Mark as Paid"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-yellow-600">Pending</span>
        </div>
      );
    }
    
    if (payroll.status === 'paid') {
      return (
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(staff.id, 'pending')}
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              title="Mark as Pending"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(staff.id, 'paid')}
              className="text-green-600 border-green-300 bg-green-50"
              title="Currently Paid"
              disabled
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-green-600">Paid</span>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center space-y-1">
        <AlertCircle className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-500">Unknown</span>
      </div>
    );
  };

  useEffect(() => {
    loadData();
    fetchEmployeesRealtime();
  }, []);

  // Filter staff based on selected employee
  const filteredStaff = allStaff.filter(staff => {
    if (selectedEmployee === 'all') return true;
    return staff.id === selectedEmployee || staff.name === selectedEmployee;
  });

  // Get selected employee name for display
  const getSelectedEmployeeName = () => {
    if (selectedEmployee === 'all') return 'All Employees';
    const staff = allStaff.find(s => s.id === selectedEmployee || s.name === selectedEmployee);
    return staff ? staff.name : 'Select Employee';
  };

  useEffect(() => {
    if (selectedStaff) {
      const basicSalary = selectedStaff.salary;
      
      setCustomInvoiceData(prev => ({
        ...prev,
        invoiceNumber: `INV-${selectedStaff.id}-${getCurrentMonth()}`,
        allowances: [
          { type: 'Basic Salary', amount: basicSalary },
          { type: 'House Rent', amount: basicSalary * 0.4 },
          { type: 'Medical Allowance', amount: 1500 }
        ],
        deductions: [
          { type: 'Income Tax', amount: basicSalary * 0.1 },
          { type: 'Provident Fund', amount: basicSalary * 0.05 }
        ]
      }));
    }
  }, [selectedStaff]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentMonth = getCurrentMonth();
      
      const [employeesData, payrollStats, departmentsData] = await Promise.all([
        fetchEmployees(),
        getPayrollStats(currentMonth),
        fetchDepartments()
      ]);
      
      setEmployees(employeesData);
      setDepartments(departmentsData);
      
      // Create managers from departments - ONLY use data from departments
      const managersData = createManagersFromDepartments(departmentsData);
      setManagers(managersData);
      
      // Combine all staff
      const allStaffData = [...managersData, ...employeesData];
      setAllStaff(allStaffData);
      
      setSalaryRecords(payrollStats.records);
      
      // Calculate stats
      const activeStaff = allStaffData.filter(staff => staff.status === 'active');
      
      const totalMonthlySalary = activeStaff
        .reduce((sum, staff) => sum + (staff.salary || 0), 0);
      
      const totalBudget = departmentsData.reduce((sum, dept) => 
        sum + parseInt(dept.budget || '0'), 0
      );

      setStats({
        totalEmployees: employeesData.filter(emp => emp.status === 'active').length,
        totalManagers: managersData.length,
        totalStaff: activeStaff.length,
        processedPayrolls: payrollStats.processedPayrolls,
        pendingPayrolls: payrollStats.pendingPayrolls,
        totalPayrollAmount: payrollStats.totalPayrollAmount,
        totalMonthlySalary,
        totalBudget,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const payrollStats = [
    {
      title: 'Total Staff',
      value: stats.totalStaff.toString(),
      change: `+${Math.round((stats.totalStaff / (stats.totalStaff + 1)) * 10)}%`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Employees + Managers'
    },
    {
      title: 'Departments',
      value: departments.length.toString(),
      change: '+0%',
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Total departments'
    },
   
    {
      title: 'Monthly Salary',
      value: `$${(stats.totalMonthlySalary / 1000).toFixed(1)}K`,
      change: '+8%',
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Total monthly payroll'
    },
    {
      title: 'Paid This Month',
      value: stats.processedPayrolls.toString(),
      change: `+${Math.round((stats.processedPayrolls / stats.totalStaff) * 100)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Staff paid'
    },
    {
      title: 'Pending',
      value: stats.pendingPayrolls.toString(),
      change: `${Math.round((stats.pendingPayrolls / stats.totalStaff) * 100)}%`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Awaiting processing'
    },
  ];

  const getStaffPayroll = (staffId: string) => {
    return salaryRecords.find(record => 
      record.employeeId === staffId && record.month === getCurrentMonth()
    );
  };

  const handleGenerateInvoice = (staff: Employee | Manager) => {
    setSelectedStaff(staff);
    setIsInvoiceDialogOpen(true);
  };

  const handleAddAllowance = () => {
    setCustomInvoiceData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { type: 'New Allowance', amount: 0 }]
    }));
  };

  const handleRemoveAllowance = (index: number) => {
    setCustomInvoiceData(prev => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index)
    }));
  };

  const handleAddDeduction = () => {
    setCustomInvoiceData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { type: 'New Deduction', amount: 0 }]
    }));
  };

  const handleRemoveDeduction = (index: number) => {
    setCustomInvoiceData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  const updateAllowance = (index: number, field: keyof Allowance, value: string | number) => {
    setCustomInvoiceData(prev => ({
      ...prev,
      allowances: prev.allowances.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const updateDeduction = (index: number, field: keyof Deduction, value: string | number) => {
    setCustomInvoiceData(prev => ({
      ...prev,
      deductions: prev.deductions.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateNetPay = () => {
    const totalAllowances = customInvoiceData.allowances.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = customInvoiceData.deductions.reduce((sum, item) => sum + item.amount, 0);
    return totalAllowances - totalDeductions;
  };

  const handleDownloadInvoice = async (staff: Employee | Manager) => {
    try {
      setPdfLoading(staff.id);
      
      const payroll = getStaffPayroll(staff.id) || {
        employeeId: staff.id,
        employeeName: staff.name,
        month: getCurrentMonth(),
        year: new Date().getFullYear(),
        basicSalary: staff.salary,
        allowances: customInvoiceData.allowances,
        deductions: customInvoiceData.deductions,
        netPay: calculateNetPay(),
        status: 'paid',
        paymentMethod: customInvoiceData.paymentMethod,
        createdAt: { toDate: () => new Date() } as any,
      };

      const pdfBlob = await generateCustomInvoicePDF(payroll, staff as Employee, customInvoiceData);
      const filename = `invoice-${staff.name.replace(/\s+/g, '-').toLowerCase()}-${getCurrentMonth()}.pdf`;
      downloadPDF(pdfBlob, filename);

      toast.success(`Invoice generated for ${staff.name}!`);
      setIsInvoiceDialogOpen(false);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    } finally {
      setPdfLoading(null);
    }
  };

  const handleProcessPayroll = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      await generatePayroll(month, currentDate.getFullYear());
      await loadData();
      
      toast.success('Payroll processed successfully!');
      setIsProcessDialogOpen(false);
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast.error('Failed to process payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Employee Filter */}
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Payroll Management</h1>
            <p className="text-red-100 mt-1 text-lg">
              {selectedEmployee === 'all' 
                ? 'Manage salaries for all staff' 
                : `Payroll for ${getSelectedEmployeeName()}`
              }
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            {/* Employee Filter Dropdown */}
            <div className="w-full md:w-64">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-red-200" />
                <Label className="text-sm font-medium text-red-100">Filter by Employee</Label>
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <SelectValue placeholder="Select employee" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>All Employees</span>
                    </div>
                  </SelectItem>
                  {allStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${(staff as any).isManager ? 'bg-blue-100' : 'bg-red-100'} flex items-center justify-center`}>
                          <span className={`text-xs font-medium ${(staff as any).isManager ? 'text-blue-600' : 'text-red-600'}`}>
                            {staff.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-xs text-gray-500">
                            {(staff as any).isManager ? 'Manager' : 'Employee'} • {staff.department}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button 
                className="bg-white text-red-600 hover:bg-red-50 border-2 border-red-300 whitespace-nowrap"
                onClick={loadData}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Button 
                className="bg-white text-red-600 hover:bg-red-50 border-2 border-red-300 whitespace-nowrap"
                onClick={() => setIsProcessDialogOpen(true)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Process Payroll
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Summary Card (if employee selected) */}
      {selectedEmployee !== 'all' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{getSelectedEmployeeName()}</h3>
                  <p className="text-gray-600">
                    {allStaff.find(s => s.id === selectedEmployee)?.department || 'No department'} • 
                    {allStaff.find(s => s.id === selectedEmployee)?.position || 'No position'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-700">
                      Salary: <span className="font-bold text-green-600">
                        ${allStaff.find(s => s.id === selectedEmployee)?.salary?.toLocaleString() || '0'}
                      </span>
                    </span>
                    <span className="text-sm text-gray-700">
                      Status: <span className="font-bold text-blue-600">
                        {allStaff.find(s => s.id === selectedEmployee)?.status || 'active'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${(allStaff.find(s => s.id === selectedEmployee)?.salary || 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Monthly Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {payrollStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border hover:border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
                <p className="text-xs mt-2">
                  <span className="text-green-600 font-semibold">{stat.change}</span>{' '}
                  <span className="text-gray-500">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Staff Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">
                Payroll Records
                {selectedEmployee !== 'all' && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    for {getSelectedEmployeeName()}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Manage salaries for all staff (Managers + Employees) - Click icons to change status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredStaff.length} of {allStaff.length} staff
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Staff Member</TableHead>
                <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                <TableHead className="font-semibold text-gray-900">Position</TableHead>
                <TableHead className="font-semibold text-gray-900">Department</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Salary</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">Salary Status</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {selectedEmployee === 'all' 
                        ? 'No staff records found. Please add staff first.'
                        : `No payroll records found for ${getSelectedEmployeeName()}.`
                      }
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff) => (
                  <TableRow 
                    key={staff.id} 
                    className={`hover:bg-gray-50 transition-colors ${(staff as any).isManager ? 'bg-blue-50' : ''}`}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full ${(staff as any).isManager ? 'bg-blue-500' : 'bg-red-500'} flex items-center justify-center`}>
                          <span className="text-sm font-semibold text-white">
                            {(staff as any).isManager ? 'M' : staff.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 flex items-center">
                            {staff.name}
                            {(staff as any).isManager && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Manager</Badge>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {staff.email || 'No email'}
                          </p>
                          {(staff as any).isManager && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Budget: ${(staff as Manager).budget}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Team: {(staff as Manager).employeesCount}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">
                          {staff.phone || 'No phone'}
                        </span>
                      </div>
                      {(staff as any).isManager && (
                        <div className="mt-1 text-xs text-gray-500">
                          Growth: <span className="text-green-600">{(staff as Manager).growth}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Briefcase className={`h-4 w-4 ${(staff as any).isManager ? 'text-blue-500' : 'text-gray-500'}`} />
                        <span className={`text-sm ${(staff as any).isManager ? 'font-semibold text-blue-600' : 'text-gray-900'}`}>
                          {staff.position}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={(staff as any).isManager ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                        {staff.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        ${staff.salary?.toLocaleString() || '0'}
                      </span>
                      <div className="text-xs text-gray-500">
                        {(staff as any).isManager ? 'Manager Salary' : 'Employee Salary'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(staff)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateInvoice(staff)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="ml-1">Invoice</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Summary Footer */}
          {filteredStaff.length > 0 && (
            <div className="bg-gray-50 p-4 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {filteredStaff.filter(s => (s as any).isManager).length} managers and {filteredStaff.filter(s => !(s as any).isManager).length} employees
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Managers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-600">Employees</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    Total Monthly Payroll: <span className="text-red-600">
                      ${filteredStaff.reduce((sum, staff) => sum + (staff.salary || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customize Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="bg-white border-2 border-gray-200 max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Customize Invoice - {selectedStaff?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Edit all invoice fields and customize the layout
            </DialogDescription>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Editable Fields */}
                <div className="space-y-6">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={customInvoiceData.companyName}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            companyName: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companySubtitle">Invoice Title</Label>
                        <Input
                          id="companySubtitle"
                          value={customInvoiceData.companySubtitle}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            companySubtitle: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">Company Address</Label>
                        <Input
                          id="companyAddress"
                          value={customInvoiceData.companyAddress}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            companyAddress: e.target.value
                          }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="companyPhone">Company Phone</Label>
                          <Input
                            id="companyPhone"
                            value={customInvoiceData.companyPhone}
                            onChange={(e) => setCustomInvoiceData(prev => ({
                              ...prev,
                              companyPhone: e.target.value
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyEmail">Company Email</Label>
                          <Input
                            id="companyEmail"
                            value={customInvoiceData.companyEmail}
                            onChange={(e) => setCustomInvoiceData(prev => ({
                              ...prev,
                              companyEmail: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          value={customInvoiceData.bankName}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            bankName: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={customInvoiceData.accountNumber}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            accountNumber: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Input
                        id="paymentMethod"
                        value={customInvoiceData.paymentMethod}
                        onChange={(e) => setCustomInvoiceData(prev => ({
                          ...prev,
                          paymentMethod: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  {/* Allowances */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Allowances</h3>
                      <Button variant="outline" size="sm" onClick={handleAddAllowance}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {customInvoiceData.allowances.map((allowance, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={allowance.type}
                            onChange={(e) => updateAllowance(index, 'type', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={allowance.amount}
                            onChange={(e) => updateAllowance(index, 'amount', Number(e.target.value))}
                            className="w-32"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAllowance(index)}
                            disabled={customInvoiceData.allowances.length === 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Deductions</h3>
                      <Button variant="outline" size="sm" onClick={handleAddDeduction}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {customInvoiceData.deductions.map((deduction, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={deduction.type}
                            onChange={(e) => updateDeduction(index, 'type', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={deduction.amount}
                            onChange={(e) => updateDeduction(index, 'amount', Number(e.target.value))}
                            className="w-32"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveDeduction(index)}
                            disabled={customInvoiceData.deductions.length === 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Settings */}
                <div className="space-y-6">
                  {/* Additional Content */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Additional Content</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="additionalNotes">Additional Notes</Label>
                        <Textarea
                          id="additionalNotes"
                          value={customInvoiceData.additionalNotes}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            additionalNotes: e.target.value
                          }))}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactText">Contact Text</Label>
                        <Input
                          id="contactText"
                          value={customInvoiceData.contactText}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            contactText: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footerText">Footer Text</Label>
                        <Input
                          id="footerText"
                          value={customInvoiceData.footerText}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            footerText: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                        <Input
                          id="invoiceNumber"
                          value={customInvoiceData.invoiceNumber}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            invoiceNumber: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invoiceDate">Invoice Date</Label>
                        <Input
                          id="invoiceDate"
                          value={customInvoiceData.invoiceDate}
                          onChange={(e) => setCustomInvoiceData(prev => ({
                            ...prev,
                            invoiceDate: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Salary Summary</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Allowances:</span>
                        <span className="font-semibold text-green-600">
                          ${customInvoiceData.allowances.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Deductions:</span>
                        <span className="font-semibold text-red-600">
                          ${customInvoiceData.deductions.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-bold text-lg">Net Payable Amount:</span>
                        <span className="font-bold text-lg text-blue-600">
                          ${calculateNetPay().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDownloadInvoice(selectedStaff)}
                  disabled={pdfLoading === selectedStaff.id}
                >
                  {pdfLoading === selectedStaff.id ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate PDF Invoice
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Payroll Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="bg-white border-2 border-gray-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Process Payroll</DialogTitle>
            <DialogDescription className="text-gray-600">
              Generate payroll for all active staff
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                This will process payroll for {stats.totalStaff} active staff members ({stats.totalEmployees} employees + {stats.totalManagers} managers) with total monthly salary of ${stats.totalMonthlySalary.toLocaleString()}.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleProcessPayroll}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Process Payroll'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}