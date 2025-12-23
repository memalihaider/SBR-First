// lib/serviceService.ts
import { Service } from '@/types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

const servicesCollection = collection(db, 'services');

export const serviceService = {
  // Get all services
  async getAllServices(): Promise<Service[]> {
    try {
      const snapshot = await getDocs(servicesCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
    } catch (error) {
      console.error('Error getting services:', error);
      return [];
    }
  },

  // Create new service
  async createService(serviceData: Omit<Service, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(servicesCollection, {
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Update service
  async updateService(id: string, serviceData: Partial<Service>): Promise<void> {
    try {
      const docRef = doc(db, 'services', id);
      await updateDoc(docRef, {
        ...serviceData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Delete service
  async deleteService(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'services', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }
};