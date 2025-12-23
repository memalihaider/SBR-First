'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import mockData from '@/lib/mock-data';
import { Product } from '@/types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: (product: Product) => void;
}

export function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    mainCategoryId: '',
    subCategoryId: '',
    manufacturer: '',
    modelNumber: '',
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    minStockLevel: '',
    maxStockLevel: '',
    reorderPoint: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.mainCategoryId) {
      return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: formData.sku,
      name: formData.name,
      productType: '',
      description: formData.description || '',
      orderSpecification: '',
      mainCategoryId: formData.mainCategoryId,
      subCategoryId: formData.subCategoryId || '',
      category: `${mockData.getMainCategoryById(formData.mainCategoryId)?.name || 'Unknown'}/${mockData.getSubCategoryById(formData.subCategoryId)?.name || 'Unknown'}`,
      manufacturer: formData.manufacturer || '',
      supplierName: '',
      modelNumber: formData.modelNumber || '',
      costPrice: parseFloat(formData.costPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      marginPercentage: 0,
      shippingCharges: 0,
      margin: ((parseFloat(formData.sellingPrice) || 0) - (parseFloat(formData.costPrice) || 0)) / (parseFloat(formData.costPrice) || 1),
      currentStock: parseInt(formData.currentStock) || 0,
      minStockLevel: parseInt(formData.minStockLevel) || 10,
      maxStockLevel: parseInt(formData.maxStockLevel) || 1000,
      reorderPoint: parseInt(formData.reorderPoint) || 20,
      specifications: {},
      images: [],
      datasheet: '',
      status: 'active',
      isSerialTracked: false,
      isBatchTracked: false,
      services: [],
      totalWithServices: 0,
      preferredVendor: '',
      alternateVendors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onProductAdded?.(newProduct);

    // Reset form
    setFormData({
      name: '',
      sku: '',
      description: '',
      mainCategoryId: '',
      subCategoryId: '',
      manufacturer: '',
      modelNumber: '',
      costPrice: '',
      sellingPrice: '',
      currentStock: '',
      minStockLevel: '',
      maxStockLevel: '',
      reorderPoint: '',
    });

    onClose();
  };

  const availableSubCategories = formData.mainCategoryId
    ? mockData.getSubCategoriesByMainCategory(formData.mainCategoryId)
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Enter SKU"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mainCategory">Main Category *</Label>
              <Select
                value={formData.mainCategoryId}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  mainCategoryId: value,
                  subCategoryId: '' // Reset subcategory when main category changes
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {mockData.mainCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subCategory">Sub Category</Label>
              <Select
                value={formData.subCategoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subCategoryId: value }))}
                disabled={!formData.mainCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub category" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Manufacturer & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                placeholder="Enter manufacturer"
              />
            </div>
            <div>
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input
                id="modelNumber"
                value={formData.modelNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, modelNumber: e.target.value }))}
                placeholder="Enter model number"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: e.target.value }))}
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxStockLevel">Max Stock Level</Label>
              <Input
                id="maxStockLevel"
                type="number"
                min="0"
                value={formData.maxStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStockLevel: e.target.value }))}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="reorderPoint">Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                min="0"
                value={formData.reorderPoint}
                onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: e.target.value }))}
                placeholder="20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.sku || !formData.mainCategoryId}>
              Add Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}