
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Tag,
  Settings,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Upload,
  X,
  FileImage,

} from 'lucide-react';
import { SubCategory, MainCategory } from '@/types';
import { toast } from 'sonner';
import { 
  subCategoryService, 
  mainCategoryService
} from '@/lib/categoryService';
import Link from 'next/link';

export default function AdminSubCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Data states
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);

  // Dialog states
  const [isAddSubCategoryDialogOpen, setIsAddSubCategoryDialogOpen] = useState(false);
  const [isEditSubCategoryDialogOpen, setIsEditSubCategoryDialogOpen] = useState(false);
  const [isDeleteSubCategoryDialogOpen, setIsDeleteSubCategoryDialogOpen] = useState(false);

  // Form states
  const [subCategoryForm, setSubCategoryForm] = useState<Partial<SubCategory>>({
    name: '',
    description: '',
    mainCategoryId: '',
    icon: '',
    isActive: true,
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

  // Image states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Set selected image when editing
  useEffect(() => {
    if (isEditSubCategoryDialogOpen && selectedSubCategory?.icon) {
      setSelectedImage(selectedSubCategory.icon);
    }
  }, [isEditSubCategoryDialogOpen, selectedSubCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subCats, mainCats] = await Promise.all([
        subCategoryService.getAllSubCategories(),
        mainCategoryService.getAllMainCategories()
      ]);
      setSubCategories(subCats);
      setMainCategories(mainCats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load sub-categories');
    } finally {
      setLoading(false);
    }
  };

  // Filter sub-categories based on search
  const filteredSubCategories = useMemo(() => {
    return subCategories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMainCategoryName(category.mainCategoryId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, subCategories]);

  // Helper functions
  const getMainCategoryName = (mainCategoryId: string) => {
    const mainCategory = mainCategories.find(cat => cat.id === mainCategoryId);
    return mainCategory?.name || 'Unknown Category';
  };

  const getMainCategoryIcon = (mainCategoryId: string) => {
    const mainCategory = mainCategories.find(cat => cat.id === mainCategoryId);
    return mainCategory?.icon || '📁';
  };

  // ✅ NEW: Check if string is a valid image URL
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Check if it's a URL (starts with http/https)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
    const urlLower = url.toLowerCase();
    
    return imageExtensions.some(ext => urlLower.includes(ext));
  };

  // ✅ NEW: Check if string is emoji
  const isEmoji = (str: string): boolean => {
    if (!str) return false;
    // Simple emoji detection
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(str) && str.length <= 3;
  };

  // ✅ NEW: Check what type of icon it is
  const getIconType = (icon: string): 'emoji' | 'image' | 'url' | 'text' => {
    if (!icon) return 'text';
    
    if (icon.startsWith('data:image')) {
      return 'image';
    } else if (isValidImageUrl(icon)) {
      return 'url';
    } else if (isEmoji(icon)) {
      return 'emoji';
    }
    
    return 'text';
  };

  // Image compression function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large
          const maxDimension = 200;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Image upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Max size 500KB for Firebase (safety margin)
    if (file.size > 500 * 1024) {
      toast.error('Image size should be less than 500KB for Firebase');
      return;
    }

    try {
      setIsImageUploading(true);
      const compressedBase64 = await compressImage(file);
      
      if (compressedBase64.length > 800000) {
        toast.error('Image too large even after compression. Please use a smaller image.');
        return;
      }

      setSelectedImage(compressedBase64);
      setSubCategoryForm({ ...subCategoryForm, icon: compressedBase64 });
      toast.success('Image added successfully!');
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSubCategoryForm({ ...subCategoryForm, icon: '' });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // ✅ NEW: Handle URL input
  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubCategoryForm({ ...subCategoryForm, icon: value });
    
    // Check if it's a valid image URL
    if (isValidImageUrl(value)) {
      setSelectedImage(value);
    } else if (isEmoji(value)) {
      setSelectedImage(value);
    } else {
      setSelectedImage(null);
    }
  };

  // Sub Category Handlers
  const handleAddSubCategory = () => {
    setSubCategoryForm({
      name: '',
      description: '',
      mainCategoryId: '',
      icon: '',
      isActive: true,
    });
    setSelectedImage(null);
    setIsImageUploading(false);
    setIsAddSubCategoryDialogOpen(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setSubCategoryForm(subCategory);
    
    // Set selected image based on icon type
    if (subCategory.icon) {
      setSelectedImage(subCategory.icon);
    } else {
      setSelectedImage(null);
    }
    
    setIsEditSubCategoryDialogOpen(true);
  };

  const handleDeleteSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setIsDeleteSubCategoryDialogOpen(true);
  };

  const handleSaveSubCategory = async () => {
    if (!subCategoryForm.name?.trim()) {
      toast.error('Please enter a sub-category name');
      return;
    }

    if (!subCategoryForm.mainCategoryId) {
      toast.error('Please select a main category');
      return;
    }

    // Check icon size for Firebase (only for base64 images)
    if (subCategoryForm.icon && subCategoryForm.icon.startsWith('data:image') && subCategoryForm.icon.length > 1000000) {
      toast.error('Icon image is too large. Please use a smaller image or URL.');
      return;
    }

    try {
      if (isAddSubCategoryDialogOpen) {
        const newSubCategory: Omit<SubCategory, 'id'> = {
          name: subCategoryForm.name!,
          description: subCategoryForm.description || '',
          mainCategoryId: subCategoryForm.mainCategoryId!,
          icon: subCategoryForm.icon || '',
          isActive: subCategoryForm.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await subCategoryService.createSubCategory(newSubCategory);
        toast.success(`Sub-category "${subCategoryForm.name}" added successfully!`);
      } else if (isEditSubCategoryDialogOpen && selectedSubCategory) {
        await subCategoryService.updateSubCategory(selectedSubCategory.id, subCategoryForm);
        toast.success(`Sub-category "${subCategoryForm.name}" updated successfully!`);
      }
      
      await loadData();
      setIsAddSubCategoryDialogOpen(false);
      setIsEditSubCategoryDialogOpen(false);
      setSubCategoryForm({});
      setSelectedSubCategory(null);
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Error saving sub category:', error);
      
      // Firebase size error handle karna
      if (error.message?.includes('longer than') || error.message?.includes('1048487 bytes')) {
        toast.error('Image is too large for database. Please use a URL instead.');
      } else {
        toast.error('Failed to save sub-category');
      }
    }
  };

  const handleConfirmDeleteSubCategory = async () => {
    if (!selectedSubCategory) return;

    try {
      setDeleting(selectedSubCategory.id);
      
      await subCategoryService.deleteSubCategory(selectedSubCategory.id);
      
      toast.success(`Sub-category "${selectedSubCategory.name}" deleted successfully!`);
      await loadData();
      setIsDeleteSubCategoryDialogOpen(false);
      setSelectedSubCategory(null);
    } catch (error) {
      console.error('Error deleting sub category:', error);
      toast.error('Failed to delete sub-category. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // Stats calculation
  const getStats = () => {
    const totalSubCategories = subCategories.length;
    const activeSubCategories = subCategories.filter(cat => cat.isActive).length;
    
    return {
      total: totalSubCategories,
      active: activeSubCategories,
      inactive: totalSubCategories - activeSubCategories
    };
  };

  const stats = getStats();

  // Dialog close handler
  const handleDialogClose = () => {
    setIsAddSubCategoryDialogOpen(false);
    setIsEditSubCategoryDialogOpen(false);
    setSubCategoryForm({});
    setSelectedSubCategory(null);
    setSelectedImage(null);
    setIsImageUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600" />
          <p className="mt-2 text-gray-600">Loading sub-categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/inventory/categories">
              <Button variant="ghost" size="sm" className="text-white hover:bg-red-500">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Sub Category Management</h1>
              <p className="text-blue-100 mt-1 text-lg">Manage all sub-categories across main categories</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-white text-red-600 hover:bg-blue-50" onClick={handleAddSubCategory}>
              <Plus className="h-5 w-5 mr-2" />
              Add Sub Category
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Sub Categories</CardTitle>
            <Tag className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-sm text-gray-500 mt-1">All sub-categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Active</CardTitle>
            <Settings className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
            <p className="text-sm text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Inactive</CardTitle>
            <Settings className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.inactive}</div>
            <p className="text-sm text-gray-500 mt-1">Currently inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sub-categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sub Categories List - UPDATED TO SHOW EXTERNAL IMAGES */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl text-gray-900">All Sub Categories</CardTitle>
          <CardDescription className="text-gray-600">
            {filteredSubCategories.length} sub-categories across {mainCategories.length} main categories
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {filteredSubCategories.map((subCategory) => {
              const mainCategoryName = getMainCategoryName(subCategory.mainCategoryId);
              const mainCategoryIcon = getMainCategoryIcon(subCategory.mainCategoryId);
              
              // ✅ Determine icon type
              const iconType = getIconType(subCategory.icon || '');

              return (
                <div key={subCategory.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-8 h-8">
                          {iconType === 'image' ? (
                            // Base64 image
                            <img 
                              src={subCategory.icon} 
                              alt={subCategory.name}
                              className="w-6 h-6 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-xl">🖼️</span>`;
                                }
                              }}
                            />
                          ) : iconType === 'url' ? (
                            // External URL image
                            <img 
                              src={subCategory.icon} 
                              alt={subCategory.name}
                              className="w-6 h-6 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-xl">🔗</span>`;
                                }
                              }}
                            />
                          ) : iconType === 'emoji' ? (
                            // Emoji
                            <span className="text-xl">{subCategory.icon}</span>
                          ) : (
                            // Text or invalid
                            <span className="text-xl">📁</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{subCategory.name}</h3>
                          <p className="text-sm text-gray-600">{subCategory.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {mainCategoryName}
                            </span>
                            {iconType === 'url' && (
                              <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded flex items-center">
                                <link className="h-3 w-3 mr-1" />
                                URL Image
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant={subCategory.isActive ? "default" : "secondary"}>
                        {subCategory.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right text-sm text-gray-500">
                        <div>Created: {subCategory.createdAt.toLocaleDateString()}</div>
                        <div>Updated: {subCategory.updatedAt.toLocaleDateString()}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSubCategory(subCategory)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubCategory(subCategory)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        disabled={deleting === subCategory.id}
                      >
                        {deleting === subCategory.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSubCategories.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Tag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No sub-categories found</p>
              <p className="text-sm">Try adjusting your search term or add a new sub-category</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Sub Category Dialog with Image Upload - UPDATED FOR URL SUPPORT */}
      <Dialog open={isAddSubCategoryDialogOpen || isEditSubCategoryDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4 sticky top-0 bg-white z-10">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {isAddSubCategoryDialogOpen ? 'Add Sub Category' : 'Edit Sub Category'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              {isEditSubCategoryDialogOpen ? `Editing ${selectedSubCategory?.name}` : 'Create a new sub-category'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 bg-white py-4">
            <div className="space-y-2">
              <Label htmlFor="subCategoryName">Sub Category Name *</Label>
              <Input
                id="subCategoryName"
                value={subCategoryForm.name}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                placeholder="Enter sub-category name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategoryDescription">Description</Label>
              <Textarea
                id="subCategoryDescription"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                placeholder="Enter sub-category description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainCategorySelect">Main Category *</Label>
              <Select
                value={subCategoryForm.mainCategoryId}
                onValueChange={(value) => setSubCategoryForm({ ...subCategoryForm, mainCategoryId: value })}
                disabled={isEditSubCategoryDialogOpen}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                     {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Icon/Image Section - UPDATED */}
            <div className="space-y-3">
              <Label>Icon</Label>
              
              <div className="space-y-4">
                {/* Universal Input Field for all types */}
                <div className="space-y-2">
                  <Label htmlFor="iconInput" className="text-sm">
                    <div className="flex items-center">
                      <span>Emoji, Image URL, or Upload</span>
                      <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                    </div>
                  </Label>
                  <div className="relative">
                    <Input
                      id="iconInput"
                      value={subCategoryForm.icon || ''}
                      onChange={handleUrlInput}
                      placeholder="Enter emoji 🔸, paste image URL, or upload image"
                      className="text-lg pr-10"
                    />
                    {subCategoryForm.icon && (
                      <button
                        type="button"
                        onClick={() => {
                          setSubCategoryForm({ ...subCategoryForm, icon: '' });
                          setSelectedImage(null);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>Examples:</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">🔸</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">https://example.com/image.jpg</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                
                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {/* Preview Section */}
                  {selectedImage ? (
                    <div className="relative">
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden mb-3">
                          {selectedImage.startsWith('data:image') || isValidImageUrl(selectedImage) ? (
                            <img
                              src={selectedImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="%23999" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14L6 17h12l-3.86-5.14z"/></svg>';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-100">
                              <span className="text-4xl">{selectedImage}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleImageClick}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Change
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {isValidImageUrl(subCategoryForm.icon || '') 
                            ? '✓ Valid image URL detected' 
                            : isEmoji(subCategoryForm.icon || '') 
                              ? '✓ Emoji detected'
                              : selectedImage.startsWith('data:image')
                                ? '✓ Image uploaded'
                                : 'Enter emoji or image URL'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="text-center cursor-pointer"
                      onClick={handleImageClick}
                    >
                      <div className="flex flex-col items-center justify-center py-6">
                        <Upload className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-700">Upload Image</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Click to select from gallery
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPG, PNG, GIF up to 500KB
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {isImageUploading && (
                    <div className="flex items-center justify-center mt-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Processing image...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="subCategoryActive"
                checked={subCategoryForm.isActive}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="subCategoryActive">Active Category</Label>
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t sticky bottom-0 bg-gray-50 z-10">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSubCategory} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isImageUploading}
            >
              {isAddSubCategoryDialogOpen ? 'Add Sub Category' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sub Category Dialog - SCROLLABLE */}
      <Dialog open={isDeleteSubCategoryDialogOpen} onOpenChange={setIsDeleteSubCategoryDialogOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4 sticky top-0 bg-white z-10">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              Delete Sub Category
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to delete "{selectedSubCategory?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 bg-white">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Deleting this sub-category may affect existing products that are assigned to it.
              </p>
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t sticky bottom-0 bg-gray-50 z-10">
            <Button variant="outline" onClick={() => setIsDeleteSubCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDeleteSubCategory} 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting === selectedSubCategory?.id}
            >
              {deleting === selectedSubCategory?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Sub Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}