'use client';

import Link from 'next/link';

import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CurrencySelector } from '@/components/ui/currency-selector';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user && !['super_admin', 'client'].includes(user.role)) {
      const redirectMap: Record<string, string> = {
        sales_manager: '/sales/dashboard',
        sales_rep: '/salesrep/dashboard',
        inventory_manager: '/inventory/dashboard',
        project_manager: '/project/dashboard',
        finance_manager: '/finance/dashboard',
        vendor: '/vendor/orders',
      };
      router.replace(redirectMap[user.role] || '/auth/login');
      return;
    }
  }, [user, isAuthenticated, initialized, router]);

  if (!initialized) {
    return null;
  }

  if (!isAuthenticated || !user || !['super_admin', 'client'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
  <div className="w-64 bg-linear-to-b from-indigo-900 to-indigo-800 text-white shadow-xl">
          <div className="p-6 border-b border-indigo-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-indigo-900 text-xl font-bold">C</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Client Portal</h1>
                <p className="text-indigo-200 text-xs">Customer Dashboard</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              <Link
                href="/client/customer"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-indigo-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                All customer
              </Link>
              <Link
                href="/client/project"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-indigo-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Project
              </Link>
             
             
              <Link
                href="/client/documents"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-indigo-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Documents
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
                Client Dashboard
              </h2>
              <div className="flex items-center space-x-4">
                <CurrencySelector />
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{user.role.replace('_', ' ').toUpperCase()}</p>
                </div>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg"
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
