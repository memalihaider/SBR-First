import { faker } from '@faker-js/faker';
import { 
  Customer, Lead, Product, MainCategory, SubCategory, Project, Quotation, Invoice, InvoiceItem,
  Vendor, PurchaseOrder, InventoryTransaction, Activity,
  CustomerType, LeadStatus, ProductCategory, ProjectStatus,
  QuotationStatus, InvoiceStatus, PurchaseOrderStatus,
  UserRole, CompanySettings, Expense, Attendance, Employee,
  AttendanceStatus, LeaveType, LeaveStatus,
  Department, Payroll, PerformanceReview,
  JobPosting, Candidate, JobApplication, JobStatus, JobPriority, CandidateStatus,
  ReturnRequest, ReturnReason, ReturnStatus, ReturnType,
  OnboardingProcess, OnboardingTemplate, OnboardingTask, OnboardingStatus, OnboardingTaskStatus, OnboardingTaskPriority
} from '@/types';

// Set seed for consistent data
faker.seed(12345);

// Generate Main Categories
function generateMainCategories(): MainCategory[] {
  const mainCategories: MainCategory[] = [
    {
      id: 'electronics',
      name: 'Electronics',
      description: 'Electronic components and devices',
      icon: '⚡',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'mechanical',
      name: 'Mechanical',
      description: 'Mechanical parts and components',
      icon: '⚙️',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'tools',
      name: 'Tools & Equipment',
      description: 'Tools, test equipment, and machinery',
      icon: '🔧',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'consumables',
      name: 'Consumables',
      description: 'Consumable materials and supplies',
      icon: '📦',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'software',
      name: 'Software & Licenses',
      description: 'Software products and licenses',
      icon: '💻',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    }
  ];

  return mainCategories;
}

// Generate Sub Categories
function generateSubCategories(): SubCategory[] {
  const subCategories: SubCategory[] = [
    // Electronics subcategories
    {
      id: 'semiconductors',
      name: 'Semiconductors',
      description: 'ICs, transistors, diodes, and semiconductor devices',
      mainCategoryId: 'electronics',
      icon: '🔸',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'passive_components',
      name: 'Passive Components',
      description: 'Resistors, capacitors, inductors, and transformers',
      mainCategoryId: 'electronics',
      icon: '🔌',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'connectors',
      name: 'Connectors & Cables',
      description: 'Connectors, cables, and wiring accessories',
      mainCategoryId: 'electronics',
      icon: '🔗',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'power_supplies',
      name: 'Power Supplies',
      description: 'Power supplies, adapters, and converters',
      mainCategoryId: 'electronics',
      icon: '🔋',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },

    // Mechanical subcategories
    {
      id: 'fasteners',
      name: 'Fasteners',
      description: 'Screws, bolts, nuts, and fastening hardware',
      mainCategoryId: 'mechanical',
      icon: '🔩',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'bearings',
      name: 'Bearings & Bushings',
      description: 'Ball bearings, roller bearings, and bushings',
      mainCategoryId: 'mechanical',
      icon: '🎯',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'gears',
      name: 'Gears & Transmissions',
      description: 'Gears, sprockets, and transmission components',
      mainCategoryId: 'mechanical',
      icon: '⚙️',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },

    // Tools & Equipment subcategories
    {
      id: 'hand_tools',
      name: 'Hand Tools',
      description: 'Manual tools for assembly and maintenance',
      mainCategoryId: 'tools',
      icon: '🔨',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'power_tools',
      name: 'Power Tools',
      description: 'Electric and pneumatic power tools',
      mainCategoryId: 'tools',
      icon: '⚡',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'test_equipment',
      name: 'Test Equipment',
      description: 'Multimeters, oscilloscopes, and testing devices',
      mainCategoryId: 'tools',
      icon: '📊',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'safety_equipment',
      name: 'Safety Equipment',
      description: 'PPE, safety gear, and protective equipment',
      mainCategoryId: 'tools',
      icon: '🛡️',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },

    // Consumables subcategories
    {
      id: 'chemicals',
      name: 'Chemicals & Solvents',
      description: 'Cleaning chemicals, solvents, and lubricants',
      mainCategoryId: 'consumables',
      icon: '🧪',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'adhesives',
      name: 'Adhesives & Tapes',
      description: 'Glues, tapes, and adhesive materials',
      mainCategoryId: 'consumables',
      icon: '📏',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },

    // Software subcategories
    {
      id: 'design_software',
      name: 'Design Software',
      description: 'CAD, CAM, and design software licenses',
      mainCategoryId: 'software',
      icon: '🎨',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    },
    {
      id: 'productivity_software',
      name: 'Productivity Software',
      description: 'Office suites, collaboration tools, and utilities',
      mainCategoryId: 'software',
      icon: '📈',
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    }
  ];

  return subCategories;
}

