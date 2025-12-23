// =======================
// CORE SYSTEM TYPES
// =======================

export type UserRole = 
  | 'super_admin'
  | 'sales_manager'
  | 'sales_rep'
  | 'inventory_manager'
  | 'project_manager'
  | 'finance_manager'
  | 'hr_manager'
  | 'employee'
  | 'client'
  | 'vendor';

export type Permission = 
  | 'read'
  | 'write'
  | 'approve'
  | 'admin'
  | 'delete';

export type Module = 
  | 'dashboard'
  | 'users'
  | 'crm'
  | 'inventory'
  | 'projects'
  | 'finance'
  | 'hr'
  | 'quotations'
  | 'reports'
  | 'settings';

export interface RolePermissions {
  role: UserRole;
  modules: Record<Module, Permission[]>;
  dataScope: 'global' | 'department' | 'assigned' | 'own';
}

// =======================
// USER & AUTHENTICATION
// =======================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  permissions: RolePermissions;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// =======================
// CRM & SALES TYPES
// =======================

export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiating'
  | 'closed_won'
  | 'closed_lost';

export type CustomerType = 
  | 'enterprise'
  | 'sme'
  | 'government'
  | 'individual';

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  estimatedValue: number;
  probability: number;
  expectedCloseDate: Date;
  assignedTo: string; // User ID
  notes: string[];
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  companyName: string;
  customerType: CustomerType;
  industry: string;
  website?: string;
  taxId?: string;
  
  // Primary Contact
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  
  phoneNumbers: { type: string; number: string; }[];
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  
  // Business Info
  creditLimit: number;
  paymentTerms: string;
  isActive: boolean;
  
  // Relationships
  assignedSalesRep: string; // User ID
  projects: string[]; // Project IDs
  totalRevenue: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  description: string;
  relatedTo: {
    type: 'lead' | 'customer' | 'project';
    id: string;
  };
  createdBy: string; // User ID
  scheduledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

// =======================
// INVENTORY & PRODUCTS
// =======================

export type ProductCategory = string; // Now a string to support hierarchical categories

export type ProductStatus =
  | 'active'
  | 'discontinued'
  | 'out_of_stock'
  | 'low_stock';

export interface MainCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  mainCategoryId: string; // Reference to MainCategory
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  productType: string;
  description: string;
  orderSpecification: string;
  mainCategoryId: string; // Reference to MainCategory
  subCategoryId: string; // Reference to SubCategory
  category: ProductCategory; // Legacy field, now represents the full path (e.g., "Electronics/Semiconductors")
  manufacturer: string;
  supplierName: string;
  modelNumber?: string;

  // Pricing
  costPrice: number;
  sellingPrice: number;
  margin: number;
  marginPercentage: number;
  shippingCharges: number;

  // Inventory
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;

  // Specifications
  specifications: Record<string, string>;
  images: string[];
  datasheet?: string;

  // Status
  status: ProductStatus;
  isSerialTracked: boolean;
  isBatchTracked: boolean;
  services: ProductService[];
  totalWithServices: number;

  // Vendor Info
  preferredVendor: string; // Vendor ID
  alternateVendors: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  productId: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  
  // References
  referenceType?: 'purchase_order' | 'sales_order' | 'project' | 'return_request';
  referenceId?: string;
  
  // Location
  fromWarehouse?: string;
  toWarehouse?: string;
  
  // Tracking
  serialNumbers?: string[];
  batchNumber?: string;
  
  createdBy: string; // User ID
  createdAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  manager: string; // User ID
  capacity: number;
  isActive: boolean;
  createdAt: Date;
}

// =======================
// RETURNS & PRODUCT RETURNS
// =======================

export type ReturnReason =
  | 'defective'
  | 'wrong_item'
  | 'damaged'
  | 'customer_dissatisfaction'
  | 'expired'
  | 'overstock'
  | 'quality_issue'
  | 'other';

export type ReturnStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'received'
  | 'inspected'
  | 'refunded'
  | 'replaced'
  | 'cancelled';

export type ReturnType =
  | 'customer_return'
  | 'vendor_return'
  | 'internal_return';

