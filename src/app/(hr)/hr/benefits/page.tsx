'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { useCurrencyStore } from '@/stores/currency';
import mockData from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Shield, Heart, Users, Clock, CheckCircle, AlertCircle, Plus, Eye, Edit, Settings, CalendarIcon, FileText, TrendingUp, Award, UserCheck, X, Check, AlertTriangle, DollarSign, Building } from 'lucide-react';

export default function HRBenefitsPage() {
  const { formatAmount } = useCurrencyStore();

  // State management
  const [activeTab, setActiveTab] = useState('overview');

  // Dialog states
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [managePlanOpen, setManagePlanOpen] = useState(false);
  const [reviewClaimOpen, setReviewClaimOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [managePlansOpen, setManagePlansOpen] = useState(false);
  const [processClaimsOpen, setProcessClaimsOpen] = useState(false);
  const [openEnrollmentOpen, setOpenEnrollmentOpen] = useState(false);

  // Selected items
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<any>(null);

  // Form states
  const [addPlanForm, setAddPlanForm] = useState({
    name: '',
    type: 'health',
    provider: '',
    monthlyCost: 0,
    coverage: 'individual',
    description: '',
    effectiveDate: new Date(),
    isActive: true,
  });

  const [managePlanForm, setManagePlanForm] = useState({
    enrolled: 0,
    totalEligible: 142,
    monthlyCost: 0,
    coverage: 'individual',
    status: 'active',
  });

  const [reviewClaimForm, setReviewClaimForm] = useState({
    status: 'approved',
    approvedAmount: 0,
    notes: '',
    processedDate: new Date(),
  });

  const [openEnrollmentForm, setOpenEnrollmentForm] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    allowChanges: true,
    notifyEmployees: true,
    description: '',
  });

  const benefitsStats = [
    {
      title: 'Active Enrollments',
      value: '138',
      change: '+4',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Health Insurance',
      value: '142',
      change: '+2',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Open Enrollment',
      value: '12 days',
      change: 'Active',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Claims Processed',
      value: '89',
      change: '+15%',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const benefitPlans = [
    {
      id: 1,
      name: 'Premium Health Insurance',
      type: 'Health',
      provider: 'BlueCross BlueShield',
      enrolled: 89,
      totalEligible: 142,
      monthlyCost: 450,
      coverage: 'Individual + Family',
      status: 'active',
    },
    {
      id: 2,
      name: 'Dental Care Plus',
      type: 'Dental',
      provider: 'Delta Dental',
      enrolled: 76,
      totalEligible: 142,
      monthlyCost: 35,
      coverage: 'Individual + Family',
      status: 'active',
    },
    {
      id: 3,
      name: 'Vision Essentials',
      type: 'Vision',
      provider: 'VSP',
      enrolled: 65,
      totalEligible: 142,
      monthlyCost: 25,
      coverage: 'Individual + Family',
      status: 'active',
    },
    {
      id: 4,
      name: '401(k) Retirement Plan',
      type: 'Retirement',
      provider: 'Fidelity',
      enrolled: 95,
      totalEligible: 142,
      monthlyCost: 'Employee Contribution',
      coverage: 'Employee Only',
      status: 'active',
    },
  ];

  const pendingClaims = [
    {
      id: 1,
      employee: 'Alice Johnson',
      type: 'Medical',
      amount: 250,
      date: '2024-12-08',
      status: 'under-review',
      description: 'Doctor visit - annual checkup',
    },
    {
      id: 2,
      employee: 'Bob Smith',
      type: 'Dental',
      amount: 180,
      date: '2024-12-06',
      status: 'approved',
      description: 'Cleaning and exam',
    },
    {
      id: 3,
      employee: 'Carol Davis',
      type: 'Vision',
      amount: 95,
      date: '2024-12-04',
      status: 'pending',
      description: 'New glasses prescription',
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      event: 'Open Enrollment Ends',
      date: '2024-12-20',
      daysLeft: 12,
      type: 'enrollment',
      description: 'Annual benefits enrollment period closes',
    },
    {
      id: 2,
      event: 'COBRA Deadline',
      date: '2024-12-15',
      daysLeft: 7,
      type: 'compliance',
      description: 'COBRA election period for recent termination',
    },
    {
      id: 3,
      event: 'ACA Reporting',
      date: '2024-12-31',
      daysLeft: 23,
      type: 'reporting',
      description: 'Affordable Care Act reporting deadline',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'under-review':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <Badge className="bg-blue-100 text-blue-800">Enrollment</Badge>;
      case 'compliance':
        return <Badge className="bg-red-100 text-red-800">Compliance</Badge>;
      case 'reporting':
        return <Badge className="bg-purple-100 text-purple-800">Reporting</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Handle functions
  const handleAddPlan = () => {
    toast.success('Benefit plan added successfully!');
    setAddPlanOpen(false);
    setAddPlanForm({
      name: '',
      type: 'health',
      provider: '',
      monthlyCost: 0,
      coverage: 'individual',
      description: '',
      effectiveDate: new Date(),
      isActive: true,
    });
  };

  const handleViewDetails = (plan: any) => {
    setSelectedPlan(plan);
    setViewDetailsOpen(true);
  };

  const handleManagePlan = (plan: any) => {
    setSelectedPlan(plan);
    setManagePlanForm({
      enrolled: plan.enrolled,
      totalEligible: plan.totalEligible,
      monthlyCost: typeof plan.monthlyCost === 'number' ? plan.monthlyCost : 0,
      coverage: plan.coverage.toLowerCase().replace(' + ', '-').replace(' ', '-'),
      status: plan.status,
    });
    setManagePlanOpen(true);
  };

  const handleUpdatePlan = () => {
    toast.success('Benefit plan updated successfully!');
    setManagePlanOpen(false);
  };

  const handleReviewClaim = (claim: any) => {
    setSelectedClaim(claim);
    setReviewClaimForm({
      status: 'approved',
      approvedAmount: claim.amount,
      notes: '',
      processedDate: new Date(),
    });
    setReviewClaimOpen(true);
  };

  const handleProcessClaim = () => {
    toast.success(`Claim ${reviewClaimForm.status === 'approved' ? 'approved' : 'denied'} successfully!`);
    setReviewClaimOpen(false);
  };

  const handleViewDeadlineDetails = (deadline: any) => {
    setSelectedDeadline(deadline);
    setDetailsOpen(true);
  };

  const handleManagePlans = () => {
    toast.success('Plans management completed!');
    setManagePlansOpen(false);
  };

  const handleProcessClaims = () => {
    toast.success('Claims processed successfully!');
    setProcessClaimsOpen(false);
  };

  const handleOpenEnrollment = () => {
    toast.success('Open enrollment period configured successfully!');
    setOpenEnrollmentOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-rose-600 to-rose-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Benefits Administration</h1>
            <p className="text-rose-100 mt-1 text-lg">Manage employee benefits, insurance, and wellness programs</p>
          </div>
          <CurrencySelector />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefitsStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-rose-200">
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
                  <span className="text-gray-500">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Benefit Plans */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl text-gray-900">Benefit Plans</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Active benefits programs and enrollment status
                </CardDescription>
              </div>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                onClick={() => setAddPlanOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {benefitPlans.map((plan) => (
                <div key={plan.id} className="p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <Shield className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {plan.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {plan.provider} • {plan.type}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(plan.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Enrollment</p>
                      <p className="font-semibold text-gray-900">
                        {plan.enrolled}/{plan.totalEligible} employees
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Cost</p>
                      <p className="font-semibold text-gray-900">
                        {typeof plan.monthlyCost === 'number' ? formatAmount(plan.monthlyCost) : plan.monthlyCost}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Coverage: {plan.coverage}</p>
                  <div className="flex justify-end mt-3 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-300 hover:bg-rose-50"
                      onClick={() => handleViewDetails(plan)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-300 hover:bg-rose-50"
                      onClick={() => handleManagePlan(plan)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Claims */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Pending Claims</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Benefits claims requiring review and processing
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {claim.employee}
                        </p>
                        <p className="text-xs text-gray-500">
                          {claim.type} • {claim.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted: {new Date(claim.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatAmount(claim.amount)}</p>
                      {getStatusBadge(claim.status)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-300 hover:bg-rose-50"
                      onClick={() => handleReviewClaim(claim)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-amber-50 to-orange-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Upcoming Deadlines</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Important benefits-related dates and compliance requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {deadline.event}
                      </p>
                      <p className="text-xs text-gray-500">
                        {deadline.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        Due: {new Date(deadline.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{deadline.daysLeft} days</p>
                    <p className="text-xs text-gray-500">remaining</p>
                  </div>
                  {getTypeBadge(deadline.type)}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 border-rose-300 hover:bg-rose-50"
                    onClick={() => handleViewDeadlineDetails(deadline)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-rose-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Benefits Actions</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Common benefits administration tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="p-5 border-2 border-rose-200 rounded-xl hover:bg-linear-to-br hover:from-rose-50 hover:to-pink-50 hover:border-rose-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl"
              onClick={() => setManagePlansOpen(true)}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
                  <Shield className="h-5 w-5 text-rose-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Manage Plans</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Configure and update benefit plans
              </p>
            </Button>
            <Button
              className="p-5 border-2 border-blue-200 rounded-xl hover:bg-linear-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl"
              onClick={() => setProcessClaimsOpen(true)}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Process Claims</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Review and approve benefit claims
              </p>
            </Button>
            <Button
              className="p-5 border-2 border-green-200 rounded-xl hover:bg-linear-to-br hover:from-green-50 hover:to-emerald-50 hover:border-green-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl"
              onClick={() => setOpenEnrollmentOpen(true)}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Open Enrollment</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Manage annual benefits enrollment
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Plan Dialog */}
      <Dialog open={addPlanOpen} onOpenChange={setAddPlanOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Benefit Plan</DialogTitle>
            <DialogDescription>
              Create a new benefit plan for employees
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={addPlanForm.name}
                  onChange={(e) => setAddPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter plan name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type</Label>
                <Select value={addPlanForm.type} onValueChange={(value) => setAddPlanForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health Insurance</SelectItem>
                    <SelectItem value="dental">Dental Insurance</SelectItem>
                    <SelectItem value="vision">Vision Insurance</SelectItem>
                    <SelectItem value="retirement">Retirement Plan</SelectItem>
                    <SelectItem value="life">Life Insurance</SelectItem>
                    <SelectItem value="disability">Disability Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={addPlanForm.provider}
                  onChange={(e) => setAddPlanForm(prev => ({ ...prev, provider: e.target.value }))}
                  placeholder="Insurance provider"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyCost">Monthly Cost</Label>
                <Input
                  id="monthlyCost"
                  type="number"
                  value={addPlanForm.monthlyCost}
                  onChange={(e) => setAddPlanForm(prev => ({ ...prev, monthlyCost: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverage">Coverage Type</Label>
                <Select value={addPlanForm.coverage} onValueChange={(value) => setAddPlanForm(prev => ({ ...prev, coverage: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Only</SelectItem>
                    <SelectItem value="individual-family">Individual + Family</SelectItem>
                    <SelectItem value="employee-only">Employee Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !addPlanForm.effectiveDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {addPlanForm.effectiveDate ? format(addPlanForm.effectiveDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={addPlanForm.effectiveDate}
                      onSelect={(date) => date && setAddPlanForm(prev => ({ ...prev, effectiveDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={addPlanForm.description}
                onChange={(e) => setAddPlanForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the benefit plan"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={addPlanForm.isActive}
                onCheckedChange={(checked) => setAddPlanForm(prev => ({ ...prev, isActive: !!checked }))}
              />
              <Label htmlFor="isActive">Plan is active and available for enrollment</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddPlanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlan}>
              Add Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Benefit Plan Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the benefit plan
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Plan Name</Label>
                  <div className="mt-1 text-lg font-semibold">{selectedPlan.name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPlan.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="mt-1">{selectedPlan.type}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Provider</Label>
                  <div className="mt-1">{selectedPlan.provider}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Monthly Cost</Label>
                  <div className="mt-1 font-semibold">
                    {typeof selectedPlan.monthlyCost === 'number' ? formatAmount(selectedPlan.monthlyCost) : selectedPlan.monthlyCost}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Coverage</Label>
                  <div className="mt-1">{selectedPlan.coverage}</div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Enrollment Statistics</Label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedPlan.enrolled}</div>
                    <div className="text-sm text-blue-700">Enrolled</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{selectedPlan.totalEligible}</div>
                    <div className="text-sm text-gray-700">Eligible</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((selectedPlan.enrolled / selectedPlan.totalEligible) * 100)}%
                    </div>
                    <div className="text-sm text-green-700">Coverage</div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Plan Features</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Comprehensive coverage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Network provider access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">24/7 customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Online account management</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Plan Dialog */}
      <Dialog open={managePlanOpen} onOpenChange={setManagePlanOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Benefit Plan</DialogTitle>
            <DialogDescription>
              Update plan settings and enrollment details
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enrolled">Currently Enrolled</Label>
                  <Input
                    id="enrolled"
                    type="number"
                    value={managePlanForm.enrolled}
                    onChange={(e) => setManagePlanForm(prev => ({ ...prev, enrolled: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalEligible">Total Eligible</Label>
                  <Input
                    id="totalEligible"
                    type="number"
                    value={managePlanForm.totalEligible}
                    onChange={(e) => setManagePlanForm(prev => ({ ...prev, totalEligible: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyCost">Monthly Cost</Label>
                  <Input
                    id="monthlyCost"
                    type="number"
                    value={managePlanForm.monthlyCost}
                    onChange={(e) => setManagePlanForm(prev => ({ ...prev, monthlyCost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverage">Coverage Type</Label>
                  <Select value={managePlanForm.coverage} onValueChange={(value) => setManagePlanForm(prev => ({ ...prev, coverage: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Only</SelectItem>
                      <SelectItem value="individual-family">Individual + Family</SelectItem>
                      <SelectItem value="employee-only">Employee Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Plan Status</Label>
                <Select value={managePlanForm.status} onValueChange={(value) => setManagePlanForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setManagePlanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>
              Update Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Claim Dialog */}
      <Dialog open={reviewClaimOpen} onOpenChange={setReviewClaimOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Benefit Claim</DialogTitle>
            <DialogDescription>
              Process and approve or deny the benefit claim
            </DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Claim Details</h4>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Employee:</span>
                    <div className="font-medium">{selectedClaim.employee}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <div className="font-medium">{selectedClaim.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <div className="font-medium">{formatAmount(selectedClaim.amount)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <div className="font-medium">{new Date(selectedClaim.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-600">Description:</span>
                  <div className="font-medium">{selectedClaim.description}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimStatus">Decision</Label>
                  <Select value={reviewClaimForm.status} onValueChange={(value) => setReviewClaimForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approve</SelectItem>
                      <SelectItem value="denied">Deny</SelectItem>
                      <SelectItem value="pending">Keep Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approvedAmount">Approved Amount</Label>
                  <Input
                    id="approvedAmount"
                    type="number"
                    value={reviewClaimForm.approvedAmount}
                    onChange={(e) => setReviewClaimForm(prev => ({ ...prev, approvedAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="claimNotes">Review Notes</Label>
                <Textarea
                  id="claimNotes"
                  value={reviewClaimForm.notes}
                  onChange={(e) => setReviewClaimForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about the decision"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReviewClaimOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessClaim}>
              Process Claim
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog for Deadlines */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deadline Details</DialogTitle>
            <DialogDescription>
              Important information about this deadline
            </DialogDescription>
          </DialogHeader>
          {selectedDeadline && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Event</Label>
                  <div className="mt-1 text-lg font-semibold">{selectedDeadline.event}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedDeadline.type)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <div className="mt-1">{new Date(selectedDeadline.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Days Remaining</Label>
                  <div className="mt-1 text-lg font-semibold text-red-600">{selectedDeadline.daysLeft} days</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedDeadline.description}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Action Required</Label>
                <div className="mt-1 space-y-2">
                  {selectedDeadline.type === 'enrollment' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Review enrollment data</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Process employee elections</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Update plan enrollments</span>
                      </div>
                    </>
                  )}
                  {selectedDeadline.type === 'compliance' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Notify affected employees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Process COBRA elections</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Update benefit records</span>
                      </div>
                    </>
                  )}
                  {selectedDeadline.type === 'reporting' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Compile ACA data</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Generate reports</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Submit to authorities</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Plans Dialog */}
      <Dialog open={managePlansOpen} onOpenChange={setManagePlansOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Benefit Plans</DialogTitle>
            <DialogDescription>
              Bulk operations for benefit plan management
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Plan Status Updates</h4>
                  <p className="text-sm text-gray-600 mb-3">Change status for multiple plans</p>
                  <Button className="w-full" variant="outline">
                    Update Plan Status
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Cost Adjustments</h4>
                  <p className="text-sm text-gray-600 mb-3">Update pricing for benefit plans</p>
                  <Button className="w-full" variant="outline">
                    Adjust Costs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Enrollment Reports</h4>
                  <p className="text-sm text-gray-600 mb-3">Generate enrollment analytics</p>
                  <Button className="w-full" variant="outline">
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Plan Archiving</h4>
                  <p className="text-sm text-gray-600 mb-3">Archive inactive benefit plans</p>
                  <Button className="w-full" variant="outline">
                    Archive Plans
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setManagePlansOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleManagePlans}>
              Complete Management
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Process Claims Dialog */}
      <Dialog open={processClaimsOpen} onOpenChange={setProcessClaimsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Process Benefit Claims</DialogTitle>
            <DialogDescription>
              Bulk processing of pending benefit claims
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Pending Review</span>
                  </div>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-sm text-gray-600">Claims awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Auto-Approve</span>
                  </div>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-gray-600">Eligible for auto-approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <X className="h-5 w-5 text-red-600" />
                    <span className="font-medium">High Priority</span>
                  </div>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-sm text-gray-600">Require immediate attention</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Processing Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Auto-Process Eligible Claims</h5>
                  <p className="text-sm text-gray-600 mb-3">Automatically approve claims under $500</p>
                  <Button size="sm" className="w-full">
                    Auto-Process
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Bulk Approval</h5>
                  <p className="text-sm text-gray-600 mb-3">Approve multiple claims at once</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Bulk Approve
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setProcessClaimsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessClaims}>
              Process Claims
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Open Enrollment Dialog */}
      <Dialog open={openEnrollmentOpen} onOpenChange={setOpenEnrollmentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Open Enrollment</DialogTitle>
            <DialogDescription>
              Set up the annual benefits enrollment period
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Enrollment Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !openEnrollmentForm.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {openEnrollmentForm.startDate ? format(openEnrollmentForm.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={openEnrollmentForm.startDate}
                      onSelect={(date) => date && setOpenEnrollmentForm(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Enrollment End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !openEnrollmentForm.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {openEnrollmentForm.endDate ? format(openEnrollmentForm.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={openEnrollmentForm.endDate}
                      onSelect={(date) => date && setOpenEnrollmentForm(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowChanges"
                  checked={openEnrollmentForm.allowChanges}
                  onCheckedChange={(checked) => setOpenEnrollmentForm(prev => ({ ...prev, allowChanges: !!checked }))}
                />
                <Label htmlFor="allowChanges">Allow employees to make changes during enrollment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyEmployees"
                  checked={openEnrollmentForm.notifyEmployees}
                  onCheckedChange={(checked) => setOpenEnrollmentForm(prev => ({ ...prev, notifyEmployees: !!checked }))}
                />
                <Label htmlFor="notifyEmployees">Send notification emails to all employees</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollmentDescription">Enrollment Description</Label>
              <Textarea
                id="enrollmentDescription"
                value={openEnrollmentForm.description}
                onChange={(e) => setOpenEnrollmentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the enrollment period and any special instructions"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenEnrollmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOpenEnrollment}>
              Configure Enrollment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}