// Generate Products (500+ items)
function generateProducts(): Product[] {
  const mainCategories = generateMainCategories();
  const subCategories = generateSubCategories();
  const manufacturers = ['Intel', 'AMD', 'NVIDIA', 'Texas Instruments', 'Analog Devices', 'Keysight', 'Rohde & Schwarz', 'Fluke', 'Bosch', 'Makita', '3M', 'WD-40'];

  // Create a mapping of subcategories to their main categories for easy lookup
  const subCategoryMap = new Map(subCategories.map(sub => [sub.id, sub]));

  const products: Product[] = [];

  // Generate products for each subcategory
  subCategories.forEach(subCategory => {
    const mainCategory = mainCategories.find(mc => mc.id === subCategory.mainCategoryId);
    if (!mainCategory) return;

    // Generate 20-50 products per subcategory
    const productCount = faker.number.int({ min: 20, max: 50 });

    for (let i = 0; i < productCount; i++) {
      const manufacturer = faker.helpers.arrayElement(manufacturers);
      const costPrice = faker.number.float({ min: 10, max: 5000, fractionDigits: 2 });
      const margin = faker.number.float({ min: 0.2, max: 0.6, fractionDigits: 2 });
      const sellingPrice = costPrice * (1 + margin);

      // Generate product name based on subcategory
      let productName = '';
      switch (subCategory.id) {
        case 'semiconductors':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['Microcontroller', 'Microprocessor', 'FPGA', 'DSP', 'ADC', 'DAC'])} ${faker.string.alphanumeric(6).toUpperCase()}`;
          break;
        case 'passive_components':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['Resistor', 'Capacitor', 'Inductor', 'Transformer'])} ${faker.number.int({ min: 100, max: 10000 })}${faker.helpers.arrayElement(['Ω', 'µF', 'mH', 'V'])}`;
          break;
        case 'connectors':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['USB', 'HDMI', 'Ethernet', 'DB9', 'RJ45', 'Power'])} Connector ${faker.helpers.arrayElement(['Male', 'Female', 'Panel Mount'])}`;
          break;
        case 'power_supplies':
          productName = `${manufacturer} ${faker.number.int({ min: 5, max: 48 })}V ${faker.number.int({ min: 1, max: 20 })}A Power Supply`;
          break;
        case 'fasteners':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['M', '#'])}${faker.number.int({ min: 2, max: 12 })} ${faker.helpers.arrayElement(['Bolt', 'Screw', 'Nut', 'Washer'])} ${faker.helpers.arrayElement(['Stainless Steel', 'Brass', 'Aluminum'])}`;
          break;
        case 'bearings':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['Ball Bearing', 'Roller Bearing', 'Thrust Bearing'])} ${faker.number.int({ min: 6000, max: 63000 })} Series`;
          break;
        case 'hand_tools':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['Screwdriver', 'Pliers', 'Wrench', 'Hammer', 'Multitool'])} Professional Grade`;
          break;
        case 'power_tools':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['Drill', 'Saw', 'Sander', 'Grinder'])} ${faker.number.int({ min: 12, max: 36 })}V Cordless`;
          break;
        case 'test_equipment':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['Multimeter', 'Oscilloscope', 'Signal Generator', 'Power Meter'])} ${faker.helpers.arrayElement(['Digital', 'Analog', 'Portable'])}`;
          break;
        case 'chemicals':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['Cleaning Solution', 'Lubricant', 'Solvent', 'Adhesive Remover'])} ${faker.number.int({ min: 1, max: 5 })}L`;
          break;
        case 'design_software':
          productName = `${manufacturer} ${faker.helpers.arrayElement(['CAD', 'CAM', 'CAE', 'EDA'])} Suite ${faker.helpers.arrayElement(['Professional', 'Enterprise', 'Ultimate'])}`;
          break;
        default:
          productName = `${manufacturer} ${faker.commerce.productName()}`;
      }

      products.push({
        id: `prod-${products.length + 1}`,
        sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
        name: productName,
        productType: '',
        description: faker.commerce.productDescription(),
        orderSpecification: '',
        mainCategoryId: mainCategory.id,
        subCategoryId: subCategory.id,
        category: `${mainCategory.name}/${subCategory.name}`, // Full path for backward compatibility
        manufacturer,
        supplierName: '',
        modelNumber: faker.string.alphanumeric(10).toUpperCase(),
        costPrice,
        sellingPrice,
        margin,
        marginPercentage: 0,
        shippingCharges: 0,
        currentStock: faker.number.int({ min: 0, max: 1000 }),
        minStockLevel: faker.number.int({ min: 10, max: 50 }),
        maxStockLevel: faker.number.int({ min: 500, max: 1500 }),
        reorderPoint: faker.number.int({ min: 20, max: 100 }),
        specifications: {
          'Operating Voltage': `${faker.number.int({ min: 3, max: 24 })}V`,
          'Temperature Range': `-${faker.number.int({ min: 20, max: 40 })}°C to +${faker.number.int({ min: 60, max: 85 })}°C`,
          'Package': faker.helpers.arrayElement(['DIP', 'SMD', 'BGA', 'QFN', 'Through Hole', 'Surface Mount']),
          'Datasheet': `${faker.internet.url()}/datasheet.pdf`
        },
        images: [faker.image.url()],
        datasheet: `${faker.internet.url()}/datasheet.pdf`,
        status: faker.helpers.arrayElement(['active', 'discontinued', 'out_of_stock', 'low_stock']),
        isSerialTracked: faker.datatype.boolean(),
        isBatchTracked: faker.datatype.boolean(),
        services: [],
        totalWithServices: 0,
        preferredVendor: `vendor-${faker.number.int({ min: 1, max: 30 })}`,
        alternateVendors: [`vendor-${faker.number.int({ min: 1, max: 30 })}`, `vendor-${faker.number.int({ min: 1, max: 30 })}`],
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: faker.date.recent({ days: 30 })
      });
    }
  });

  return products;
}

// Generate Customers (200+ items)
function generateCustomers(): Customer[] {
  const customers: Customer[] = [];
  const customerTypes: CustomerType[] = ['enterprise', 'sme', 'government', 'individual'];
  const industries = ['Manufacturing', 'Healthcare', 'Automotive', 'Aerospace', 'Telecommunications', 'Energy', 'Education'];

  for (let i = 0; i < 200; i++) {
    const customerType = faker.helpers.arrayElement(customerTypes);
    const industry = faker.helpers.arrayElement(industries);
    
    customers.push({
      id: `customer-${i + 1}`,
      companyName: faker.company.name(),
      customerType,
      industry,
      website: faker.internet.url(),
      taxId: faker.string.alphanumeric(10).toUpperCase(),
      primaryContact: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        designation: faker.person.jobTitle()
      },
      phoneNumbers: [
        { type: 'primary', number: faker.phone.number() },
        { type: 'secondary', number: faker.phone.number() }
      ],
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zipCode: faker.location.zipCode()
      },
      creditLimit: faker.number.float({ min: 10000, max: 500000, fractionDigits: 2 }),
      paymentTerms: faker.helpers.arrayElement(['Net 30', 'Net 45', 'Net 60', '2/10 Net 30']),
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      assignedSalesRep: `user-${faker.number.int({ min: 2, max: 3 })}`, // Sales reps
      projects: [],
      totalRevenue: faker.number.float({ min: 5000, max: 1000000, fractionDigits: 2 }),
      createdAt: faker.date.past({ years: 3 }),
      updatedAt: faker.date.recent({ days: 60 })
    });
  }

  return customers;
}

// Generate Leads (150+ items)
function generateLeads(): Lead[] {
  const leads: Lead[] = [];
  const leadStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost'];
  const sources = ['Website', 'Referral', 'Cold Call', 'Email Campaign', 'Trade Show', 'LinkedIn', 'Partner'];

  for (let i = 0; i < 150; i++) {
    const status = faker.helpers.arrayElement(leadStatuses);
    const source = faker.helpers.arrayElement(sources);
    const estimatedValue = faker.number.float({ min: 5000, max: 500000, fractionDigits: 2 });
    
    leads.push({
      id: `lead-${i + 1}`,
      companyName: faker.company.name(),
      contactPerson: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      status,
      source,
      estimatedValue,
      probability: faker.number.int({ min: 10, max: 95 }),
      expectedCloseDate: faker.date.future({ years: 1 }),
      assignedTo: `user-${faker.number.int({ min: 2, max: 3 })}`, // Sales reps
      notes: [
        faker.lorem.paragraph(),
        faker.lorem.paragraph()
      ],
      activities: [],
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 })
    });
  }

  return leads;
}

// Generate Projects (50+ items)
function generateProjects(): Project[] {
  const projects: Project[] = [];
  const projectTypes: Project['type'][] = ['installation', 'maintenance', 'consulting', 'supply_only', 'turnkey'];
  const projectStatuses: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];

  for (let i = 0; i < 50; i++) {
    const type = faker.helpers.arrayElement(projectTypes);
    const status = faker.helpers.arrayElement(projectStatuses);
    const startDate = faker.date.past({ years: 1 });
    const endDate = faker.date.future({ years: 1 });
    const budgetAmount = faker.number.float({ min: 25000, max: 2000000, fractionDigits: 2 });
    
    projects.push({
      id: `project-${i + 1}`,
      projectNumber: `PRJ-${faker.date.recent().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      name: `${faker.company.buzzPhrase()} ${faker.commerce.product()}`,
      description: faker.lorem.paragraphs(2),
      type,
      status,
      customerId: `customer-${faker.number.int({ min: 1, max: 200 })}`,
      startDate,
      endDate,
      actualStartDate: status !== 'planning' ? faker.date.between({ from: startDate, to: new Date() }) : undefined,
      actualEndDate: status === 'completed' ? faker.date.between({ from: startDate, to: endDate }) : undefined,
      budgetAmount,
      actualCost: faker.number.float({ min: budgetAmount * 0.7, max: budgetAmount * 1.2, fractionDigits: 2 }),
      profitMargin: faker.number.float({ min: 0.15, max: 0.35, fractionDigits: 2 }),
      projectManager: `user-${faker.number.int({ min: 5, max: 5 })}`, // Project manager
      teamMembers: [`user-${faker.number.int({ min: 2, max: 6 })}`],
      completionPercentage: faker.number.int({ min: 0, max: 100 }),
      milestones: [
        {
          id: `milestone-${i + 1}-1`,
          name: 'Project Kickoff',
          description: 'Initial project setup and team alignment',
          dueDate: faker.date.between({ from: startDate, to: endDate }),
          completedDate: status !== 'planning' ? faker.date.recent() : undefined,
          isCompleted: status !== 'planning',
          deliverables: ['Project Charter', 'Resource Plan']
        }
      ],
      documents: [
        {
          id: `doc-${i + 1}-1`,
          name: 'Project Contract',
          type: 'contract',
          url: faker.internet.url(),
          uploadedBy: `user-${faker.number.int({ min: 1, max: 8 })}`,
          uploadedAt: faker.date.recent()
        }
      ],
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 14 })
    });
  }

  return projects;
}
function generateQuotations(): Quotation[] {
  const quotations: Quotation[] = [];
  const quotationStatuses: QuotationStatus[] = ['draft', 'sent', 'under_review', 'approved', 'rejected', 'expired'];

  for (let i = 0; i < 100; i++) {
    const status = faker.helpers.arrayElement(quotationStatuses);
    const customerId = `customer-${faker.number.int({ min: 1, max: 200 })}`;
    const items = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
      productId: `prod-${faker.number.int({ min: 1, max: 500 })}`,
      quantity: faker.number.int({ min: 1, max: 50 }),
      unitPrice: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
      discount: faker.number.float({ min: 0, max: 0.1, fractionDigits: 2 }),
      totalPrice: 0 // Will be calculated
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 - item.discount)), 0);
    const discountAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.discount), 0);
    const taxAmount = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + taxAmount;

    // Update totalPrice for each item
    items.forEach(item => {
      item.totalPrice = item.quantity * item.unitPrice * (1 - item.discount);
    });

    quotations.push({
      id: `quotation-${i + 1}`,
      quotationNumber: `QTN-${faker.date.recent().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      customerId,
      status,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      validUntil: faker.date.future({ years: 1 }),
      paymentTerms: faker.helpers.arrayElement(['Net 30', 'Net 45', 'Net 60', '2/10 Net 30']),
      deliveryTerms: faker.lorem.sentence(),
      createdBy: `user-${faker.number.int({ min: 2, max: 3 })}`,
      approvedBy: status === 'approved' ? `user-${faker.number.int({ min: 4, max: 5 })}` : undefined,
      convertedToProject: status === 'approved' && faker.datatype.boolean() ? `project-${faker.number.int({ min: 1, max: 50 })}` : undefined,
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 })
    });
  }

  return quotations;
}

// Generate Invoices (80+ items)
function generateInvoices(): Invoice[] {
  const invoices: Invoice[] = [];
  const invoiceStatuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'];
  const products = generateProducts(); // Get products for reference
  const mainCategories = generateMainCategories();
  const subCategories = generateSubCategories();

  for (let i = 0; i < 80; i++) {
    const status = faker.helpers.arrayElement(invoiceStatuses);
    const customerId = `customer-${faker.number.int({ min: 1, max: 200 })}`;
    const projectId = faker.datatype.boolean() ? `project-${faker.number.int({ min: 1, max: 50 })}` : undefined;
    
    const items: InvoiceItem[] = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 20 });
      const unitPrice = product.sellingPrice;
      const discount = faker.number.float({ min: 0, max: 0.15, fractionDigits: 2 });
      const discountAmount = unitPrice * quantity * discount;
      const taxRate = faker.number.float({ min: 0.05, max: 0.15, fractionDigits: 2 });
      const taxAmount = (unitPrice * quantity * (1 - discount)) * taxRate;
      const serviceCharge = faker.number.float({ min: 0, max: 0.05, fractionDigits: 2 });
      const serviceChargeAmount = (unitPrice * quantity * (1 - discount)) * serviceCharge;
      const totalPrice = (unitPrice * quantity * (1 - discount)) + taxAmount + serviceChargeAmount;

      const mainCategory = mainCategories.find(mc => mc.id === product.mainCategoryId);
      const subCategory = subCategories.find(sc => sc.id === product.subCategoryId);

      return {
        id: faker.string.uuid(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        mainCategoryId: product.mainCategoryId,
        mainCategoryName: mainCategory?.name || 'Unknown',
        subCategoryId: product.subCategoryId,
        subCategoryName: subCategory?.name || 'Unknown',
        manufacturer: product.manufacturer,
        modelNumber: product.modelNumber,
        description: product.description,
        specifications: product.specifications,
        quantity,
        unitPrice,
        discount,
        discountAmount,
        taxRate,
        taxAmount,
        serviceCharge,
        serviceChargeAmount,
        totalPrice,
        stockAvailable: product.currentStock,
        isStockTracked: product.isSerialTracked || product.isBatchTracked,
        serialNumbers: product.isSerialTracked ? Array.from({ length: quantity }, () => faker.string.alphanumeric(10)) : undefined,
        batchNumber: product.isBatchTracked ? faker.string.alphanumeric(8) : undefined,
        notes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : undefined
      };
    });

    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * (1 - item.discount)), 0);
    const totalDiscountAmount = items.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalTaxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalServiceChargeAmount = items.reduce((sum, item) => sum + item.serviceChargeAmount, 0);
    const totalAmount = subtotal + totalTaxAmount + totalServiceChargeAmount;
    const paidAmount = status === 'paid' ? totalAmount : 
                      status === 'partially_paid' ? faker.number.float({ min: totalAmount * 0.3, max: totalAmount * 0.8, fractionDigits: 2 }) : 0;
    const remainingAmount = totalAmount - paidAmount;

    // Generate taxes array
    const taxes = items.map(item => ({
      id: faker.string.uuid(),
      name: 'Sales Tax',
      rate: item.taxRate,
      amount: item.taxAmount,
      type: 'sales_tax' as const,
      isInclusive: false
    }));

    // Generate service charges array
    const serviceCharges = items.filter(item => item.serviceCharge > 0).map(item => ({
      id: faker.string.uuid(),
      name: 'Service Charge',
      rate: item.serviceCharge,
      amount: item.serviceChargeAmount,
      type: 'custom' as const,
      description: 'Additional service fee'
    }));

    const issueDate = faker.date.past({ years: 1 });
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term

    invoices.push({
      id: `invoice-${i + 1}`,
      invoiceNumber: `INV-${faker.date.recent().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      customerId,
      customerName: faker.company.name(), // Add customer name
      projectId,
      projectName: projectId ? `Project ${faker.number.int({ min: 1, max: 50 })}` : undefined,
      status,
      items,
      subtotal,
      discountAmount: totalDiscountAmount,
      discountPercentage: totalDiscountAmount / subtotal * 100,
      taxes,
      totalTaxAmount,
      serviceCharges,
      totalServiceChargeAmount,
      totalAmount,
      paidAmount,
      remainingAmount,
      stockReserved: false,
      issueDate,
      dueDate,
      paidDate: status === 'paid' ? faker.date.between({ from: issueDate, to: new Date() }) : undefined,
      paymentTerms: 'Net 30 days',
      createdBy: `user-${faker.number.int({ min: 2, max: 3 })}`,
      createdAt: issueDate,
      updatedAt: faker.date.recent({ days: 7 })
    });
  }

  return invoices;
}