export interface ReturnItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reason: ReturnReason;
  condition: 'new' | 'used' | 'damaged' | 'defective';
  notes?: string;
  images?: string[];
  serialNumbers?: string[];
  batchNumber?: string;
}

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  type: ReturnType;
  
  // References
  referenceType?: 'sales_order' | 'purchase_order' | 'project';
  referenceId?: string;
  customerId?: string; // For customer returns
  vendorId?: string; // For vendor returns
  
  // Return Details
  items: ReturnItem[];
  totalQuantity: number;
  totalValue: number;
  
  // Status & Processing
  status: ReturnStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Dates
  requestedDate: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  processedDate?: Date;
  
  // Processing Info
  inspectedBy?: string; // User ID
  approvedBy?: string; // User ID
  rejectedReason?: string;
  
  // Financial
  refundAmount?: number;
  restockingFee?: number;
  finalRefundAmount?: number;
  
  // Logistics
  returnMethod: 'pickup' | 'drop_off' | 'mail';
  trackingNumber?: string;
  warehouseLocation?: string;
  
  // Notes & Comments
  customerNotes?: string;
  internalNotes?: string;
  resolutionNotes?: string;
  
  // Audit
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

// =======================
// VENDOR & PROCUREMENT
// =======================

export type VendorStatus = 'active' | 'inactive' | 'blacklisted';

export interface Vendor {
  id: string;
  companyName: string;
  vendorCode: string;
  
  // Contact Information
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  
  // Business Details
  taxId: string;
  paymentTerms: string;
  creditDays: number;
  
  // Performance Metrics
  rating: number; // 1-5
  onTimeDeliveryRate: number;
  qualityRating: number;
  
  // Categories
  productCategories: string[]; // Now array of strings for hierarchical categories
  suppliedProducts: string[];
  
  status: VendorStatus;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export type PurchaseOrderStatus = 
  | 'draft'
  | 'sent'
  | 'acknowledged'
  | 'partially_received'
  | 'completed'
  | 'cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  status: PurchaseOrderStatus;
  
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    deliveryDate: Date;
  }>;
  
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  
  deliveryAddress: string;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  
  createdBy: string; // User ID
  approvedBy?: string; // User ID
  
  createdAt: Date;
  updatedAt: Date;
}

// =======================
// PROJECTS & QUOTATIONS
// =======================

export type ProjectStatus = 
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type ProjectType = 
  | 'installation'
  | 'maintenance'
  | 'consulting'
  | 'supply_only'
  | 'turnkey';

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  
  // Client Information
  customerId: string;
  
  // Timeline
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Financial
  budgetAmount: number;
  actualCost: number;
  profitMargin: number;
  
  // Team
  projectManager: string; // User ID
  teamMembers: string[]; // User IDs
  
  // Progress
  completionPercentage: number;
  milestones: Milestone[];
  
  // Documents
  documents: ProjectDocument[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  isCompleted: boolean;
  deliverables: string[];
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'contract' | 'specification' | 'drawing' | 'report' | 'boq' | 'other';
  url: string;
  uploadedBy: string; // User ID
  uploadedAt: Date;
}

// =======================
// BILL OF QUANTITIES (BOQ)
// =======================

export type BOQStatus = 
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'sent_to_client'
  | 'accepted'
  | 'rejected'
  | 'expired';

export type BOQItemType = 
  | 'material'
  | 'labor'
  | 'equipment'
  | 'subcontract'
  | 'overhead'
  | 'contingency';

export type BOQMainCategory = 
  | 'civil_works'
  | 'electrical'
  | 'mechanical'
  | 'plumbing'
  | 'hvac'
  | 'fire_safety'
  | 'security'
  | 'finishing'
  | 'landscaping'
  | 'other';

