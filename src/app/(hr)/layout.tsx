'use client';

import Link from 'next/link';

import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CurrencySelector } from '@/components/ui/currency-selector';

export default function HRLayout({
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

    // TEMPORARY: Bypass authentication for testing onboarding page
    if (process.env.NODE_ENV === 'development') {
      // Allow access for testing
      return;
    }

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // Check if user has HR access
    if (user && !['hr_manager', 'super_admin'].includes(user.role)) {
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
        employee: '/employee/dashboard',
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

  // TEMPORARY: Bypass authentication check for testing in development
  const isAuthorized = process.env.NODE_ENV === 'development' || 
    (isAuthenticated && user && ['hr_manager', 'super_admin'].includes(user.role));

  if (!isAuthorized) {
    // If initialized but not authorized, show forbidden message
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-sm text-gray-600 mt-2">You do not have permission to access the HR Management Portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HR Portal Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-linear-to-b from-purple-900 to-purple-800 text-white shadow-xl">
          <div className="p-6 border-b border-purple-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-purple-900 text-xl font-bold">H</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">HR Portal</h1>
                <p className="text-purple-200 text-xs">Human Resources</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 px-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-1">
              <Link
                href="/hr/dashboard"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-purple-300 uppercase tracking-wider">Employee Management</p>
              </div>
              <Link
                href="/hr/employees"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Employees
              </Link>
              <Link
                href="/hr/recruitment"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4" />
                </svg>
              Department
              </Link>
              <Link
                href="/hr/onboarding"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Attendance
              </Link>

              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-purple-300 uppercase tracking-wider">Payroll & Benefits</p>
              </div>
              <Link
                href="/hr/payroll"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Payroll Management
              </Link>
              
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-purple-300 uppercase tracking-wider">Performance</p>
              </div>
              <Link
                href="/hr/performance"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
               Employe History
              </Link>



              <Link
                href="/hr/manager"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
               Manager History
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
                HR Management Portal
              </h2>
              <div className="flex items-center space-x-4">
                <CurrencySelector />
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName || 'Test'} {user?.lastName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{(user?.role || 'hr_manager').replace('_', ' ').toUpperCase()}</p>
                </div>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
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