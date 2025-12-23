import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

const QUOTATIONS_COLLECTION = 'quotations';

// Add new quotation
export const addQuotation = async (quotationData) => {
  try {
    const docRef = await addDoc(collection(db, QUOTATIONS_COLLECTION), {
      ...quotationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...quotationData };
  } catch (error) {
    console.error('Error adding quotation:', error);
    throw error;
  }
};

// Update quotation
export const updateQuotation = async (id, quotationData) => {
  try {
    const quotationRef = doc(db, QUOTATIONS_COLLECTION, id);
    await updateDoc(quotationRef, {
      ...quotationData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...quotationData };
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
};

// Delete quotation
export const deleteQuotation = async (id) => {
  try {
    await deleteDoc(doc(db, QUOTATIONS_COLLECTION, id));
    return id;
  } catch (error) {
    console.error('Error deleting quotation:', error);
    throw error;
  }
};

// Get all quotations
export const getAllQuotations = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, QUOTATIONS_COLLECTION), orderBy('createdAt', 'desc'))
    );
    const quotations = [];
    querySnapshot.forEach((doc) => {
      quotations.push({ id: doc.id, ...doc.data() });
    });
    return quotations;
  } catch (error) {
    console.error('Error getting quotations:', error);
    throw error;
  }
};

// Get quotation by ID
export const getQuotationById = async (id) => {
  try {
    const docRef = doc(db, QUOTATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Quotation not found');
    }
  } catch (error) {
    console.error('Error getting quotation:', error);
    throw error;
  }
};

// Real-time quotations listener
export const subscribeToQuotations = (callback) => {
  const q = query(collection(db, QUOTATIONS_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const quotations = [];
    querySnapshot.forEach((doc) => {
      quotations.push({ id: doc.id, ...doc.data() });
    });
    callback(quotations);
  });
};

// Get quotations by status
export const getQuotationsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, QUOTATIONS_COLLECTION), 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const quotations = [];
    querySnapshot.forEach((doc) => {
      quotations.push({ id: doc.id, ...doc.data() });
    });
    return quotations;
  } catch (error) {
    console.error('Error getting quotations by status:', error);
    throw error;
  }
};