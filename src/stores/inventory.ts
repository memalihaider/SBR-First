'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

interface Supplier {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: Date;
}

interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'increase' | 'decrease' | 'transfer';
  quantity: number;
  reason: string;
  adjustedBy: string;
  date: Date;
  reference?: string;
}

interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDelivery: Date;
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
}

interface InventoryStore {
  categories: Category[];
  suppliers: Supplier[];
  stockAdjustments: StockAdjustment[];
  purchaseOrders: PurchaseOrder[];
  addCategory: (name: string, description?: string) => void;
  addSupplier: (name: string, contactEmail?: string, contactPhone?: string, address?: string) => void;
  getCategories: () => Category[];
  getSuppliers: () => Supplier[];
  addStockAdjustment: (adjustment: Omit<StockAdjustment, 'id' | 'date'>) => void;
  getStockAdjustments: (productId?: string) => StockAdjustment[];
  updateProductStock: (productId: string, newStock: number) => void;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'poNumber' | 'orderDate'>) => void;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrder['status']) => void;
  getPurchaseOrders: () => PurchaseOrder[];
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
}

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Semiconductors', createdAt: new Date() },
  { id: '2', name: 'Test Equipment', createdAt: new Date() },
  { id: '3', name: 'Components', createdAt: new Date() },
  { id: '4', name: 'Cables', createdAt: new Date() },
  { id: '5', name: 'Tools', createdAt: new Date() },
  { id: '6', name: 'Accessories', createdAt: new Date() },
];

// Default suppliers
const defaultSuppliers: Supplier[] = [
  { id: '1', name: 'TechSupply Co.', contactEmail: 'contact@techsupply.com', contactPhone: '+1-555-0101', createdAt: new Date() },
  { id: '2', name: 'Global Parts Ltd.', contactEmail: 'sales@globalparts.com', contactPhone: '+1-555-0102', createdAt: new Date() },
  { id: '3', name: 'Premium Supplies Inc.', contactEmail: 'info@premiumsupplies.com', contactPhone: '+1-555-0103', createdAt: new Date() },
  { id: '4', name: 'ElectroHub', contactEmail: 'orders@electrohub.com', contactPhone: '+1-555-0104', createdAt: new Date() },
  { id: '5', name: 'Component Masters', contactEmail: 'support@componentmasters.com', contactPhone: '+1-555-0105', createdAt: new Date() },
];

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,
      suppliers: defaultSuppliers,
      stockAdjustments: [],
      purchaseOrders: [],

      addCategory: (name: string, description?: string) => {
        const newCategory: Category = {
          id: Date.now().toString(),
          name,
          description,
          createdAt: new Date(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      addSupplier: (name: string, contactEmail?: string, contactPhone?: string, address?: string) => {
        const newSupplier: Supplier = {
          id: Date.now().toString(),
          name,
          contactEmail,
          contactPhone,
          address,
          createdAt: new Date(),
        };
        set((state) => ({
          suppliers: [...state.suppliers, newSupplier],
        }));
      },

      getCategories: () => get().categories,
      getSuppliers: () => get().suppliers,

      addStockAdjustment: (adjustment) => {
        const newAdjustment: StockAdjustment = {
          id: `ADJ-${Date.now()}`,
          ...adjustment,
          date: new Date(),
        };
        set((state) => ({
          stockAdjustments: [...state.stockAdjustments, newAdjustment],
        }));
      },

      getStockAdjustments: (productId?: string) => {
        const adjustments = get().stockAdjustments;
        if (productId) {
          return adjustments.filter(adj => adj.productId === productId);
        }
        return adjustments;
      },

      updateProductStock: (productId: string, newStock: number) => {
        // This would typically update the product in a products store
        // For now, we'll just log it as the products are in mock data
        console.log(`Updated stock for product ${productId} to ${newStock}`);
      },

      addPurchaseOrder: (order) => {
        const newOrder: PurchaseOrder = {
          id: `PO-${Date.now()}`,
          poNumber: `PO-${new Date().getFullYear()}-${String(get().purchaseOrders.length + 1).padStart(4, '0')}`,
          ...order,
          orderDate: new Date(),
        };
        set((state) => ({
          purchaseOrders: [...state.purchaseOrders, newOrder],
        }));
      },

      updatePurchaseOrderStatus: (id: string, status: PurchaseOrder['status']) => {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map(po =>
            po.id === id ? { ...po, status } : po
          ),
        }));
      },

      getPurchaseOrders: () => get().purchaseOrders,

      getPurchaseOrderById: (id: string) => {
        return get().purchaseOrders.find(po => po.id === id);
      },
    }),
    {
      name: 'inventory-store',
    }
  )
);