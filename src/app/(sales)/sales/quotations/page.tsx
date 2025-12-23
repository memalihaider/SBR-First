'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Send,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Firebase imports
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { QuotationStatus } from '@/types';

interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  status: QuotationStatus;
  issueDate: string;
  validUntil: string;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  serviceCharges: number;
  totalAmount: number;
  items: QuotationItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  taxType: 'percentage' | 'fixed';
  totalPrice?: number; // Optional bana diya
  amount?: number; // Amount bhi add kiya
}

// Helper function to calculate item total safely
const calculateItemTotal = (item: QuotationItem): number => {
  try {
    // Pehle subtotal calculate karein
    const subtotal = (item.quantity || 0) * (item.rate || 0);
    
    // Discount calculate karein
    let discountAmount = 0;
    if (item.discountType === 'percentage') {
      discountAmount = subtotal * ((item.discount || 0) / 100);
    } else {
      discountAmount = item.discount || 0;
    }
    
    // Taxable amount
    const taxableAmount = subtotal - discountAmount;
    
    // Tax calculate karein
    let taxAmount = 0;
    if (item.taxType === 'percentage') {
      taxAmount = taxableAmount * ((item.tax || 0) / 100);
    } else {
      taxAmount = item.tax || 0;
    }
    
    // Final total
    return taxableAmount + taxAmount;
  } catch (error) {
    console.error('Error calculating item total:', error);
    return 0;
  }
};

// Firebase functions for quotations
const fetchQuotationsFromFirebase = async (): Promise<Quotation[]> => {
  try {
    const quotationsRef = collection(db, 'quotations');
    const q = query(quotationsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const quotations: Quotation[] = [];
    const uniqueIds = new Set(); // Duplicate IDs check karne ke liye
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const quotationData: Quotation = { 
        id: doc.id, 
        quotationNumber: data.quotationNumber || '',
        customerId: data.customerId || '',
        customerName: data.customerName || '',
        customerCompany: data.customerCompany || '',
        customerEmail: data.customerEmail || '',
        customerPhone: data.customerPhone || '',
        status: data.status || 'draft',
        issueDate: data.issueDate || new Date().toISOString(),
        validUntil: data.validUntil || new Date().toISOString(),
        subtotal: data.subtotal || 0,
        totalDiscount: data.totalDiscount || 0,
        totalTax: data.totalTax || 0,
        serviceCharges: data.serviceCharges || 0,
        totalAmount: data.totalAmount || 0,
        items: (data.items || []).map((item: any) => ({
          id: item.id || '',
          productId: item.productId || '',
          productName: item.productName || '',
          description: item.description || '',
          quantity: item.quantity || 0,
          rate: item.rate || 0,
          discount: item.discount || 0,
          discountType: item.discountType || 'percentage',
          tax: item.tax || 0,
          taxType: item.taxType || 'percentage',
          totalPrice: item.totalPrice || item.amount || calculateItemTotal(item),
          amount: item.amount || item.totalPrice || calculateItemTotal(item)
        })),
        notes: data.notes || '',
        createdBy: data.createdBy || 'Admin',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      };
      
      // Check karein ke ID unique hai ya nahi
      if (!uniqueIds.has(quotationData.id)) {
        uniqueIds.add(quotationData.id);
        quotations.push(quotationData);
      } else {
        console.warn('Duplicate quotation ID found:', quotationData.id);
      }
    });
    
    return quotations;
  } catch (error) {
    console.error('Error fetching quotations from Firebase:', error);
    return [];
  }
};

// Firebase mein quotation save karna
const saveQuotationToFirebase = async (quotationData: Omit<Quotation, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'quotations'), quotationData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving quotation to Firebase:', error);
    throw error;
  }
};

// Firebase mein quotation update karna
const updateQuotationInFirebase = async (quotationId: string, quotationData: Partial<Quotation>): Promise<void> => {
  try {
    const quotationRef = doc(db, 'quotations', quotationId);
    await updateDoc(quotationRef, quotationData);
  } catch (error) {
    console.error('Error updating quotation in Firebase:', error);
    throw error;
  }
};