// Generate Expenses (100+ items)
function generateExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const categories = ['Office Supplies', 'Travel', 'Software', 'Marketing', 'Utilities', 'Equipment', 'Professional Services', 'Training', 'Entertainment', 'Miscellaneous'];
  const vendors = ['Office Depot', 'Delta Airlines', 'Adobe Inc.', 'Google LLC', 'Verizon', 'Apple Store', 'IKEA Business', 'Marriott Hotels', 'Amazon Business', 'Microsoft', 'Deloitte', 'LinkedIn Learning'];
  const paymentMethods = ['Company Card', 'Corporate Account', 'Bank Transfer', 'Purchase Order', 'Auto-Pay', 'Check'];
  const statuses = ['approved', 'pending', 'rejected'];

  for (let i = 0; i < 100; i++) {
    const category = faker.helpers.arrayElement(categories);
    const vendor = faker.helpers.arrayElement(vendors);
    const amount = faker.number.float({ min: 25, max: 5000, fractionDigits: 2 });
    const expenseDate = faker.date.recent({ days: 90 });
    const status = faker.helpers.arrayElement(statuses);
    
    expenses.push({
      id: `expense-${i + 1}`,
      category,
      description: faker.commerce.productDescription(),
      amount,
      expenseDate,
      projectId: faker.datatype.boolean({ probability: 0.3 }) ? `project-${faker.number.int({ min: 1, max: 50 })}` : undefined,
      vendorId: faker.datatype.boolean({ probability: 0.7 }) ? `vendor-${faker.number.int({ min: 1, max: 30 })}` : undefined,
      approvedBy: status === 'approved' ? `user-${faker.number.int({ min: 4, max: 5 })}` : undefined,
      approvedAt: status === 'approved' ? faker.date.between({ from: expenseDate, to: new Date() }) : undefined,
      receiptUrl: faker.datatype.boolean({ probability: 0.8 }) ? faker.internet.url() : undefined,
      createdBy: `user-${faker.number.int({ min: 1, max: 8 })}`,
      createdAt: expenseDate,
    });
  }

  return expenses;
}

