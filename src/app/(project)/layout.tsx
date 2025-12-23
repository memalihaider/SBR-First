
'use client';

import Link from 'next/link';

import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CurrencySelector } from '@/components/ui/currency-selector';

export default function ProjectLayout({
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

    if (user && !['super_admin', 'project_manager'].includes(user.role)) {
      const redirectMap: Record<string, string> = {
        sales_manager: '/sales/dashboard',
        sales_rep: '/salesrep/dashboard',
        inventory_manager: '/inventory/dashboard',
        finance_manager: '/finance/dashboard',
        client: '/client/projects',
        vendor: '/vendor/orders',
      };
      router.replace(redirectMap[user.role] || '/auth/login');
      return;
    }
  }, [user, isAuthenticated, initialized, router]);

  if (!initialized || !isAuthenticated || !user) {
    return null;
  }

  if (!['super_admin', 'project_manager'].includes(user.role)) {
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
  <div className="w-64 bg-linear-to-b from-purple-900 to-purple-800 text-white shadow-xl">
          <div className="p-6 border-b border-purple-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-purple-900 text-xl font-bold">P</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Project Portal</h1>
                <p className="text-purple-200 text-xs">Project Management</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              <Link
                href="/project/dashboard"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/project/projects"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                All Projects
              </Link>
              <Link
                href="/project/tasks"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Tasks
              </Link>
             
              <Link
                href="/project/resources"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
               BOQ
              </Link>


               <Link
                href="/project/timeline"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-800 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Projects History
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
                Project Management
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
