'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Edit,
  Search,
  Filter,
  FileText,
  Calculator,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  Building,
  Settings,
  Save,
  Send,
  Copy,
  Trash2,
  PlusCircle,
  MinusCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import mockData from '@/lib/mock-data';
import { BOQ, BOQItem, BOQSection, BOQStatus, BOQItemType, BOQMainCategory, BOQSubCategory } from '@/types';
import { toast } from 'sonner';
import { faker } from '@faker-js/faker';

// Mock BOQ data
const boqs: BOQ[] = [
  {
    id: 'BOQ-001',
    boqNumber: 'BOQ-2024-001',
    projectId: 'PROJ-001',
    projectName: 'Office Building Installation',
    customerId: 'CUST-001',
    customerName: 'TechCorp Solutions',
    status: 'approved',
    version: 2,
    title: 'Bill of Quantities - Office Building Electrical Installation',
    description: 'Complete electrical installation for 5-floor office building',
    sections: [
      {
        id: 'SEC-001',
        sectionNumber: '1.0',
        title: 'Electrical Wiring & Cabling',
        description: 'All electrical wiring and cabling work',
        items: [
          {
            id: 'ITEM-001',
            itemNumber: '1.1',
            description: '2.5mm² Copper Conductor Cable',
            type: 'material',
            mainCategory: 'electrical',
            subCategory: 'cabling',
            category: 'Electrical/Cabling',
            unit: 'meter',
            quantity: 2500,
            unitRate: 8.50,
            totalAmount: 21250,
            specifications: '600V rated, stranded copper',
            brand: 'ABC Cables',
            qualityGrade: 'premium',
            warranty: '5 years',
          },
          {
            id: 'ITEM-002',
            itemNumber: '1.2',
            description: 'Electrical Conduit 25mm PVC',
            type: 'material',
            mainCategory: 'electrical',
            subCategory: 'cabling',
            category: 'Electrical/Cabling',
            unit: 'meter',
            quantity: 800,
            unitRate: 12.00,
            totalAmount: 9600,
            specifications: 'Heavy duty PVC conduit',
            brand: 'PVC Master',
            qualityGrade: 'standard',
            warranty: '10 years',
          },
        ],
        subtotal: 30850,
      },
      {
        id: 'SEC-002',
        sectionNumber: '2.0',
        title: 'Lighting & Fixtures',
        description: 'All lighting fixtures and installation',
        items: [
          {
            id: 'ITEM-003',
            itemNumber: '2.1',
            description: 'LED Panel Light 600x600mm',
            type: 'material',
            mainCategory: 'electrical',
            subCategory: 'lighting',
            category: 'Electrical/Lighting',
            unit: 'each',
            quantity: 120,
            unitRate: 85.00,
            totalAmount: 10200,
            specifications: '36W LED panel with emergency backup',
            brand: 'LightTech',
            model: 'LP-6060-36W',
            qualityGrade: 'premium',
            warranty: '3 years',
            deliveryTime: 7,
          },
        ],
        subtotal: 10200,
      },
    ],
    subtotal: 41050,
    discountAmount: 2052.50,
    discountPercentage: 5,
    taxAmount: 7799.50,
    taxPercentage: 21,
    totalAmount: 46797,
    validityPeriod: 30,
    paymentTerms: '50% advance, 40% on completion, 10% after warranty',
    deliveryTerms: 'Delivery within 45 days from PO date',
    warrantyTerms: '2 years comprehensive warranty',
    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    approvedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    createdBy: 'John Doe',
    approvedBy: 'Jane Smith',
    reviewedBy: ['Mike Johnson'],
    internalNotes: 'Client requested LED lighting upgrade',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'BOQ-002',
    boqNumber: 'BOQ-2024-002',
    projectId: 'PROJ-002',
    projectName: 'Warehouse Automation',
    customerId: 'CUST-002',
    customerName: 'Logistics Plus',
    status: 'draft',
    version: 1,
    title: 'Bill of Quantities - Warehouse Automation System',
    description: 'Automated conveyor and sorting system installation',
    sections: [
      {
        id: 'SEC-003',
        sectionNumber: '1.0',
        title: 'Conveyor System',
        description: 'Automated conveyor belts and components',
        items: [
          {
            id: 'ITEM-004',
            itemNumber: '1.1',
            description: 'Modular Conveyor Belt System',
            type: 'equipment',
            mainCategory: 'mechanical',
            subCategory: 'conveyors',
            category: 'Mechanical/Conveying',
            unit: 'meter',
            quantity: 500,
            unitRate: 450.00,
            totalAmount: 225000,
            specifications: 'Heavy duty modular conveyor, 100kg/m capacity',
            brand: 'ConveyorPro',
            model: 'CP-500-HD',
            qualityGrade: 'premium',
            warranty: '2 years',
            deliveryTime: 30,
          },
        ],
        subtotal: 225000,
      },
    ],
    subtotal: 225000,
    discountAmount: 0,
    discountPercentage: 0,
    taxAmount: 47250,
    taxPercentage: 21,
    totalAmount: 272250,
    validityPeriod: 45,
    paymentTerms: '30% advance, 30% on delivery, 40% on installation',
    deliveryTerms: 'Delivery within 60 days from PO date',
    createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
    createdBy: 'Alice Wilson',
    internalNotes: 'High priority project - expedite approval',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

export default function FinanceBOQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBOQ, setSelectedBOQ] = useState<BOQ | null>(null);
  const [expandedBOQs, setExpandedBOQs] = useState<Set<string>>(new Set());
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const itemsPerPage = 10;

  // Create/Edit BOQ form state
  const [boqForm, setBoqForm] = useState({
    projectId: '',
    customerId: '',
    title: '',
    description: '',
    validityPeriod: 30,
    paymentTerms: '50% advance, 50% on completion',
    deliveryTerms: 'Delivery within 30 days from PO date',
    discountPercentage: 0,
    taxPercentage: 21,
    sections: [] as BOQSection[],
  });

  // Edit item form state
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  // Filter BOQs based on search and filters
  const filteredBOQs = useMemo(() => {
    return boqs.filter(boq => {
      const matchesSearch = boq.boqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          boq.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          boq.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || boq.status === statusFilter;
      const matchesProject = projectFilter === 'all' || boq.projectId === projectFilter;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [searchTerm, statusFilter, projectFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBOQs.length / itemsPerPage);
  const paginatedBOQs = filteredBOQs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const boqStats = [
    { title: 'Total BOQs', value: boqs.length.toString(), change: '+3', icon: FileText, color: 'yellow' },
    { title: 'Approved BOQs', value: boqs.filter(b => b.status === 'approved').length.toString(), change: '+2', icon: CheckCircle, color: 'emerald' },
    { title: 'Draft BOQs', value: boqs.filter(b => b.status === 'draft').length.toString(), change: '+1', icon: Clock, color: 'yellow' },
    { title: 'Total Value', value: '$' + (boqs.reduce((sum, b) => sum + b.totalAmount, 0) / 1000).toFixed(0) + 'K', change: '+15%', icon: DollarSign, color: 'yellow' },
  ];

  const toggleBOQExpansion = (boqId: string) => {
    const newExpanded = new Set(expandedBOQs);
    if (newExpanded.has(boqId)) {
      newExpanded.delete(boqId);
    } else {
      newExpanded.add(boqId);
    }
    setExpandedBOQs(newExpanded);
  };

  const getStatusBadge = (status: BOQStatus) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      sent_to_client: { color: 'bg-blue-100 text-blue-800', label: 'Sent to Client' },
      accepted: { color: 'bg-emerald-100 text-emerald-800', label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      expired: { color: 'bg-orange-100 text-orange-800', label: 'Expired' },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const calculateBOQTotals = (sections: BOQSection[], discountPercentage: number, taxPercentage: number) => {
    const subtotal = sections.reduce((sum, section) => sum + section.subtotal, 0);
    const discountAmount = subtotal * (discountPercentage / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * (taxPercentage / 100);
    const totalAmount = discountedSubtotal + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    };
  };

  const handleViewDetails = (boq: BOQ) => {
    setSelectedBOQ(boq);
    setIsDetailsDialogOpen(true);
  };

  const handleCreateBOQ = () => {
    setBoqForm({
      projectId: '',
      customerId: '',
      title: '',
      description: '',
      validityPeriod: 30,
      paymentTerms: '50% advance, 50% on completion',
      deliveryTerms: 'Delivery within 30 days from PO date',
      discountPercentage: 0,
      taxPercentage: 21,
      sections: [],
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditBOQ = (boq: BOQ) => {
    setBoqForm({
      projectId: boq.projectId,
      customerId: boq.customerId,
      title: boq.title,
      description: boq.description || '',
      validityPeriod: boq.validityPeriod,
      paymentTerms: boq.paymentTerms,
      deliveryTerms: boq.deliveryTerms,
      discountPercentage: boq.discountPercentage,
      taxPercentage: boq.taxPercentage,
      sections: boq.sections,
    });
    setSelectedBOQ(boq);
    setIsEditDialogOpen(true);
  };

  const handleAddSection = () => {
    const newSection: BOQSection = {
      id: faker.string.uuid(),
      sectionNumber: `${boqForm.sections.length + 1}.0`,
      title: '',
      description: '',
      items: [],
      subtotal: 0,
    };
    setBoqForm({
      ...boqForm,
      sections: [...boqForm.sections, newSection],
    });
  };

  const handleRemoveSection = (sectionIndex: number) => {
    setBoqForm({
      ...boqForm,
      sections: boqForm.sections.filter((_, index) => index !== sectionIndex),
    });
  };

  const handleUpdateSection = (sectionIndex: number, field: string, value: any) => {
    const updatedSections = [...boqForm.sections];
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], [field]: value };
    setBoqForm({ ...boqForm, sections: updatedSections });
  };

  const handleAddItem = (sectionIndex: number) => {
    const newItem: BOQItem = {
      id: faker.string.uuid(),
      itemNumber: `${sectionIndex + 1}.${boqForm.sections[sectionIndex].items.length + 1}`,
      description: '',
      type: 'material',
      mainCategory: 'civil_works',
      subCategory: 'excavation',
      category: 'Civil Works/Excavation',
      unit: 'each',
      quantity: 1,
      unitRate: 0,
      totalAmount: 0,
    };
    const updatedSections = [...boqForm.sections];
    updatedSections[sectionIndex].items.push(newItem);
    setBoqForm({ ...boqForm, sections: updatedSections });
  };

  const handleRemoveItem = (sectionIndex: number, itemIndex: number) => {
    const updatedSections = [...boqForm.sections];
    updatedSections[sectionIndex].items.splice(itemIndex, 1);
    setBoqForm({ ...boqForm, sections: updatedSections });
  };

  const handleUpdateItem = (sectionIndex: number, itemIndex: number, field: string, value: any) => {
    const updatedSections = [...boqForm.sections];
    const item = updatedSections[sectionIndex].items[itemIndex];

    if (field === 'quantity' || field === 'unitRate') {
      const quantity = field === 'quantity' ? value : item.quantity;
      const unitRate = field === 'unitRate' ? value : item.unitRate;
      item.totalAmount = quantity * unitRate;
    }

    if (field === 'mainCategory') {
      // Reset subCategory when mainCategory changes
      item.mainCategory = value;
      item.subCategory = getDefaultSubCategory(value) as BOQSubCategory;
      item.category = `${getMainCategoryLabel(value)}/${getSubCategoryLabel(item.subCategory)}`;
    } else if (field === 'subCategory') {
      item.subCategory = value;
      item.category = `${getMainCategoryLabel(item.mainCategory)}/${getSubCategoryLabel(value)}`;
    } else {
      (item as any)[field] = value;
    }

    // Recalculate section subtotal
    updatedSections[sectionIndex].subtotal = updatedSections[sectionIndex].items.reduce(
      (sum, item) => sum + item.totalAmount, 0
    );

    setBoqForm({ ...boqForm, sections: updatedSections });
  };

  const getMainCategoryLabel = (mainCategory: string) => {
    const labels: Record<string, string> = {
      civil_works: 'Civil Works',
      electrical: 'Electrical',
      mechanical: 'Mechanical',
      plumbing: 'Plumbing',
      hvac: 'HVAC',
      fire_safety: 'Fire Safety',
      security: 'Security',
      finishing: 'Finishing',
      landscaping: 'Landscaping',
      other: 'Other',
    };
    return labels[mainCategory] || mainCategory;
  };

  const getSubCategoryLabel = (subCategory: string) => {
    const labels: Record<string, string> = {
      // Civil Works
      excavation: 'Excavation',
      foundation: 'Foundation',
      concrete: 'Concrete',
      masonry: 'Masonry',
      structural_steel: 'Structural Steel',
      roofing: 'Roofing',
      // Electrical
      wiring: 'Wiring',
      lighting: 'Lighting',
      switchgear: 'Switchgear',
      transformers: 'Transformers',
      generators: 'Generators',
      cabling: 'Cabling',
      earthing: 'Earthing',
      // Mechanical
      pumps: 'Pumps',
      compressors: 'Compressors',
      conveyors: 'Conveyors',
      elevators: 'Elevators',
      cranes: 'Cranes',
      machinery: 'Machinery',
      // Plumbing
      water_supply: 'Water Supply',
      drainage: 'Drainage',
      sewage: 'Sewage',
      fire_hydrants: 'Fire Hydrants',
      water_tanks: 'Water Tanks',
      // HVAC
      air_conditioning: 'Air Conditioning',
      ventilation: 'Ventilation',
      ducting: 'Ducting',
      chillers: 'Chillers',
      boilers: 'Boilers',
      // Fire Safety
      sprinklers: 'Sprinklers',
      fire_extinguishers: 'Fire Extinguishers',
      alarms: 'Alarms',
      hydrants: 'Hydrants',
      // Security
      cctv: 'CCTV',
      access_control: 'Access Control',
      intrusion_detection: 'Intrusion Detection',
      fencing: 'Fencing',
      // Finishing
      painting: 'Painting',
      flooring: 'Flooring',
      ceiling: 'Ceiling',
      doors_windows: 'Doors & Windows',
      furniture: 'Furniture',
      // Landscaping
      hardscaping: 'Hardscaping',
      softscaping: 'Softscaping',
      irrigation: 'Irrigation',
      // Other
      custom: 'Custom',
    };
    return labels[subCategory] || subCategory;
  };

  const getDefaultSubCategory = (mainCategory: string): string => {
    const defaults: Record<string, string> = {
      civil_works: 'excavation',
      electrical: 'wiring',
      mechanical: 'machinery',
      plumbing: 'water_supply',
      hvac: 'air_conditioning',
      fire_safety: 'sprinklers',
      security: 'cctv',
      finishing: 'painting',
      landscaping: 'hardscaping',
      other: 'custom',
    };
    return defaults[mainCategory] || 'custom';
  };

  const getSubCategoriesForMain = (mainCategory: string): Array<{ value: string; label: string }> => {
    const subCategories: Record<string, Array<{ value: string; label: string }>> = {
      civil_works: [
        { value: 'excavation', label: 'Excavation' },
        { value: 'foundation', label: 'Foundation' },
        { value: 'concrete', label: 'Concrete' },
        { value: 'masonry', label: 'Masonry' },
        { value: 'structural_steel', label: 'Structural Steel' },
        { value: 'roofing', label: 'Roofing' },
      ],
      electrical: [
        { value: 'wiring', label: 'Wiring' },
        { value: 'lighting', label: 'Lighting' },
        { value: 'switchgear', label: 'Switchgear' },
        { value: 'transformers', label: 'Transformers' },
        { value: 'generators', label: 'Generators' },
        { value: 'cabling', label: 'Cabling' },
        { value: 'earthing', label: 'Earthing' },
      ],
      mechanical: [
        { value: 'pumps', label: 'Pumps' },
        { value: 'compressors', label: 'Compressors' },
        { value: 'conveyors', label: 'Conveyors' },
        { value: 'elevators', label: 'Elevators' },
        { value: 'cranes', label: 'Cranes' },
        { value: 'machinery', label: 'Machinery' },
      ],
      plumbing: [
        { value: 'water_supply', label: 'Water Supply' },
        { value: 'drainage', label: 'Drainage' },
        { value: 'sewage', label: 'Sewage' },
        { value: 'fire_hydrants', label: 'Fire Hydrants' },
        { value: 'water_tanks', label: 'Water Tanks' },
      ],
      hvac: [
        { value: 'air_conditioning', label: 'Air Conditioning' },
        { value: 'ventilation', label: 'Ventilation' },
        { value: 'ducting', label: 'Ducting' },
        { value: 'chillers', label: 'Chillers' },
        { value: 'boilers', label: 'Boilers' },
      ],
      fire_safety: [
        { value: 'sprinklers', label: 'Sprinklers' },
        { value: 'fire_extinguishers', label: 'Fire Extinguishers' },
        { value: 'alarms', label: 'Alarms' },
        { value: 'hydrants', label: 'Hydrants' },
      ],
      security: [
        { value: 'cctv', label: 'CCTV' },
        { value: 'access_control', label: 'Access Control' },
        { value: 'intrusion_detection', label: 'Intrusion Detection' },
        { value: 'fencing', label: 'Fencing' },
      ],
      finishing: [
        { value: 'painting', label: 'Painting' },
        { value: 'flooring', label: 'Flooring' },
        { value: 'ceiling', label: 'Ceiling' },
        { value: 'doors_windows', label: 'Doors & Windows' },
        { value: 'furniture', label: 'Furniture' },
      ],
      landscaping: [
        { value: 'hardscaping', label: 'Hardscaping' },
        { value: 'softscaping', label: 'Softscaping' },
        { value: 'irrigation', label: 'Irrigation' },
      ],
      other: [
        { value: 'custom', label: 'Custom' },
      ],
    };
    return subCategories[mainCategory] || [{ value: 'custom', label: 'Custom' }];
  };

  const handleSaveBOQ = () => {
    if (!boqForm.projectId || !boqForm.customerId || !boqForm.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (boqForm.sections.length === 0) {
      toast.error('Please add at least one section with items');
      return;
    }

    const totals = calculateBOQTotals(boqForm.sections, boqForm.discountPercentage, boqForm.taxPercentage);

    const newBOQ: BOQ = {
      id: faker.string.uuid(),
      boqNumber: `BOQ-2024-${faker.string.numeric(3).padStart(3, '0')}`,
      projectId: boqForm.projectId,
      projectName: 'Project Name', // Would be looked up from project data
      customerId: boqForm.customerId,
      customerName: 'Customer Name', // Would be looked up from customer data
      status: 'draft',
      version: 1,
      title: boqForm.title,
      description: boqForm.description,
      sections: boqForm.sections,
      ...totals,
      discountPercentage: boqForm.discountPercentage,
      taxPercentage: boqForm.taxPercentage,
      validityPeriod: boqForm.validityPeriod,
      paymentTerms: boqForm.paymentTerms,
      deliveryTerms: boqForm.deliveryTerms,
      createdDate: new Date(),
      lastModified: new Date(),
      expiryDate: new Date(Date.now() + boqForm.validityPeriod * 24 * 60 * 60 * 1000),
      createdBy: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating BOQ:', newBOQ);
    toast.success(`BOQ ${newBOQ.boqNumber} created successfully`);

    setIsCreateDialogOpen(false);
    setBoqForm({
      projectId: '',
      customerId: '',
      title: '',
      description: '',
      validityPeriod: 30,
      paymentTerms: '50% advance, 50% on completion',
      deliveryTerms: 'Delivery within 30 days from PO date',
      discountPercentage: 0,
      taxPercentage: 21,
      sections: [],
    });
  };

  const handleUpdateBOQ = () => {
    if (!selectedBOQ) return;

    const totals = calculateBOQTotals(boqForm.sections, boqForm.discountPercentage, boqForm.taxPercentage);

    const updatedBOQ: BOQ = {
      ...selectedBOQ,
      title: boqForm.title,
      description: boqForm.description,
      sections: boqForm.sections,
      ...totals,
      discountPercentage: boqForm.discountPercentage,
      taxPercentage: boqForm.taxPercentage,
      validityPeriod: boqForm.validityPeriod,
      paymentTerms: boqForm.paymentTerms,
      deliveryTerms: boqForm.deliveryTerms,
      lastModified: new Date(),
      updatedAt: new Date(),
    };

    console.log('Updating BOQ:', updatedBOQ);
    toast.success(`BOQ ${updatedBOQ.boqNumber} updated successfully`);

    setIsEditDialogOpen(false);
    setSelectedBOQ(null);
  };

  const handleApproveBOQ = (boq: BOQ) => {
    console.log('Approving BOQ:', boq.id);
    toast.success(`BOQ ${boq.boqNumber} approved successfully`);
  };

  const handleSendToClient = (boq: BOQ) => {
    console.log('Sending BOQ to client:', boq.id);
    toast.success(`BOQ ${boq.boqNumber} sent to client successfully`);
  };

  const handleExportBOQ = (boq: BOQ) => {
    console.log('Exporting BOQ:', boq.boqNumber);
    toast.success('BOQ exported successfully');
  };

  const handleDuplicateBOQ = (boq: BOQ) => {
    console.log('Duplicating BOQ:', boq.id);
    toast.success('BOQ duplicated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-yellow-600 to-yellow-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Bill of Quantities (BOQ)</h1>
            <p className="text-yellow-100 mt-1 text-lg">Financial management and cost analysis for project quotations</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => {}}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button className="bg-white text-yellow-600 hover:bg-yellow-50" onClick={handleCreateBOQ}>
              <Plus className="h-5 w-5 mr-2" />
              Create BOQ
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {boqStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
                <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                  <IconComponent className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{stat.change}</span>
                  <span className="text-gray-500"> from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search BOQs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="BOQ number, project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="sent_to_client">Sent to Client</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="PROJ-001">Office Building Installation</SelectItem>
                  <SelectItem value="PROJ-002">Warehouse Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setProjectFilter('all');
                setCurrentPage(1);
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BOQ Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-yellow-50 to-amber-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Bill of Quantities</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                {filteredBOQs.length} of {boqs.length} BOQs
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-gray-300 bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold text-gray-900">BOQ Number</TableHead>
                  <TableHead className="font-semibold text-gray-900">Project</TableHead>
                  <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Total Value</TableHead>
                  <TableHead className="font-semibold text-gray-900">Expiry Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBOQs.map((boq) => {
                  const isExpanded = expandedBOQs.has(boq.id);

                  return (
                    <React.Fragment key={boq.id}>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBOQExpansion(boq.id)}
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{boq.boqNumber}</div>
                            <div className="text-sm text-gray-500">v{boq.version}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{boq.projectName}</div>
                            <div className="text-sm text-gray-500">{boq.customerName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(boq.status)}
                        </TableCell>
                        <TableCell className="text-right text-gray-900 font-medium">
                          ${boq.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{boq.expiryDate.toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {Math.ceil((boq.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(boq)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditBOQ(boq)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {boq.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApproveBOQ(boq)}
                                className="h-8 w-8 p-0 text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {boq.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSendToClient(boq)}
                                className="h-8 w-8 p-0 text-blue-600"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportBOQ(boq)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicateBOQ(boq)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">BOQ Sections</h4>
                                  <div className="space-y-2">
                                    {boq.sections.map((section, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                        <div>
                                          <p className="font-medium text-sm">{section.title}</p>
                                          <p className="text-xs text-gray-600">{section.items.length} items</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium text-sm">${section.subtotal.toLocaleString()}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">BOQ Summary</h4>
                                  <div className="space-y-2 text-sm bg-white p-3 rounded border">
                                    <div className="flex justify-between">
                                      <span>Subtotal:</span>
                                      <span className="font-medium">${boq.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Discount ({boq.discountPercentage}%):</span>
                                      <span className="font-medium text-green-600">-${boq.discountAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Tax ({boq.taxPercentage}%):</span>
                                      <span className="font-medium">${boq.taxAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 font-bold">
                                      <span>Total:</span>
                                      <span className="text-yellow-600">${boq.totalAmount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBOQs.length)} of {filteredBOQs.length} BOQs
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BOQ Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              BOQ Details - {selectedBOQ?.boqNumber}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Complete bill of quantities breakdown
            </DialogDescription>
          </DialogHeader>

          {selectedBOQ && (
            <div className="space-y-6 bg-white">
              {/* BOQ Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedBOQ.status)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Version:</span>
                  <Badge variant="outline">v{selectedBOQ.version}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Expiry:</span>
                  <span className="text-sm">{selectedBOQ.expiryDate.toLocaleDateString()}</span>
                </div>
              </div>

              {/* Project & Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Project Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium text-gray-900">{selectedBOQ.projectName}</p>
                    <p className="text-sm text-gray-600">{selectedBOQ.customerName}</p>
                    <p className="text-sm text-gray-600">Created: {selectedBOQ.createdDate.toLocaleDateString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Terms & Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Validity:</span> {selectedBOQ.validityPeriod} days</p>
                    <p className="text-sm"><span className="font-medium">Payment:</span> {selectedBOQ.paymentTerms}</p>
                    <p className="text-sm"><span className="font-medium">Delivery:</span> {selectedBOQ.deliveryTerms}</p>
                  </CardContent>
                </Card>
              </div>

              {/* BOQ Sections */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">BOQ Breakdown</h3>
                {selectedBOQ.sections.map((section, sectionIndex) => (
                  <Card key={section.id}>
                    <CardHeader className="bg-gray-50">
                      <CardTitle className="text-lg">
                        Section {section.sectionNumber}: {section.title}
                      </CardTitle>
                      {section.description && (
                        <p className="text-sm text-gray-600">{section.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item #</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                              <TableHead className="text-right">Unit Rate</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {section.items.map((item, itemIndex) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.itemNumber}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{item.description}</p>
                                    {item.specifications && (
                                      <p className="text-sm text-gray-600">{item.specifications}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {item.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">${item.unitRate.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-medium">${item.totalAmount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-gray-50 font-semibold">
                              <TableCell colSpan={6} className="text-right">Section Subtotal:</TableCell>
                              <TableCell className="text-right">${section.subtotal.toLocaleString()}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* BOQ Summary */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-xl text-green-900">BOQ Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Subtotal:</span>
                        <span className="font-bold">${selectedBOQ.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Discount ({selectedBOQ.discountPercentage}%):</span>
                        <span className="font-bold text-green-600">-${selectedBOQ.discountAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Tax ({selectedBOQ.taxPercentage}%):</span>
                        <span className="font-bold">${selectedBOQ.taxAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t-2 pt-3 text-lg">
                        <span className="font-bold">Total Amount:</span>
                        <span className="font-bold text-yellow-600">${selectedBOQ.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Created By:</span>
                        <span>{selectedBOQ.createdBy}</span>
                      </div>
                      {selectedBOQ.approvedBy && (
                        <div className="flex justify-between">
                          <span className="font-medium">Approved By:</span>
                          <span>{selectedBOQ.approvedBy}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium">Last Modified:</span>
                        <span>{selectedBOQ.lastModified.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Version:</span>
                        <span>v{selectedBOQ.version}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedBOQ.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedBOQ.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedBOQ && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleExportBOQ(selectedBOQ)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={() => handleEditBOQ(selectedBOQ)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit BOQ
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create BOQ Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-6xl bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Create New BOQ
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Create a detailed bill of quantities for a project
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 bg-white max-h-96 overflow-y-auto">
            {/* BOQ Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <Select
                  value={boqForm.projectId}
                  onValueChange={(value) => setBoqForm({ ...boqForm, projectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.projects.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name} - {project.customerId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={boqForm.customerId}
                  onValueChange={(value) => setBoqForm({ ...boqForm, customerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.companyName}>
                        {customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">BOQ Title *</Label>
                <Input
                  id="title"
                  value={boqForm.title}
                  onChange={(e) => setBoqForm({ ...boqForm, title: e.target.value })}
                  placeholder="Enter BOQ title"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={boqForm.description}
                  onChange={(e) => setBoqForm({ ...boqForm, description: e.target.value })}
                  placeholder="Enter BOQ description"
                  rows={3}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validity">Validity Period (days)</Label>
                <Input
                  id="validity"
                  type="number"
                  value={boqForm.validityPeriod}
                  onChange={(e) => setBoqForm({ ...boqForm, validityPeriod: parseInt(e.target.value) || 30 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={boqForm.discountPercentage}
                  onChange={(e) => setBoqForm({ ...boqForm, discountPercentage: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Textarea
                  id="payment-terms"
                  value={boqForm.paymentTerms}
                  onChange={(e) => setBoqForm({ ...boqForm, paymentTerms: e.target.value })}
                  placeholder="Enter payment terms"
                  rows={2}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="delivery-terms">Delivery Terms</Label>
                <Textarea
                  id="delivery-terms"
                  value={boqForm.deliveryTerms}
                  onChange={(e) => setBoqForm({ ...boqForm, deliveryTerms: e.target.value })}
                  placeholder="Enter delivery terms"
                  rows={2}
                />
              </div>
            </div>

            {/* BOQ Sections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">BOQ Sections</h3>
                <Button onClick={handleAddSection} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              <div className="space-y-4">
                {boqForm.sections.map((section, sectionIndex) => (
                  <Card key={section.id}>
                    <CardHeader className="bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Section title"
                            value={section.title}
                            onChange={(e) => handleUpdateSection(sectionIndex, 'title', e.target.value)}
                          />
                          <Input
                            placeholder="Section description (optional)"
                            value={section.description || ''}
                            onChange={(e) => handleUpdateSection(sectionIndex, 'description', e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={() => handleRemoveSection(sectionIndex)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 ml-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Items</h4>
                        <Button onClick={() => handleAddItem(sectionIndex)} variant="outline" size="sm">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <Card key={item.id} className="border border-gray-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm">Item {item.itemNumber}</span>
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {item.type}
                                  </Badge>
                                </div>
                                <Button
                                  onClick={() => handleRemoveItem(sectionIndex, itemIndex)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`item-description-${sectionIndex}-${itemIndex}`}>Description</Label>
                                  <Input
                                    id={`item-description-${sectionIndex}-${itemIndex}`}
                                    value={item.description}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, 'description', e.target.value)}
                                    placeholder="Enter item description"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-unit-${sectionIndex}-${itemIndex}`}>Unit</Label>
                                  <Input
                                    id={`item-unit-${sectionIndex}-${itemIndex}`}
                                    value={item.unit}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, 'unit', e.target.value)}
                                    placeholder="e.g., m², kg, nos"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-quantity-${sectionIndex}-${itemIndex}`}>Quantity</Label>
                                  <Input
                                    id={`item-quantity-${sectionIndex}-${itemIndex}`}
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, 'quantity', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-unitRate-${sectionIndex}-${itemIndex}`}>Unit Rate (₹)</Label>
                                  <Input
                                    id={`item-unitRate-${sectionIndex}-${itemIndex}`}
                                    type="number"
                                    value={item.unitRate}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, 'unitRate', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-mainCategory-${sectionIndex}-${itemIndex}`}>Main Category</Label>
                                  <Select
                                    value={item.mainCategory}
                                    onValueChange={(value) => handleUpdateItem(sectionIndex, itemIndex, 'mainCategory', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select main category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="civil_works">Civil Works</SelectItem>
                                      <SelectItem value="electrical">Electrical</SelectItem>
                                      <SelectItem value="mechanical">Mechanical</SelectItem>
                                      <SelectItem value="plumbing">Plumbing</SelectItem>
                                      <SelectItem value="hvac">HVAC</SelectItem>
                                      <SelectItem value="fire_safety">Fire Safety</SelectItem>
                                      <SelectItem value="security">Security</SelectItem>
                                      <SelectItem value="finishing">Finishing</SelectItem>
                                      <SelectItem value="landscaping">Landscaping</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-subCategory-${sectionIndex}-${itemIndex}`}>Sub Category</Label>
                                  <Select
                                    value={item.subCategory}
                                    onValueChange={(value) => handleUpdateItem(sectionIndex, itemIndex, 'subCategory', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select sub category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getSubCategoriesForMain(item.mainCategory).map((subCat) => (
                                        <SelectItem key={subCat.value} value={subCat.value}>
                                          {subCat.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-brand-${sectionIndex}-${itemIndex}`}>Brand (Optional)</Label>
                                  <Input
                                    id={`item-brand-${sectionIndex}-${itemIndex}`}
                                    value={item.brand || ''}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, 'brand', e.target.value)}
                                    placeholder="e.g., Philips, Siemens"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-model-${sectionIndex}-${itemIndex}`}>Model (Optional)</Label>
                                  <Input
                                    id={`item-model-${sectionIndex}-${itemIndex}`}
                                    value={item.model || ''}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, 'model', e.target.value)}
                                    placeholder="e.g., LED-100W, AC-5000"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-qualityGrade-${sectionIndex}-${itemIndex}`}>Quality Grade</Label>
                                  <Select
                                    value={item.qualityGrade || 'standard'}
                                    onValueChange={(value) => handleUpdateItem(sectionIndex, itemIndex, 'qualityGrade', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select quality grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="premium">Premium</SelectItem>
                                      <SelectItem value="standard">Standard</SelectItem>
                                      <SelectItem value="economy">Economy</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-warranty-${sectionIndex}-${itemIndex}`}>Warranty (Months)</Label>
                                  <Input
                                    id={`item-warranty-${sectionIndex}-${itemIndex}`}
                                    type="number"
                                    value={item.warranty || 0}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, 'warranty', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-deliveryTime-${sectionIndex}-${itemIndex}`}>Delivery Time (Days)</Label>
                                  <Input
                                    id={`item-deliveryTime-${sectionIndex}-${itemIndex}`}
                                    type="number"
                                    value={item.deliveryTime || 0}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, 'deliveryTime', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                  <Label htmlFor={`item-specifications-${sectionIndex}-${itemIndex}`}>Specifications (Optional)</Label>
                                  <Textarea
                                    id={`item-specifications-${sectionIndex}-${itemIndex}`}
                                    value={item.specifications || ''}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, 'specifications', e.target.value)}
                                    placeholder="Enter detailed specifications..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex justify-between items-center">
                                <span className="font-medium">Item Total:</span>
                                <span className="font-bold text-lg text-yellow-600">₹{item.totalAmount.toLocaleString()}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded flex justify-between items-center">
                        <span className="font-medium">Section Subtotal:</span>
                        <span className="font-bold text-lg">${section.subtotal.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {boqForm.sections.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No sections added yet</p>
                  <p className="text-sm">Click "Add Section" to start building your BOQ</p>
                </div>
              )}

              {/* BOQ Total Preview */}
              {boqForm.sections.length > 0 && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">BOQ Total Preview:</span>
                      <span className="text-2xl font-bold text-yellow-600">
                        ${calculateBOQTotals(boqForm.sections, boqForm.discountPercentage, boqForm.taxPercentage).totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Including discount and tax calculations</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBOQ} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Create BOQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit BOQ Dialog - Similar to Create but with existing data */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-white border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Edit BOQ - {selectedBOQ?.boqNumber}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Modify the bill of quantities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 bg-white max-h-96 overflow-y-auto">
            {/* Same form content as Create BOQ Dialog */}
            <div className="text-center py-4 text-gray-600">
              Edit form content would be identical to create form with pre-filled data
            </div>
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBOQ} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Update BOQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}