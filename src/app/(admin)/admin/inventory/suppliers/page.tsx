'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vendor, VendorStatus, MainCategory, Product } from '@/types';
import { toast } from 'sonner';
import { supplierService, supplierStatsService, dataService } from '@/lib/supplierService';
import { Edit, Trash2, Loader2, Plus, Search, Mail, Phone, X } from 'lucide-react';

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Vendor | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Data states
  const [suppliers, setSuppliers] = useState<Vendor[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierStats, setSupplierStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalCategories: 0,
    averageRating: 0
  });

  // Form states for add/edit supplier
  const [supplierForm, setSupplierForm] = useState({
    companyName: '',
    vendorCode: '',
    taxId: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    designation: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    paymentTerms: '',
    creditDays: 30,
    status: 'active' as VendorStatus,
    productCategories: [] as string[],
    suppliedProducts: [] as string[],
    rating: 4.5,
    onTimeDeliveryRate: 95,
    qualityRating: 4.5
  });

  // New category and product inputs
  const [newCategory, setNewCategory] = useState('');
  const [newProduct, setNewProduct] = useState('');

  // Contact form states
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    contactMethod: 'email' as 'email' | 'phone'
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliersData, stats, categoriesData, productsData] = await Promise.all([
        supplierService.getAllSuppliers(),
        supplierStatsService.getSupplierStats(),
        dataService.getAllMainCategories(),
        dataService.getAllProducts()
      ]);
      setSuppliers(suppliersData);
      setSupplierStats(stats);
      setMainCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSuppliers = () => {
    let filtered = suppliers;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.primaryContact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.primaryContact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredSuppliers = getFilteredSuppliers();

  // Category handlers
  const handleAddCategory = () => {
    if (newCategory.trim() && !supplierForm.productCategories.includes(newCategory.trim())) {
      setSupplierForm({
        ...supplierForm,
        productCategories: [...supplierForm.productCategories, newCategory.trim()]
      });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setSupplierForm({
      ...supplierForm,
      productCategories: supplierForm.productCategories.filter(cat => cat !== categoryToRemove)
    });
  };

  // Product handlers
  const handleAddProduct = () => {
    if (newProduct.trim() && !supplierForm.suppliedProducts.includes(newProduct.trim())) {
      setSupplierForm({
        ...supplierForm,
        suppliedProducts: [...supplierForm.suppliedProducts, newProduct.trim()]
      });
      setNewProduct('');
    }
  };

  const handleRemoveProduct = (productToRemove: string) => {
    setSupplierForm({
      ...supplierForm,
      suppliedProducts: supplierForm.suppliedProducts.filter(product => product !== productToRemove)
    });
  };

  const handleAddSupplier = async () => {
    if (!supplierForm.companyName?.trim() || !supplierForm.vendorCode?.trim() || 
        !supplierForm.contactName?.trim() || !supplierForm.contactEmail?.trim() || 
        !supplierForm.contactPhone?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const newSupplier: Omit<Vendor, 'id'> = {
        companyName: supplierForm.companyName,
        vendorCode: supplierForm.vendorCode,
        taxId: supplierForm.taxId,
        primaryContact: {
          name: supplierForm.contactName,
          email: supplierForm.contactEmail,
          phone: supplierForm.contactPhone,
          designation: supplierForm.designation
        },
        address: {
          street: supplierForm.street,
          city: supplierForm.city,
          state: supplierForm.state,
          country: supplierForm.country,
          zipCode: supplierForm.zipCode
        },
        paymentTerms: supplierForm.paymentTerms,
        creditDays: supplierForm.creditDays,
        rating: supplierForm.rating,
        onTimeDeliveryRate: supplierForm.onTimeDeliveryRate,
        qualityRating: supplierForm.qualityRating,
        productCategories: supplierForm.productCategories,
        suppliedProducts: supplierForm.suppliedProducts,
        status: supplierForm.status,
        isActive: supplierForm.status === 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await supplierService.createSupplier(newSupplier);
      toast.success(`Supplier "${supplierForm.companyName}" added successfully!`);
      
      await loadData();
      setIsAddDialogOpen(false);
      resetSupplierForm();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Failed to add supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSupplier = async () => {
    if (!selectedSupplier) return;

    if (!supplierForm.companyName?.trim() || !supplierForm.vendorCode?.trim() || 
        !supplierForm.contactName?.trim() || !supplierForm.contactEmail?.trim() || 
        !supplierForm.contactPhone?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        companyName: supplierForm.companyName,
        vendorCode: supplierForm.vendorCode,
        taxId: supplierForm.taxId,
        primaryContact: {
          name: supplierForm.contactName,
          email: supplierForm.contactEmail,
          phone: supplierForm.contactPhone,
          designation: supplierForm.designation
        },
        address: {
          street: supplierForm.street,
          city: supplierForm.city,
          state: supplierForm.state,
          country: supplierForm.country,
          zipCode: supplierForm.zipCode
        },
        paymentTerms: supplierForm.paymentTerms,
        creditDays: supplierForm.creditDays,
        rating: supplierForm.rating,
        onTimeDeliveryRate: supplierForm.onTimeDeliveryRate,
        qualityRating: supplierForm.qualityRating,
        productCategories: supplierForm.productCategories,
        suppliedProducts: supplierForm.suppliedProducts,
        status: supplierForm.status,
        isActive: supplierForm.status === 'active'
      };
      
      await supplierService.updateSupplier(selectedSupplier.id, updateData);
      toast.success(`Supplier "${supplierForm.companyName}" updated successfully!`);
      
      await loadData();
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      resetSupplierForm();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error('Failed to update supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;

    try {
      setDeleting(selectedSupplier.id);
      await supplierService.deleteSupplier(selectedSupplier.id);
      toast.success(`Supplier "${selectedSupplier.companyName}" deleted successfully!`);
      await loadData();
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Failed to delete supplier');
    } finally {
      setDeleting(null);
    }
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      companyName: '',
      vendorCode: '',
      taxId: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      designation: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      paymentTerms: '',
      creditDays: 30,
      status: 'active',
      productCategories: [],
      suppliedProducts: [],
      rating: 4.5,
      onTimeDeliveryRate: 95,
      qualityRating: 4.5
    });
    setNewCategory('');
    setNewProduct('');
  };

  const handleEditClick = (supplier: Vendor) => {
    setSelectedSupplier(supplier);
    setSupplierForm({
      companyName: supplier.companyName,
      vendorCode: supplier.vendorCode,
      taxId: supplier.taxId || '',
      contactName: supplier.primaryContact.name,
      contactEmail: supplier.primaryContact.email,
      contactPhone: supplier.primaryContact.phone,
      designation: supplier.primaryContact.designation || '',
      street: supplier.address.street,
      city: supplier.address.city,
      state: supplier.address.state,
      country: supplier.address.country,
      zipCode: supplier.address.zipCode,
      paymentTerms: supplier.paymentTerms,
      creditDays: supplier.creditDays,
      status: supplier.status,
      productCategories: supplier.productCategories || [],
      suppliedProducts: supplier.suppliedProducts || [],
      rating: supplier.rating,
      onTimeDeliveryRate: supplier.onTimeDeliveryRate,
      qualityRating: supplier.qualityRating
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (supplier: Vendor) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleContactSupplier = (supplier: Vendor) => {
    console.log('Contacting supplier:', supplier.companyName, contactForm);
    toast.success(`Contact message sent to ${supplier.companyName}`);
    setIsContactDialogOpen(false);
    setContactForm({ subject: '', message: '', contactMethod: 'email' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'blacklisted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get product name by ID
  const getProductNameById = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : productId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600" />
          <p className="mt-2 text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your supplier relationships</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{supplierStats.totalSuppliers}</div>
            <p className="text-sm text-gray-500 mt-1">Registered vendors</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{supplierStats.activeSuppliers}</div>
            <p className="text-sm text-gray-500 mt-1">Currently supplying</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{supplierStats.totalCategories}</div>
            <p className="text-sm text-gray-500 mt-1">Categories supplied</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{supplierStats.averageRating.toFixed(1)} ★</div>
            <p className="text-sm text-gray-500 mt-1">Supplier quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search suppliers by name, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-gray-300 pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                className={filterStatus === 'active' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
                className={filterStatus === 'inactive' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{supplier.companyName}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{supplier.primaryContact.name}</p>
                  <p className="text-xs text-gray-500">{supplier.vendorCode}</p>
                </div>
                <Badge className={getStatusBadge(supplier.status)}>
                  {supplier.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {supplier.primaryContact.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {supplier.primaryContact.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {supplier.address.city}, {supplier.address.state}
                </div>

                <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{supplier.productCategories?.length || 0}</div>
                    <div className="text-xs text-gray-500">Categories</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{supplier.onTimeDeliveryRate}%</div>
                    <div className="text-xs text-gray-500">On-Time</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">{supplier.rating} ★</div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setIsViewDialogOpen(true);
                    }}
                    className="flex-1 bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                  >
                    View Details
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(supplier)}
                    className="bg-white border-gray-300 hover:bg-green-50 hover:border-green-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(supplier)}
                    className="bg-white border-gray-300 hover:bg-red-50 hover:border-red-300 text-red-600"
                    disabled={deleting === supplier.id}
                  >
                    {deleting === supplier.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact Details</TabsTrigger>
                <TabsTrigger value="business">Business Info</TabsTrigger>
                <TabsTrigger value="products">Products & Categories</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="Enter company name"
                      value={supplierForm.companyName}
                      onChange={(e) => setSupplierForm({...supplierForm, companyName: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendorCode">Vendor Code *</Label>
                    <Input
                      id="vendorCode"
                      placeholder="Enter vendor code"
                      value={supplierForm.vendorCode}
                      onChange={(e) => setSupplierForm({...supplierForm, vendorCode: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    placeholder="Enter tax ID"
                    value={supplierForm.taxId}
                    onChange={(e) => setSupplierForm({...supplierForm, taxId: e.target.value})}
                    className="bg-white border-gray-300"
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="Enter contact name"
                      value={supplierForm.contactName}
                      onChange={(e) => setSupplierForm({...supplierForm, contactName: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      placeholder="Enter designation"
                      value={supplierForm.designation}
                      onChange={(e) => setSupplierForm({...supplierForm, designation: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="Enter email address"
                      value={supplierForm.contactEmail}
                      onChange={(e) => setSupplierForm({...supplierForm, contactEmail: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="Enter phone number"
                      value={supplierForm.contactPhone}
                      onChange={(e) => setSupplierForm({...supplierForm, contactPhone: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="business" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      placeholder="Enter street address"
                      value={supplierForm.street}
                      onChange={(e) => setSupplierForm({...supplierForm, street: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={supplierForm.city}
                      onChange={(e) => setSupplierForm({...supplierForm, city: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      value={supplierForm.state}
                      onChange={(e) => setSupplierForm({...supplierForm, state: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="Enter ZIP code"
                      value={supplierForm.zipCode}
                      onChange={(e) => setSupplierForm({...supplierForm, zipCode: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Enter country"
                      value={supplierForm.country}
                      onChange={(e) => setSupplierForm({...supplierForm, country: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select value={supplierForm.paymentTerms} onValueChange={(value) => setSupplierForm({...supplierForm, paymentTerms: value})}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="creditDays">Credit Days</Label>
                    <Input
                      id="creditDays"
                      type="number"
                      placeholder="Enter credit days"
                      value={supplierForm.creditDays}
                      onChange={(e) => setSupplierForm({...supplierForm, creditDays: parseInt(e.target.value) || 30})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={supplierForm.status} onValueChange={(value: VendorStatus) => setSupplierForm({...supplierForm, status: value})}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blacklisted">Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* NEW: Products & Categories Tab */}
              <TabsContent value="products" className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="4.5"
                      value={supplierForm.rating}
                      onChange={(e) => setSupplierForm({...supplierForm, rating: parseFloat(e.target.value) || 4.5})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="onTimeDeliveryRate">On-Time Delivery Rate (%)</Label>
                    <Input
                      id="onTimeDeliveryRate"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="95"
                      value={supplierForm.onTimeDeliveryRate}
                      onChange={(e) => setSupplierForm({...supplierForm, onTimeDeliveryRate: parseFloat(e.target.value) || 95})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualityRating">Quality Rating (1-5)</Label>
                    <Input
                      id="qualityRating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="4.5"
                      value={supplierForm.qualityRating}
                      onChange={(e) => setSupplierForm({...supplierForm, qualityRating: parseFloat(e.target.value) || 4.5})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>

                {/* Product Categories Section */}
                <div className="space-y-3">
                  <Label>Product Categories</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {supplierForm.productCategories.map((category) => (
                      <Badge key={category} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                        {category}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(category)}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select product category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 max-h-60">
                        {mainCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCategory}
                      className="bg-white border-gray-300 hover:bg-gray-50"
                    >
                      Add Category
                    </Button>
                  </div>
                </div>

                {/* Supplied Products Section */}
                <div className="space-y-3">
                  <Label>Supplied Products</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {supplierForm.suppliedProducts.map((productId) => (
                      <Badge key={productId} className="bg-green-100 text-green-800 flex items-center gap-1">
                        {getProductNameById(productId)}
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(productId)}
                          className="hover:text-green-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={newProduct} onValueChange={setNewProduct}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 max-h-60">
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.sku}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddProduct}
                      className="bg-white border-gray-300 hover:bg-gray-50"
                    >
                      Add Product
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Select product categories and specific products that this supplier provides. 
                    This helps in better supplier management and product sourcing.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="bg-white border-gray-300 hover:bg-gray-50">
                Cancel
              </Button>
              <Button onClick={handleAddSupplier} className="bg-red-600 hover:bg-red-700 text-white" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Supplier'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog - Same structure as Add Dialog but with handleEditSupplier */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact Details</TabsTrigger>
                <TabsTrigger value="business">Business Info</TabsTrigger>
                <TabsTrigger value="products">Products & Categories</TabsTrigger>
              </TabsList>

              {/* Same content as Add Dialog but with edit handlers */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-companyName">Company Name *</Label>
                    <Input
                      id="edit-companyName"
                      placeholder="Enter company name"
                      value={supplierForm.companyName}
                      onChange={(e) => setSupplierForm({...supplierForm, companyName: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-vendorCode">Vendor Code *</Label>
                    <Input
                      id="edit-vendorCode"
                      placeholder="Enter vendor code"
                      value={supplierForm.vendorCode}
                      onChange={(e) => setSupplierForm({...supplierForm, vendorCode: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-taxId">Tax ID</Label>
                  <Input
                    id="edit-taxId"
                    placeholder="Enter tax ID"
                    value={supplierForm.taxId}
                    onChange={(e) => setSupplierForm({...supplierForm, taxId: e.target.value})}
                    className="bg-white border-gray-300"
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-contactName">Contact Name *</Label>
                    <Input
                      id="edit-contactName"
                      placeholder="Enter contact name"
                      value={supplierForm.contactName}
                      onChange={(e) => setSupplierForm({...supplierForm, contactName: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-designation">Designation</Label>
                    <Input
                      id="edit-designation"
                      placeholder="Enter designation"
                      value={supplierForm.designation}
                      onChange={(e) => setSupplierForm({...supplierForm, designation: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-contactEmail">Email *</Label>
                    <Input
                      id="edit-contactEmail"
                      type="email"
                      placeholder="Enter email address"
                      value={supplierForm.contactEmail}
                      onChange={(e) => setSupplierForm({...supplierForm, contactEmail: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-contactPhone">Phone *</Label>
                    <Input
                      id="edit-contactPhone"
                      placeholder="Enter phone number"
                      value={supplierForm.contactPhone}
                      onChange={(e) => setSupplierForm({...supplierForm, contactPhone: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="business" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-street">Street Address *</Label>
                    <Input
                      id="edit-street"
                      placeholder="Enter street address"
                      value={supplierForm.street}
                      onChange={(e) => setSupplierForm({...supplierForm, street: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-city">City *</Label>
                    <Input
                      id="edit-city"
                      placeholder="Enter city"
                      value={supplierForm.city}
                      onChange={(e) => setSupplierForm({...supplierForm, city: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-state">State</Label>
                    <Input
                      id="edit-state"
                      placeholder="Enter state"
                      value={supplierForm.state}
                      onChange={(e) => setSupplierForm({...supplierForm, state: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-zipCode">ZIP Code</Label>
                    <Input
                      id="edit-zipCode"
                      placeholder="Enter ZIP code"
                      value={supplierForm.zipCode}
                      onChange={(e) => setSupplierForm({...supplierForm, zipCode: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-country">Country</Label>
                    <Input
                      id="edit-country"
                      placeholder="Enter country"
                      value={supplierForm.country}
                      onChange={(e) => setSupplierForm({...supplierForm, country: e.target.value})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-paymentTerms">Payment Terms</Label>
                    <Select value={supplierForm.paymentTerms} onValueChange={(value) => setSupplierForm({...supplierForm, paymentTerms: value})}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-creditDays">Credit Days</Label>
                    <Input
                      id="edit-creditDays"
                      type="number"
                      placeholder="Enter credit days"
                      value={supplierForm.creditDays}
                      onChange={(e) => setSupplierForm({...supplierForm, creditDays: parseInt(e.target.value) || 30})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={supplierForm.status} onValueChange={(value: VendorStatus) => setSupplierForm({...supplierForm, status: value})}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blacklisted">Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Products & Categories Tab for Edit */}
              <TabsContent value="products" className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-rating">Rating (1-5)</Label>
                    <Input
                      id="edit-rating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="4.5"
                      value={supplierForm.rating}
                      onChange={(e) => setSupplierForm({...supplierForm, rating: parseFloat(e.target.value) || 4.5})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-onTimeDeliveryRate">On-Time Delivery Rate (%)</Label>
                    <Input
                      id="edit-onTimeDeliveryRate"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="95"
                      value={supplierForm.onTimeDeliveryRate}
                      onChange={(e) => setSupplierForm({...supplierForm, onTimeDeliveryRate: parseFloat(e.target.value) || 95})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-qualityRating">Quality Rating (1-5)</Label>
                    <Input
                      id="edit-qualityRating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="4.5"
                      value={supplierForm.qualityRating}
                      onChange={(e) => setSupplierForm({...supplierForm, qualityRating: parseFloat(e.target.value) || 4.5})}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>

                {/* Product Categories Section */}
                <div className="space-y-3">
                  <Label>Product Categories</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {supplierForm.productCategories.map((category) => (
                      <Badge key={category} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                        {category}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(category)}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select product category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 max-h-60">
                        {mainCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCategory}
                      className="bg-white border-gray-300 hover:bg-gray-50"
                    >
                      Add Category
                    </Button>
                  </div>
                </div>

                {/* Supplied Products Section */}
                <div className="space-y-3">
                  <Label>Supplied Products</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {supplierForm.suppliedProducts.map((productId) => (
                      <Badge key={productId} className="bg-green-100 text-green-800 flex items-center gap-1">
                        {getProductNameById(productId)}
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(productId)}
                          className="hover:text-green-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={newProduct} onValueChange={setNewProduct}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 max-h-60">
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.sku}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddProduct}
                      className="bg-white border-gray-300 hover:bg-gray-50"
                    >
                      Add Product
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-white border-gray-300 hover:bg-gray-50">
                Cancel
              </Button>
              <Button onClick={handleEditSupplier} className="bg-red-600 hover:bg-red-700 text-white" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Delete Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete "{selectedSupplier?.companyName}"? This action cannot be undone.
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Deleting this supplier will remove all associated records.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-white border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSupplier}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting === selectedSupplier?.id}
            >
              {deleting === selectedSupplier?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Supplier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Supplier Details - {selectedSupplier?.companyName}
            </DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Company Name</Label>
                      <p className="text-sm text-gray-900">{selectedSupplier.companyName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Vendor Code</Label>
                      <p className="text-sm text-gray-900">{selectedSupplier.vendorCode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <Badge className={getStatusBadge(selectedSupplier.status)}>{selectedSupplier.status}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Payment Terms</Label>
                      <p className="text-sm text-gray-900">{selectedSupplier.paymentTerms}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Tax ID</Label>
                      <p className="text-sm text-gray-900">{selectedSupplier.taxId || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Credit Days</Label>
                      <p className="text-sm text-gray-900">{selectedSupplier.creditDays} days</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Contact Person</Label>
                      <p className="text-sm text-gray-900">{selectedSupplier.primaryContact.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Designation</Label>
                      <p className="text-sm text-gray-900">{selectedSupplier.primaryContact.designation || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-sm text-gray-900">{selectedSupplier.primaryContact.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <p className="text-sm text-gray-900">{selectedSupplier.primaryContact.phone}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Address</Label>
                    <p className="text-sm text-gray-900">
                      {selectedSupplier.address.street}, {selectedSupplier.address.city}, {selectedSupplier.address.state} {selectedSupplier.address.zipCode}, {selectedSupplier.address.country}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-white border border-gray-200">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{selectedSupplier.rating}</div>
                          <div className="text-sm text-gray-500">Overall Rating</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border border-gray-200">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{selectedSupplier.onTimeDeliveryRate}%</div>
                          <div className="text-sm text-gray-500">On-Time Delivery</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border border-gray-200">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedSupplier.qualityRating}</div>
                          <div className="text-sm text-gray-500">Quality Rating</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Product Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSupplier.productCategories?.map((category) => (
                        <Badge key={category} className="bg-blue-100 text-blue-800">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Supplied Products</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSupplier.suppliedProducts?.map((productId) => (
                        <Badge key={productId} className="bg-green-100 text-green-800">
                          {getProductNameById(productId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}