export type BOQSubCategory = 
  // Civil Works
  | 'excavation'
  | 'foundation'
  | 'concrete'
  | 'masonry'
  | 'structural_steel'
  | 'roofing'
  // Electrical
  | 'wiring'
  | 'lighting'
  | 'switchgear'
  | 'transformers'
  | 'generators'
  | 'cabling'
  | 'earthing'
  // Mechanical
  | 'pumps'
  | 'compressors'
  | 'conveyors'
  | 'elevators'
  | 'cranes'
  | 'machinery'
  // Plumbing
  | 'water_supply'
  | 'drainage'
  | 'sewage'
  | 'fire_hydrants'
  | 'water_tanks'
  // HVAC
  | 'air_conditioning'
  | 'ventilation'
  | 'ducting'
  | 'chillers'
  | 'boilers'
  // Fire Safety
  | 'sprinklers'
  | 'fire_extinguishers'
  | 'alarms'
  | 'hydrants'
  // Security
  | 'cctv'
  | 'access_control'
  | 'intrusion_detection'
  | 'fencing'
  // Finishing
  | 'painting'
  | 'flooring'
  | 'ceiling'
  | 'doors_windows'
  | 'furniture'
  // Landscaping
  | 'hardscaping'
  | 'softscaping'
  | 'irrigation'
  // Other
  | 'custom';

export interface BOQItem {
  id: string;
  itemNumber: string;
  description: string;
  type: BOQItemType;
  mainCategory: BOQMainCategory;
  subCategory: BOQSubCategory;
  category: string; // Full category path (e.g., "Electrical/Lighting")
  unit: string; // e.g., 'sqm', 'cubic_m', 'kg', 'hours', 'each', 'meter', 'liter'
  quantity: number;
  unitRate: number;
  totalAmount: number;
  specifications?: string;
  brand?: string;
  model?: string;
  manufacturer?: string;
  qualityGrade?: 'standard' | 'premium' | 'luxury';
  warranty?: string;
  deliveryTime?: number; // in days
  notes?: string;
  referenceCode?: string; // Internal reference or catalog code
  isAlternative?: boolean; // If this is an alternative item
  alternativeTo?: string; // Item ID this is alternative to
}

export interface BOQSection {
  id: string;
  sectionNumber: string;
  title: string;
  description?: string;
  items: BOQItem[];
  subtotal: number;
}

export interface BOQ {
  id: string;
  boqNumber: string;
  projectId: string;
  projectName: string;
  customerId: string;
  customerName: string;
  
  // Status & Workflow
  status: BOQStatus;
  version: number;
  
  // Content
  title: string;
  description?: string;
  sections: BOQSection[];
  
  // Financial Summary
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  taxAmount: number;
  taxPercentage: number;
  totalAmount: number;
  
  // Terms & Conditions
  validityPeriod: number; // days
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms?: string;
  
  // Dates
  createdDate: Date;
  lastModified: Date;
  approvedDate?: Date;
  sentDate?: Date;
  expiryDate: Date;
  
  // Workflow
  createdBy: string; // User ID
  approvedBy?: string; // User ID
  reviewedBy?: string[]; // User IDs
  
  // Conversion
  convertedToQuotation?: string; // Quotation ID
  convertedToProject?: string; // Project ID
  
  // Notes & Comments
  internalNotes?: string;
  clientComments?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type QuotationStatus = 
  | 'draft'
  | 'sent'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'converted';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId?: string;
  projectName?: string;
  projectTitle?: string;
  description?: string;
  status: QuotationStatus;
  
  // Items
  items: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    totalPrice?: number;
    amount?: number;
    selectedServices?: Array<{
      serviceId: string;
      serviceName: string;
      servicePrice: number;
    }>;
  }>;
  
  // Pricing
  subtotal: number;
  discountAmount?: number;
  taxAmount: number;
  totalAmount: number;
  
  // Terms
  issueDate?: Date;
  validUntil: Date;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  
  // Workflow
  createdBy?: string; // User ID
  approvedBy?: string; // User ID
  
  // Conversion
  convertedToProject?: string; // Project ID
  
  createdAt?: Date;
  updatedAt?: Date;
}

// =======================
// FINANCE & ACCOUNTING
// =======================

