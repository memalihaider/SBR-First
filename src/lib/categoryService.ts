import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query,
  where,
  orderBy,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { MainCategory, SubCategory, Product } from '@/types';

// Main Categories Service
export const mainCategoryService = {
  // Get all main categories
  async getAllMainCategories(): Promise<MainCategory[]> {
    try {
      const q = query(collection(db, 'mainCategories'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as MainCategory));
    } catch (error) {
      console.error('Error getting main categories:', error);
      throw error;
    }
  },

  // Get main category by ID
  async getMainCategoryById(id: string): Promise<MainCategory | null> {
    try {
      const docRef = doc(db, 'mainCategories', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as MainCategory;
      }
      return null;
    } catch (error) {
      console.error('Error getting main category:', error);
      throw error;
    }
  },

  // Create main category
  async createMainCategory(category: Omit<MainCategory, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'mainCategories'), {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating main category:', error);
      throw error;
    }
  },

  // Update main category
  async updateMainCategory(id: string, category: Partial<MainCategory>): Promise<void> {
    try {
      const docRef = doc(db, 'mainCategories', id);
      await updateDoc(docRef, {
        ...category,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating main category:', error);
      throw error;
    }
  },

  // Delete main category
  async deleteMainCategory(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'mainCategories', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting main category:', error);
      throw error;
    }
  }
};

// Sub Categories Service
export const subCategoryService = {
  // Get all sub categories
  async getAllSubCategories(): Promise<SubCategory[]> {
    try {
      const q = query(collection(db, 'subCategories'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as SubCategory));
    } catch (error) {
      console.error('Error getting sub categories:', error);
      throw error;
    }
  },

  // Get sub categories by main category ID
  async getSubCategoriesByMainCategory(mainCategoryId: string): Promise<SubCategory[]> {
    try {
      const q = query(
        collection(db, 'subCategories'), 
        where('mainCategoryId', '==', mainCategoryId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as SubCategory));
    } catch (error) {
      console.error('Error getting sub categories by main category:', error);
      throw error;
    }
  },

  // Get sub category by ID
  async getSubCategoryById(id: string): Promise<SubCategory | null> {
    try {
      const docRef = doc(db, 'subCategories', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as SubCategory;
      }
      return null;
    } catch (error) {
      console.error('Error getting sub category:', error);
      throw error;
    }
  },

  // Create sub category
  async createSubCategory(category: Omit<SubCategory, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'subCategories'), {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating sub category:', error);
      throw error;
    }
  },

  // Update sub category
  async updateSubCategory(id: string, category: Partial<SubCategory>): Promise<void> {
    try {
      const docRef = doc(db, 'subCategories', id);
      await updateDoc(docRef, {
        ...category,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating sub category:', error);
      throw error;
    }
  },

  // Delete sub category
  async deleteSubCategory(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'subCategories', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting sub category:', error);
      throw error;
    }
  },

  // Delete all sub categories by main category ID
  async deleteSubCategoriesByMainCategory(mainCategoryId: string): Promise<void> {
    try {
      const subCategories = await this.getSubCategoriesByMainCategory(mainCategoryId);
      const deletePromises = subCategories.map(subCategory => 
        this.deleteSubCategory(subCategory.id)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting sub categories by main category:', error);
      throw error;
    }
  }
};

// Products Service (for stats)
export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Product));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Get products by main category ID
  async getProductsByMainCategory(mainCategoryId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, 'products'), 
        where('mainCategoryId', '==', mainCategoryId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Product));
    } catch (error) {
      console.error('Error getting products by main category:', error);
      throw error;
    }
  },

  // Get products by sub category ID
  async getProductsBySubCategory(subCategoryId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, 'products'), 
        where('subCategoryId', '==', subCategoryId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Product));
    } catch (error) {
      console.error('Error getting products by sub category:', error);
      throw error;
    }
  },

  // Update products when category is deleted - SIMPLIFIED VERSION
  async updateProductsOnCategoryDelete(mainCategoryId?: string, subCategoryId?: string): Promise<void> {
    try {
      let q;
      if (mainCategoryId) {
        q = query(collection(db, 'products'), where('mainCategoryId', '==', mainCategoryId));
      } else if (subCategoryId) {
        q = query(collection(db, 'products'), where('subCategoryId', '==', subCategoryId));
      } else {
        return;
      }

      const querySnapshot = await getDocs(q!);
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((doc) => {
        const updateData: any = {};
        if (mainCategoryId) {
          updateData.mainCategoryId = '';
          updateData.subCategoryId = '';
        } else if (subCategoryId) {
          updateData.subCategoryId = '';
        }
        updateData.updatedAt = new Date();
        batch.update(doc.ref, updateData);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating products on category delete:', error);
      // Don't throw error here, just log it
      console.log('Continuing with category deletion despite product update error');
    }
  }
};

// Delete Service - Specialized for deletion operations
export const deleteService = {
  // Delete main category with all its sub categories and update products
  async deleteMainCategoryCompletely(mainCategoryId: string): Promise<void> {
    try {
      // 1. First update products to remove category references
      await productService.updateProductsOnCategoryDelete(mainCategoryId);
      
      // 2. Delete all sub categories under this main category
      const subCategories = await subCategoryService.getSubCategoriesByMainCategory(mainCategoryId);
      const deleteSubCategoryPromises = subCategories.map(subCategory => 
        subCategoryService.deleteSubCategory(subCategory.id)
      );
      await Promise.all(deleteSubCategoryPromises);
      
      // 3. Finally delete the main category
      await mainCategoryService.deleteMainCategory(mainCategoryId);
    } catch (error) {
      console.error('Error in complete main category deletion:', error);
      throw error;
    }
  },

  // Delete sub category and update products
  async deleteSubCategoryCompletely(subCategoryId: string): Promise<void> {
    try {
      // 1. Update products to remove sub category reference
      await productService.updateProductsOnCategoryDelete(undefined, subCategoryId);
      
      // 2. Delete the sub category
      await subCategoryService.deleteSubCategory(subCategoryId);
    } catch (error) {
      console.error('Error in complete sub category deletion:', error);
      throw error;
    }
  }
};

// Stats Service
export const statsService = {
  async getCategoryStats(mainCategoryId: string) {
    try {
      const [subCategories, products] = await Promise.all([
        subCategoryService.getSubCategoriesByMainCategory(mainCategoryId),
        productService.getProductsByMainCategory(mainCategoryId)
      ]);

      const activeProducts = products.filter(p => p.status === 'active');

      return {
        subCategories: subCategories.length,
        products: products.length,
        activeProducts: activeProducts.length
      };
    } catch (error) {
      console.error('Error getting category stats:', error);
      return {
        subCategories: 0,
        products: 0,
        activeProducts: 0
      };
    }
  },

  async getOverallStats() {
    try {
      const [mainCategories, subCategories, products] = await Promise.all([
        mainCategoryService.getAllMainCategories(),
        subCategoryService.getAllSubCategories(),
        productService.getAllProducts()
      ]);

      return {
        mainCategories: mainCategories.length,
        subCategories: subCategories.length,
        products: products.length
      };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      return {
        mainCategories: 0,
        subCategories: 0,
        products: 0
      };
    }
  }
};

