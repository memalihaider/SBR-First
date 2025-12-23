// lib/returns.ts
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ReturnRequest, ReturnStatus, ReturnType, ReturnReason } from '@/types';

// Firebase collections
const RETURNS_COLLECTION = 'returns';
const PRODUCTS_COLLECTION = 'products';

// Types for Firebase data
export interface FirebaseReturnRequest extends Omit<ReturnRequest, 'id' | 'requestedDate' | 'actualReturnDate' | 'createdAt' | 'updatedAt'> {
  id?: string;
  requestedDate: Timestamp;
  actualReturnDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  currentStock: number;
  isSerialTracked: boolean;
  isBatchTracked: boolean;
}

// Convert Firebase timestamp to Date
const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Convert Date to Firebase timestamp
const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Convert Firebase data to ReturnRequest
const convertToReturnRequest = (data: DocumentData): ReturnRequest => {
  return {
    id: data.id,
    returnNumber: data.returnNumber,
    type: data.type,
    referenceType: data.referenceType,
    referenceId: data.referenceId,
    customerId: data.customerId,
    vendorId: data.vendorId,
    items: data.items,
    totalQuantity: data.totalQuantity,
    totalValue: data.totalValue,
    status: data.status,
    priority: data.priority,
    requestedDate: convertTimestampToDate(data.requestedDate),
    actualReturnDate: data.actualReturnDate ? convertTimestampToDate(data.actualReturnDate) : undefined,
    returnMethod: data.returnMethod,
    customerNotes: data.customerNotes,
    resolutionNotes: data.resolutionNotes,
    trackingNumber: data.trackingNumber,
    refundAmount: data.refundAmount,
    restockingFee: data.restockingFee,
    finalRefundAmount: data.finalRefundAmount,
    createdBy: data.createdBy,
    createdAt: convertTimestampToDate(data.createdAt),
    updatedAt: convertTimestampToDate(data.updatedAt)
  };
};

// Utility function to remove undefined fields
const removeUndefinedFields = (obj: any): any => {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

// Return CRUD Operations
export const returnsService = {
  // Create new return
  async createReturn(returnData: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Remove undefined fields before saving to Firebase
      const cleanReturnData = removeUndefinedFields(returnData);
      
      // Clean items array as well
      if (cleanReturnData.items) {
        cleanReturnData.items = cleanReturnData.items.map((item: any) => removeUndefinedFields(item));
      }

      const firebaseReturn: Omit<FirebaseReturnRequest, 'id'> = {
        ...cleanReturnData,
        requestedDate: convertDateToTimestamp(returnData.requestedDate),
        actualReturnDate: returnData.actualReturnDate ? convertDateToTimestamp(returnData.actualReturnDate) : undefined,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Clean the firebase return object as well
      const cleanFirebaseReturn = removeUndefinedFields(firebaseReturn);

      const docRef = await addDoc(collection(db, RETURNS_COLLECTION), cleanFirebaseReturn);
      return docRef.id;
    } catch (error) {
      console.error('Error creating return:', error);
      throw new Error('Failed to create return');
    }
  },

  // Update return
  async updateReturn(returnId: string, updates: Partial<ReturnRequest>): Promise<void> {
    try {
      const returnRef = doc(db, RETURNS_COLLECTION, returnId);
      const cleanUpdates = removeUndefinedFields(updates);
      
      const firebaseUpdates: any = {
        ...cleanUpdates,
        updatedAt: Timestamp.now()
      };

      // Convert Date fields to Timestamp if they exist
      if (updates.actualReturnDate) {
        firebaseUpdates.actualReturnDate = convertDateToTimestamp(updates.actualReturnDate);
      }

      await updateDoc(returnRef, removeUndefinedFields(firebaseUpdates));
    } catch (error) {
      console.error('Error updating return:', error);
      throw new Error('Failed to update return');
    }
  },

  // Delete return
  async deleteReturn(returnId: string): Promise<void> {
    try {
      const returnRef = doc(db, RETURNS_COLLECTION, returnId);
      await deleteDoc(returnRef);
    } catch (error) {
      console.error('Error deleting return:', error);
      throw new Error('Failed to delete return');
    }
  },

  // Get single return
  async getReturn(returnId: string): Promise<ReturnRequest | null> {
    try {
      const returnRef = doc(db, RETURNS_COLLECTION, returnId);
      const returnSnap = await getDoc(returnRef);
      
      if (returnSnap.exists()) {
        return convertToReturnRequest({ id: returnSnap.id, ...returnSnap.data() });
      }
      return null;
    } catch (error) {
      console.error('Error getting return:', error);
      throw new Error('Failed to get return');
    }
  },

  // Get all returns with real-time listener
  getReturnsRealTime(callback: (returns: ReturnRequest[]) => void): () => void {
    const q = query(
      collection(db, RETURNS_COLLECTION), 
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const returns: ReturnRequest[] = [];
      querySnapshot.forEach((doc) => {
        returns.push(convertToReturnRequest({ id: doc.id, ...doc.data() }));
      });
      callback(returns);
    });
  },

  // Get returns by status
  getReturnsByStatusRealTime(status: ReturnStatus, callback: (returns: ReturnRequest[]) => void): () => void {
    const q = query(
      collection(db, RETURNS_COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const returns: ReturnRequest[] = [];
      querySnapshot.forEach((doc) => {
        returns.push(convertToReturnRequest({ id: doc.id, ...doc.data() }));
      });
      callback(returns);
    });
  },

  // Get returns statistics real-time
  getReturnsStatsRealTime(callback: (stats: {
    total: number;
    pending: number;
    approved: number;
    processed: number;
    totalValue: number;
  }) => void): () => void {
    return onSnapshot(collection(db, RETURNS_COLLECTION), (querySnapshot) => {
      const returns: ReturnRequest[] = [];
      querySnapshot.forEach((doc) => {
        returns.push(convertToReturnRequest({ id: doc.id, ...doc.data() }));
      });

      const total = returns.length;
      const pending = returns.filter(r => r.status === 'pending').length;
      const approved = returns.filter(r => r.status === 'approved').length;
      const processed = returns.filter(r => ['refunded', 'replaced'].includes(r.status)).length;
      const totalValue = returns.reduce((sum, r) => sum + r.totalValue, 0);

      callback({ total, pending, approved, processed, totalValue });
    });
  }
};

// Products Service for dropdown
export const productsService = {
  // Get all products for dropdown
  getProductsRealTime(callback: (products: Product[]) => void): () => void {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name'));

    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      callback(products);
    });
  },

  // Update product stock
  async updateProductStock(productId: string, newStock: number): Promise<void> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      await updateDoc(productRef, {
        currentStock: newStock,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw new Error('Failed to update product stock');
    }
  },

  // Get single product
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        return { id: productSnap.id, ...productSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Failed to get product');
    }
  }
};

// Generate return number
export const generateReturnNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `RTN-${timestamp}`;
};