// Firebase se quotation delete karna - FIXED VERSION
const deleteQuotationFromFirebase = async (quotationId: string): Promise<void> => {
  try {
    console.log('Deleting quotation with ID:', quotationId);
    
    // Document reference banayein
    const quotationRef = doc(db, 'quotations', quotationId);
    
    // Document exists check karein
    const quotationDoc = await getDocs(query(collection(db, 'quotations'), 
      where('__name__', '==', quotationId)
    ));
    
    if (quotationDoc.empty) {
      throw new Error('Quotation not found in database');
    }
    
    // Delete operation perform karein
    await deleteDoc(quotationRef);
    console.log('Quotation deleted successfully from Firebase');
  } catch (error) {
    console.error('Error deleting quotation from Firebase:', error);
    throw error;
  }
};

// Firebase se customers fetch karna
const fetchCustomersFromFirebase = async () => {
  try {
    const customersRef = collection(db, 'customers');
    const querySnapshot = await getDocs(customersRef);
    
    const customers: any[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() });
    });
    
    return customers;
  } catch (error) {
    console.error('Error fetching customers from Firebase:', error);
    return [];
  }
};

export default function AdminSalesQuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const itemsPerPage = 15;

  // Load quotations and customers from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Firebase se quotations load karein
        const firebaseQuotations = await fetchQuotationsFromFirebase();
        setQuotations(firebaseQuotations);

        // Firebase se customers load karein (agar available hai)
        const firebaseCustomers = await fetchCustomersFromFirebase();
        if (firebaseCustomers.length > 0) {
          setCustomers(firebaseCustomers);
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter quotations based on search and filters
  const filteredQuotations = useMemo(() => {
    return quotations.filter(quotation => {
      const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quotation.customerCompany.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
      const matchesCustomer = customerFilter === 'all' || quotation.customerId === customerFilter;

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const now = new Date();
        const quotationDate = new Date(quotation.issueDate);
        const daysDiff = Math.floor((now.getTime() - quotationDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today':
            matchesDate = daysDiff === 0;
            break;
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
          case 'quarter':
            matchesDate = daysDiff <= 90;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesCustomer && matchesDate;
    });
  }, [quotations, searchTerm, statusFilter, customerFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Real-time stats calculation
  const quotationStats = useMemo(() => {
    const totalQuotations = quotations.length;
    const pendingReview = quotations.filter(q => q.status === 'sent' || q.status === 'under_review').length;
    const approved = quotations.filter(q => q.status === 'approved').length;
    const totalValue = quotations.reduce((sum, q) => sum + q.totalAmount, 0);

    return [
      { 
        title: 'Total Quotations', 
        value: totalQuotations.toString(), 
        change: '+0', 
        icon: FileText, 
        color: 'blue' 
      },
      { 
        title: 'Pending Review', 
        value: pendingReview.toString(), 
        change: '+0', 
        icon: Clock, 
        color: 'yellow' 
      },
      { 
        title: 'Approved', 
        value: approved.toString(), 
        change: '+0', 
        icon: CheckCircle, 
        color: 'green' 
      },
      { 
        title: 'Total Value', 
        value: '$' + totalValue.toLocaleString(), 
        change: '+0%', 
        icon: DollarSign, 
        color: 'purple' 
      },
    ];
  }, [quotations]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", label: string, color: string }> = {
      draft: { variant: 'secondary', label: 'DRAFT', color: 'gray' },
      sent: { variant: 'default', label: 'SENT', color: 'blue' },
      under_review: { variant: 'outline', label: 'UNDER REVIEW', color: 'yellow' },
      approved: { variant: 'default', label: 'APPROVED', color: 'green' },
      rejected: { variant: 'destructive', label: 'REJECTED', color: 'red' },
      expired: { variant: 'outline', label: 'EXPIRED', color: 'orange' },
      converted: { variant: 'default', label: 'CONVERTED', color: 'purple' },
    };
    return statusMap[status] || statusMap.draft;
  };

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsViewDialogOpen(true);
  };

  const handleDuplicateQuotation = async (quotation: Quotation) => {
    const newQuotation: Omit<Quotation, 'id'> = {
      ...quotation,
      quotationNumber: `QT-${Date.now()}`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Firebase mein save karein
      const newId = await saveQuotationToFirebase(newQuotation);
      
      const updatedQuotations = [{ id: newId, ...newQuotation }, ...quotations];
      setQuotations(updatedQuotations);
      alert(`Quotation duplicated successfully! New number: ${newQuotation.quotationNumber}`);
    } catch (error) {
      console.error('Error duplicating quotation:', error);
      alert('Error duplicating quotation');
    }
  };

  const handleConvertToInvoice = async (quotation: Quotation) => {
    try {
      // Firebase mein update karein
      await updateQuotationInFirebase(quotation.id, { 
        status: 'converted',
        updatedAt: new Date().toISOString()
      });
      
      const updatedQuotations = quotations.map(q => 
        q.id === quotation.id ? { ...q, status: 'converted' as QuotationStatus, updatedAt: new Date().toISOString() } : q
      );
      setQuotations(updatedQuotations);
      alert(`Quotation ${quotation.quotationNumber} converted to invoice successfully!`);
    } catch (error) {
      console.error('Error converting quotation to invoice:', error);
      alert('Error converting quotation to invoice');
    }
  };

  // DELETE FUNCTION - FIXED
  const handleDeleteQuotation = async (quotation: Quotation) => {
    if (!confirm(`Are you sure you want to delete quotation ${quotation.quotationNumber}? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(quotation.id);
    
    try {
      console.log('Starting deletion process for:', quotation.id);
      
      // Firebase se delete karein
      await deleteQuotationFromFirebase(quotation.id);
      
      // Local state update karein
      const updatedQuotations = quotations.filter(q => q.id !== quotation.id);
      setQuotations(updatedQuotations);
      
      console.log('Quotation deleted successfully from both frontend and backend');
      alert(`Quotation ${quotation.quotationNumber} deleted successfully!`);
      
    } catch (error: any) {
      console.error('Error deleting quotation:', error);
      
      // Detailed error message
      let errorMessage = 'Error deleting quotation';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSendQuotation = async (quotation: Quotation) => {
    try {
      // Firebase mein update karein
      await updateQuotationInFirebase(quotation.id, { 
        status: 'sent',
        updatedAt: new Date().toISOString()
      });
      
      const updatedQuotations = quotations.map(q => 
        q.id === quotation.id ? { ...q, status: 'sent' as QuotationStatus, updatedAt: new Date().toISOString() } : q
      );
      setQuotations(updatedQuotations);
      alert(`Quotation ${quotation.quotationNumber} sent successfully!`);
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert('Error sending quotation');
    }
  };

  const handleExportQuotations = () => {
    const csvContent = [
      ['Quotation Number', 'Customer', 'Status', 'Issue Date', 'Valid Until', 'Total Amount'],
      ...filteredQuotations.map(q => [
        q.quotationNumber,
        q.customerCompany,
        q.status,
        new Date(q.issueDate).toLocaleDateString(),
        new Date(q.validUntil).toLocaleDateString(),
        `$${q.totalAmount.toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEditQuotation = (quotation: Quotation) => {
    router.push(`/admin/sales/quotations/edit/${quotation.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Sales Management</h1>
            <p className="text-red-100 mt-1 text-lg">Comprehensive quotation and proposal management</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={handleExportQuotations}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/sales/quotations/new">
              <Button className="bg-white text-red-600 hover:bg-red-50">
                <Plus className="h-5 w-5 mr-2" />
                New Quotation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats - Real-time */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quotationStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
                <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                  <IconComponent className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm mt-1">
                  <span className="text-green-600 font-semibold">{stat.change}</span>
                  <span className="text-gray-500"> this quarter</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search quotations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.slice(0, 10).map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.companyName || customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCustomerFilter('all');
                setDateFilter('all');
                setCurrentPage(1);
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Quotations</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                {filteredQuotations.length} of {quotations.length} quotations
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {quotations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quotations Found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first quotation.</p>
              <Link href="/admin/sales/quotations/new">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Quotation
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quotation #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedQuotations.map((quotation, index) => {
                      const statusBadge = getStatusBadge(quotation.status);
                      // Unique key ke liye quotation.id + index use karein
                      const uniqueKey = `${quotation.id}-${index}`;
                      
                      return (
                        <TableRow key={uniqueKey} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-bold text-gray-900">{quotation.quotationNumber}</div>
                              <div className="text-xs text-gray-500">by {quotation.createdBy || 'Admin'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{quotation.customerName}</div>
                              <div className="text-sm text-gray-500">{quotation.customerCompany}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant} className={`bg-${statusBadge.color}-100 text-${statusBadge.color}-800`}>
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(quotation.issueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(quotation.validUntil).toLocaleDateString()}</TableCell>
                          <TableCell>{quotation.items.length} items</TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            ${quotation.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewQuotation(quotation)}
                                className="h-8 w-8 p-0"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {/* <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0" 
                                title="Edit"
                                onClick={() => handleEditQuotation(quotation)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button> */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDuplicateQuotation(quotation)}
                                className="h-8 w-8 p-0"
                                title="Duplicate"
                              >
                                <Copy className="h-4 w-4" />
                                </Button>
                              {/* </Button>
                              {quotation.status === 'draft' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSendQuotation(quotation)}
                                  className="h-8 w-8 p-0"
                                  title="Send"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleConvertToInvoice(quotation)}
                                className="h-8 w-8 p-0"
                                disabled={quotation.status !== 'approved'}
                                title="Convert to Invoice"
                              >
                                <FileCheck className="h-4 w-4" />
                              </Button> */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteQuotation(quotation)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                title="Delete"
                                disabled={deleteLoading === quotation.id}
                              >
                                {deleteLoading === quotation.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredQuotations.length)} of {filteredQuotations.length} quotations
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <Button
                            key={`page-${pageNum}`}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Quotation Dialog - FIXED VERSION */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Quotation Details</DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              {selectedQuotation?.quotationNumber} - {selectedQuotation?.customerName}
            </DialogDescription>
          </DialogHeader>

          {selectedQuotation && (
            <div className="space-y-6 bg-white">
              {/* Header Info - FIXED: <p> tags replaced with <div> */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quotation Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">Number:</span>
                      <span className="text-gray-900">{selectedQuotation.quotationNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">Status:</span>
                      <Badge variant={getStatusBadge(selectedQuotation.status).variant} className="ml-2">
                        {getStatusBadge(selectedQuotation.status).label}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">Issue Date:</span>
                      <span className="text-gray-900">{new Date(selectedQuotation.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">Valid Until:</span>
                      <span className="text-gray-900">{new Date(selectedQuotation.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-16">Name:</span>
                      <span className="text-gray-900">{selectedQuotation.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-16">Company:</span>
                      <span className="text-gray-900">{selectedQuotation.customerCompany}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-16">Email:</span>
                      <span className="text-gray-900">{selectedQuotation.customerEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-16">Phone:</span>
                      <span className="text-gray-900">{selectedQuotation.customerPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table - FIXED: Safe totalPrice handling */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Quotation Items</h4>
                <div className="rounded-md border border-gray-300 bg-white shadow-sm">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-900">Item</TableHead>
                        <TableHead className="font-semibold text-gray-900">Description</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900">Qty</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900">Rate</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900">Discount</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900">Tax</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuotation.items.map((item: QuotationItem, index: number) => {
                        // Safe total calculation
                        const itemTotal = item.totalPrice || item.amount || calculateItemTotal(item);
                        
                        return (
                          <TableRow key={`${item.id}-${index}`} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">{item.productName || 'N/A'}</TableCell>
                            <TableCell className="text-gray-700">{item.description || 'N/A'}</TableCell>
                            <TableCell className="text-right text-gray-900">{item.quantity || 0}</TableCell>
                            <TableCell className="text-right text-gray-900">${(item.rate || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-right text-gray-900">{item.discount || 0}%</TableCell>
                            <TableCell className="text-right text-gray-900">{item.tax || 0}%</TableCell>
                            <TableCell className="text-right font-medium text-gray-900">
                              ${itemTotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Subtotal:</span>
                    <span className="font-medium text-gray-900">${(selectedQuotation.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Discount:</span>
                    <span className="font-medium text-red-600">-${(selectedQuotation.totalDiscount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Tax:</span>
                    <span className="font-medium text-gray-900">${(selectedQuotation.totalTax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Service Charges:</span>
                    <span className="font-medium text-gray-900">${(selectedQuotation.serviceCharges || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    Total: ${(selectedQuotation.totalAmount || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedQuotation.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {selectedQuotation.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 bg-white">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-gray-300 hover:bg-gray-50">
                  Close
                </Button>
                <Button variant="outline" onClick={() => handleDuplicateQuotation(selectedQuotation)} className="border-gray-300 hover:bg-gray-50">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button onClick={() => handleEditQuotation(selectedQuotation)} className="bg-red-600 hover:bg-red-700 text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {selectedQuotation.status === 'approved' && (
                  <Button onClick={() => handleConvertToInvoice(selectedQuotation)} className="bg-red-600 hover:bg-red-700 text-white">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Convert to Invoice
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}