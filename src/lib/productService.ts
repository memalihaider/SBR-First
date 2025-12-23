// import { 
//   collection, 
//   addDoc, 
//   updateDoc, 
//   deleteDoc, 
//   doc, 
//   getDocs, 
//   query,
//   where,
//   orderBy,
//   getDoc
// } from 'firebase/firestore';
// import { db } from './firebase';
// import { Product, ProductStatus } from '@/types';

// export const productService = {
//   // Get all products
//   async getAllProducts(): Promise<Product[]> {
//     try {
//       const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(q);
//       return querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate() || new Date(),
//         updatedAt: doc.data().updatedAt?.toDate() || new Date()
//       } as Product));
//     } catch (error) {
//       console.error('Error getting products:', error);
//       throw error;
//     }
//   },

//   // Get product by ID
//   async getProductById(id: string): Promise<Product | null> {
//     try {
//       const docRef = doc(db, 'products', id);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         return { 
//           id: docSnap.id, 
//           ...data,
//           createdAt: data.createdAt?.toDate() || new Date(),
//           updatedAt: data.updatedAt?.toDate() || new Date()
//         } as Product;
//       }
//       return null;
//     } catch (error) {
//       console.error('Error getting product:', error);
//       throw error;
//     }
//   },

//   // Create product
//   async createProduct(product: Omit<Product, 'id'>): Promise<string> {
//     try {
//       // Calculate margin
//       const margin = product.costPrice > 0 ? (product.sellingPrice - product.costPrice) / product.costPrice : 0;
      
//       const docRef = await addDoc(collection(db, 'products'), {
//         ...product,
//         margin,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       });
//       return docRef.id;
//     } catch (error) {
//       console.error('Error creating product:', error);
//       throw error;
//     }
//   },

//   // Update product
//   async updateProduct(id: string, product: Partial<Product>): Promise<void> {
//     try {
//       const docRef = doc(db, 'products', id);
      
//       // Calculate margin if prices are being updated
//       let updateData: any = { ...product };
//       if (product.costPrice !== undefined || product.sellingPrice !== undefined) {
//         const existingProduct = await this.getProductById(id);
//         if (existingProduct) {
//           const costPrice = product.costPrice ?? existingProduct.costPrice;
//           const sellingPrice = product.sellingPrice ?? existingProduct.sellingPrice;
//           updateData.margin = costPrice > 0 ? (sellingPrice - costPrice) / costPrice : 0;
//         }
//       }
      
//       await updateDoc(docRef, {
//         ...updateData,
//         updatedAt: new Date()
//       });
//     } catch (error) {
//       console.error('Error updating product:', error);
//       throw error;
//     }
//   },

//   // Delete product
//   async deleteProduct(id: string): Promise<void> {
//     try {
//       const docRef = doc(db, 'products', id);
//       await deleteDoc(docRef);
//     } catch (error) {
//       console.error('Error deleting product:', error);
//       throw error;
//     }
//   },

//   // Get products by main category
//   async getProductsByMainCategory(mainCategoryId: string): Promise<Product[]> {
//     try {
//       const q = query(
//         collection(db, 'products'), 
//         where('mainCategoryId', '==', mainCategoryId)
//       );
//       const querySnapshot = await getDocs(q);
//       return querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate() || new Date(),
//         updatedAt: doc.data().updatedAt?.toDate() || new Date()
//       } as Product));
//     } catch (error) {
//       console.error('Error getting products by main category:', error);
//       throw error;
//     }
//   },

//   // Get products by sub category
//   async getProductsBySubCategory(subCategoryId: string): Promise<Product[]> {
//     try {
//       const q = query(
//         collection(db, 'products'), 
//         where('subCategoryId', '==', subCategoryId)
//       );
//       const querySnapshot = await getDocs(q);
//       return querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate() || new Date(),
//         updatedAt: doc.data().updatedAt?.toDate() || new Date()
//       } as Product));
//     } catch (error) {
//       console.error('Error getting products by sub category:', error);
//       throw error;
//     }
//   }
// };

// // Stats service for products
// export const productStatsService = {
//   async getProductStats() {
//     try {
//       const products = await productService.getAllProducts();
      
//       const totalProducts = products.length;
//       const lowStockItems = products.filter(p => p.currentStock <= p.minStockLevel && p.currentStock > 0).length;
//       const outOfStock = products.filter(p => p.currentStock === 0).length;
//       const totalInventoryValue = products.reduce((sum, p) => sum + (p.costPrice * p.currentStock), 0);
      
//       return {
//         totalProducts,
//         lowStockItems,
//         outOfStock,
//         totalInventoryValue
//       };
//     } catch (error) {
//       console.error('Error getting product stats:', error);
//       return {
//         totalProducts: 0,
//         lowStockItems: 0,
//         outOfStock: 0,
//         totalInventoryValue: 0
//       };
//     }
//   }
// };

// new code
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
import { Product, ProductStatus } from '@/types';

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

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  // Create product
  async createProduct(product: Omit<Product, 'id'>): Promise<string> {
    try {
      // Calculate margin
      const margin = product.costPrice > 0 ? (product.sellingPrice - product.costPrice) / product.costPrice : 0;
      
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        margin,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(db, 'products', id);
      
      // Calculate margin if prices are being updated
      let updateData: any = { ...product };
      if (product.costPrice !== undefined || product.sellingPrice !== undefined) {
        const existingProduct = await this.getProductById(id);
        if (existingProduct) {
          const costPrice = product.costPrice ?? existingProduct.costPrice;
          const sellingPrice = product.sellingPrice ?? existingProduct.sellingPrice;
          updateData.margin = costPrice > 0 ? (sellingPrice - costPrice) / costPrice : 0;
        }
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get products by main category
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

  // Get products by sub category
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
  }
};

// Stats service for products
export const productStatsService = {
  async getProductStats() {
    try {
      const products = await productService.getAllProducts();
      
      const totalProducts = products.length;
      const lowStockItems = products.filter(p => p.currentStock <= p.minStockLevel && p.currentStock > 0).length;
      const outOfStock = products.filter(p => p.currentStock === 0).length;
      const totalInventoryValue = products.reduce((sum, p) => sum + (p.costPrice * p.currentStock), 0);
      
      return {
        totalProducts,
        lowStockItems,
        outOfStock,
        totalInventoryValue
      };
    } catch (error) {
      console.error('Error getting product stats:', error);
      return {
        totalProducts: 0,
        lowStockItems: 0,
        outOfStock: 0,
        totalInventoryValue: 0
      };
    }
  }
};




