'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCurrencyStore } from '@/stores/currency';
import { useInventoryStore } from '@/stores/inventory';

export default function AddProductPage() {
  const router = useRouter();
  const { formatAmount } = useCurrencyStore();
  const { categories, suppliers, addCategory, addSupplier, getCategories, getSuppliers } = useInventoryStore();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    manufacturer: '',
    modelNumber: '',
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    minStockLevel: '',
    maxStockLevel: '',
    reorderPoint: '',
    isSerialTracked: false,
    isBatchTracked: false,
  });

  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  // Modal states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setSpecifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addSpecification = () => {
    const key = `spec_${Object.keys(specifications).length + 1}`;
    setSpecifications(prev => ({
      ...prev,
      [key]: ''
    }));
  }; 

  const removeSpecification = (key: string) => {
    setSpecifications(prev => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the product to your backend
    console.log('Product data:', { ...formData, specifications });
    // For now, just navigate back to products page
    router.push('/inventory/products');
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), newCategoryDescription.trim() || undefined);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsAddCategoryModalOpen(false);
    }
  };

  const handleAddSupplier = () => {
    if (newSupplierName.trim()) {
      addSupplier(
        newSupplierName.trim(),
        newSupplierEmail.trim() || undefined,
        newSupplierPhone.trim() || undefined,
        newSupplierAddress.trim() || undefined
      );
      setNewSupplierName('');
      setNewSupplierEmail('');
      setNewSupplierPhone('');
      setNewSupplierAddress('');
      setIsAddSupplierModalOpen(false);
    }
  };

  const calculateMargin = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    if (cost > 0) {
      return (((selling - cost) / cost) * 100).toFixed(1);
    }
    return '0.0';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product in your inventory</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/inventory/products')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <div className="flex gap-2">
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategories().map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddCategoryModalOpen(true)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="manufacturer">Supplier *</Label>
                <div className="flex gap-2">
                  <Select value={formData.manufacturer} onValueChange={(value) => handleInputChange('manufacturer', value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSuppliers().map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddSupplierModalOpen(true)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="modelNumber">Model Number</Label>
                <Input
                  id="modelNumber"
                  value={formData.modelNumber}
                  onChange={(e) => handleInputChange('modelNumber', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="costPrice">Cost Price *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => handleInputChange('costPrice', e.target.value)}
                  required
                />
                {formData.costPrice && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatAmount(parseFloat(formData.costPrice))}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                  required
                />
                {formData.sellingPrice && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatAmount(parseFloat(formData.sellingPrice))}
                  </p>
                )}
              </div>
              <div>
                <Label>Margin</Label>
                <div className="mt-2">
                  <p className="text-lg font-semibold text-green-600">{calculateMargin()}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="currentStock">Current Stock *</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => handleInputChange('currentStock', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="minStockLevel">Min Stock Level *</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                <Input
                  id="maxStockLevel"
                  type="number"
                  value={formData.maxStockLevel}
                  onChange={(e) => handleInputChange('maxStockLevel', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reorderPoint">Reorder Point</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => handleInputChange('reorderPoint', e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isSerialTracked"
                  checked={formData.isSerialTracked}
                  onCheckedChange={(checked) => handleInputChange('isSerialTracked', !!checked)}
                />
                <Label htmlFor="isSerialTracked">Serial Number Tracking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isBatchTracked"
                  checked={formData.isBatchTracked}
                  onCheckedChange={(checked) => handleInputChange('isBatchTracked', !!checked)}
                />
                <Label htmlFor="isBatchTracked">Batch Number Tracking</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Specifications
              <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                Add Specification
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Specification Name</Label>
                  <Input
                    placeholder="e.g., Operating Voltage"
                    value={key.startsWith('spec_') ? '' : key}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      if (newKey !== key) {
                        setSpecifications(prev => {
                          const newSpecs = { ...prev };
                          delete newSpecs[key];
                          newSpecs[newKey] = value;
                          return newSpecs;
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Label>Value</Label>
                  <Input
                    placeholder="e.g., 3.3V - 5V"
                    value={value}
                    onChange={(e) => handleSpecificationChange(key, e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSpecification(key)}
                >
                  Remove
                </Button>
              </div>
            ))}
            {Object.keys(specifications).length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No specifications added yet. Click "Add Specification" to add product details.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push('/inventory/products')}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Create Product
          </Button>
        </div>
      </form>

      {/* Add Category Modal */}
      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-category-name">Category Name *</Label>
              <Input
                id="new-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label htmlFor="new-category-description">Description (Optional)</Label>
              <Textarea
                id="new-category-description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Modal */}
      <Dialog open={isAddSupplierModalOpen} onOpenChange={setIsAddSupplierModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-supplier-name">Supplier Name *</Label>
              <Input
                id="new-supplier-name"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-supplier-email">Contact Email</Label>
                <Input
                  id="new-supplier-email"
                  type="email"
                  value={newSupplierEmail}
                  onChange={(e) => setNewSupplierEmail(e.target.value)}
                  placeholder="contact@supplier.com"
                />
              </div>
              <div>
                <Label htmlFor="new-supplier-phone">Contact Phone</Label>
                <Input
                  id="new-supplier-phone"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  placeholder="+1-555-0123"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="new-supplier-address">Address</Label>
              <Textarea
                id="new-supplier-address"
                value={newSupplierAddress}
                onChange={(e) => setNewSupplierAddress(e.target.value)}
                placeholder="Enter supplier address"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSupplierModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSupplier} disabled={!newSupplierName.trim()}>
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}