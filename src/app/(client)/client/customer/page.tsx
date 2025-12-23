"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Plus,
  Eye,
  Edit,
  Save,
  X,
  User,
  Building,
  Globe,
  CreditCard,
  Calendar,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Search,
} from "lucide-react";
import mockData from "@/lib/mock-data";
import { useCurrency } from "@/lib/currency";
import { Customer, CustomerType } from "@/types";

// Firestore helpers
import {
  addCustomerToFirestore,
  updateCustomerInFirestore,
  deleteCustomerFromFirestore,
  subscribeToCustomers,
} from "@/lib/customer";

// Firebase imports for projects
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot 
} from "firebase/firestore";

// ------------------- Customer Form Dialog -------------------
function CustomerFormDialog({
  customer,
  isOpen,
  onClose,
  onSave,
  mode,
}: {
  customer?: Partial<Customer>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Partial<Customer>) => void;
  mode: "add" | "edit";
}) {
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      companyName: "",
      customerType: "sme" as CustomerType,
      industry: "",
      website: "",
      taxId: "",
      primaryContact: {
        name: "",
        email: "",
        phone: "",
        designation: "",
      },
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },
      creditLimit: 0,
      paymentTerms: "Net 30",
      isActive: true,
      assignedSalesRep: "user-2",
      projects: [],
      totalRevenue: 0,
      // NEW: Multiple phone numbers
      phoneNumbers: [
        { type: "whatsapp", number: "" },
        { type: "primary", number: "" }
      ]
    }
  );

  // When editingCustomer changes (opening edit dialog), set formData
  useEffect(() => {
    setFormData(
      customer || {
        companyName: "",
        customerType: "sme" as CustomerType,
        industry: "",
        website: "",
        taxId: "",
        primaryContact: {
          name: "",
          email: "",
          phone: "",
          designation: "",
        },
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
        creditLimit: 0,
        paymentTerms: "Net 30",
        isActive: true,
        assignedSalesRep: "user-2",
        projects: [],
        totalRevenue: 0,
        // NEW: Multiple phone numbers
        phoneNumbers: [
          { type: "whatsapp", number: "" },
          { type: "primary", number: "" }
        ]
      }
    );
  }, [customer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const updateFormData = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...((prev as any)[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // NEW: Add new phone number field
  const addPhoneNumber = () => {
    setFormData((prev) => ({
      ...prev,
      phoneNumbers: [
        ...(prev.phoneNumbers || []),
        { type: "primary", number: "" }
      ]
    }));
  };

  // NEW: Update phone number
  const updatePhoneNumber = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedPhoneNumbers = [...(prev.phoneNumbers || [])];
      if (field === 'type') {
        updatedPhoneNumbers[index] = { ...updatedPhoneNumbers[index], type: value };
      } else {
        updatedPhoneNumbers[index] = { ...updatedPhoneNumbers[index], number: value };
      }
      return { ...prev, phoneNumbers: updatedPhoneNumbers };
    });
  };

  // NEW: Remove phone number
  const removePhoneNumber = (index: number) => {
    setFormData((prev) => {
      const updatedPhoneNumbers = [...(prev.phoneNumbers || [])];
      updatedPhoneNumbers.splice(index, 1);
      return { ...prev, phoneNumbers: updatedPhoneNumbers };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl z-100">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {mode === "add" ? (
              <Plus className="h-5 w-5" />
            ) : (
              <Edit className="h-5 w-5" />
            )}
            <span>{mode === "add" ? "Add New Customer" : "Edit Customer"}</span>
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new customer record with complete business information."
              : "Update customer information and business details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ""}
                    onChange={(e) =>
                      updateFormData("companyName", e.target.value)
                    }
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry || ""}
                    onChange={(e) => updateFormData("industry", e.target.value)}
                    placeholder="e.g., Manufacturing, Healthcare"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Contact Information</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.primaryContact?.name || ""}
                      onChange={(e) =>
                        updateFormData("primaryContact.name", e.target.value)
                      }
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.primaryContact?.email || ""}
                      onChange={(e) =>
                        updateFormData("primaryContact.email", e.target.value)
                      }
                      placeholder="email@company.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone Numbers Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Phone Numbers</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addPhoneNumber}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Number</span>
                    </Button>
                  </div>
                  
                  {(formData.phoneNumbers || []).map((phone, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Select
                        value={phone.type}
                        onValueChange={(value) => updatePhoneNumber(index, 'type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="fax">Fax</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        value={phone.number}
                        onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="flex-1"
                      />
                      
                      {(formData.phoneNumbers || []).length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removePhoneNumber(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Address Information</span>
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.address?.street || ""}
                    onChange={(e) =>
                      updateFormData("address.street", e.target.value)
                    }
                    placeholder="123 Business St"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address?.city || ""}
                      onChange={(e) =>
                        updateFormData("address.city", e.target.value)
                      }
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.address?.state || ""}
                      onChange={(e) =>
                        updateFormData("address.state", e.target.value)
                      }
                      placeholder="State"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.address?.country || ""}
                      onChange={(e) =>
                        updateFormData("address.country", e.target.value)
                      }
                      placeholder="Country"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.address?.zipCode || ""}
                      onChange={(e) =>
                        updateFormData("address.zipCode", e.target.value)
                      }
                      placeholder="12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isActive">Status</Label>
                    <Select
                      value={formData.isActive ? "active" : "inactive"}
                      onValueChange={(value) =>
                        updateFormData("isActive", value === "active")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              
                
            
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ""}
                    onChange={(e) => updateFormData("website", e.target.value)}
                    placeholder="https://www.company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId || ""}
                    onChange={(e) => updateFormData("taxId", e.target.value)}
                    placeholder="Tax identification number"
                  />
                </div>
              </div>
              
             
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              <Save className="h-4 w-4 mr-2" />
              {mode === "add" ? "Create Customer" : "Update Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------------------- Customer View Dialog -------------------
function CustomerViewDialog({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const { formatAmount } = useCurrency();
  const [customerProjects, setCustomerProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Calculate total revenue from all projects
  const calculateTotalRevenue = (projects: any[]) => {
    return projects.reduce((total, project) => total + (project.budgetAmount || 0), 0);
  };

  // Fetch projects for this specific customer from Firebase
  useEffect(() => {
    if (!customer?.id) return;

    const fetchCustomerProjects = async () => {
      try {
        setLoadingProjects(true);
        const db = getFirestore();
        const projectsCollection = collection(db, 'projects');
        const q = query(projectsCollection, where("customerId", "==", customer.id));
        
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to Date objects
          startDate: doc.data().startDate?.toDate?.(),
          endDate: doc.data().endDate?.toDate?.(),
          createdAt: doc.data().createdAt?.toDate?.(),
          updatedAt: doc.data().updatedAt?.toDate?.(),
        }));
        
        setCustomerProjects(projects);
      } catch (error) {
        console.error('Error fetching customer projects:', error);
        setCustomerProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchCustomerProjects();
  }, [customer?.id]);

  // Keep using mock getters for quotes/invoices if present
  const customerQuotations =
    (mockData.getQuotationsByCustomer &&
      mockData.getQuotationsByCustomer(customer.id)) ||
    [];
  const customerInvoices =
    (mockData.getInvoicesByCustomer &&
      mockData.getInvoicesByCustomer(customer.id)) ||
    [];

  // Get status badge configuration
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', label: string }> = {
      planning: { variant: 'secondary', label: 'PLANNING' },
      active: { variant: 'default', label: 'ACTIVE' },
      on_hold: { variant: 'destructive', label: 'ON HOLD' },
      completed: { variant: 'default', label: 'COMPLETED' },
      cancelled: { variant: 'outline', label: 'CANCELLED' },
    };
    return statusMap[status] || statusMap.planning;
  };

  // Get project type label
  const getProjectTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      installation: 'Installation',
      maintenance: 'Maintenance',
      consulting: 'Consulting',
      supply_only: 'Supply Only',
      turnkey: 'Turnkey'
    };
    return typeMap[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl z-100">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl">
              {customer.companyName?.charAt(0) || "C"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{customer.companyName}</h2>
              <p className="text-gray-600">{customer.industry}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete customer profile and business information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact Details</TabsTrigger>
            <TabsTrigger value="projects">
              Projects ({customerProjects.length})
            </TabsTrigger>
            
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Business Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      variant={customer.isActive ? "default" : "secondary"}
                    >
                      {customer.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  
                 
                  {customer.website && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Website:</span>
                      <a
                        href={customer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {customer.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Financial Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="font-bold text-green-600">
                      {formatAmount(calculateTotalRevenue(customerProjects))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Projects:</span>
                    <span className="font-semibold">
                      {customerProjects.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Projects:</span>
                    <span className="font-semibold">
                      {customerProjects.filter(project => project.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Projects:</span>
                    <span className="font-semibold">
                      {customerProjects.filter(project => project.status === 'completed').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Primary Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">
                      {customer.primaryContact?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <a
                      href={`mailto:${customer.primaryContact?.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {customer.primaryContact?.email}
                    </a>
                  </div>
                  {/* Display multiple phone numbers */}
                  {(customer.phoneNumbers || []).map((phone, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600 capitalize">
                        {phone.type} Phone:
                      </span>
                      <a
                        href={`tel:${phone.number}`}
                        className="text-blue-600 hover:underline"
                      >
                        {phone.number}
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold">{customer.address?.street}</p>
                  <p>
                    {customer.address?.city}, {customer.address?.state}{" "}
                    {customer.address?.zipCode}
                  </p>
                  <p>{customer.address?.country}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {loadingProjects ? (
              <div className="text-center py-8 text-gray-500">
                Loading projects...
              </div>
            ) : customerProjects.length > 0 ? (
              customerProjects.map((project) => {
                const statusBadge = getStatusBadge(project.status);
                return (
                  <Card key={project.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg text-gray-900">
                              {project.name}
                            </h4>
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.label}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {getProjectTypeLabel(project.type)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {project.description}
                          </p>
                          
                          <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">Project Manager</p>
                              <p className="text-sm font-semibold text-gray-700">
                                {project.projectManager || 'Not assigned'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Start Date</p>
                              <p className="text-sm font-semibold text-gray-700">
                                {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">End Date</p>
                              <p className="text-sm font-semibold text-gray-700">
                                {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Team Members</p>
                              <p className="text-sm font-semibold text-gray-700">
                                {project.teamMembers?.length || 0}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">Progress</span>
                              <span className="text-sm font-bold text-gray-900">
                                {project.completionPercentage || 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${project.completionPercentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-6 text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatAmount(project.budgetAmount || 0)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Budget</p>
                          
                          {project.actualCost > 0 && (
                            <>
                              <p className="text-lg font-semibold text-blue-600 mt-2">
                                {formatAmount(project.actualCost || 0)}
                              </p>
                              <p className="text-xs text-gray-500">Actual Cost</p>
                            </>
                          )}
                          
                          {project.profitMargin > 0 && (
                            <>
                              <p className="text-lg font-semibold text-purple-600 mt-2">
                                {project.profitMargin}%
                              </p>
                              <p className="text-xs text-gray-500">Profit Margin</p>
                            </>
                          )}
                          
                          {project.milestones?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-gray-700">
                                {project.milestones.length} Milestones
                              </p>
                              <p className="text-xs text-gray-500">
                                {project.milestones.filter((m: any) => m.isCompleted).length} Completed
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No projects found for this customer
              </div>
            )}
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            
            
              

           
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit} className="bg-red-600 hover:bg-red-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
          <Button variant="destructive" onClick={() => onDelete(customer.id)}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------------------- Main Page -------------------
export default function AdminSalesCustomersPage() {
  const { formatAmount } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // NEW: Customer filter state
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>("all");

  // Fetch all projects from Firebase for stats calculation
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const db = getFirestore();
        const projectsCollection = collection(db, 'projects');
        const querySnapshot = await getDocs(projectsCollection);
        const projects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          budgetAmount: doc.data().budgetAmount || 0,
        }));
        setAllProjects(projects);
      } catch (error) {
        console.error('Error fetching all projects:', error);
        setAllProjects([]);
      }
    };

    fetchAllProjects();
  }, []);

  // Subscribe to Firestore customers collection on mount
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToCustomers((items: any[]) => {
      // If Firestore is empty, optionally populate initial mock data
      if (
        items.length === 0 &&
        mockData &&
        Array.isArray(mockData.customers) &&
        mockData.customers.length > 0
      ) {
        // We won't auto-add mock data to Firestore — keep Firestore authoritative.
        // The UI will show no customers until you add real ones.
      }
      setCustomers(items as Customer[]);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Calculate total revenue for a specific customer
  const calculateCustomerRevenue = (customerId: string) => {
    const customerProjects = allProjects.filter(project => project.customerId === customerId);
    return customerProjects.reduce((total, project) => total + (project.budgetAmount || 0), 0);
  };

  // Calculate total projects for a specific customer
  const calculateCustomerProjectsCount = (customerId: string) => {
    return allProjects.filter(project => project.customerId === customerId).length;
  };

  // Calculate total revenue from all projects across all customers
  const calculateTotalRevenueFromProjects = () => {
    return allProjects.reduce((total, project) => total + (project.budgetAmount || 0), 0);
  };

  // Calculate total number of projects across all customers
  const calculateTotalProjectsCount = () => {
    return allProjects.length;
  };

  // Add customer handler -> Firestore
  const handleAddCustomer = async (customerData: Partial<Customer>) => {
    try {
      await addCustomerToFirestore({
        ...customerData,
      });
      // realtime listener will update UI
    } catch (err) {
      console.error("Add customer error", err);
      alert("Failed to add customer. Check console for details.");
    }
  };

  // Edit handler -> Firestore
  const handleEditCustomer = async (customerData: Partial<Customer>) => {
    if (!editingCustomer) return;
    try {
      await updateCustomerInFirestore(editingCustomer.id, {
        ...customerData,
      });
      setEditingCustomer(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Update customer error", err);
      alert("Failed to update customer. Check console for details.");
    }
  };

  // Delete handler -> Firestore
  const handleDeleteCustomer = async (customerId: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this customer? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
      await deleteCustomerFromFirestore(customerId);
      // realtime listener will update UI
      setIsViewDialogOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Delete customer error", err);
      alert("Failed to delete customer. Check console for details.");
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleEditFromView = () => {
    if (selectedCustomer) {
      setEditingCustomer(selectedCustomer);
      setIsViewDialogOpen(false);
      setIsEditDialogOpen(true);
    }
  };

  // Filter customers based on selected filter
  const getFilteredCustomers = () => {
    if (selectedCustomerFilter === "all") {
      return customers;
    }
    return customers.filter(customer => customer.id === selectedCustomerFilter);
  };

  const filteredCustomers = getFilteredCustomers();

  // Stats (derived from customers state and projects data)
  const customerStats = [
    {
      title: "Total Customers",
      value: customers.length.toString(),
      change: "+18",
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Customers",
      value: customers.filter((c) => c.isActive).length.toString(),
      change: "+12",
      icon: Building2,
      color: "green",
    },
    {
      title: "Total Revenue",
      value: formatAmount(calculateTotalRevenueFromProjects()),
      change: "+22%",
      icon: DollarSign,
      color: "yellow",
    },
    {
      title: "Total Projects",
      value: calculateTotalProjectsCount().toString(),
      change: "+8%",
      icon: TrendingUp,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">All Customers</h1>
            <p className="text-red-100 mt-1 text-lg">
              Complete customer database and relationship management
            </p>
          </div>
          
        </div>
      </div>

      {/* NEW: Customer Filter Dropdown - Added after stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <Label htmlFor="customer-filter" className="text-sm font-medium mb-2 block">
                Filter Customers
              </Label>
              <Select
                value={selectedCustomerFilter}
                onValueChange={setSelectedCustomerFilter}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.companyName} - {customer.primaryContact?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomerFilter("all")}
                disabled={selectedCustomerFilter === "all"}
              >
                Clear Filter
              </Button>
            
            </div>
          </div>
          
          {selectedCustomerFilter !== "all" && (
            <div className="mt-3 text-sm text-gray-600">
              Showing customer: <span className="font-semibold">
                {customers.find(c => c.id === selectedCustomerFilter)?.companyName}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customerStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 border-2"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`p-2`}>
                  <IconComponent className={`h-5 w-5`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-sm mt-1">
                  <span className="text-green-600 font-semibold">
                    {stat.change}
                  </span>
                  <span className="text-gray-500"> from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Customers List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-blue-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">
            Customer Directory
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            {filteredCustomers.length} customers with complete business information
            {selectedCustomerFilter !== "all" && ` (Filtered)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading customers...
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.slice(0, 15).map((customer) => {
                const customerRevenue = calculateCustomerRevenue(customer.id);
                const customerProjectsCount = calculateCustomerProjectsCount(customer.id);
                
                return (
                  <div
                    key={customer.id}
                    className="p-5 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-all duration-200 hover:shadow-md bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-14 h-14 bg-linear-to-br from-red-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {customer.companyName?.charAt(0) || "C"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-bold text-gray-900 text-lg">
                              {customer.companyName}
                            </h4>
                            <Badge
                              variant={
                                customer.isActive ? "default" : "secondary"
                              }
                            >
                              {customer.isActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                            
                          </div>
                        
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {customer.primaryContact?.email}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {customer.primaryContact?.phone}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {customer.address?.city}, {customer.address?.state}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">
                                Contact Person
                              </p>
                              <p className="text-sm font-semibold text-gray-700">
                                {customer.primaryContact?.name}
                              </p>
                            </div>
                            <div>
                             
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Total Projects
                              </p>
                              <p className="text-sm font-semibold text-gray-700">
                                {customerProjectsCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatAmount(customerRevenue)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Total Revenue
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-600"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 "
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CustomerFormDialog
        customer={undefined}
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddCustomer}
        mode="add"
      />

      <CustomerFormDialog
        customer={editingCustomer || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleEditCustomer}
        mode="edit"
      />

      {selectedCustomer && (
        <CustomerViewDialog
          customer={selectedCustomer}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedCustomer(null);
          }}
          onEdit={handleEditFromView}
          onDelete={handleDeleteCustomer}
        />
      )}
    </div>
  );
}