export type InvoiceStatus = 
  | 'draft'
  | 'sent'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled';

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  mainCategoryId: string;
  mainCategoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  manufacturer: string;
  modelNumber?: string;
  description: string;
  specifications?: Record<string, string>;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage
  discountAmount: number;
  taxRate: number; // percentage
  taxAmount: number;
  serviceCharge: number; // percentage
  serviceChargeAmount: number;
  totalPrice: number;
  stockAvailable: number;
  isStockTracked: boolean;
  serialNumbers?: string[];
  batchNumber?: string;
  notes?: string;
}

export interface InvoiceTax {
  id: string;
  name: string;
  rate: number; // percentage
  amount: number;
  type: 'vat' | 'gst' | 'sales_tax' | 'service_tax' | 'custom';
  isInclusive: boolean;
}

export interface InvoiceServiceCharge {
  id: string;
  name: string;
  rate: number; // percentage
  amount: number;
  type: 'delivery' | 'installation' | 'maintenance' | 'warranty' | 'custom';
  description?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  projectId?: string;
  projectName?: string;
  status: InvoiceStatus;
  
  // Items with detailed product information
  items: InvoiceItem[];
  
  // Financial breakdown
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  taxes: InvoiceTax[];
  totalTaxAmount: number;
  serviceCharges: InvoiceServiceCharge[];
  totalServiceChargeAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  
  // Stock management
  stockReserved: boolean;
  stockReservationId?: string;
  
  // Dates
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  
  // Terms and conditions
  paymentTerms: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  notes?: string;
  
  // References
  quotationId?: string;
  purchaseOrderId?: string;
  
  // Workflow
  createdBy: string; // User ID
  approvedBy?: string; // User ID
  sentBy?: string; // User ID
  sentAt?: Date;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card';
  referenceNumber?: string;
  paymentDate: Date;
  
  createdBy: string; // User ID
  createdAt: Date;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expenseDate: Date;
  
  // References
  projectId?: string;
  vendorId?: string;
  
  // Approval
  approvedBy?: string; // User ID
  approvedAt?: Date;
  
  // Receipt
  receiptUrl?: string;
  
  createdBy: string; // User ID
  createdAt: Date;
}

// =======================
// ANALYTICS & REPORTING
// =======================

export interface DashboardMetrics {
  // Sales Metrics
  totalRevenue: number;
  monthlyRevenue: number;
  salesGrowth: number;
  activePipeline: number;
  
  // Project Metrics
  activeProjects: number;
  completedProjects: number;
  projectsOnTime: number;
  averageProjectValue: number;
  
  // Inventory Metrics
  totalInventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  inventoryTurnover: number;
  
  // Financial Metrics
  outstandingInvoices: number;
  overdueInvoices: number;
  totalReceivables: number;
  profitMargin: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }>;
}

// =======================
// NOTIFICATIONS & SYSTEM
// =======================

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;

  // Action
  actionUrl?: string;
  actionText?: string;

  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  module: Module;
  recordId?: string;
  userId: string;
  userRole: UserRole;

  // Changes
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;

  ipAddress?: string;
  userAgent?: string;

  createdAt: Date;
}

// =======================
// COMMUNICATION & MESSAGING
// =======================

export type PortalType =
  | 'admin'
  | 'client'
  | 'finance'
  | 'inventory'
  | 'project'
  | 'sales'
  | 'salesrep'
  | 'vendor'
  | 'hr'
  | 'employee';

export type MessageType =
  | 'direct'
  | 'portal_broadcast'
  | 'global_announcement';