// Generate Employees (50+ items)
function generateEmployees(): Employee[] {
  const employees: Employee[] = [];
  const departments = ['Engineering', 'Sales', 'HR', 'Finance', 'Operations', 'Marketing', 'IT', 'Support'];
  const positions = ['Manager', 'Senior Developer', 'Developer', 'Analyst', 'Coordinator', 'Specialist', 'Assistant'];

  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const department = faker.helpers.arrayElement(departments);
    const position = faker.helpers.arrayElement(positions);
    
    employees.push({
      id: `employee-${i + 1}`,
      employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
      userId: `user-${i + 1}`,
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      department,
      position,
      managerId: i > 5 ? `user-${faker.number.int({ min: 1, max: 5 })}` : undefined,
      hireDate: faker.date.past({ years: 5 }),
      salary: faker.number.float({ min: 30000, max: 150000, fractionDigits: 2 }),
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      avatar: faker.image.avatar(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zipCode: faker.location.zipCode()
      },
      emergencyContact: {
        name: faker.person.fullName(),
        relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend']),
        phone: faker.phone.number()
      },
      createdAt: faker.date.past({ years: 5 }),
      updatedAt: faker.date.recent({ days: 30 })
    });
  }

  return employees;
}

// Generate Attendance Records (1000+ items for last 30 days)
function generateAttendance(): Attendance[] {
  const attendance: Attendance[] = [];
  const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday', 'weekend'];
  const employees = generateEmployees(); // Get employees for reference

  // Generate attendance for last 30 days
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    
    // Skip weekends for most records, but include some weekend work
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    employees.forEach(employee => {
      if (!employee.isActive) return; // Skip inactive employees
      
      let status: AttendanceStatus;
      let checkInTime: Date | undefined;
      let checkOutTime: Date | undefined;
      let hoursWorked = 0;
      
      if (isWeekend) {
        status = faker.helpers.weightedArrayElement([
          { weight: 8, value: 'weekend' as AttendanceStatus },
          { weight: 2, value: 'present' as AttendanceStatus }
        ]);
      } else {
        status = faker.helpers.weightedArrayElement([
          { weight: 75, value: 'present' as AttendanceStatus },
          { weight: 10, value: 'late' as AttendanceStatus },
          { weight: 8, value: 'absent' as AttendanceStatus },
          { weight: 5, value: 'half_day' as AttendanceStatus },
          { weight: 2, value: 'on_leave' as AttendanceStatus }
        ]);
      }
      
      if (status === 'present' || status === 'late' || status === 'half_day') {
        // Generate check-in time
        const baseHour = status === 'late' ? 9.5 : 8.5; // 9:30 AM for late, 8:30 AM for on-time
        const checkInHour = baseHour + faker.number.float({ min: -0.5, max: 0.5, fractionDigits: 2 });
        checkInTime = new Date(date);
        checkInTime.setHours(Math.floor(checkInHour), (checkInHour % 1) * 60);
        
        // Generate check-out time (typically 8-9 hours later)
        const workHours = status === 'half_day' ? 4 : faker.number.float({ min: 7.5, max: 9.5, fractionDigits: 2 });
        checkOutTime = new Date(checkInTime.getTime() + workHours * 60 * 60 * 1000);
        hoursWorked = workHours;
      }
      
      attendance.push({
        id: `attendance-${employee.id}-${date.toISOString().split('T')[0]}`,
        employeeId: employee.id,
        date,
        checkInTime,
        checkOutTime,
        status,
        hoursWorked,
        breakDuration: status === 'present' || status === 'late' ? faker.number.int({ min: 30, max: 90 }) : 0,
        location: faker.datatype.boolean() ? 'Office' : 'Remote',
        ipAddress: faker.internet.ip(),
        notes: faker.datatype.boolean({ probability: 0.1 }) ? faker.lorem.sentence() : undefined,
        approvedBy: faker.datatype.boolean({ probability: 0.8 }) ? `user-${faker.number.int({ min: 4, max: 5 })}` : undefined,
        createdAt: date,
        updatedAt: faker.date.between({ from: date, to: new Date() })
      });
    });
  }

  return attendance;
}

