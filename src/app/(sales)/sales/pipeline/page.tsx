'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useCurrencyStore } from '@/stores/currency';
import { 
  Building, 
  Users, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText,
  Plus,
  Eye,
  Edit,
  MoveRight,
  Filter,
  Search,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from 'date-fns';

interface Customer {
  id: string;
  companyName: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  phoneNumbers: Array<{
    type: string;
    number: string;
  }>;
  address: {
    street?: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  };
  customerType: string;
  industry: string;
  isActive: boolean;
  creditLimit: number;
  paymentTerms: string;
  totalRevenue: number;
  website?: string;
  taxId?: string;
  assignedSalesRep: string;
  projects: string[];
  createdAt: any;
  updatedAt: any;
}

interface Project {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  budgetAmount: number;
  actualCost: number;
  completionPercentage: number;
  status: string;
  profitMargin: number;
  createdAt: any;
  updatedAt: any;
}

interface MonthlyCustomerStats {
  month: string;
  year: number;
  newCustomers: number;
  totalRevenue: number;
  customers: Customer[];
}

export default function PipelinePage() {
  const { formatAmount } = useCurrencyStore();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  
  // Modal states
  const [addCustomerDialog, setAddCustomerDialog] = useState(false);
  const [viewCustomerDialog, setViewCustomerDialog] = useState(false);
  const [editCustomerDialog, setEditCustomerDialog] = useState(false);
  const [monthlyStatsDialog, setMonthlyStatsDialog] = useState(false);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    primaryContact: {
      name: '',
      email: '',
      phone: ''
    },
    phoneNumbers: [{ type: 'primary', number: '' }],
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    customerType: 'sme',
    industry: 'it',
    creditLimit: 0,
    paymentTerms: 'Net 30',
    website: '',
    taxId: '',
    assignedSalesRep: '',
    isActive: true
  });

  // Fetch customers and projects from Firebase
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
        const projectsQuery = query(collection(db, 'projects'));
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

  // Calculate revenue for each customer from their projects
  const calculateCustomerRevenue = (customer: Customer) => {
    const customerProjects = projects.filter(project => project.customerId === customer.id);
    const totalRevenue = customerProjects.reduce((sum, project) => {
      return sum + (project.budgetAmount || 0);
    }, 0);
    
    return {
      ...customer,
      totalRevenue,
      projectCount: customerProjects.length
    };
  };

  // Apply filters
  useEffect(() => {
    let result = customers.map(calculateCustomerRevenue);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(customer =>
        customer.companyName.toLowerCase().includes(query) ||
        customer.primaryContact.name.toLowerCase().includes(query) ||
        customer.primaryContact.email.toLowerCase().includes(query) ||
        customer.address.city.toLowerCase().includes(query) ||
        customer.industry.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(customer => 
        statusFilter === 'active' ? customer.isActive : !customer.isActive
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(customer => customer.customerType === typeFilter);
    }

    setFilteredCustomers(result);
  }, [customers, projects, searchQuery, statusFilter, typeFilter]);

  // Calculate statistics
  const calculateStats = () => {
    const customersWithRevenue = customers.map(calculateCustomerRevenue);
    
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const totalRevenue = customersWithRevenue.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
    const smeCustomers = customers.filter(c => c.customerType === 'sme').length;
    const enterpriseCustomers = customers.filter(c => c.customerType === 'enterprise').length;
    
    // Monthly stats for last 12 months
    const last12Months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    const monthlyStats: MonthlyCustomerStats[] = last12Months.map(monthDate => {
      const month = format(monthDate, 'MMM');
      const year = monthDate.getFullYear();
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthCustomers = customers.filter(customer => {
        if (!customer.createdAt) return false;
        const createdAt = customer.createdAt.toDate ? customer.createdAt.toDate() : new Date(customer.createdAt);
        return isWithinInterval(createdAt, { start: monthStart, end: monthEnd });
      });

      const monthCustomersWithRevenue = monthCustomers.map(calculateCustomerRevenue);
      const monthRevenue = monthCustomersWithRevenue.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);

      return {
        month,
        year,
        newCustomers: monthCustomers.length,
        totalRevenue: monthRevenue,
        customers: monthCustomers
      };
    }).reverse();

    // Current month stats
    const currentMonth = format(new Date(), 'MMM');
    const currentMonthStats = monthlyStats.find(stat => stat.month === currentMonth) || {
      month: currentMonth,
      year: new Date().getFullYear(),
      newCustomers: 0,
      totalRevenue: 0,
      customers: []
    };

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      smeCustomers,
      enterpriseCustomers,
      monthlyStats,
      currentMonthStats
    };
  };

  const stats = calculateStats();

  // Get projects for a specific customer
  const getCustomerProjects = (customerId: string) => {
    return projects.filter(project => project.customerId === customerId);
  };

  // Handle form submission
  const handleAddCustomer = async () => {
    if (!customerForm.companyName || !customerForm.primaryContact.name || !customerForm.primaryContact.email) {
      toast.error('Please fill in all required fields (Company Name, Contact Name, Email)');
      return;
    }

    try {
      // In real app, you would add to Firebase here
      toast.success(`${customerForm.companyName} has been added successfully!`);
      
      // Reset form
      setCustomerForm({
        companyName: '',
        primaryContact: {
          name: '',
          email: '',
          phone: ''
        },
        phoneNumbers: [{ type: 'primary', number: '' }],
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        },
        customerType: 'sme',
        industry: 'it',
        creditLimit: 0,
        paymentTerms: 'Net 30',
        website: '',
        taxId: '',
        assignedSalesRep: '',
        isActive: true
      });
      
      setAddCustomerDialog(false);
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewCustomerDialog(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      companyName: customer.companyName,
      primaryContact: customer.primaryContact,
      phoneNumbers: customer.phoneNumbers || [{ type: 'primary', number: '' }],
      address: {
        street: customer.address?.street || '',
        city: customer.address?.city || '',
        state: customer.address?.state || '',
        country: customer.address?.country || '',
        zipCode: customer.address?.zipCode || '',
      },
      customerType: customer.customerType,
      industry: customer.industry,
      creditLimit: customer.creditLimit || 0,
      paymentTerms: customer.paymentTerms || 'Net 30',
      website: customer.website || '',
      taxId: customer.taxId || '',
      assignedSalesRep: customer.assignedSalesRep || '',
      isActive: customer.isActive
    });
    setEditCustomerDialog(true);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      toast.success(`${customerForm.companyName} has been updated successfully!`);
      setEditCustomerDialog(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  const handleViewMonthDetails = (month: string, year: number) => {
    const monthStats = stats.monthlyStats.find(stat => stat.month === month && stat.year === year);
    setSelectedMonth(`${month} ${year}`);
    setMonthlyStatsDialog(true);
  };

  const handleExportData = () => {
    toast.success('Data exported successfully!');
  };

  const handleRefreshData = () => {
    toast.success('Data refreshed!');
  };

  // Dashboard metrics
  const metrics = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: '+12',
      changeType: 'positive',
      icon: Users,
      color: 'blue',
      description: 'All registered customers'
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers.toString(),
      change: '+3',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green',
      description: 'Currently active customers'
    },
    {
      title: 'Total Revenue',
      value: formatAmount(stats.totalRevenue),
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'purple',
      description: 'Total revenue from all projects'
    },
    {
      title: 'New This Month',
      value: stats.currentMonthStats.newCustomers.toString(),
      change: '+2',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'orange',
      description: `Customers added in ${format(new Date(), 'MMMM')}`
    },
    {
      title: 'SME Customers',
      value: stats.smeCustomers.toString(),
      change: '+4',
      changeType: 'positive',
      icon: Building,
      color: 'cyan',
      description: 'Small & Medium Enterprises'
    },
  
  ];

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers Pipeline</h1>
          <p className="text-gray-600 mt-1">Customer acquisition history and monthly tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          
          <Dialog open={addCustomerDialog} onOpenChange={setAddCustomerDialog}>
            <DialogTrigger asChild>
             
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New Customer</span>
                </DialogTitle>
                <DialogDescription>
                  Add a new customer to your pipeline
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input
                      id="company-name"
                      value={customerForm.companyName}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      value={customerForm.industry} 
                      onValueChange={(value) => setCustomerForm(prev => ({ ...prev, industry: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">IT & Technology</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-type">Customer Type</Label>
                    <Select 
                      value={customerForm.customerType} 
                      onValueChange={(value) => setCustomerForm(prev => ({ ...prev, customerType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sme">SME</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit-limit">Credit Limit</Label>
                    <Input
                      id="credit-limit"
                      type="number"
                      value={customerForm.creditLimit}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-terms">Payment Terms</Label>
                    <Select 
                      value={customerForm.paymentTerms} 
                      onValueChange={(value) => setCustomerForm(prev => ({ ...prev, paymentTerms: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="COD">COD</SelectItem>
                        <SelectItem value="Advance">Advance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Primary Contact</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Name *</Label>
                      <Input
                        id="contact-name"
                        value={customerForm.primaryContact.name}
                        onChange={(e) => setCustomerForm(prev => ({
                          ...prev,
                          primaryContact: { ...prev.primaryContact, name: e.target.value }
                        }))}
                        placeholder="Contact person name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={customerForm.primaryContact.email}
                        onChange={(e) => setCustomerForm(prev => ({
                          ...prev,
                          primaryContact: { ...prev.primaryContact, email: e.target.value }
                        }))}
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone</Label>
                      <Input
                        id="contact-phone"
                        value={customerForm.primaryContact.phone}
                        onChange={(e) => setCustomerForm(prev => ({
                          ...prev,
                          primaryContact: { ...prev.primaryContact, phone: e.target.value }
                        }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        value={customerForm.address.street}
                        onChange={(e) => setCustomerForm(prev => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        placeholder="Street address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={customerForm.address.city}
                        onChange={(e) => setCustomerForm(prev => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={customerForm.address.state}
                        onChange={(e) => setCustomerForm(prev => ({
                          ...prev,
                          address: { ...prev.address, state: e.target.value }
                        }))}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={customerForm.address.country}
                        onChange={(e) => setCustomerForm(prev => ({
                          ...prev,
                          address: { ...prev.address, country: e.target.value }
                        }))}
                        placeholder="Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipcode">ZIP Code</Label>
                      <Input
                        id="zipcode"
                        value={customerForm.address.zipCode}
                        onChange={(e) => setCustomerForm(prev => ({
                          ...prev,
                          address: { ...prev.address, zipCode: e.target.value }
                        }))}
                        placeholder="ZIP Code"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={customerForm.website}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-id">Tax ID</Label>
                    <Input
                      id="tax-id"
                      value={customerForm.taxId}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, taxId: e.target.value }))}
                      placeholder="Tax identification number"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddCustomerDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCustomer} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colorClass = `text-${metric.color}-600`;
          const bgColorClass = `bg-${metric.color}-100`;
          
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  <span>{metric.title}</span>
                  <div className={`p-1.5 ${bgColorClass} rounded-lg`}>
                    <IconComponent className={`h-4 w-4 ${colorClass}`} />
                  </div>
                </CardTitle>
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

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers List</TabsTrigger>
          <TabsTrigger value="monthly">Monthly History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Customer Acquisition Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Customer Acquisition</CardTitle>
                <CardDescription>New customers added each month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyStats.map((monthStat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{monthStat.month} {monthStat.year}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {monthStat.newCustomers} customers
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {formatAmount(monthStat.totalRevenue)}
                          </span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewMonthDetails(monthStat.month, monthStat.year)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((monthStat.newCustomers / Math.max(...stats.monthlyStats.map(m => m.newCustomers))) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Customers</CardTitle>
                <CardDescription>Latest customers added to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers.slice(0, 5).map((customer) => {
                    const customerWithRevenue = calculateCustomerRevenue(customer);
                    return (
                      <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.companyName}</p>
                            <p className="text-sm text-gray-600">{customer.primaryContact.name}</p>
                            <p className="text-xs text-green-600 font-medium">
                              {formatAmount(customerWithRevenue.totalRevenue)} revenue
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={customer.isActive ? "default" : "secondary"}>
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Industry Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Distribution</CardTitle>
              <CardDescription>Customers by industry sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from(new Set(customers.map(c => c.industry))).map((industry) => {
                  const count = customers.filter(c => c.industry === industry).length;
                  const percentage = (count / customers.length) * 100;
                  
                  return (
                    <div key={industry} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm font-medium text-gray-700 capitalize">{industry}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers List Tab */}
        <TabsContent value="customers" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Search Customers</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, company, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Customer Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="sme">SME</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customers List</CardTitle>
              <CardDescription>
                {filteredCustomers.length} of {customers.length} customers found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Building className="h-12 w-12 text-gray-400 mx-auto" />
                          <p className="mt-2 text-gray-500">No customers found</p>
                          <p className="text-sm text-gray-400">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => {
                        const createdAt = customer.createdAt?.toDate 
                          ? customer.createdAt.toDate() 
                          : new Date(customer.createdAt);
                        const customerProjects = getCustomerProjects(customer.id);
                        const customerWithRevenue = calculateCustomerRevenue(customer);
                        
                        return (
                          <TableRow key={customer.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="font-medium text-gray-900">{customer.companyName}</div>
                              <div className="text-sm text-gray-500">
                                {format(createdAt, 'MMM dd, yyyy')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{customer.primaryContact.name}</div>
                              <div className="text-sm text-gray-500">{customer.primaryContact.email}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">{customer.address.city}</div>
                              <div className="text-xs text-gray-500">{customer.address.country}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {customer.customerType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {customerProjects.length} projects
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {formatAmount(customerWithRevenue.totalRevenue || 0)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={customer.isActive ? "default" : "secondary"}>
                                {customer.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewCustomer(customer)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditCustomer(customer)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly History Tab */}
        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Customer History</CardTitle>
              <CardDescription>Detailed monthly customer acquisition and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.monthlyStats.map((monthStat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{monthStat.month} {monthStat.year}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">New Customers</span>
                          <span className="text-2xl font-bold text-blue-600">{monthStat.newCustomers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Revenue</span>
                          <span className="text-xl font-bold text-green-600">{formatAmount(monthStat.totalRevenue)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Avg Revenue/Customer</span>
                          <span className="font-medium">
                            {monthStat.newCustomers > 0 
                              ? formatAmount(monthStat.totalRevenue / monthStat.newCustomers)
                              : formatAmount(0)
                            }
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleViewMonthDetails(monthStat.month, monthStat.year)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Type Distribution</CardTitle>
                <CardDescription>Breakdown by customer type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['sme', 'enterprise', 'startup', 'government'].map((type) => {
                    const count = customers.filter(c => c.customerType === type).length;
                    const percentage = (count / customers.length) * 100;
                    
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{type}</span>
                          <span className="text-gray-900 font-bold">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Industry */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Industry</CardTitle>
                <CardDescription>Total revenue generated per industry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(customers.map(c => c.industry))).map((industry) => {
                    const industryCustomers = customers.filter(c => c.industry === industry);
                    const customersWithRevenue = industryCustomers.map(calculateCustomerRevenue);
                    const totalRevenue = customersWithRevenue.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
                    const percentage = (totalRevenue / stats.totalRevenue) * 100;
                    
                    return (
                      <div key={industry} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{industry}</span>
                          <span className="text-green-600 font-bold">{formatAmount(totalRevenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {industryCustomers.length} customers • {percentage.toFixed(1)}% of total revenue
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Customers by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from(new Set(customers.map(c => c.address.country))).map((country) => {
                  const countryCustomers = customers.filter(c => c.address.country === country);
                  const customersWithRevenue = countryCustomers.map(calculateCustomerRevenue);
                  const cities = Array.from(new Set(countryCustomers.map(c => c.address.city)));
                  
                  return (
                    <Card key={country} className="hover:shadow-md">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-bold text-gray-900">{country}</h4>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{countryCustomers.length}</p>
                          <p className="text-sm text-gray-600">{cities.length} cities</p>
                          <p className="text-xs text-gray-500">
                            {formatAmount(
                              customersWithRevenue.reduce((sum, c) => sum + (c.totalRevenue || 0), 0)
                            )} revenue
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {/* View Customer Modal */}
      <Dialog open={viewCustomerDialog} onOpenChange={setViewCustomerDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200">
          {selectedCustomer && (() => {
            const customerProjects = getCustomerProjects(selectedCustomer.id);
            const customerWithRevenue = calculateCustomerRevenue(selectedCustomer);
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>{selectedCustomer.companyName}</span>
                    <Badge variant={selectedCustomer.isActive ? "default" : "secondary"}>
                      {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Customer details and history
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Company Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Company Name:</span>
                          <span className="font-medium">{selectedCustomer.companyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Industry:</span>
                          <Badge variant="outline" className="capitalize">
                            {selectedCustomer.industry}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer Type:</span>
                          <Badge variant="outline" className="capitalize">
                            {selectedCustomer.customerType}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax ID:</span>
                          <span className="font-medium">{selectedCustomer.taxId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Credit Limit:</span>
                          <span className="font-medium">{formatAmount(selectedCustomer.creditLimit || 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primary Contact:</span>
                          <span className="font-medium">{selectedCustomer.primaryContact.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedCustomer.primaryContact.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedCustomer.primaryContact.phone || 'N/A'}</span>
                        </div>
                        {selectedCustomer.website && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Website:</span>
                            <a 
                              href={selectedCustomer.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {selectedCustomer.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Street</Label>
                        <p className="text-gray-900">{selectedCustomer.address.street || 'N/A'}</p>
                      </div>
                      <div>
                        <Label>City</Label>
                        <p className="text-gray-900">{selectedCustomer.address.city}</p>
                      </div>
                      <div>
                        <Label>State</Label>
                        <p className="text-gray-900">{selectedCustomer.address.state}</p>
                      </div>
                      <div>
                        <Label>Country</Label>
                        <p className="text-gray-900">{selectedCustomer.address.country}</p>
                      </div>
                      {selectedCustomer.address.zipCode && (
                        <div>
                          <Label>ZIP Code</Label>
                          <p className="text-gray-900">{selectedCustomer.address.zipCode}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Financial Information</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatAmount(customerWithRevenue.totalRevenue || 0)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Credit Limit</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatAmount(selectedCustomer.creditLimit || 0)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Payment Terms</p>
                        <p className="text-xl font-bold text-purple-600">
                          {selectedCustomer.paymentTerms}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Projects Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Projects ({customerProjects.length})</h3>
                    {customerProjects.length > 0 ? (
                      <div className="space-y-3">
                        {customerProjects.map((project) => (
                          <div key={project.id} className="p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{project.name}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <Badge variant="outline">
                                    Budget: {formatAmount(project.budgetAmount)}
                                  </Badge>
                                  <Badge variant="outline">
                                    Status: {project.status}
                                  </Badge>
                                  <Badge variant="outline">
                                    Completion: {project.completionPercentage}%
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">
                                  {formatAmount(project.budgetAmount)}
                                </p>
                                <p className="text-sm text-gray-600">Project Revenue</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No projects found for this customer</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Phone Numbers */}
                  {selectedCustomer.phoneNumbers && selectedCustomer.phoneNumbers.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Phone Numbers</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedCustomer.phoneNumbers.map((phone, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="capitalize">
                                {phone.type}
                              </Badge>
                              <span className="font-medium">{phone.number}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Created</p>
                            <p className="text-sm text-gray-600">
                              {format(
                                selectedCustomer.createdAt?.toDate 
                                  ? selectedCustomer.createdAt.toDate() 
                                  : new Date(selectedCustomer.createdAt),
                                'MMM dd, yyyy • hh:mm a'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <RefreshCw className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Last Updated</p>
                            <p className="text-sm text-gray-600">
                              {format(
                                selectedCustomer.updatedAt?.toDate 
                                  ? selectedCustomer.updatedAt.toDate() 
                                  : new Date(selectedCustomer.updatedAt),
                                'MMM dd, yyyy • hh:mm a'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewCustomerDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setViewCustomerDialog(false);
                    handleEditCustomer(selectedCustomer);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Customer
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={editCustomerDialog} onOpenChange={setEditCustomerDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Customer - {selectedCustomer?.companyName}</span>
            </DialogTitle>
            <DialogDescription>
              Update customer information
            </DialogDescription>
          </DialogHeader>

          {/* Similar form as Add Customer but with existing data */}
          {/* You can reuse the form from Add Customer modal */}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCustomer} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Update Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Monthly Stats Details Modal */}
      <Dialog open={monthlyStatsDialog} onOpenChange={setMonthlyStatsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Monthly Details - {selectedMonth}</span>
            </DialogTitle>
            <DialogDescription>
              Customer acquisition details for this month
            </DialogDescription>
          </DialogHeader>

          {selectedMonth && (() => {
            const monthStat = stats.monthlyStats.find(s => `${s.month} ${s.year}` === selectedMonth);
            const monthCustomers = monthStat?.customers || [];
            const monthCustomersWithRevenue = monthCustomers.map(calculateCustomerRevenue);
            
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total New Customers</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {monthStat?.newCustomers || 0}
                    </p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatAmount(monthStat?.totalRevenue || 0)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Customers Added This Month</h3>
                  <div className="space-y-3">
                    {monthCustomersWithRevenue.length > 0 ? (
                      monthCustomersWithRevenue.map((customer) => {
                        const customerProjects = getCustomerProjects(customer.id);
                        
                        return (
                          <div key={customer.id} className="p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Building className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="font-medium">{customer.companyName}</p>
                                  <p className="text-sm text-gray-600">{customer.primaryContact.name}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline">
                                      {customerProjects.length} projects
                                    </Badge>
                                    <span className="text-xs text-green-600 font-medium">
                                      {formatAmount(customer.totalRevenue)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="capitalize">
                                  {customer.customerType}
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setMonthlyStatsDialog(false);
                                    handleViewCustomer(customer);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Building className="h-12 w-12 mx-auto mb-2" />
                        <p>No customers added in this month</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setMonthlyStatsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}