export type MessageStatus =
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface Message {
  id: string;
  senderId: string; // User ID
  senderName: string;
  senderRole: UserRole;
  senderPortal: PortalType;

  // Recipients
  recipientType: 'user' | 'portal' | 'global';
  recipientIds?: string[]; // User IDs for specific users
  recipientPortals?: PortalType[]; // Portal types for portal broadcasts
  recipientRoles?: UserRole[]; // Roles for role-based broadcasts

  // Message Content
  type: MessageType;
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Status & Tracking
  status: MessageStatus;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;

  // Attachments
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;

  // Thread/Conversation
  threadId?: string; // For threaded conversations
  parentMessageId?: string; // For replies

  // Metadata
  isAnnouncement: boolean;
  expiresAt?: Date; // For announcements that expire
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'portal';
  participants: Array<{
    userId: string;
    userName: string;
    userRole: UserRole;
    portal: PortalType;
    joinedAt: Date;
  }>;

  // For portal/group chats
  portalType?: PortalType;
  description?: string;

  // Settings
  isActive: boolean;
  lastMessageAt?: Date;
  lastMessagePreview?: string;

  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Target Audience
  targetType: 'global' | 'portal' | 'role' | 'specific_users';
  targetPortals?: PortalType[];
  targetRoles?: UserRole[];
  targetUserIds?: string[];

  // Timing
  publishedAt: Date;
  expiresAt?: Date;
  isActive: boolean;

  // Author
  createdBy: string; // User ID
  createdByName: string;
  createdByRole: UserRole;

  // Engagement
  views: number;
  acknowledgments: Array<{
    userId: string;
    acknowledgedAt: Date;
  }>;

  // Attachments
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

// =======================
// API & PAGINATION
// =======================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  assignedTo?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =======================
// FORM SCHEMAS
// =======================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: any; // Zod schema
}

export interface DynamicForm {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitUrl: string;
  method: 'POST' | 'PUT' | 'PATCH';
}

// =======================
// UI & COMPONENT PROPS
// =======================

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

export interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: string | number;
}

// =======================
// PORTAL SPECIFIC TYPES
// =======================

export interface PortalConfig {
  name: string;
  path: string;
  allowedRoles: UserRole[];
  defaultRoute: string;
  navigation: NavigationItem[];
  theme?: {
    primaryColor: string;
    logoUrl: string;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  requiredPermissions?: Permission[];
  badge?: string | number;
}

// =======================
// COMPANY SETTINGS
// =======================

export interface CompanySettings {
  companyName: string;
  logoUrl: string;
  tagline?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  taxInfo: {
    taxId: string;
    registrationNumber?: string;
  };
  invoiceSettings: {
    termsAndConditions: string;
    paymentTerms: string;
    lateFeePolicy?: string;
    defaultDueDays: number;
    footerText?: string;
  };
  banking: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode?: string;
  };
}

// =======================
// HUMAN RESOURCES TYPES
// =======================

export type AttendanceStatus = 
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'on_leave'
  | 'holiday'
  | 'weekend';

export type LeaveType = 
  | 'annual'
  | 'sick'
  | 'maternity'
  | 'paternity'
  | 'emergency'
  | 'unpaid';