// Generate Departments (8 items)
function generateDepartments(): Department[] {
  const departments: Department[] = [];
  const deptData = [
    { name: 'Engineering', code: 'ENG', managerId: 'user-1' },
    { name: 'Sales', code: 'SAL', managerId: 'user-2' },
    { name: 'Human Resources', code: 'HR', managerId: 'user-3' },
    { name: 'Finance', code: 'FIN', managerId: 'user-4' },
    { name: 'Operations', code: 'OPS', managerId: 'user-5' },
    { name: 'Marketing', code: 'MKT', managerId: 'user-6' },
    { name: 'IT Support', code: 'ITS', managerId: 'user-7' },
    { name: 'Customer Support', code: 'SUP', managerId: 'user-8' }
  ];

  deptData.forEach((dept, index) => {
    departments.push({
      id: `department-${index + 1}`,
      name: dept.name,
      code: dept.code,
      description: `${dept.name} department responsible for ${dept.name.toLowerCase()} operations`,
      managerId: dept.managerId,
      budget: faker.number.float({ min: 50000, max: 500000, fractionDigits: 2 }),
      employeeCount: faker.number.int({ min: 5, max: 15 }),
      isActive: true,
      createdAt: faker.date.past({ years: 3 }),
      updatedAt: faker.date.recent({ days: 30 })
    });
  });

  return departments;
}

// Generate Payroll Records (100+ items)
function generatePayrolls(): Payroll[] {
  const payrolls: Payroll[] = [];
  const employees = generateEmployees(); // Get employees for reference

  // Generate payroll for last 6 months
  const today = new Date();
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const periodStart = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() - monthOffset + 1, 0);

    employees.filter(e => e.isActive).forEach(employee => {
      const baseSalary = employee.salary;
      const monthlySalary = baseSalary / 12;

      // Generate allowances (housing, transport, etc.)
      const allowances = [
        { type: 'Housing Allowance', amount: monthlySalary * 0.15 },
        { type: 'Transport Allowance', amount: monthlySalary * 0.1 },
        { type: 'Medical Allowance', amount: monthlySalary * 0.05 },
      ];

      // Generate deductions (tax, insurance, etc.)
      const deductions = [
        { type: 'Income Tax', amount: monthlySalary * 0.12 },
        { type: 'Social Security', amount: monthlySalary * 0.08 },
        { type: 'Health Insurance', amount: monthlySalary * 0.03 },
      ];

      const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
      const grossPay = monthlySalary + totalAllowances;
      const netPay = grossPay - totalDeductions;

      payrolls.push({
        id: `payroll-${employee.id}-${periodStart.toISOString().slice(0, 7)}`,
        employeeId: employee.id,
        period: {
          startDate: periodStart,
          endDate: periodEnd,
        },
        basicSalary: monthlySalary,
        allowances,
        deductions,
        grossPay,
        netPay,
        taxAmount: deductions.find(d => d.type === 'Income Tax')?.amount || 0,
        paymentDate: monthOffset === 0 ? undefined : new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 15),
        paymentMethod: faker.helpers.arrayElement(['Bank Transfer', 'Check', 'Direct Deposit']),
        status: monthOffset === 0 ? 'pending' : monthOffset === 1 ? 'processed' : 'paid',
        createdBy: `user-${faker.number.int({ min: 4, max: 5 })}`,
        createdAt: periodStart,
        updatedAt: faker.date.between({ from: periodStart, to: new Date() })
      });
    });
  }

  return payrolls;
}

// Generate Job Postings (20+ items)
function generateJobPostings(): JobPosting[] {
  const jobPostings: JobPosting[] = [];
  const departments = ['Engineering', 'Sales', 'HR', 'Finance', 'Operations', 'Marketing', 'IT Support', 'Customer Support'];
  const employmentTypes: JobPosting['employmentType'][] = ['full_time', 'part_time', 'contract', 'internship'];
  const experienceLevels: JobPosting['experienceLevel'][] = ['entry', 'mid', 'senior', 'executive'];
  const statuses: JobStatus[] = ['active', 'paused', 'closed', 'filled'];
  const priorities: JobPriority[] = ['low', 'medium', 'high', 'urgent'];

  const jobTitles = [
    'Software Developer', 'Senior Software Developer', 'Sales Representative', 'Marketing Specialist',
    'HR Coordinator', 'Financial Analyst', 'Operations Manager', 'IT Support Specialist',
    'Customer Service Representative', 'Project Manager', 'Data Analyst', 'UX Designer',
    'DevOps Engineer', 'Business Analyst', 'Account Manager', 'Content Writer'
  ];

  for (let i = 0; i < 20; i++) {
    const department = faker.helpers.arrayElement(departments);
    const title = faker.helpers.arrayElement(jobTitles);
    const postedDate = faker.date.recent({ days: 60 });
    const deadline = faker.date.future({ years: 1 });

    jobPostings.push({
      id: `job-${i + 1}`,
      title: `${faker.helpers.arrayElement(['Senior', 'Junior', '', 'Lead'])} ${title}`.trim(),
      department,
      location: faker.helpers.arrayElement(['Remote', 'On-site', 'Hybrid']),
      employmentType: faker.helpers.arrayElement(employmentTypes),
      experienceLevel: faker.helpers.arrayElement(experienceLevels),
      salaryRange: {
        min: faker.number.int({ min: 30000, max: 80000 }),
        max: faker.number.int({ min: 80000, max: 200000 }),
        currency: 'USD'
      },
      description: faker.lorem.paragraphs(2),
      requirements: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => faker.lorem.sentence()),
      responsibilities: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => faker.lorem.sentence()),
      benefits: ['Health Insurance', '401(k)', 'Paid Time Off', 'Professional Development', 'Flexible Hours'],
      skills: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => faker.lorem.words(2)),
      status: faker.helpers.arrayElement(statuses),
      priority: faker.helpers.arrayElement(priorities),
      postedBy: `user-${faker.number.int({ min: 1, max: 8 })}`,
      postedDate,
      applicationDeadline: faker.datatype.boolean() ? deadline : undefined,
      applicationsCount: faker.number.int({ min: 0, max: 50 }),
      viewsCount: faker.number.int({ min: 10, max: 200 }),
      createdAt: postedDate,
      updatedAt: faker.date.between({ from: postedDate, to: new Date() })
    });
  }

  return jobPostings;
}

