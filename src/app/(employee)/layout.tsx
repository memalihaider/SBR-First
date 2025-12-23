'use client';

import Link from 'next/link';

import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CurrencySelector } from '@/components/ui/currency-selector';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const initialized = useAuthStore(state => state.initialized);
  const router = useRouter();

  useEffect(() => {
    // Wait until auth store is initialized (cookie checked)
    if (!initialized) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // Check if user has employee access
    if (user && !['employee'].includes(user.role)) {
      // Redirect to appropriate portal
      const redirectMap: Record<string, string> = {
        super_admin: '/admin/dashboard',
        sales_manager: '/sales/dashboard',
        sales_rep: '/salesrep/dashboard',
        inventory_manager: '/inventory/dashboard',
        project_manager: '/project/dashboard',
        finance_manager: '/finance/dashboard',
        client: '/client/projects',
        vendor: '/vendor/orders',
        hr_manager: '/hr/dashboard',
      };
      router.replace(redirectMap[user.role] || '/auth/login');
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

  if (!isAuthenticated || !user || !['employee'].includes(user.role)) {
    // If initialized but not authorized, show forbidden message
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-sm text-gray-600 mt-2">You do not have permission to access the Employee Portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Employee Portal Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-linear-to-b from-red-900 to-red-800 text-white shadow-xl">
          <div className="p-6 border-b border-red-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-red-900 text-xl font-bold">E</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Employee Portal</h1>
                <p className="text-red-200 text-xs">Personal Dashboard</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 px-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-1">
              <Link
                href="/employee/dashboard"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-red-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">My Work</p>
              </div>
              <Link
                href="/employee/tasks"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-red-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                My Tasks
              </Link>
              <Link
                href="/employee/projects"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-red-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Projects
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-red-300 uppercase tracking-wider">Salary</p>
              </div>
              <Link
                href="/employee/payrol"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-red-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                My Payroll
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
                Employee Portal
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
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
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