export type LeaveStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface Employee {
  id: string;
  employeeId: string;
  userId: string; // Reference to User
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  managerId?: string;
  hireDate: Date;
  salary: number;
  isActive: boolean;
  avatar?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: AttendanceStatus;
  hoursWorked: number;
  breakDuration: number; // in minutes
  location?: string;
  ipAddress?: string;
  notes?: string;
  approvedBy?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string; // User ID
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId: string; // User ID
  parentDepartmentId?: string;
  budget?: number;
  employeeCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payroll {
  id: string;
  employeeId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  basicSalary: number;
  allowances: Array<{
    type: string;
    amount: number;
    description?: string;
  }>;
  deductions: Array<{
    type: string;
    amount: number;
    description?: string;
  }>;
  grossPay: number;
  netPay: number;
  taxAmount: number;
  paymentDate?: Date;
  paymentMethod: string;
  status: 'pending' | 'processed' | 'paid';
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string; // User ID
  reviewPeriod: {
    startDate: Date;
    endDate: Date;
  };
  overallRating: number; // 1-5
  categories: Array<{
    name: string;
    rating: number;
    comments: string;
  }>;
  goals: Array<{
    description: string;
    status: 'achieved' | 'partially_achieved' | 'not_achieved';
    comments: string;
  }>;
  developmentAreas: string[];
  overallComments: string;
  nextReviewDate?: Date;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  createdAt: Date;
  updatedAt: Date;
}

// =======================
// RECRUITMENT TYPES
// =======================

export type JobStatus = 
  | 'draft'
  | 'active'
  | 'paused'
  | 'closed'
  | 'filled';

export type JobPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type CandidateStatus = 
  | 'new'
  | 'screening'
  | 'interview_scheduled'
  | 'interviewed'
  | 'technical_review'
  | 'final_interview'
  | 'offer_extended'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type InterviewType = 
  | 'phone_screening'
  | 'technical_interview'
  | 'behavioral_interview'
  | 'final_interview'
  | 'panel_interview';

export type InterviewStatus = 
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  status: JobStatus;
  priority: JobPriority;
  postedBy: string; // User ID
  postedDate: Date;
  applicationDeadline?: Date;
  applicationsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  currentPosition?: string;
  currentCompany?: string;
  experienceYears: number;
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
    gpa?: number;
  }>;
  skills: string[];
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  availabilityDate?: Date;
  status: CandidateStatus;
  appliedDate: Date;
  lastActivityDate: Date;
  notes: string[];
  rating: number; // 1-5 stars
  source: 'website' | 'referral' | 'linkedin' | 'indeed' | 'other';
  referredBy?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: CandidateStatus;
  appliedDate: Date;
  lastUpdated: Date;
  currentStage: string;
  interviewRounds: Interview[];
  offerDetails?: {
    salary: number;
    startDate: Date;
    benefits: string[];
  };
  rejectionReason?: string;
  notes: string[];
  rating: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  applicationId: string;
  interviewType: InterviewType;
  scheduledDate: Date;
  duration: number; // in minutes
  interviewers: string[]; // User IDs
  location: string; // physical location or virtual link
  status: InterviewStatus;
  feedback?: {
    rating: number; // 1-5
    strengths: string[];
    weaknesses: string[];
    recommendation: 'hire' | 'reject' | 'consider' | 'strong_hire';
    notes: string;
    interviewerId: string;
    submittedAt: Date;
  };
  rescheduleReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecruitmentMetrics {
  totalJobsPosted: number;
  activeJobs: number;
  totalApplications: number;
  applicationsThisMonth: number;
  averageTimeToHire: number; // in days
  offerAcceptanceRate: number;
  candidateQualityScore: number; // average rating
  sourceEffectiveness: Record<string, number>; // conversion rates by source
}

// =======================
// ONBOARDING TYPES
// =======================

export type OnboardingStatus = 
  | 'not-started'
  | 'in-progress'
  | 'almost-complete'
  | 'completed'
  | 'on-hold'
  | 'cancelled';

export type OnboardingTaskStatus = 
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'overdue'
  | 'cancelled';

export type OnboardingTaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: 'hr' | 'it' | 'training' | 'compliance' | 'orientation' | 'equipment' | 'other';
  priority: OnboardingTaskPriority;
  status: OnboardingTaskStatus;
  assignedTo?: string; // User ID
  dueDate: Date;
  completedDate?: Date;
  notes?: string;
  isRequired: boolean;
  order: number;
  dependencies?: string[]; // Task IDs that must be completed first
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description?: string;
  department: string;
  position?: string;
  duration: number; // in days
  tasks: OnboardingTask[];
  isActive: boolean;
  lastUsed?: Date;
  usageCount: number;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingProcess {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  templateId?: string;
  templateName?: string;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  status: OnboardingStatus;
  progress: number; // percentage 0-100
  mentorId?: string; // User ID
  mentorName?: string;
  tasks: OnboardingTask[];
  completedTasks: number;
  totalTasks: number;
  notes: string[];
  feedback?: {
    employeeRating: number; // 1-5
    mentorRating: number; // 1-5
    comments: string;
    submittedAt: Date;
  };
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingMetrics {
  totalActiveOnboardings: number;
  completedThisMonth: number;
  averageCompletionTime: number; // in days
  completionRate: number; // percentage
  overdueTasks: number;
  upcomingTasks: number;
  mentorUtilization: Record<string, number>; // mentor ID -> active onboardings
}

// =======================
// SERVICE TYPES
// =======================

export type ServiceStatus = 'active' | 'inactive';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  availability: 'available' | 'limited' | 'not_available';
  status: ServiceStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
  total: number;
}

// Export all as default for easier importing
export default {
  // Types are already exported above
};