// Generate Candidates (100+ items)
function generateCandidates(): Candidate[] {
  const candidates: Candidate[] = [];
  const statuses: CandidateStatus[] = ['new', 'screening', 'interview_scheduled', 'interviewed', 'technical_review', 'final_interview', 'offer_extended', 'hired', 'rejected'];
  const sources = ['website', 'referral', 'linkedin', 'indeed', 'other'];

  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const appliedDate = faker.date.recent({ days: 90 });

    candidates.push({
      id: `candidate-${i + 1}`,
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      resumeUrl: faker.datatype.boolean({ probability: 0.8 }) ? faker.internet.url() : undefined,
      coverLetter: faker.datatype.boolean({ probability: 0.6 }) ? faker.lorem.paragraphs(2) : undefined,
      portfolioUrl: faker.datatype.boolean({ probability: 0.4 }) ? faker.internet.url() : undefined,
      linkedinUrl: faker.datatype.boolean({ probability: 0.7 }) ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : undefined,
      currentPosition: faker.person.jobTitle(),
      currentCompany: faker.company.name(),
      experienceYears: faker.number.int({ min: 0, max: 15 }),
      education: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
        degree: faker.helpers.arrayElement(['Bachelor of Science', 'Master of Science', 'Bachelor of Arts', 'MBA', 'PhD']),
        institution: faker.company.name() + ' University',
        graduationYear: faker.number.int({ min: 2000, max: 2024 }),
        gpa: faker.datatype.boolean() ? faker.number.float({ min: 2.0, max: 4.0, fractionDigits: 2 }) : undefined
      })),
      skills: Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () => faker.lorem.words(2)),
      expectedSalary: faker.datatype.boolean({ probability: 0.6 }) ? {
        min: faker.number.int({ min: 40000, max: 100000 }),
        max: faker.number.int({ min: 100000, max: 250000 }),
        currency: 'USD'
      } : undefined,
      availabilityDate: faker.datatype.boolean() ? faker.date.future({ years: 1 }) : undefined,
      status: faker.helpers.arrayElement(statuses),
      appliedDate,
      lastActivityDate: faker.date.between({ from: appliedDate, to: new Date() }),
      notes: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => faker.lorem.sentence()),
      rating: faker.number.int({ min: 1, max: 5 }),
      source: faker.helpers.arrayElement(sources) as Candidate['source'],
      referredBy: faker.datatype.boolean({ probability: 0.2 }) ? `user-${faker.number.int({ min: 1, max: 8 })}` : undefined,
      createdAt: appliedDate,
      updatedAt: faker.date.between({ from: appliedDate, to: new Date() })
    });
  }

  return candidates;
}

// Generate Job Applications (150+ items)
function generateJobApplications(): JobApplication[] {
  const applications: JobApplication[] = [];
  const candidates = generateCandidates();
  const jobs = generateJobPostings();
  const statuses: CandidateStatus[] = ['new', 'screening', 'interview_scheduled', 'interviewed', 'technical_review', 'final_interview', 'offer_extended', 'hired', 'rejected'];

  for (let i = 0; i < 150; i++) {
    const candidate = faker.helpers.arrayElement(candidates);
    const job = faker.helpers.arrayElement(jobs);
    const appliedDate = faker.date.between({ from: job.postedDate, to: new Date() });
    const status = faker.helpers.arrayElement(statuses);

    applications.push({
      id: `application-${i + 1}`,
      jobId: job.id,
      candidateId: candidate.id,
      status,
      appliedDate,
      lastUpdated: faker.date.between({ from: appliedDate, to: new Date() }),
      currentStage: faker.helpers.arrayElement(['Application Review', 'Phone Screening', 'Technical Interview', 'Final Interview', 'Offer', 'Hired']),
      interviewRounds: [], // Will be populated separately
      offerDetails: status === 'offer_extended' ? {
        salary: faker.number.int({ min: 50000, max: 150000 }),
        startDate: faker.date.future({ years: 1 }),
        benefits: ['Health Insurance', '401(k)', 'Paid Time Off']
      } : undefined,
      rejectionReason: status === 'rejected' ? faker.lorem.sentence() : undefined,
      notes: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.lorem.sentence()),
      rating: faker.number.int({ min: 1, max: 5 }),
      createdAt: appliedDate,
      updatedAt: faker.date.between({ from: appliedDate, to: new Date() })
    });
  }

  return applications;
}

