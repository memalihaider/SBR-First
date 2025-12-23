# Largify 360ERP - Comprehensive Enterprise Resource Planning System

A modern, multi-portal ERP system built with Next.js 16, TypeScript, and Tailwind CSS, featuring role-based access control and comprehensive business management capabilities for Electronics Equipment & Services companies.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the login page.

## 🔐 Demo Accounts

Use any of these demo accounts to explore different portals (password: `password` for all):

### Internal Roles
- **Super Admin**: admin@largify.com → Full system access
- **Sales Manager**: sales.manager@largify.com → Sales team oversight
- **Sales Rep**: sales.rep@largify.com → Lead & customer management
- **Inventory Manager**: inventory@largify.com → Stock control
- **Project Manager**: project@largify.com → Project oversight
- **Finance Manager**: finance@largify.com → Financial controls

### External Roles
- **Client**: client@example.com → Customer portal
- **Vendor**: vendor@supplier.com → Supplier portal

## ✨ Features

### Multi-Portal Architecture
**7 Distinct User Portals** with role-specific interfaces and workflows:

1. **Super Admin Portal** - Complete system oversight, user management, analytics
2. **Sales Portal** - CRM, lead pipeline, quotation workflows
3. **Inventory Portal** - Real-time stock control, procurement, warehouse operations
4. **Project Portal** - End-to-end project lifecycle management
5. **Finance Portal** - Accounting, invoicing, financial reporting
6. **Client Portal** - Customer-facing project tracking
7. **Vendor Portal** - Supplier-facing purchase orders

### Core Modules

#### 🎯 CRM & Sales Hub
- Lead-to-customer conversion pipelines
- 360° client profiles with integrated communications
- Sales forecasting and performance analytics
- Quotation and proposal management with approval workflows

#### 📦 Inventory & Supply Chain
- Multi-warehouse inventory tracking (500+ products)
- Real-time stock updates with automated alerts
- Serial/batch tracking for electronics components
- Automated reordering and vendor management

#### 💼 Project Management
- Quote-to-project automation
- Resource allocation and team coordination
- Milestone tracking and delivery management
- Client collaboration features

#### 💰 Financial Control Center
- Integrated accounting with AR/AP
- Project-based profitability tracking
- Invoice generation and payment tracking
- Comprehensive financial reporting

### Technical Features

✅ **Role-Based Access Control** - Granular permissions (read, write, approve, admin)  
✅ **Data Scope Restrictions** - Global, department, assigned, or own data access  
✅ **Mock Data Ecosystem** - 500+ products, 200+ customers, 50+ projects  
✅ **Real-time Dashboards** - Portal-specific KPIs and analytics  
✅ **Type-Safe** - Comprehensive TypeScript definitions throughout  
✅ **Modern UI** - Built with Shadcn/ui component library  
✅ **Responsive Design** - Full mobile and tablet support  

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Mock Data**: Faker.js (500+ realistic records)

## 📁 Project Structure

```
src/
├── app/
│   ├── (admin)/          # Super Admin portal
│   ├── (sales)/          # Sales portal
│   ├── (inventory)/      # Inventory portal (coming soon)
│   ├── (project)/        # Project portal (coming soon)
│   ├── (finance)/        # Finance portal (coming soon)
│   ├── (client)/         # Client portal (coming soon)
│   ├── (vendor)/         # Vendor portal (coming soon)
│   ├── auth/login/       # Authentication
│   └── page.tsx          # Auto-redirect to login
├── components/
│   ├── ui/               # Shadcn/ui components (20+)
│   └── auth-provider.tsx # Auth initialization
├── lib/
│   ├── auth.ts           # Permissions & access control
│   ├── mock-data.ts      # 900+ mock records
│   └── utils.ts          # Utility functions
├── stores/
│   └── auth.ts           # Authentication store
├── types/
│   └── index.ts          # TypeScript definitions (50+)
└── middleware.ts         # Route protection

```

## 🎨 Portal Overview

### Super Admin Portal (`/admin/dashboard`)
- System metrics (users, projects, performance)
- Recent activities across all portals
- System health monitoring
- Quick action panels

### Sales Portal (`/sales/dashboard`)
- Monthly revenue & conversion metrics
- Sales pipeline by stage
- Recent lead activities
- Team performance tracking

### Other Portals
Currently in development with full implementations coming soon.

## 🔒 Security & Permissions

### Permission Levels
- **Read**: View data only
- **Write**: Create and edit records
- **Approve**: Approve workflows (quotations, POs)
- **Admin**: Full module control
- **Delete**: Remove records

### Data Scope
- **Global**: All organizational data (Super Admin, Finance Manager)
- **Department**: Department-specific data (Sales Manager, Inventory Manager)
- **Assigned**: Only assigned records (Sales Rep, Project Manager)
- **Own**: Personal records only (Client, Vendor)

## 📊 Mock Data

Comprehensive dataset for realistic testing:
- **500+ Products** - Semiconductors, test equipment, components, cables, tools
- **200+ Customers** - Complete profiles with transaction histories
- **150+ Leads** - Various pipeline stages (new → closed)
- **50+ Projects** - Planning, active, completed statuses
- **Vendors, Purchase Orders, Invoices** - Full procurement & finance records

## 🚦 Development Guide

### Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd 360crm

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev       # Development server (localhost:3000)
npm run build     # Production build
npm run start     # Production server
npm run lint      # Run ESLint
```

### Adding New Features
1. **New Portal**: Create route group in `src/app/(portal-name)/`
2. **New Component**: Add to `src/components/` with TypeScript types
3. **Update Permissions**: Modify `ROLE_PERMISSIONS` in `src/lib/auth.ts`
4. **Add Mock Data**: Extend generators in `src/lib/mock-data.ts`

## 🎯 Implementation Status

### ✅ Completed (Phase 1-2)
- [x] Multi-portal routing architecture
- [x] Authentication & role-based access
- [x] Comprehensive type definitions (50+ interfaces)
- [x] Mock data system (900+ records)
- [x] Super Admin portal
- [x] Sales portal
- [x] Login & auth flow
- [x] UI component library (20+ components)

### 🚧 In Progress (Phase 3)
- [ ] Inventory portal implementation
- [ ] Project portal implementation
- [ ] Finance portal implementation
- [ ] Client portal implementation
- [ ] Vendor portal implementation

### 📋 Planned (Phase 4)
- [ ] Advanced analytics & reporting
- [ ] Real-time notifications
- [ ] Document management
- [ ] Advanced search & filtering
- [ ] API integration layer
- [ ] Mobile responsiveness optimization

## 📝 Key Files

- `src/types/index.ts` - All TypeScript definitions
- `src/lib/auth.ts` - Permission matrix & access control
- `src/stores/auth.ts` - Auth state management with 8 demo users
- `src/lib/mock-data.ts` - Comprehensive mock dataset
- `middleware.ts` - Route protection & JWT verification

## 🤝 Contributing

This project demonstrates enterprise-level architecture. Feel free to:
- Extend portals with new features
- Add more mock data scenarios
- Improve UI/UX components
- Enhance type safety

## 📧 Support

For questions or issues, please check the code documentation or open an issue.

---

**Built with Next.js 16** | **TypeScript** | **Tailwind CSS** | **Shadcn/ui**
