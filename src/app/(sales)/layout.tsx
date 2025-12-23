
'use client';

import Link from 'next/link';

import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SalesCurrencySwitcher } from '@/components/sales-currency-switcher';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const initialized = useAuthStore(state => state.initialized);
  const router = useRouter();

  useEffect(() => {
    // Wait until auth store is initialized
    if (!initialized) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // Check if user has sales access
    if (user && !['super_admin', 'sales_manager', 'sales_rep'].includes(user.role)) {
      // Redirect to appropriate portal
      const redirectMap: Record<string, string> = {
        inventory_manager: '/inventory/dashboard',
        project_manager: '/project/dashboard',
        finance_manager: '/finance/dashboard',
        client: '/client/projects',
        vendor: '/vendor/orders',
      };
      router.replace(redirectMap[user.role] || '/auth/login');
      return;
    }
  }, [user, isAuthenticated, initialized, router]);

  // While initializing, show nothing
  if (!initialized) {
    return null;
  }

  if (!isAuthenticated || !user || !['super_admin', 'sales_manager', 'sales_rep'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-sm text-gray-600 mt-2">You do not have permission to access the Sales Portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-linear-to-b from-blue-900 to-blue-800 text-white shadow-xl">
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-900 text-xl font-bold">S</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Sales Portal</h1>
                <p className="text-blue-200 text-xs">CRM & Pipeline</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6 px-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-1">
              <Link
                href="/sales/dashboard"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/sales/leads"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Leads
              </Link>
              <Link
                href="/sales/customers"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Customers
              </Link>
              <Link
                href="/sales/quotations"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Quotations
              </Link>
              <Link
                href="/sales/pipeline"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Pipeline
              </Link>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-md border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Sales Management
              </h2>
              <div className="flex items-center space-x-4">
                <SalesCurrencySwitcher />
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{user.role.replace('_', ' ').toUpperCase()}</p>
                </div>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}