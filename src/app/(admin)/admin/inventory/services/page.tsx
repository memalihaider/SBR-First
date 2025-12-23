'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Briefcase,
  Search,
  Eye,
  Edit,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Service, ServiceStatus } from '@/types';
import { toast } from 'sonner';
import { serviceService } from '@/lib/serviceService';

type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'PKR';

export default function AdminServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ✅ NEW: Currency state
  const [currency, setCurrency] = useState<Currency>('USD');
  
  // ✅ NEW: Price filter states
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | 'none'>('none');

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    availability: 'available',
    status: 'active',
  });

  const itemsPerPage = 10;

  // ✅ NEW: Currency conversion rates
  const currencyRates: Record<Currency, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.0,
    AED: 3.67,
    PKR: 280.0
  };

  const currencySymbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AED: 'د.إ',
    PKR: '₨'
  };

  // ✅ UPDATED: Format currency function with conversion
  const formatCurrency = (amount: number | undefined | null, convert: boolean = true) => {
    if (!amount && amount !== 0) return `${currencySymbols[currency]}0`;
    
    let convertedAmount = amount;
    if (convert && currency !== 'USD') {
      convertedAmount = amount * currencyRates[currency];
    }
    
    // Format based on currency
    switch (currency) {
      case 'INR':
        return `${currencySymbols[currency]}${convertedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
      case 'PKR':
        return `${currencySymbols[currency]}${convertedAmount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
      default:
        return `${currencySymbols[currency]}${convertedAmount.toFixed(2)}`;
    }
  };

  // ✅ NEW: Get original price (for calculations)
  const getOriginalPrice = (convertedPrice: number) => {
    return convertedPrice / currencyRates[currency];
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const servicesData = await serviceService.getAllServices();
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Filter services with price filtering
  const filteredServices = useMemo(() => {
    if (!services || services.length === 0) return [];
    
    let filtered = services.filter(service => {
      if (!service) return false;
      
      // Search filter
      const nameMatch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const descMatch = service.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
      // Price filter (converted to current currency for comparison)
      const convertedPrice = (service.price || 0) * currencyRates[currency];
      const minPriceFilter = minPrice !== '' ? convertedPrice >= minPrice : true;
      const maxPriceFilter = maxPrice !== '' ? convertedPrice <= maxPrice : true;
      
      return (nameMatch || descMatch) && minPriceFilter && maxPriceFilter;
    });

    // Price sorting
    if (priceSort !== 'none') {
      filtered.sort((a, b) => {
        const priceA = (a.price || 0) * currencyRates[currency];
        const priceB = (b.price || 0) * currencyRates[currency];
        
        return priceSort === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    return filtered;
  }, [searchTerm, services, minPrice, maxPrice, priceSort, currency]);

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ UPDATED: Stats for services with currency conversion
  const stats = useMemo(() => {
    if (!services || services.length === 0) {
      return {
        totalServices: 0,
        activeServices: 0,
        availableServices: 0,
        totalValue: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0
      };
    }

    const validServices = services.filter(s => s?.price !== undefined);
    const totalValue = validServices.reduce((sum, service) => sum + (service.price || 0), 0);
    const convertedTotalValue = totalValue * currencyRates[currency];
    
    const prices = validServices.map(s => (s.price || 0) * currencyRates[currency]);
    const minPriceValue = Math.min(...prices);
    const maxPriceValue = Math.max(...prices);
    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    return {
      totalServices: services.length,
      activeServices: services.filter(s => s?.status === 'active').length,
      availableServices: services.filter(s => s?.availability === 'available').length,
      totalValue: convertedTotalValue,
      averagePrice,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue
    };
  }, [services, currency]);

  const getStatusBadge = (status: ServiceStatus | undefined) => {
    if (!status || status === 'active') {
      return { variant: 'default' as const, label: 'ACTIVE', color: 'green' };
    }
    return { variant: 'secondary' as const, label: 'INACTIVE', color: 'gray' };
  };

  const getAvailabilityBadge = (availability: Service['availability'] | undefined) => {
    switch (availability) {
      case 'available':
        return { label: 'Available', color: 'green' };
      case 'limited':
        return { label: 'Limited', color: 'yellow' };
      case 'not_available':
        return { label: 'Not Available', color: 'red' };
      default:
        return { label: 'Unknown', color: 'gray' };
    }
  };

  // ✅ NEW: Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setPriceSort('none');
    setCurrentPage(1);
  };

  // View/Edit/Delete handlers
  const handleViewService = (service: Service) => {
    setSelectedService(service);
    setIsViewDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || 0,
      availability: service.availability || 'available',
      status: service.status || 'active',
    });
    setIsEditDialogOpen(true);
  };

  const handleAddService = () => {
    setServiceForm({
      name: '',
      description: '',
      price: 0,
      availability: 'available',
      status: 'active',
    });
    setIsAddDialogOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveService = async () => {
    const serviceName = serviceForm.name?.trim();
    const servicePrice = serviceForm.price || 0;
    
    if (!serviceName) {
      toast.error('Please enter service name');
      return;
    }

    if (servicePrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setSaving(true);
      
      const serviceData = {
        name: serviceName,
        description: serviceForm.description || '',
        price: servicePrice,
        availability: serviceForm.availability || 'available',
        status: serviceForm.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (isAddDialogOpen) {
        await serviceService.createService(serviceData);
        toast.success(`Service "${serviceName}" added successfully!`);
      } else if (isEditDialogOpen && selectedService?.id) {
        await serviceService.updateService(selectedService.id, serviceData);
        toast.success(`Service "${serviceName}" updated successfully!`);
      }
      
      await loadData();
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setServiceForm({});
      setSelectedService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedService?.id) return;

    try {
      setDeleting(selectedService.id);
      await serviceService.deleteService(selectedService.id);
      toast.success(`Service "${selectedService.name}" deleted successfully!`);
      await loadData();
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Service Management</h1>
            <p className="text-blue-100 mt-1 text-lg">Manage your services with price filters and currency selection</p>
          </div>
          <Button className="bg-white text-blue-600 hover:bg-blue-50" onClick={handleAddService}>
            <Plus className="h-5 w-5 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Services</p>
                <p className="text-2xl font-bold mt-2">{stats.totalServices}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Services</p>
                <p className="text-2xl font-bold mt-2">{stats.activeServices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Price</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(stats.averagePrice)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Min: {formatCurrency(stats.minPrice)} | Max: {formatCurrency(stats.maxPrice)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">In {currency}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            <div className="flex items-center space-x-3">
              {/* ✅ NEW: Currency Selector */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="currency" className="text-sm font-medium">Currency:</Label>
                <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="AED">AED (د.إ)</SelectItem>
                    <SelectItem value="PKR">PKR (₨)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Services</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* ✅ NEW: Min Price Filter */}
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price ({currency})</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : '')}
                min="0"
                step="0.01"
              />
            </div>

            {/* ✅ NEW: Max Price Filter */}
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price ({currency})</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : '')}
                min="0"
                step="0.01"
              />
            </div>

            {/* ✅ NEW: Price Sort */}
            <div className="space-y-2">
              <Label htmlFor="priceSort">Sort by Price</Label>
              <Select value={priceSort} onValueChange={(value: 'asc' | 'desc' | 'none') => setPriceSort(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No sorting</SelectItem>
                  <SelectItem value="asc">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Low to High
                    </div>
                  </SelectItem>
                  <SelectItem value="desc">
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      High to Low
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ✅ NEW: Active filters display */}
          {(minPrice !== '' || maxPrice !== '' || priceSort !== 'none') && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                  {minPrice !== '' && (
                    <Badge variant="outline" className="bg-white">
                      Min: {formatCurrency(minPrice, false)}
                    </Badge>
                  )}
                  {maxPrice !== '' && (
                    <Badge variant="outline" className="bg-white">
                      Max: {formatCurrency(maxPrice, false)}
                    </Badge>
                  )}
                  {priceSort === 'asc' && (
                    <Badge variant="outline" className="bg-white">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Price: Low to High
                    </Badge>
                  )}
                  {priceSort === 'desc' && (
                    <Badge variant="outline" className="bg-white">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Price: High to Low
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white">
                    Currency: {currency}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-800">
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Services</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                {filteredServices.length} services found • Currency: {currency}
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-gray-300 bg-white shadow-sm">
            {paginatedServices.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No services found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                <Button className="mt-4" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-900">Service Name</TableHead>
                      <TableHead className="font-semibold text-gray-900">Description</TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        <div className="flex items-center">
                          Price ({currency})
                          {priceSort === 'asc' && <TrendingUp className="h-3 w-3 ml-1 text-green-600" />}
                          {priceSort === 'desc' && <TrendingDown className="h-3 w-3 ml-1 text-red-600" />}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">Availability</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedServices.map((service) => {
                      if (!service) return null;
                      
                      const statusBadge = getStatusBadge(service.status);
                      const availabilityBadge = getAvailabilityBadge(service.availability);
                      const convertedPrice = (service.price || 0) * currencyRates[currency];
                      
                      return (
                        <TableRow key={service.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="font-medium text-gray-900">{service.name || 'Unnamed Service'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {service.description || 'No description'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-green-600">
                                {formatCurrency(convertedPrice, false)}
                              </span>
                              {currency !== 'USD' && (
                                <span className="text-xs text-gray-500">
                                  ${(service.price || 0).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`text-xs ${
                                availabilityBadge.color === 'green' ? 'bg-green-100 text-green-800' :
                                availabilityBadge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {availabilityBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={statusBadge.variant}
                              className={`text-xs ${
                                statusBadge.color === 'green' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewService(service)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditService(service)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteService(service)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deleting === service.id}
                              >
                                {deleting === service.id ? (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 px-4 pb-4">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} services
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
                      <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
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
          </div>
        </CardContent>
      </Card>

      {/* View Service Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedService?.name || 'Service Details'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Service Details • Currency: {currency}
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                  {selectedService.description || 'No description'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Price</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency((selectedService.price) * currencyRates[currency], false)}
                  </p>
                  {currency !== 'USD' && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${(selectedService.price ).toFixed(2)} USD
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Availability</h4>
                  <Badge className={
                    selectedService.availability === 'available' ? 'bg-green-100 text-green-800' :
                    selectedService.availability === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {selectedService.availability === 'available' ? 'Available' :
                     selectedService.availability === 'limited' ? 'Limited' : 'Not Available'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsViewDialogOpen(false); handleEditService(selectedService); }}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Service
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setServiceForm({});
        }
      }}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {isAddDialogOpen ? 'Add New Service' : 'Edit Service'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isEditDialogOpen ? `Editing ${selectedService?.name}` : 'Enter service details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={serviceForm.name || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="Enter service name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={serviceForm.description || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Enter service description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="price"
                  type="number"
                  value={serviceForm.price }
                  onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value)  })}
                  placeholder="Enter price in USD"
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
              {currency !== 'USD' && (
                <p className="text-sm text-gray-500 mt-1">
                  ≈ {formatCurrency(serviceForm.price || 0)} in {currency}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <select
                  id="availability"
                  value={serviceForm.availability || 'available'}
                  onChange={(e) => setServiceForm({ ...serviceForm, availability: e.target.value as Service['availability'] })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={serviceForm.status || 'active'}
                  onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value as ServiceStatus })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveService} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isAddDialogOpen ? 'Adding...' : 'Saving...'}
                </>
              ) : (
                <>
                  {isAddDialogOpen ? 'Add Service' : 'Save Changes'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              Delete Service
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete "{selectedService?.name}"?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting === selectedService?.id}
            >
              {deleting === selectedService?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Service
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}