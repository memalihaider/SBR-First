// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuthStore } from '@/stores/auth';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { CurrencySelector } from '@/components/ui/currency-selector';

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user, isAuthenticated } = useAuthStore();
//   const initialized = useAuthStore(state => state.initialized);
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     // Wait until auth store is initialized (cookie checked)
//     if (!initialized) return;

//     if (!isAuthenticated) {
//       router.replace('/auth/login');
//       return;
//     }

//     // Check if user has admin access
//     if (user && !['super_admin'].includes(user.role)) {
//       // Redirect to appropriate portal
//       const redirectMap: Record<string, string> = {
//         sales_manager: '/sales/dashboard',
//         sales_rep: '/sales/leads',
//         inventory_manager: '/inventory/dashboard',
//         project_manager: '/project/dashboard',
//         finance_manager: '/finance/dashboard',
//         client: '/client/projects',
//         vendor: '/vendor/orders',
//       };
//       router.replace(redirectMap[user.role] || '/auth/login');
//     }
//   }, [user, isAuthenticated, initialized, router]);

//   // While initializing, show loading
//   if (!initialized) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-pulse">Loading...</div>
//       </div>
//     );
//   }

//   if (!isAuthenticated || !user || !['super_admin'].includes(user.role)) {
//     // If initialized but not authorized, show forbidden message
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <h2 className="text-xl font-bold">Access Denied</h2>
//           <p className="text-sm text-gray-600 mt-2">You do not have permission to access the Admin Portal.</p>
//         </div>
//       </div>
//     );
//   }

//   // Active link check function
//   const isActiveLink = (href: string) => {
//     return pathname === href || pathname.startsWith(href + '/');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Admin Portal Layout */}
//       <div className="flex h-screen">
//         {/* Sidebar */}
//         <div className="w-64 bg-linear-to-b from-red-900 to-red-800 text-white shadow-xl">
//           <div className="p-6 border-b border-red-700">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
//                 <span className="text-red-900 text-xl font-bold">L</span>
//               </div>
//               <div>
//                 <h1 className="text-lg font-bold">360 View</h1>
//                 <p className="text-red-200 text-xs">Complete Customer Insights</p>
//               </div>
//             </div>
//           </div>

//           <nav className="mt-6 px-4 overflow-y-auto max-h-[calc(100vh-200px)]">
//             <div className="space-y-1">
//               <Link
//                 href="/admin/dashboard"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/dashboard')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/dashboard') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//                 </svg>
//                 Dashboard
//               </Link>

//               <div className="pt-4 pb-2">
//                 <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">User Management</p>
//               </div>
//               <Link
//                 href="/admin/users"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/users')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/users') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//                 All Users
//               </Link>
//               <Link
//                 href="/admin/roles"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/roles')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/roles') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//                 Roles & Permissions
//               </Link>

//               <div className="pt-4 pb-2">
//                 <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">HR Management</p>
//               </div>
//               <Link
//                 href="/admin/hr/employees"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/hr/employees')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/hr/employees') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//                 All Employees
//               </Link>
//               <Link
//                 href="/admin/hr/departments"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/hr/departments')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/hr/departments') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                 </svg>
//                 Departments
//               </Link>
//               <Link
//                 href="/admin/hr/attendance"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/hr/attendance')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/hr/attendance') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 Attendance
//               </Link>
//               <Link
//                 href="/admin/hr/payroll"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/hr/payroll')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/hr/payroll') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//                 Payroll
//               </Link>

//               <div className="pt-4 pb-2">
//                 <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">Sales Management</p>
//               </div>
//               <Link
//                 href="/admin/sales/leads"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/sales/leads')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/sales/leads') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//                 360 View
//               </Link>
//               <Link
//                 href="/admin/sales/customers"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/sales/customers')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/sales/customers') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//                 All Customers
//               </Link>
//               <Link
//                 href="/admin/sales/quotations"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/sales/quotations')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/sales/quotations') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 All Quotations
//               </Link>
//               <Link
//                 href="/admin/inventory/products"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/inventory/products')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/inventory/products') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                 </svg>
//                 Products Catalog
//               </Link>