function generateReturnRequests(): ReturnRequest[] {
  const returnRequests: ReturnRequest[] = [];
  const products = generateProducts();
  const customers = generateCustomers();

  const returnReasons: ReturnReason[] = ['defective', 'wrong_item', 'damaged', 'customer_dissatisfaction', 'quality_issue'];
  const returnStatuses: ReturnStatus[] = ['pending', 'approved', 'received', 'inspected', 'refunded', 'replaced'];
  const returnTypes: ReturnType[] = ['customer_return', 'vendor_return', 'internal_return'];

  for (let i = 0; i < 25; i++) {
    const type = faker.helpers.arrayElement(returnTypes);
    const status = faker.helpers.arrayElement(returnStatuses);
    const requestedDate = faker.date.recent({ days: 60 });

    // Generate return items
    const itemCount = faker.number.int({ min: 1, max: 3 });
    const items = [];
    let totalQuantity = 0;
    let totalValue = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = product.sellingPrice;

      items.push({
        id: faker.string.uuid(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity,
        unitPrice,
        totalValue: quantity * unitPrice,
        reason: faker.helpers.arrayElement(returnReasons),
        condition: faker.helpers.arrayElement(['new', 'used', 'damaged', 'defective']),
        notes: faker.lorem.sentence(),
        images: faker.datatype.boolean() ? [faker.image.url()] : undefined,
        serialNumbers: product.isSerialTracked ? Array.from({ length: quantity }, () => faker.string.alphanumeric(10)) : undefined,
        batchNumber: product.isBatchTracked ? faker.string.alphanumeric(8) : undefined
      });

      totalQuantity += quantity;
      totalValue += quantity * unitPrice;
    }

    const returnRequest: ReturnRequest = {
      id: faker.string.uuid(),
      returnNumber: `RTN-${faker.string.numeric(6)}`,
      type,

      // References based on type
      referenceType: type === 'customer_return' ? 'sales_order' : type === 'vendor_return' ? 'purchase_order' : undefined,
      referenceId: type !== 'internal_return' ? faker.string.uuid() : undefined,
      customerId: type === 'customer_return' ? faker.helpers.arrayElement(customers).id : undefined,
      vendorId: type === 'vendor_return' ? faker.string.uuid() : undefined,

      items,
      totalQuantity,
      totalValue,

      status,
      priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent']),

      requestedDate,
      expectedReturnDate: faker.date.future({ years: 0.1 }),
      actualReturnDate: status !== 'pending' ? faker.date.between({ from: requestedDate, to: new Date() }) : undefined,
      processedDate: ['refunded', 'replaced'].includes(status) ? faker.date.between({ from: requestedDate, to: new Date() }) : undefined,

      inspectedBy: status !== 'pending' ? faker.string.uuid() : undefined,
      approvedBy: ['approved', 'received', 'inspected', 'refunded', 'replaced'].includes(status) ? faker.string.uuid() : undefined,
      rejectedReason: status === 'rejected' ? faker.lorem.sentence() : undefined,

      refundAmount: ['refunded'].includes(status) ? totalValue * faker.number.float({ min: 0.8, max: 1.0 }) : undefined,
      restockingFee: ['refunded'].includes(status) ? totalValue * faker.number.float({ min: 0, max: 0.1 }) : undefined,
      finalRefundAmount: ['refunded'].includes(status) ? totalValue * faker.number.float({ min: 0.7, max: 0.95 }) : undefined,

      returnMethod: faker.helpers.arrayElement(['pickup', 'drop_off', 'mail']),
      trackingNumber: faker.datatype.boolean() ? faker.string.alphanumeric(12) : undefined,
      warehouseLocation: faker.company.name(),

      customerNotes: type === 'customer_return' ? faker.lorem.paragraph() : undefined,
      internalNotes: faker.lorem.sentence(),
      resolutionNotes: ['refunded', 'replaced'].includes(status) ? faker.lorem.paragraph() : undefined,

      createdBy: faker.string.uuid(),
      createdAt: requestedDate,
      updatedAt: faker.date.between({ from: requestedDate, to: new Date() })
    };

    returnRequests.push(returnRequest);
  }

  return returnRequests;
}

