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
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Vendor, MainCategory, Product } from '@/types';

export const supplierService = {
  // Get all suppliers
  async getAllSuppliers(): Promise<Vendor[]> {
    try {
      const q = query(collection(db, 'suppliers'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Vendor));
    } catch (error) {
      console.error('Error getting suppliers:', error);
      throw error;
    }
  },

  // Get supplier by ID
  async getSupplierById(id: string): Promise<Vendor | null> {
    try {
      const docRef = doc(db, 'suppliers', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Vendor;
      }
      return null;
    } catch (error) {
      console.error('Error getting supplier:', error);
      throw error;
    }
  },

  // Create supplier
  async createSupplier(supplier: Omit<Vendor, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'suppliers'), {
        ...supplier,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  // Update supplier
  async updateSupplier(id: string, supplier: Partial<Vendor>): Promise<void> {
    try {
      const docRef = doc(db, 'suppliers', id);
      await updateDoc(docRef, {
        ...supplier,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  },

  // Delete supplier
  async deleteSupplier(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'suppliers', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  },

  // Get suppliers by status
  async getSuppliersByStatus(status: string): Promise<Vendor[]> {
    try {
      const q = query(
        collection(db, 'suppliers'), 
        where('status', '==', status)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Vendor));
    } catch (error) {
      console.error('Error getting suppliers by status:', error);
      throw error;
    }
  }
};

// Stats service for suppliers
export const supplierStatsService = {
  async getSupplierStats() {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      
      const totalSuppliers = suppliers.length;
      const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
      const totalCategories = suppliers.reduce((sum, s) => sum + s.productCategories.length, 0);
      const averageRating = suppliers.length > 0 
        ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length 
        : 0;
      
      return {
        totalSuppliers,
        activeSuppliers,
        totalCategories,
        averageRating
      };
    } catch (error) {
      console.error('Error getting supplier stats:', error);
      return {
        totalSuppliers: 0,
        activeSuppliers: 0,
        totalCategories: 0,
        averageRating: 0
      };
    }
  }
};

// Service to get main categories and products
export const dataService = {
  // Get all main categories
  async getAllMainCategories(): Promise<MainCategory[]> {
    try {
      const q = query(collection(db, 'mainCategories'), orderBy('name', 'asc'));
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

  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'));
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
  }
};