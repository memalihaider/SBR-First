'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Package,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2,
  Tag,
  TrendingUp,
  Briefcase,
  Minus,
  PlusCircle,
  Trash,
  CheckSquare
} from 'lucide-react';
import { Product, ProductCategory, ProductStatus, MainCategory, SubCategory, Service, ProductService } from '@/types';
import { toast } from 'sonner';
import { productService, productStatsService } from '@/lib/productService';
import { mainCategoryService, subCategoryService } from '@/lib/categoryService';
import { serviceService } from '@/lib/serviceService';

export default function AdminInventoryProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mainCategoryFilter, setMainCategoryFilter] = useState('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');

  // ✅ NEW: Services state
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<ProductService[]>([]);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
    totalInventoryValue: 0
  });

  // Form state for add/edit product
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    productType: '',
    sku: '',
    description: '',
    orderSpecification: '',
    mainCategoryId: '',
    subCategoryId: '',
    category: '' as ProductCategory,
    manufacturer: '',
    modelNumber: '',
    supplierName: '',
    costPrice: 0,
    sellingPrice: 0,
    marginPercentage: 0,
    shippingCharges: 0,
    currentStock: 0,
    minStockLevel: 10,
    maxStockLevel: 1000,
    reorderPoint: 20,
    status: 'active' as ProductStatus,
    services: [],
    images: []
  });

  const itemsPerPage = 15;

  // Currency conversion rates (example rates)
  const currencyRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    INR: 83.0,
    JPY: 110.0,
    CAD: 1.25,
    AUD: 1.35,
    CNY: 6.45,
    AED: 3.67 // UAE Dirham
  };

  // Currency symbols
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '¥',
    AED: 'AED' // Arabic Dirham symbol
  };

  // Format currency function
  const formatCurrency = (amount: number) => {
    const convertedAmount = amount * currencyRates[currency as keyof typeof currencyRates];
    const symbol = currencySymbols[currency as keyof typeof currencySymbols];
    
    if (currency === 'INR') {
      return `${symbol}${convertedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    }
    
    if (currency === 'AED') {
      return `${symbol}${convertedAmount.toFixed(2)}`;
    }
    
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };

  // Format large currency values
  const formatLargeCurrency = (amount: number) => {
    const convertedAmount = amount * currencyRates[currency as keyof typeof currencyRates];
    const symbol = currencySymbols[currency as keyof typeof currencySymbols];
    
    if (convertedAmount >= 1000000) {
      return `${symbol}${(convertedAmount / 1000000).toFixed(1)}M`;
    } else if (convertedAmount >= 1000) {
      return `${symbol}${(convertedAmount / 1000).toFixed(1)}K`;
    }
    
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };

  // ✅ NEW: Calculate total with services
  // ✅ FIXED: Don't add service prices to product price - services are only for linking
  const calculateTotalWithServices = (product: Product) => {
    // Product total = selling price + shipping (services are separate and linked only)
    return product.sellingPrice + (product.shippingCharges || 0);
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, mainCats, subCats, stats, servicesData] = await Promise.all([
        productService.getAllProducts(),
        mainCategoryService.getAllMainCategories(),
        subCategoryService.getAllSubCategories(),
        productStatsService.getProductStats(),
        serviceService.getAllServices() // ✅ NEW: Load services
      ]);
      setProducts(productsData);
      setMainCategories(mainCats);
      setSubCategories(subCats);
      setProductStats(stats);
      setServices(servicesData); // ✅ NEW: Set services
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getMainCategoryById = (id: string) => {
    return mainCategories.find(cat => cat.id === id);
  };

  const getSubCategoryById = (id: string) => {
    return subCategories.find(sub => sub.id === id);
  };

  const getSubCategoriesByMainCategory = (mainCategoryId: string) => {
    return subCategories.filter(sub => sub.mainCategoryId === mainCategoryId);
  };

  // ✅ NEW: Get service by ID
  const getServiceById = (id: string) => {
    return services.find(service => service.id === id);
  };

  // Calculate total cost price and selling price
  const calculateTotalPrices = useMemo(() => {
    let totalCostPrice = 0;
    let totalSellingPrice = 0;

    products.forEach(product => {
      totalCostPrice += product.costPrice * product.currentStock;
      totalSellingPrice += calculateTotalWithServices(product) * product.currentStock;
    });

    return {
      totalCostPrice,
      totalSellingPrice,
      totalProfit: totalSellingPrice - totalCostPrice,
      profitMargin: totalCostPrice > 0 ? ((totalSellingPrice - totalCostPrice) / totalCostPrice) * 100 : 0
    };
  }, [products]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.productType && product.productType.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMainCategory = mainCategoryFilter === 'all' || product.mainCategoryId === mainCategoryFilter;
      const matchesSubCategory = subCategoryFilter === 'all' || product.subCategoryId === subCategoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

      let matchesStock = true;
      if (stockFilter !== 'all') {
        switch (stockFilter) {
          case 'in_stock':
            matchesStock = product.currentStock > 0;
            break;
          case 'low_stock':
            matchesStock = product.currentStock > 0 && product.currentStock <= product.minStockLevel;
            break;
          case 'out_of_stock':
            matchesStock = product.currentStock === 0;
            break;
          case 'overstock':
            matchesStock = product.currentStock > product.maxStockLevel;
            break;
        }
      }

      return matchesSearch && matchesMainCategory && matchesSubCategory && matchesStatus && matchesStock;
    });
  }, [searchTerm, mainCategoryFilter, subCategoryFilter, statusFilter, stockFilter, products]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Updated stats with Cost Price and Selling Price
  const stats = [
    { 
      title: 'Total Products', 
      value: productStats.totalProducts.toString(), 
      change: '+42', 
      icon: Package, 
      color: 'blue' 
    },
    { 
      title: 'Low Stock Items', 
      value: productStats.lowStockItems.toString(), 
      change: '+8', 
      icon: AlertTriangle, 
      color: 'red' 
    },
    { 
      title: 'Out of Stock', 
      value: productStats.outOfStock.toString(), 
      change: '-5', 
      icon: TrendingDown, 
      color: 'yellow' 
    },
    { 
      title: 'Total Cost Price', 
      value: formatLargeCurrency(calculateTotalPrices.totalCostPrice), 
      change: `${calculateTotalPrices.profitMargin > 0 ? '+' : ''}${calculateTotalPrices.profitMargin.toFixed(1)}%`, 
      icon: Tag, 
      color: 'purple' 
    },
    { 
      title: 'Total Selling Price', 
      value: formatLargeCurrency(calculateTotalPrices.totalSellingPrice), 
      change: `${calculateTotalPrices.totalProfit > 0 ? '+' : ''}${formatCurrency(calculateTotalPrices.totalProfit)}`, 
      icon: TrendingUp, 
      color: 'green' 
    },
  ];

  const getStatusBadge = (status: ProductStatus) => {
    const statusMap: Record<ProductStatus, { variant: 'default' | 'destructive' | 'secondary' | 'outline', label: string, color: string }> = {
      active: { variant: 'default', label: 'ACTIVE', color: 'green' },
      discontinued: { variant: 'secondary', label: 'DISCONTINUED', color: 'gray' },
      out_of_stock: { variant: 'destructive', label: 'OUT OF STOCK', color: 'red' },
      low_stock: { variant: 'outline', label: 'LOW STOCK', color: 'yellow' },
    };
    return statusMap[status] || statusMap.active;
  };

  // Stock status colors update
  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) return { status: 'out_of_stock', label: 'Out of Stock', color: 'red' };
    if (product.currentStock <= product.minStockLevel) return { status: 'low_stock', label: 'Low Stock', color: 'orange' };
    if (product.currentStock > product.maxStockLevel) return { status: 'overstock', label: 'Overstock', color: 'blue' };
    return { status: 'in_stock', label: 'In Stock', color: 'green' };
  };

  // Calculate selling price based on cost price, margin percentage, and shipping charges
  const calculateSellingPrice = (costPrice: number, marginPercentage: number, shippingCharges: number) => {
    const marginAmount = costPrice * (marginPercentage / 100);
    return costPrice + marginAmount + shippingCharges;
  };

  // Handle form changes for pricing calculation
  const handlePricingChange = (field: string, value: number) => {
    const updatedForm = { ...productForm, [field]: value };
    
    // Auto-calculate selling price when cost price, margin percentage, or shipping charges change
    if (field === 'costPrice' || field === 'marginPercentage' || field === 'shippingCharges') {
      const costPrice = field === 'costPrice' ? value : updatedForm.costPrice || 0;
      const marginPercentage = field === 'marginPercentage' ? value : updatedForm.marginPercentage || 0;
      const shippingCharges = field === 'shippingCharges' ? value : updatedForm.shippingCharges || 0;
      
      const sellingPrice = calculateSellingPrice(costPrice, marginPercentage, shippingCharges);
      updatedForm.sellingPrice = sellingPrice;
    }
    
    setProductForm(updatedForm);
  };

  // ✅ NEW: Handle service selection
  const handleServiceToggle = (service: Service) => {
    const existingService = selectedServices.find(s => s.serviceId === service.id);
    
    if (existingService) {
      // Remove service
      setSelectedServices(prev => prev.filter(s => s.serviceId !== service.id));
    } else {
      // Add service with default quantity 1
      const newService: ProductService = {
        serviceId: service.id,
        serviceName: service.name,
        quantity: 1,
        price: service.price,
        total: service.price * 1
      };
      setSelectedServices(prev => [...prev, newService]);
    }
  };

  // ✅ NEW: Handle service quantity change
  const handleServiceQuantityChange = (serviceId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedServices(prev => 
      prev.map(service => 
        service.serviceId === serviceId 
          ? { 
              ...service, 
              quantity, 
              total: service.price * quantity 
            }
          : service
      )
    );
  };

  // ✅ NEW: Handle service removal
  const handleServiceRemove = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(service => service.serviceId !== serviceId));
  };

  // ✅ FIXED: Calculate total without adding service prices to product price
  // Services are only linked to product, not included in product price
  const calculateFormTotalWithServices = () => {
    // Form total = selling price + shipping (services NOT included in product price)
    return (productForm.sellingPrice || 0) + (productForm.shippingCharges || 0);
  };

  // ✅ NEW: Load services when editing product
  useEffect(() => {
    if (selectedProduct && isEditDialogOpen) {
      setSelectedServices(selectedProduct.services || []);
    }
  }, [selectedProduct, isEditDialogOpen]);

  // ✅ NEW: Reset services when closing dialog
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      setSelectedServices([]);
    }
  }, [isAddDialogOpen, isEditDialogOpen]);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    // Clean up category fields if they contain URLs instead of IDs
    const cleanedProduct = {
      ...product,
      mainCategoryId: product.mainCategoryId?.startsWith('http') ? '' : product.mainCategoryId,
      subCategoryId: product.subCategoryId?.startsWith('http') ? '' : product.subCategoryId
    };
    setSelectedProduct(cleanedProduct);
    setProductForm(cleanedProduct);
    setSelectedServices(product.services || []);
    setIsEditDialogOpen(true);
  };

  const handleAddProduct = () => {
    setProductForm({
      name: '',
      productType: '',
      sku: '',
      description: '',
      orderSpecification: '',
      mainCategoryId: '',
      subCategoryId: '',
      category: '' as ProductCategory,
      manufacturer: '',
      modelNumber: '',
      supplierName: '',
      costPrice: 0,
      sellingPrice: 0,
      marginPercentage: 0,
      shippingCharges: 0,
      currentStock: 0,
      minStockLevel: 10,
      maxStockLevel: 1000,
      reorderPoint: 20,
      status: 'active' as ProductStatus,
      services: []
    });
    setSelectedServices([]);
    setIsAddDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name?.trim() || !productForm.sku?.trim() || !productForm.manufacturer?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!productForm.mainCategoryId || !productForm.subCategoryId) {
      toast.error('Please select both main and sub category');
      return;
    }

    try {
      setSaving(true);
      
      const productData: Omit<Product, 'id'> = {
        name: productForm.name!,
        productType: productForm.productType || '',
        sku: productForm.sku!,
        description: productForm.description || '',
        orderSpecification: productForm.orderSpecification || '',
        mainCategoryId: productForm.mainCategoryId!,
        subCategoryId: productForm.subCategoryId!,
        category: productForm.category!,
        manufacturer: productForm.manufacturer!,
        modelNumber: productForm.modelNumber || '',
        supplierName: productForm.supplierName || '',
        costPrice: productForm.costPrice || 0,
        sellingPrice: productForm.sellingPrice || 0,
        marginPercentage: productForm.marginPercentage || 0,
        shippingCharges: productForm.shippingCharges || 0,
        currentStock: productForm.currentStock || 0,
        minStockLevel: productForm.minStockLevel || 10,
        maxStockLevel: productForm.maxStockLevel || 1000,
        reorderPoint: productForm.reorderPoint || 20,
        status: productForm.status || 'active',
        specifications: {},
        images: productForm.images || [],
        isSerialTracked: false,
        isBatchTracked: false,
        preferredVendor: '',
        alternateVendors: [],
        margin: 0,
        services: selectedServices, // ✅ Include selected services
        totalWithServices: calculateFormTotalWithServices(), // ✅ Calculate total with services
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (isAddDialogOpen) {
        await productService.createProduct(productData);
        toast.success(`Product "${productForm.name}" added successfully!`);
      } else if (isEditDialogOpen && selectedProduct) {
        await productService.updateProduct(selectedProduct.id, {
          ...productData,
          services: selectedServices,
          totalWithServices: calculateFormTotalWithServices()
        });
        toast.success(`Product "${productForm.name}" updated successfully!`);
      }
      
      await loadData();
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setProductForm({});
      setSelectedProduct(null);
      setSelectedServices([]);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      setDeleting(selectedProduct.id);
      await productService.deleteProduct(selectedProduct.id);
      toast.success(`Product "${selectedProduct.name}" deleted successfully!`);
      await loadData();
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleExportProducts = () => {
    alert('Exporting products to Excel/CSV');
  };

  const handleImportProducts = () => {
    alert('Importing products from CSV');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600" />
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Product Inventory</h1>
            <p className="text-red-100 mt-1 text-lg">Complete product catalog and inventory management</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 border border-white/20">
              <Label htmlFor="currency" className="text-white text-sm font-medium">Currency:</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-28 h-8 bg-transparent border-none text-white focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                  <SelectItem value="CNY">CNY (¥)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            
            <Button className="bg-white text-blue-600 hover:bg-red-50" onClick={handleAddProduct}>
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Stats - Now 5 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => {
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
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{stat.change}</span>
                  <span className="text-gray-500"> from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Name, SKU, manufacturer, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Main Category</Label>
              <Select value={mainCategoryFilter} onValueChange={(value) => {
                setMainCategoryFilter(value);
                setSubCategoryFilter('all'); // Reset subcategory when main category changes
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Main Categories</SelectItem>
                  {mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sub Category</Label>
              <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter} disabled={mainCategoryFilter === 'all'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub Categories</SelectItem>
                  {mainCategoryFilter !== 'all' && getSubCategoriesByMainCategory(mainCategoryFilter).map((subCategory) => (
                    <SelectItem key={subCategory.id} value={subCategory.id}>
                      <div className="flex items-center gap-2">
                        
                        <span>{subCategory.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stock Level</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="overstock">Overstock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setMainCategoryFilter('all');
                setSubCategoryFilter('all');
                setStatusFilter('all');
                setStockFilter('all');
                setCurrentPage(1);
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Products</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                {filteredProducts.length} of {products.length} products
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-gray-300 bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">Product</TableHead>
                  <TableHead className="font-semibold text-gray-900">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">SKU</TableHead>
                  <TableHead className="font-semibold text-gray-900">Main Category</TableHead>
                  <TableHead className="font-semibold text-gray-900">Sub Category</TableHead>
                  <TableHead className="font-semibold text-gray-900">Stock Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Current Stock</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Cost Price</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Selling Price</TableHead>
                  {/* ✅ NEW: Services Column */}
                  <TableHead className="text-right font-semibold text-gray-900">Services</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Total with Services</TableHead>
                  <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const statusBadge = getStatusBadge(product.status);
                  const totalWithServices = calculateTotalWithServices(product);
                  
                  return (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.manufacturer}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {product.productType || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getMainCategoryById(product.mainCategoryId)?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getSubCategoryById(product.subCategoryId)?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={stockStatus.status === 'out_of_stock' ? 'destructive' : stockStatus.status === 'low_stock' ? 'outline' : 'default'} 
                          className={`text-xs ${
                            stockStatus.color === 'green' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                            stockStatus.color === 'red' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                            stockStatus.color === 'orange' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                            'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-gray-900">
                        <div className="font-medium">{product.currentStock}</div>
                        <div className="text-xs text-gray-500">Min: {product.minStockLevel}</div>
                      </TableCell>
                      <TableCell className="text-right text-gray-900 font-medium">
                        {formatCurrency(product.costPrice)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-bold">
                        {formatCurrency(product.sellingPrice)}
                      </TableCell>
                      {/* ✅ NEW: Services Count */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-gray-900">
                            {product.services?.length || 0} services
                          </span>
                          {product.services && product.services.length > 0 && (
                            <span className="text-xs text-gray-500">
                              +{formatCurrency(product.services.reduce((sum, s) => sum + s.total, 0))}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {/* ✅ NEW: Total with Services */}
                      <TableCell className="text-right text-purple-600 font-bold">
                        {formatCurrency(totalWithServices)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewProduct(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditProduct(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deleting === product.id}
                          >
                            {deleting === product.id ? (
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
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
                        key={pageNum}
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
        </CardContent>
      </Card>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Product Details</DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              {selectedProduct?.name} - {selectedProduct?.sku}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6 bg-white">
              {/* Product Header */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Product Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{selectedProduct.name}</span></p>
                    <p><span className="font-medium text-gray-700">Product Type:</span> <span className="text-gray-900">{selectedProduct.productType || 'N/A'}</span></p>
                    <p><span className="font-medium text-gray-700">SKU:</span> <span className="text-gray-900">{selectedProduct.sku}</span></p>
                    <p><span className="font-medium text-gray-700">Main Category:</span> <span className="text-gray-900">{getMainCategoryById(selectedProduct.mainCategoryId)?.name || 'Unknown'}</span></p>
                    <p><span className="font-medium text-gray-700">Sub Category:</span> <span className="text-gray-900">{getSubCategoryById(selectedProduct.subCategoryId)?.name || 'Unknown'}</span></p>
                    <p><span className="font-medium text-gray-700">Manufacturer:</span> <span className="text-gray-900">{selectedProduct.manufacturer}</span></p>
                    <p><span className="font-medium text-gray-700">Model Number:</span> <span className="text-gray-900">{selectedProduct.modelNumber || 'N/A'}</span></p>
                    <p><span className="font-medium text-gray-700">Supplier Name:</span> <span className="text-gray-900">{selectedProduct.supplierName || 'N/A'}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status & Stock</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium text-gray-700">Status:</span> <Badge variant={getStatusBadge(selectedProduct.status).variant} className="ml-2">{getStatusBadge(selectedProduct.status).label}</Badge></p>
                    <p><span className="font-medium text-gray-700">Stock Status:</span> 
                      <Badge 
                        className={`ml-2 ${
                          getStockStatus(selectedProduct).color === 'green' ? 'bg-green-100 text-green-800' :
                          getStockStatus(selectedProduct).color === 'red' ? 'bg-red-100 text-red-800' :
                          getStockStatus(selectedProduct).color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {getStockStatus(selectedProduct).label}
                      </Badge>
                    </p>
                    <p><span className="font-medium text-gray-700">Current Stock:</span> <span className="text-gray-900">{selectedProduct.currentStock} units</span></p>
                    <p><span className="font-medium text-gray-700">Min Level:</span> <span className="text-gray-900">{selectedProduct.minStockLevel} units</span></p>
                    <p><span className="font-medium text-gray-700">Reorder Point:</span> <span className="text-gray-900">{selectedProduct.reorderPoint} units</span></p>
                  </div>
                </div>
              </div>

              {/* ✅ NEW: Services Section in View Dialog */}
              {selectedProduct.services && selectedProduct.services.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    Associated Services ({selectedProduct.services.length})
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.services.map((service, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{service.serviceName}</TableCell>
                            <TableCell>{service.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(service.price)}</TableCell>
                            <TableCell className="text-right font-bold text-green-600">
                              {formatCurrency(service.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Services Total:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(selectedProduct.services.reduce((sum, s) => sum + s.total, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Information */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Cost Price</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedProduct.costPrice)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Selling Price</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedProduct.sellingPrice)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Margin Percentage</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedProduct.marginPercentage || 0}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Shipping Charges</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(selectedProduct.shippingCharges || 0)}</p>
                </div>
              </div>

              {/* ✅ UPDATED: Total Pricing */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-purple-900">Total Price with Services</h4>
                    <p className="text-sm text-purple-700">Product price + shipping + services</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">
                      {formatCurrency(calculateTotalWithServices(selectedProduct))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">{selectedProduct.description}</p>
                </div>
              )}

              {/* Order Specification */}
              {selectedProduct.orderSpecification && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Order Specification</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">{selectedProduct.orderSpecification}</p>
                </div>
              )}

              {/* Stock Levels */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Stock Levels</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium text-gray-700">Min Stock:</span> <span className="text-gray-900">{selectedProduct.minStockLevel}</span></p>
                    <p><span className="font-medium text-gray-700">Max Stock:</span> <span className="text-gray-900">{selectedProduct.maxStockLevel}</span></p>
                    <p><span className="font-medium text-gray-700">Reorder Point:</span> <span className="text-gray-900">{selectedProduct.reorderPoint}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pricing Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium text-gray-700">Cost Price:</span> <span className="text-gray-900">{formatCurrency(selectedProduct.costPrice)}</span></p>
                    <p><span className="font-medium text-gray-700">Margin ({selectedProduct.marginPercentage || 0}%):</span> <span className="text-gray-900">{formatCurrency(selectedProduct.costPrice * ((selectedProduct.marginPercentage || 0) / 100))}</span></p>
                    <p><span className="font-medium text-gray-700">Shipping Charges:</span> <span className="text-gray-900">{formatCurrency(selectedProduct.shippingCharges || 0)}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Final Pricing</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium text-gray-700">Base Price:</span> <span className="text-gray-900">{formatCurrency(selectedProduct.sellingPrice)}</span></p>
                    <p><span className="font-medium text-gray-700">With Charges:</span> <span className="text-green-600 font-bold">{formatCurrency(selectedProduct.sellingPrice + (selectedProduct.shippingCharges || 0))}</span></p>
                    <p><span className="font-medium text-gray-700">Margin:</span> <span className="text-blue-600">{(selectedProduct.margin * 100).toFixed(1)}%</span></p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 bg-white">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-gray-300 hover:bg-gray-50">
                  Close
                </Button>
                <Button variant="outline" onClick={() => { setIsViewDialogOpen(false); handleEditProduct(selectedProduct); }} className="border-gray-300 hover:bg-gray-50">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={() => { setIsViewDialogOpen(false); handleDeleteProduct(selectedProduct); }} className="bg-red-600 hover:bg-red-700 text-white">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✅ UPDATED: Add/Edit Product Dialog with Services Section */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedServices([]);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {isAddDialogOpen ? 'Add New Product' : 'Edit Product'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              {isEditDialogOpen ? `Editing ${selectedProduct?.name}` : 'Enter product details below'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 bg-white">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
               
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productType">Product Type</Label>
                    <Input
                      id="productType"
                      value={productForm.productType}
                      onChange={(e) => setProductForm({ ...productForm, productType: e.target.value })}
                      placeholder=""
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="Enter SKU"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer *</Label>
                    <Input
                      id="manufacturer"
                      value={productForm.manufacturer}
                      onChange={(e) => setProductForm({ ...productForm, manufacturer: e.target.value })}
                      placeholder="Enter manufacturer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Enter product description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productImage">Product Image URL</Label>
                    <div className="space-y-2">
                      <Input
                        id="productImage"
                        value={productForm.images?.[0] || ''}
                        onChange={(e) => setProductForm({ ...productForm, images: e.target.value ? [e.target.value] : [] })}
                        placeholder="Enter product image URL (e.g., https://example.com/image.jpg)"
                      />
                      {productForm.images?.[0] && (
                        <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-xs text-gray-600 mb-2">Image Preview:</p>
                          <img 
                            src={productForm.images[0]} 
                            alt="Product preview" 
                            className="max-w-xs h-32 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'text-xs text-red-500';
                              errorDiv.textContent = 'Failed to load image';
                              (e.target as HTMLImageElement).parentElement?.appendChild(errorDiv);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mainCategory">Main Category *</Label>
                      <Select 
                        value={productForm.mainCategoryId} 
                        onValueChange={(value) => {
                          const mainCategory = getMainCategoryById(value);
                          setProductForm({ 
                            ...productForm, 
                            mainCategoryId: value,
                            subCategoryId: '', // Reset subcategory when main category changes
                            category: `${mainCategory?.name || ''}` as ProductCategory
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select main category" />
                        </SelectTrigger>
                        <SelectContent>
                          {mainCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                               
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subCategory">Sub Category *</Label>
                      <Select 
                        value={productForm.subCategoryId} 
                        onValueChange={(value) => {
                          const subCategory = getSubCategoryById(value);
                          const mainCategory = getMainCategoryById(productForm.mainCategoryId || '');
                          setProductForm({ 
                            ...productForm, 
                            subCategoryId: value,
                            category: `${mainCategory?.name || ''}/${subCategory?.name || ''}` as ProductCategory
                          });
                        }}
                        disabled={!productForm.mainCategoryId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub category" />
                        </SelectTrigger>
                        <SelectContent>
                          {productForm.mainCategoryId && getSubCategoriesByMainCategory(productForm.mainCategoryId).map((subCategory) => (
                            <SelectItem key={subCategory.id} value={subCategory.id}>
                              <div className="flex items-center gap-2">
                               
                                <span>{subCategory.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ✅ Category Preview Section */}
                    {(() => {
                      // Only show if we have valid IDs (not URLs)
                      const isValidId = (str: string | undefined) => str && typeof str === 'string' && !str.startsWith('http');
                      const mainCatId = isValidId(productForm.mainCategoryId) ? productForm.mainCategoryId : '';
                      const subCatId = isValidId(productForm.subCategoryId) ? productForm.subCategoryId : '';
                      
                      if (!mainCatId && !subCatId) return null;
                      
                      return (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Selected Categories</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {/* Main Category Preview */}
                            {mainCatId && (() => {
                              const mainCat = getMainCategoryById(mainCatId);
                              if (!mainCat) return null;
                              return (
                                <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-shrink-0">
                                     
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-500 font-medium uppercase">Main Category</p>
                                      <p className="text-sm font-bold text-gray-900 truncate">{mainCat.name}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                            
                            {/* Sub Category Preview */}
                            {subCatId && (() => {
                              const subCat = getSubCategoryById(subCatId);
                              if (!subCat) return null;
                              return (
                                <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-shrink-0">
                                      
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-500 font-medium uppercase">Sub Category</p>
                                      <p className="text-sm font-bold text-gray-900 truncate">{subCat.name}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="space-y-2">
                      <Label htmlFor="modelNumber">Model Number</Label>
                      <Input
                        id="modelNumber"
                        value={productForm.modelNumber}
                        onChange={(e) => setProductForm({ ...productForm, modelNumber: e.target.value })}
                        placeholder="Enter Supplier model number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplierName">Supplier Name</Label>
                      <Input
                        id="supplierName"
                        value={productForm.supplierName}
                        onChange={(e) => setProductForm({ ...productForm, supplierName: e.target.value })}
                        placeholder="Enter supplier name"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price *</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        value={productForm.costPrice}
                        onChange={(e) => handlePricingChange('costPrice', parseFloat(e.target.value) )}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marginPercentage">Margin Percentage *</Label>
                      <Input
                        id="marginPercentage"
                        type="number"
                        step="0.1"
                        value={productForm.marginPercentage}
                        onChange={(e) => handlePricingChange('marginPercentage', parseFloat(e.target.value) )}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingCharges">Shipping Charges</Label>
                      <Input
                        id="shippingCharges"
                        type="number"
                        step=""
                        value={productForm.shippingCharges}
                        onChange={(e) => handlePricingChange('shippingCharges', parseFloat(e.target.value) )}
                        placeholder=""
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Calculated Selling Price:</span>{' '}
                          <span className="font-bold text-green-600 text-lg">
                            {formatCurrency(productForm.sellingPrice || 0)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Margin Amount:</span>{' '}
                          <span className="font-bold text-blue-600">
                            {/* {formatCurrency((productForm.costPrice || 0) * ((productForm.marginPercentage || 0) / 100))} */}
                             {formatCurrency((productForm.marginPercentage || 0) )}%
                          </span>
                        </p>
                      </div>
                      <div>
                        
                        
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentStock">Current Stock *</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        value={productForm.currentStock}
                        onChange={(e) => setProductForm({ ...productForm, currentStock: parseInt(e.target.value)  })}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select value={productForm.status} onValueChange={(value) => setProductForm({ ...productForm, status: value as ProductStatus })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                          <SelectItem value="low_stock">Low Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minStockLevel">Min Stock Level</Label>
                      <Input
                        id="minStockLevel"
                        type="number"
                        value={productForm.minStockLevel}
                        onChange={(e) => setProductForm({ ...productForm, minStockLevel: parseInt(e.target.value)  })}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                      <Input
                        id="maxStockLevel"
                        type="number"
                        value={productForm.maxStockLevel}
                        onChange={(e) => setProductForm({ ...productForm, maxStockLevel: parseInt(e.target.value)  })}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorderPoint">Reorder Point</Label>
                      <Input
                        id="reorderPoint"
                        type="number"
                        value={productForm.reorderPoint}
                        onChange={(e) => setProductForm({ ...productForm, reorderPoint: parseInt(e.target.value) })}
                        placeholder=""
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ✅ NEW: Services Tab */}
                <TabsContent value="services" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                      Select Associated Services
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Choose services to associate with this product. Services will be added to the final price.
                    </p>

                    {/* Services Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {services.map(service => (
                        <div 
                          key={service.id} 
                          className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                            selectedServices.some(s => s.serviceId === service.id)
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleServiceToggle(service)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                checked={selectedServices.some(s => s.serviceId === service.id)}
                                onCheckedChange={() => handleServiceToggle(service)}
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">{service.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {service.description || 'No description'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatCurrency(service.price)}</p>
                              <p className="text-xs text-gray-500">
                                {service.availability === 'available' ? 'Available' : 'Limited'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Selected Services Table */}
                    {selectedServices.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">Selected Services ({selectedServices.length})</h4>
                        </div>
                        <div className="p-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedServices.map((service, index) => (
                                <TableRow key={service.serviceId}>
                                  <TableCell className="font-medium">{service.serviceName}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleServiceQuantityChange(service.serviceId, service.quantity - 1)}
                                        disabled={service.quantity <= 1}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-8 text-center">{service.quantity}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleServiceQuantityChange(service.serviceId, service.quantity + 1)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <PlusCircle className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{formatCurrency(service.price)}</TableCell>
                                  <TableCell className="text-right font-bold text-green-600">
                                    {formatCurrency(service.total)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleServiceRemove(service.serviceId)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">Services Total:</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(selectedServices.reduce((sum, service) => sum + service.total, 0))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total Summary */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Product Price:</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(productForm.sellingPrice || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Services Total:</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(selectedServices.reduce((sum, service) => sum + service.total, 0))}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-semibold text-blue-900">Final Total:</p>
                            <p className="text-sm text-blue-700">Product + Shipping + Services</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">
                              {formatCurrency(calculateFormTotalWithServices())}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                
              </Tabs>

              <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
                <Button variant="outline" onClick={() => { 
                  setIsAddDialogOpen(false); 
                  setIsEditDialogOpen(false); 
                  setSelectedServices([]);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProduct} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isAddDialogOpen ? 'Adding...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      {isAddDialogOpen ? 'Add Product' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
            <DialogHeader className="bg-white border-b border-gray-200 pb-4">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                Delete Product
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 bg-white">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Deleting this product will remove all associated inventory records and may affect existing orders.
                </p>
              </div>
            </div>

            <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete} 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleting === selectedProduct?.id}
              >
                {deleting === selectedProduct?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }