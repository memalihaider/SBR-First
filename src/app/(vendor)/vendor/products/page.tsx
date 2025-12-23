'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import mockData from '@/lib/mock-data';
import { useCurrencyStore } from '@/stores/currency';
import { AddProductModal } from '@/components/add-product-modal';
import { EditProductModal } from '@/components/edit-product-modal';
import { UpdateStockModal } from '@/components/update-stock-modal';
import { Product } from '@/types';
import { toast } from 'sonner';

export default function VendorProductsPage() {
  const { formatAmount } = useCurrencyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [products, setProducts] = useState(mockData.products);

  // Mock vendor products with additional vendor-specific properties
  const vendorProducts = products.map((product, index) => ({
    ...product,
    vendorSKU: `V-${product.sku}`,
    moq: Math.floor(Math.random() * 100) + 10,
    leadTime: Math.floor(Math.random() * 30) + 5,
    availableStock: product.currentStock,
    reorderPoint: product.reorderPoint,
    lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  }));

  const filteredProducts = vendorProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendorSKU.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(vendorProducts.map(p => p.category)));

  const stats = [
    { label: 'Total Products', value: vendorProducts.length, color: 'text-pink-600', icon: '📦' },
    { label: 'Low Stock', value: vendorProducts.filter(p => p.availableStock < p.reorderPoint).length, color: 'text-orange-600', icon: '⚠️' },
    { label: 'In Stock', value: vendorProducts.filter(p => p.availableStock >= p.reorderPoint).length, color: 'text-green-600', icon: '✅' },
    { label: 'Avg Lead Time', value: `${Math.round(vendorProducts.reduce((sum, p) => sum + p.leadTime, 0) / vendorProducts.length)} days`, color: 'text-blue-600', icon: '🕐' },
  ];

  const handleAddProduct = () => {
    setShowAddProductModal(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowEditProductModal(true);
  };

  const handleUpdateStock = (product: any) => {
    setSelectedProduct(product);
    setShowUpdateStockModal(true);
  };

  const handleProductAdded = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
    toast.success('Product added successfully!');
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    toast.success('Product updated successfully!');
  };

  const handleStockUpdated = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, currentStock: newStock } : p
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory and pricing</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleAddProduct}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
              <Input
                type="text"
                placeholder="Search by name, SKU, or vendor SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-600">Vendor SKU: {product.vendorSKU}</p>
                  </div>
                </div>
                <Badge className="bg-pink-100 text-pink-800">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Pricing */}
              <div className="mb-4 p-4 bg-pink-50 rounded-lg">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-600">Unit Price</span>
                  <span className="text-2xl font-bold text-pink-600">{formatAmount(Math.floor(Math.random() * 200) + 50)}</span>
                </div>
              </div>

              {/* Stock Information */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available Stock</span>
                  <span className={`font-semibold ${product.availableStock < product.reorderPoint ? 'text-orange-600' : 'text-green-600'}`}>
                    {product.availableStock} units
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Reorder Point</span>
                  <span className="font-semibold text-gray-900">{product.reorderPoint} units</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">MOQ</span>
                  <span className="font-semibold text-gray-900">{product.moq} units</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lead Time</span>
                  <span className="font-semibold text-gray-900">{product.leadTime} days</span>
                </div>
              </div>

              {/* Stock Alert */}
              {product.availableStock < product.reorderPoint && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center text-sm text-orange-800">
                    <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Low Stock Alert!
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={() => handleUpdateStock(product)}
                >
                  Update Stock
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-pink-600 text-pink-600 hover:bg-pink-50"
                  onClick={() => handleEditProduct(product)}
                >
                  Edit
                </Button>
              </div>

              {/* Last Updated */}
              <p className="text-xs text-gray-500 mt-3 text-center">
                Last updated: {product.lastUpdated}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={handleProductAdded}
      />

      <EditProductModal
        isOpen={showEditProductModal}
        onClose={() => setShowEditProductModal(false)}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />

      <UpdateStockModal
        isOpen={showUpdateStockModal}
        onClose={() => setShowUpdateStockModal(false)}
        product={selectedProduct}
        onStockUpdated={handleStockUpdated}
      />
    </div>
  );
}
