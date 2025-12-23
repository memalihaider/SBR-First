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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Folder,
  FolderOpen,
  Tag,
  Settings,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { MainCategory, SubCategory, Product } from '@/types';
import { toast } from 'sonner';
import { 
  mainCategoryService, 
  subCategoryService, 
  productService, 
  statsService,
  deleteService 
} from '@/lib/categoryService';

export default function AdminInventoryCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Data states
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [overallStats, setOverallStats] = useState({
    mainCategories: 0,
    subCategories: 0,
    products: 0
  });

  // Dialog states
  const [isAddMainCategoryDialogOpen, setIsAddMainCategoryDialogOpen] = useState(false);
  const [isEditMainCategoryDialogOpen, setIsEditMainCategoryDialogOpen] = useState(false);
  const [isDeleteMainCategoryDialogOpen, setIsDeleteMainCategoryDialogOpen] = useState(false);
  const [isAddSubCategoryDialogOpen, setIsAddSubCategoryDialogOpen] = useState(false);
  const [isEditSubCategoryDialogOpen, setIsEditSubCategoryDialogOpen] = useState(false);
  const [isDeleteSubCategoryDialogOpen, setIsDeleteSubCategoryDialogOpen] = useState(false);

  // Form states
  const [mainCategoryForm, setMainCategoryForm] = useState<Partial<MainCategory>>({
    name: '',
    description: '',
    icon: '',
    isActive: true,
  });

  const [subCategoryForm, setSubCategoryForm] = useState<Partial<SubCategory>>({
    name: '',
    description: '',
    mainCategoryId: '',
    icon: '',
    isActive: true,
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

  // Image upload states
  const [iconMode, setIconMode] = useState<'emoji' | 'image'>('emoji');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Set selected image when editing
  useEffect(() => {
    if (isEditMainCategoryDialogOpen && selectedMainCategory?.icon) {
      if (selectedMainCategory.icon.startsWith('data:image') || 
          selectedMainCategory.icon.startsWith('http')) {
        setSelectedImage(selectedMainCategory.icon);
        setIconMode('image');
      } else {
        setIconMode('emoji');
      }
    }
  }, [isEditMainCategoryDialogOpen, selectedMainCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mainCats, subCats, prods, stats] = await Promise.all([
        mainCategoryService.getAllMainCategories(),
        subCategoryService.getAllSubCategories(),
        productService.getAllProducts(),
        statsService.getOverallStats()
      ]);
      setMainCategories(mainCats);
      setSubCategories(subCats);
      setProducts(prods);
      setOverallStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search
  const filteredMainCategories = useMemo(() => {
    return mainCategories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, mainCategories]);

  // Helper functions
  const getSubCategoriesByMainCategory = (mainCategoryId: string) => {
    return subCategories.filter(sub => sub.mainCategoryId === mainCategoryId);
  };

  const getProductsByMainCategory = (mainCategoryId: string) => {
    return products.filter(product => product.mainCategoryId === mainCategoryId);
  };

  const getProductsBySubCategory = (subCategoryId: string) => {
    return products.filter(product => product.subCategoryId === subCategoryId);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Image upload handlers
  const handleImageUpload = async (file: File) => {
    try {
      setIsImageUploading(true);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setMainCategoryForm({ ...mainCategoryForm, icon: base64String });
        toast.success('Image selected successfully!');
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to process image');
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG)');
      return;
    }

    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    handleImageUpload(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setMainCategoryForm({ ...mainCategoryForm, icon: '' });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Main Category Handlers
  const handleAddMainCategory = () => {
    setMainCategoryForm({
      name: '',
      description: '',
      icon: '',
      isActive: true,
    });
    setIconMode('emoji');
    setSelectedImage(null);
    setIsImageUploading(false);
    setIsAddMainCategoryDialogOpen(true);
  };

  const handleEditMainCategory = (category: MainCategory) => {
    setSelectedMainCategory(category);
    setMainCategoryForm(category);
    
    // Check if icon is image or emoji
    if (category.icon && (category.icon.startsWith('data:image') || category.icon.startsWith('http'))) {
      setIconMode('image');
      setSelectedImage(category.icon);
    } else {
      setIconMode('emoji');
      setSelectedImage(null);
    }
    
    setIsEditMainCategoryDialogOpen(true);
  };

  const handleDeleteMainCategory = (category: MainCategory) => {
    setSelectedMainCategory(category);
    setIsDeleteMainCategoryDialogOpen(true);
  };

  const handleSaveMainCategory = async () => {
    if (!mainCategoryForm.name?.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      if (isAddMainCategoryDialogOpen) {
        const newCategory: Omit<MainCategory, 'id'> = {
          name: mainCategoryForm.name!,
          description: mainCategoryForm.description || '',
          icon: mainCategoryForm.icon || '',
          isActive: mainCategoryForm.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await mainCategoryService.createMainCategory(newCategory);
        toast.success(`Main category "${mainCategoryForm.name}" added successfully!`);
      } else if (isEditMainCategoryDialogOpen && selectedMainCategory) {
        await mainCategoryService.updateMainCategory(selectedMainCategory.id, mainCategoryForm);
        toast.success(`Main category "${mainCategoryForm.name}" updated successfully!`);
      }
      
      await loadData();
      setIsAddMainCategoryDialogOpen(false);
      setIsEditMainCategoryDialogOpen(false);
      setMainCategoryForm({});
      setSelectedMainCategory(null);
      setIconMode('emoji');
      setSelectedImage(null);
    } catch (error) {
      console.error('Error saving main category:', error);
      toast.error('Failed to save category');
    }
  };

  // SIMPLIFIED DELETE HANDLERS - Working Version
  const handleConfirmDeleteMainCategory = async () => {
    if (!selectedMainCategory) return;

    try {
      setDeleting(selectedMainCategory.id);
      
      // 1. First delete all sub-categories under this main category
      const subCategoriesToDelete = getSubCategoriesByMainCategory(selectedMainCategory.id);
      for (const subCategory of subCategoriesToDelete) {
        await subCategoryService.deleteSubCategory(subCategory.id);
      }
      
      // 2. Then delete the main category
      await mainCategoryService.deleteMainCategory(selectedMainCategory.id);
      
      toast.success(`Main category "${selectedMainCategory.name}" deleted successfully!`);
      await loadData();
      setIsDeleteMainCategoryDialogOpen(false);
      setSelectedMainCategory(null);
    } catch (error) {
      console.error('Error deleting main category:', error);
      toast.error('Failed to delete category. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // Sub Category Handlers
  const handleAddSubCategory = (mainCategoryId: string) => {
    setSubCategoryForm({
      name: '',
      description: '',
      mainCategoryId,
      icon: '',
      isActive: true,
    });
    setIsAddSubCategoryDialogOpen(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setSubCategoryForm(subCategory);
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
    } catch (error) {
      console.error('Error saving sub category:', error);
      toast.error('Failed to save sub-category');
    }
  };

  const handleConfirmDeleteSubCategory = async () => {
    if (!selectedSubCategory) return;

    try {
      setDeleting(selectedSubCategory.id);
      
      // Simply delete the sub category
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
  const getCategoryStats = (mainCategoryId: string) => {
    const subCats = getSubCategoriesByMainCategory(mainCategoryId);
    const prods = getProductsByMainCategory(mainCategoryId);
    const activeProducts = prods.filter(p => p.status === 'active');
    
    return {
      subCategories: subCats.length,
      products: prods.length,
      activeProducts: activeProducts.length
    };
  };

  // Dialog close handler
  const handleMainCategoryDialogClose = () => {
    setIsAddMainCategoryDialogOpen(false);
    setIsEditMainCategoryDialogOpen(false);
    setMainCategoryForm({});
    setSelectedMainCategory(null);
    setIconMode('emoji');
    setSelectedImage(null);
    setIsImageUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600" />
          <p className="mt-2 text-gray-600">Loading categories...</p>
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
            <h1 className="text-3xl font-bold text-white">Category Management</h1>
            <p className="text-red-100 mt-1 text-lg">Manage main categories and sub-categories for inventory organization</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-white text-red-600 hover:bg-red-50" onClick={handleAddMainCategory}>
              <Plus className="h-5 w-5 mr-2" />
              Add Main Category
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Main Categories</CardTitle>
            <Folder className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{overallStats.mainCategories}</div>
            <p className="text-sm text-gray-500 mt-1">Active categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Sub Categories</CardTitle>
            <Tag className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{overallStats.subCategories}</div>
            <p className="text-sm text-gray-500 mt-1">Total sub-categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Products</CardTitle>
            <Settings className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{overallStats.products}</div>
            <p className="text-sm text-gray-500 mt-1">Across all categories</p>
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
                  placeholder="Search categories..."
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

      {/* Categories Tree */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl text-gray-900">Category Hierarchy</CardTitle>
          <CardDescription className="text-gray-600">
            {filteredMainCategories.length} main categories with hierarchical sub-categories
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {filteredMainCategories.map((mainCategory) => {
              const stats = getCategoryStats(mainCategory.id);
              const subCategoriesList = getSubCategoriesByMainCategory(mainCategory.id);
              const isExpanded = expandedCategories.has(mainCategory.id);

              return (
                <div key={mainCategory.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Main Category Header */}
                  <div className="bg-linear-to-r from-red-50 to-red-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryExpansion(mainCategory.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center w-8 h-8">
                            {mainCategory.icon?.startsWith('data:image') || 
                             mainCategory.icon?.startsWith('http') ? (
                              <img 
                                src={mainCategory.icon} 
                                alt={mainCategory.name}
                                className="w-6 h-6 object-cover"
                              />
                            ) : (
                              <span className="text-2xl">{mainCategory.icon}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{mainCategory.name}</h3>
                            <p className="text-sm text-gray-600">{mainCategory.description}</p>
                          </div>
                        </div>
                        <Badge variant={mainCategory.isActive ? "default" : "secondary"}>
                          {mainCategory.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-gray-500">
                          <div>{stats.subCategories} sub-categories</div>
                          <div>{stats.products} products ({stats.activeProducts} active)</div>
                        </div>
                       
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMainCategory(mainCategory)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMainCategory(mainCategory)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          disabled={deleting === mainCategory.id}
                        >
                          {deleting === mainCategory.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sub Categories */}
                  {isExpanded && (
                    <div className="bg-gray-50">
                      {subCategoriesList.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {subCategoriesList.map((subCategory) => {
                            const subCategoryProducts = getProductsBySubCategory(subCategory.id);
                            const activeProducts = subCategoryProducts.filter(p => p.status === 'active');

                            return (
                              <div key={subCategory.id} className="p-4 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-6 h-6">
                                      {subCategory.icon?.startsWith('data:image') || 
                                       subCategory.icon?.startsWith('http') ? (
                                        <img 
                                          src={subCategory.icon} 
                                          alt={subCategory.name}
                                          className="w-5 h-5 object-cover"
                                        />
                                      ) : (
                                        <span className="text-xl">{subCategory.icon}</span>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{subCategory.name}</h4>
                                      <p className="text-sm text-gray-600">{subCategory.description}</p>
                                    </div>
                                    <Badge variant={subCategory.isActive ? "outline" : "secondary"} className="text-xs">
                                      {subCategory.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <div className="text-right text-sm text-gray-500">
                                      <div>{subCategoryProducts.length} products ({activeProducts.length} active)</div>
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
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium">No sub-categories yet</p>
                          <p className="text-sm">Click "Add Sub" to create the first sub-category</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredMainCategories.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No categories found</p>
              <p className="text-sm">Try adjusting your search term or add a new category</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Main Category Dialog */}
      <Dialog open={isAddMainCategoryDialogOpen || isEditMainCategoryDialogOpen} onOpenChange={handleMainCategoryDialogClose}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {isAddMainCategoryDialogOpen ? 'Add Main Category' : 'Edit Main Category'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              {isEditMainCategoryDialogOpen ? `Editing ${selectedMainCategory?.name}` : 'Create a new main category for organizing products'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 bg-white">
            <div className="space-y-2">
              <Label htmlFor="mainCategoryName">Category Name *</Label>
              <Input
                id="mainCategoryName"
                value={mainCategoryForm.name}
                onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainCategoryDescription">Description</Label>
              <Textarea
                id="mainCategoryDescription"
                value={mainCategoryForm.description}
                onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, description: e.target.value })}
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            {/* UPDATED ICON SECTION WITH IMAGE UPLOAD */}
            <div className="space-y-2">
              <Label>Icon</Label>
              
              <Tabs value={iconMode} onValueChange={(v) => setIconMode(v as 'emoji' | 'image')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="emoji">Emoji</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                </TabsList>
                
                <TabsContent value="emoji" className="space-y-2 pt-2">
                  <Input
                    id="mainCategoryIcon"
                    value={mainCategoryForm.icon}
                    onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, icon: e.target.value })}
                    placeholder="e.g., ⚡, ⚙️, 🔧"
                  />
                  <p className="text-xs text-gray-500">Enter a single emoji</p>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-4 pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {selectedImage ? (
                    <div className="relative">
                      <div className="relative w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={selectedImage}
                          alt="Selected"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={handleImageClick}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">Upload Image</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Click to browse gallery
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {isImageUploading && (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Processing image...</span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mainCategoryActive"
                checked={mainCategoryForm.isActive}
                onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="mainCategoryActive">Active</Label>
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={handleMainCategoryDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveMainCategory} className="bg-red-600 hover:bg-red-700 text-white">
              {isAddMainCategoryDialogOpen ? 'Add Category' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Sub Category Dialog - NO CHANGES HERE */}
      <Dialog open={isAddSubCategoryDialogOpen || isEditSubCategoryDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddSubCategoryDialogOpen(false);
          setIsEditSubCategoryDialogOpen(false);
          setSubCategoryForm({});
          setSelectedSubCategory(null);
        }
      }}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {isAddSubCategoryDialogOpen ? 'Add Sub Category' : 'Edit Sub Category'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              {isEditSubCategoryDialogOpen ? `Editing ${selectedSubCategory?.name}` : 'Create a new sub-category under the selected main category'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 bg-white">
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
                     {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategoryIcon">Icon (Emoji)</Label>
              <Input
                id="subCategoryIcon"
                value={subCategoryForm.icon}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, icon: e.target.value })}
                placeholder="e.g., 🔸, 🔌, 🔩"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="subCategoryActive"
                checked={subCategoryForm.isActive}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="subCategoryActive">Active</Label>
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => {
              setIsAddSubCategoryDialogOpen(false);
              setIsEditSubCategoryDialogOpen(false);
              setSubCategoryForm({});
              setSelectedSubCategory(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveSubCategory} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isAddSubCategoryDialogOpen ? 'Add Sub Category' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Main Category Dialog */}
      <Dialog open={isDeleteMainCategoryDialogOpen} onOpenChange={setIsDeleteMainCategoryDialogOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              Delete Main Category
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to delete "{selectedMainCategory?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 bg-white">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Deleting this main category will also delete all associated sub-categories and may affect existing products.
              </p>
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => setIsDeleteMainCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDeleteMainCategory} 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting === selectedMainCategory?.id}
            >
              {deleting === selectedMainCategory?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sub Category Dialog */}
      <Dialog open={isDeleteSubCategoryDialogOpen} onOpenChange={setIsDeleteSubCategoryDialogOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
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

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
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