//               <div className="pt-4 pb-2">
//                 <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">Inventory</p>
//               </div>
//               <Link
//                 href="/admin/inventory/products"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/inventory/products')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/inventory/products') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                 </svg>
//                 All Products
//               </Link>
//               <Link
//                 href="/admin/inventory/categories"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/inventory/categories')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/inventory/categories') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//                 </svg>
//                 Categories
//               </Link>
//               <Link
//                 href="/admin/inventory/stock"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/inventory/stock')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/inventory/stock') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//                 </svg>
//                 Stock Management
//               </Link>
//               <Link
//                 href="/admin/inventory/suppliers"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/inventory/suppliers')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/inventory/suppliers') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                 </svg>
//                 Suppliers
//               </Link>
//               <Link
//                 href="/admin/inventory/returns"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/inventory/returns')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/inventory/returns') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
//                 </svg>
//                 Returns
//               </Link>

//               <div className="pt-4 pb-2">
//                 <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">Projects</p>
//               </div>
//               <Link
//                 href="/admin/projects"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/projects')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/projects') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//                 All Projects
//               </Link>
//               <Link
//                 href="/admin/projects/tasks"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/projects/tasks')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/projects/tasks') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                 </svg>
//                 All Tasks
//               </Link>
//               <Link
//                 href="/admin/projects/boq"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/projects/boq')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/projects/boq') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 Bill of Quantities
//               </Link>

//               <div className="pt-4 pb-2">
//                 <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">Finance</p>
//               </div>
//               <Link
//                 href="/admin/finance/invoices"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/finance/invoices')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/finance/invoices') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 All Invoices
//               </Link>
//               <Link
//                 href="/admin/finance/expenses"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/finance/expenses')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/finance/expenses') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//                 All Expenses
//               </Link>
//               <Link
//                 href="/admin/finance/reports"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/finance/reports')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/finance/reports') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 Financial Reports
//               </Link>

//               <div className="pt-4 pb-2">
//                 <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">System</p>
//               </div>
//               <Link
//                 href="/admin/analytics"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/analytics')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/analytics') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                 </svg>
//                 Analytics
//               </Link>
//               <Link
//                 href="/admin/communication"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/communication')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/communication') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                 </svg>
//                 Communication
//               </Link>
//               <Link
//                 href="/admin/settings"
//                 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
//                   isActiveLink('/admin/settings')
//                     ? 'bg-white text-red-900'
//                     : 'hover:bg-red-800'
//                 }`}
//               >
//                 <svg className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
//                   isActiveLink('/admin/settings') ? 'text-red-900' : ''
//                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//                 Settings
//               </Link>
//             </div>
//           </nav>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 flex flex-col overflow-visible">
//           {/* Header */}
//           <header className="bg-white shadow-md border-b px-6 py-4 z-10 relative">
//             <div className="flex items-center justify-between">
//               <h2 className="text-2xl font-bold text-gray-900">
//                 Super Admin Portal
//               </h2>
//               <div className="flex items-center space-x-4">
//                 <CurrencySelector />
//                 <div className="text-right">
//                   <p className="text-sm font-semibold text-gray-900">
//                     {user.firstName} {user.lastName}
//                   </p>
//                   <p className="text-xs text-gray-500 font-medium">{user.role.replace('_', ' ').toUpperCase()}</p>
//                 </div>
//                 <button
//                   onClick={() => useAuthStore.getState().logout()}
//                   className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </header>

//           {/* Page Content */}
//           <main className="flex-1 overflow-auto p-6 bg-gray-50 relative z-0">
//             {children}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