// Generate Onboarding Templates
function generateOnboardingTemplates(): OnboardingTemplate[] {
  const templates: OnboardingTemplate[] = [];
  const departments = ['Engineering', 'Sales', 'HR', 'Finance', 'Operations', 'Marketing', 'IT Support', 'Customer Support'];

  departments.forEach((department, index) => {
    const tasks: OnboardingTask[] = [
      {
        id: `task-${department.toLowerCase()}-1`,
        title: 'Complete HR Paperwork',
        description: 'Fill out all required HR forms including tax forms, emergency contacts, and company policies acknowledgment.',
        category: 'hr',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        isRequired: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${department.toLowerCase()}-2`,
        title: 'IT Setup and Equipment',
        description: 'Receive company laptop, email setup, and access to required software and systems.',
        category: 'it',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        isRequired: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${department.toLowerCase()}-3`,
        title: 'Department Orientation',
        description: 'Meet with department manager and team members for department-specific orientation.',
        category: 'orientation',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        isRequired: true,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${department.toLowerCase()}-4`,
        title: 'Company Culture Training',
        description: 'Attend company culture and values training session.',
        category: 'training',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        isRequired: true,
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${department.toLowerCase()}-5`,
        title: 'Compliance Training',
        description: 'Complete mandatory compliance and safety training modules.',
        category: 'compliance',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        isRequired: true,
        order: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${department.toLowerCase()}-6`,
        title: 'Performance Goals Setting',
        description: 'Meet with manager to set initial performance goals and expectations.',
        category: 'hr',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        isRequired: true,
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    templates.push({
      id: `template-${index + 1}`,
      name: `${department} Onboarding Template`,
      description: `Standard onboarding process for new ${department.toLowerCase()} team members`,
      department,
      duration: 30, // 30 days
      tasks,
      isActive: true,
      usageCount: faker.number.int({ min: 5, max: 25 }),
      createdBy: `user-${faker.number.int({ min: 1, max: 8 })}`,
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 })
    });
  });

  return templates;
}

// Generate Onboarding Processes
function generateOnboardingProcesses(): OnboardingProcess[] {
  const processes: OnboardingProcess[] = [];
  const templates = generateOnboardingTemplates();
  const employees = [
    { id: 'employee-1', name: 'John Smith', position: 'Software Developer', department: 'Engineering' },
    { id: 'employee-2', name: 'Sarah Johnson', position: 'Sales Representative', department: 'Sales' },
    { id: 'employee-3', name: 'Mike Davis', position: 'HR Coordinator', department: 'HR' },
    { id: 'employee-4', name: 'Emily Brown', position: 'Financial Analyst', department: 'Finance' },
    { id: 'employee-5', name: 'David Wilson', position: 'Operations Manager', department: 'Operations' }
  ];

  employees.forEach((employee, index) => {
    const template = templates.find(t => t.department === employee.department) || templates[0];
    const startDate = faker.date.recent({ days: 60 });
    const expectedEndDate = new Date(startDate.getTime() + template.duration * 24 * 60 * 60 * 1000);

    // Clone tasks and update status/progress
    const tasks = template.tasks.map(task => ({
      ...task,
      id: `${task.id}-${employee.id}`,
      status: faker.helpers.arrayElement(['pending', 'in-progress', 'completed'] as OnboardingTaskStatus[]),
      completedDate: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.between({ from: startDate, to: new Date() }) : undefined
    }));

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = Math.round((completedTasks / tasks.length) * 100);

    let status: OnboardingStatus;
    if (progress === 100) {
      status = 'completed';
    } else if (progress > 50) {
      status = 'almost-complete';
    } else if (progress > 0) {
      status = 'in-progress';
    } else {
      status = 'not-started';
    }

    processes.push({
      id: `onboarding-${index + 1}`,
      employeeId: employee.id,
      employeeName: employee.name,
      position: employee.position,
      department: employee.department,
      templateId: template.id,
      templateName: template.name,
      startDate,
      expectedEndDate,
      actualEndDate: status === 'completed' ? faker.date.between({ from: startDate, to: new Date() }) : undefined,
      status,
      progress,
      mentorId: faker.datatype.boolean({ probability: 0.8 }) ? `user-${faker.number.int({ min: 1, max: 8 })}` : undefined,
      mentorName: faker.datatype.boolean({ probability: 0.8 }) ? faker.person.fullName() : undefined,
      tasks,
      completedTasks,
      totalTasks: tasks.length,
      notes: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.lorem.sentence()),
      feedback: status === 'completed' ? {
        employeeRating: faker.number.int({ min: 3, max: 5 }),
        mentorRating: faker.number.int({ min: 3, max: 5 }),
        comments: faker.lorem.paragraph(),
        submittedAt: faker.date.recent({ days: 7 })
      } : undefined,
      createdBy: `user-${faker.number.int({ min: 1, max: 8 })}`,
      createdAt: startDate,
      updatedAt: faker.date.recent({ days: 7 })
    });
  });

  return processes;
}

export const mockData = {
  mainCategories: generateMainCategories(),
  subCategories: generateSubCategories(),
  products: generateProducts(),
  customers: generateCustomers(),
  leads: generateLeads(),
  projects: generateProjects(),
  quotations: generateQuotations(),
  invoices: generateInvoices(),
  expenses: generateExpenses(),
  employees: generateEmployees(),
  attendance: generateAttendance(),
  departments: generateDepartments(),
  payrolls: generatePayrolls(),
  jobPostings: generateJobPostings(),
  candidates: generateCandidates(),
  jobApplications: generateJobApplications(),
  returnRequests: generateReturnRequests(),
  companySettings: {
    companyName: 'Largify 360ERP',
    logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=80&fit=crop&crop=center',
    tagline: 'Complete Business Management Solution',
    address: {
      street: '123 Business Avenue',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10001'
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'info@largify.com',
      website: 'https://largify.com'
    },
    taxInfo: {
      taxId: 'TAX123456789',
      registrationNumber: 'REG987654321'
    },
    invoiceSettings: {
      termsAndConditions: `1. Payment is due within 30 days of invoice date.
2. Late payments may incur a 1.5% monthly interest charge.
3. All goods remain property of Largify 360ERP until fully paid.
4. Any disputes must be raised within 7 days of invoice receipt.
5. This invoice is subject to our standard terms and conditions available at www.largify.com/terms.`,
      paymentTerms: 'Net 30 days from invoice date. Late payments subject to 1.5% monthly interest.',
      lateFeePolicy: 'Late payments will incur a 1.5% monthly interest charge.',
      defaultDueDays: 30,
      footerText: 'Thank you for your business!'
    },
    banking: {
      bankName: 'First National Bank',
      accountNumber: '****-****-****-1234',
      routingNumber: '123456789',
      swiftCode: 'FNBUS33'
    }
  },
  
  // Helper functions to get related data
  getMainCategoryById: (id: string) => generateMainCategories().find(mc => mc.id === id),
  getSubCategoryById: (id: string) => generateSubCategories().find(sc => sc.id === id),
  getSubCategoriesByMainCategory: (mainCategoryId: string) => generateSubCategories().filter(sc => sc.mainCategoryId === mainCategoryId),
  getProductsByMainCategory: (mainCategoryId: string) => generateProducts().filter(p => p.mainCategoryId === mainCategoryId),
  getProductsBySubCategory: (subCategoryId: string) => generateProducts().filter(p => p.subCategoryId === subCategoryId),
  getCustomerById: (id: string) => generateCustomers().find(c => c.id === id),
  getLeadById: (id: string) => generateLeads().find(l => l.id === id),
  getProductById: (id: string) => generateProducts().find(p => p.id === id),
  getProjectById: (id: string) => generateProjects().find(p => p.id === id),
  getQuotationById: (id: string) => generateQuotations().find(q => q.id === id),
  getExpenseById: (id: string) => generateExpenses().find(e => e.id === id),
  getEmployeeById: (id: string) => generateEmployees().find(e => e.id === id),
  getAttendanceByEmployee: (employeeId: string) => generateAttendance().filter(a => a.employeeId === employeeId),
  getPayrollsByEmployee: (employeeId: string) => generatePayrolls().filter(p => p.employeeId === employeeId),
  getPayrollsByPeriod: (startDate: Date, endDate: Date) => generatePayrolls().filter(p => 
    p.period.startDate >= startDate && p.period.endDate <= endDate
  ),
  getDepartmentsByManager: (managerId: string) => generateDepartments().filter(d => d.managerId === managerId),
  getExpensesByProject: (projectId: string) => generateExpenses().filter(e => e.projectId === projectId),
  getExpensesByVendor: (vendorId: string) => generateExpenses().filter(e => e.vendorId === vendorId),
  
  // Filter functions
  getLeadsByAssignee: (userId: string) => generateLeads().filter(l => l.assignedTo === userId),
  getCustomersByAssignee: (userId: string) => generateCustomers().filter(c => c.assignedSalesRep === userId),
  getProjectsByManager: (userId: string) => generateProjects().filter(p => p.projectManager === userId),
  getQuotationsByCustomer: (customerId: string) => generateQuotations().filter(q => q.customerId === customerId),
  getInvoicesByCustomer: (customerId: string) => generateInvoices().filter(i => i.customerId === customerId),
  getReturnRequestById: (id: string) => generateReturnRequests().find(r => r.id === id),
  getReturnRequestsByCustomer: (customerId: string) => generateReturnRequests().filter(r => r.customerId === customerId),
  getReturnRequestsByStatus: (status: ReturnStatus) => generateReturnRequests().filter(r => r.status === status),
  getReturnRequestsByType: (type: ReturnType) => generateReturnRequests().filter(r => r.type === type),
  getReturnRequestsByProduct: (productId: string) => generateReturnRequests().filter(r => 
    r.items.some(item => item.productId === productId)
  ),
  getTotalRevenue: () => {
    // Calculate total revenue from all invoices
    return generateInvoices().reduce((total, invoice) => total + invoice.totalAmount, 0);
  },
  getActiveProjects: () => {
    // Return count of active projects
    return generateProjects().filter(p => p.status === 'active').length;
  },
  getLowStockProducts: () => {
    // Return count of products below minimum stock level
    return generateProducts().filter(p => p.currentStock <= p.minStockLevel).length;
  },
  getProjectsByCustomer: (customerId: string) => {
    // Return projects for a specific customer
    return generateProjects().filter(p => p.customerId === customerId);
  },
  templates: generateOnboardingTemplates(),
  processes: generateOnboardingProcesses(),
  getTemplateById: (id: string) => generateOnboardingTemplates().find(t => t.id === id),
  getProcessById: (id: string) => generateOnboardingProcesses().find(p => p.id === id),
  getProcessesByStatus: (status: OnboardingStatus) => generateOnboardingProcesses().filter(p => p.status === status),
  getProcessesByDepartment: (department: string) => generateOnboardingProcesses().filter(p => p.department === department),
  getActiveProcesses: () => generateOnboardingProcesses().filter(p => ['not-started', 'in-progress', 'almost-complete'].includes(p.status)),
  getCompletedProcesses: () => generateOnboardingProcesses().filter(p => p.status === 'completed'),
  getOverdueTasks: () => {
    const allTasks: OnboardingTask[] = [];
    generateOnboardingProcesses().forEach(process => {
      allTasks.push(...process.tasks);
    });
    return allTasks.filter(task => task.status !== 'completed' && task.dueDate < new Date());
  }
};

export default mockData;