/// new code
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CurrencySelector } from "@/components/ui/currency-selector";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const initialized = useAuthStore((state) => state.initialized);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Wait until auth store is initialized (cookie checked)
    if (!initialized) return;

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    // Check if user has admin access
    if (user && !["super_admin"].includes(user.role)) {
      // Redirect to appropriate portal
      const redirectMap: Record<string, string> = {
        sales_manager: "/sales/dashboard",
        sales_rep: "/sales/leads",
        inventory_manager: "/inventory/dashboard",
        project_manager: "/project/dashboard",
        finance_manager: "/finance/dashboard",
        client: "/client/projects",
        vendor: "/vendor/orders",
      };
      router.replace(redirectMap[user.role] || "/auth/login");
    }
  }, [user, isAuthenticated, initialized, router]);

  // While initializing, show loading
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !["super_admin"].includes(user.role)) {
    // If initialized but not authorized, show forbidden message
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-sm text-gray-600 mt-2">
            You do not have permission to access the Admin Portal.
          </p>
        </div>
      </div>
    );
  }

  // Active link check function
  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Portal Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } bg-linear-to-b from-red-900 to-red-800 text-white shadow-xl transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <div className="p-6 border-b border-red-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-red-900 text-xl font-bold">L</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">360 View</h1>
                <p className="text-red-200 text-xs">
                  Complete Customer Insights
                </p>
              </div>
            </div>

            {/* Toggle Button - Sidebar ke andar */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-red-800 hover:bg-red-700 transition-colors duration-200"
              title="Close Sidebar"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="mt-6 px-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-1">
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/dashboard")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/dashboard") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">
                  User Management
                </p>
              </div>
              <Link
                href="/admin/users"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/users")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/users") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
               Users
              </Link>
              <Link
                href="/admin/roles"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/roles")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/roles") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Roles & Permissions
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">
                  HR Management
                </p>
              </div>
              <Link
                href="/admin/hr/employees"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/hr/employees")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/hr/employees") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                 Employees
              </Link>
              <Link
                href="/admin/hr/departments"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/hr/departments")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/hr/departments") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Departments
              </Link>
              <Link
                href="/admin/hr/attendance"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/hr/attendance")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/hr/attendance") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Attendance
              </Link>
              <Link
                href="/admin/hr/payroll"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/hr/payroll")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/hr/payroll") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Payroll
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">
                  Sales Management
                </p>
              </div>
              <Link
                href="/admin/sales/leads"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/sales/leads")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/sales/leads") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                360 View
              </Link>
              <Link
                href="/admin/sales/customers"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/sales/customers")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/sales/customers") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Customers
              </Link>
              <Link
                href="/admin/sales/quotations"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/sales/quotations")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/sales/quotations")
                      ? "text-red-900"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Quotations
              </Link>
              

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">
                  Inventory
                </p>
              </div>
              <Link
                href="/admin/inventory/categories"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/inventory/categories")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/inventory/categories")
                      ? "text-red-900"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Categories
              </Link>
              <Link
                href="/admin/inventory/sub-categories"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/inventory/sub-categories")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/inventory/sub-categories")
                      ? "text-red-900"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Sub Categories
              </Link>

              <Link
                href="/admin/inventory/products"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/inventory/products")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/inventory/products")
                      ? "text-red-900"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Products
              </Link>
















 <Link
                href="/admin/inventory/services"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/inventory/services")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/inventory/services")
                      ? "text-red-900"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Services
              </Link>

















              <Link
                href="/admin/inventory/stock"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/inventory/stock")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/inventory/stock") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Stock Management
              </Link>
              <Link
                href="/admin/inventory/suppliers"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/inventory/suppliers")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/inventory/suppliers")
                      ? "text-red-900"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Suppliers
              </Link>
              <Link
                href="/admin/inventory/returns"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/inventory/returns")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/inventory/returns")
                      ? "text-red-900"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                Returns
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">
                  Projects
                </p>
              </div>
              <Link
                href="/admin/projects"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/projects")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/projects") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                 Projects
              </Link>
              <Link
                href="/admin/projects/tasks"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/projects/tasks")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/projects/tasks") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                 Tasks
              </Link>
              <Link
                href="/admin/projects/boq"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/projects/boq")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/projects/boq") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Bill of Quantities
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">
                  Finance
                </p>
              </div>
              <Link
                href="/admin/finance/invoices"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/finance/invoices")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/finance/invoices")
                      ? "text-red-900"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Invoices
              </Link>
              <Link
                href="/admin/finance/expenses"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/finance/expenses")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/finance/expenses")
                      ? "text-red-900"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
               Expenses
              </Link>
              <Link
                href="/admin/finance/reports"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/finance/reports")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/finance/reports") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Financial Reports
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">
                  System
                </p>
              </div>
              <Link
                href="/admin/analytics"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/analytics")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/analytics") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Analytics
              </Link>
              <Link
                href="/admin/communication"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/communication")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/communication") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Communication
              </Link>
              <Link
                href="/admin/settings"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActiveLink("/admin/settings")
                    ? "bg-white text-red-900"
                    : "hover:bg-red-800"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                    isActiveLink("/admin/settings") ? "text-red-900" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </Link>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-visible">
          {/* Header */}
          <header className="bg-white shadow-md border-b px-6 py-4 z-10 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Toggle Button - Header mein bhi (agar sidebar closed hai) */}
                {!sidebarOpen && (
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white"
                    title="Open Sidebar"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  Super Admin Portal
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <CurrencySelector />
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {user.role.replace("_", " ").toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50 relative z-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
