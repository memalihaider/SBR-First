'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, initialized } = useAuthStore();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    if (isAuthenticated && user) {
      // Redirect to appropriate portal based on user role
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
        employee: '/employee/dashboard',
      };
      router.replace(redirectMap[user.role] || '/auth/login');
    } else {
      // Show landing page
      setShowLanding(true);
    }
  }, [isAuthenticated, user, initialized, router]);

  if (!initialized || !showLanding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <span className="text-white text-3xl font-bold">360</span>
            </div>
            <p className="text-gray-700 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: '👥',
      title: 'Admin Portal',
      description: 'Complete control over users, roles, and system settings',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: '💼',
      title: 'Sales Management',
      description: 'Track leads, manage customers, and close deals faster',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: '📊',
      title: 'Sales Rep Portal',
      description: 'Dedicated workspace for sales representatives',
      color: 'from-teal-500 to-teal-600',
    },
    {
      icon: '📦',
      title: 'Inventory Control',
      description: 'Real-time stock tracking and supplier management',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: '🎯',
      title: 'Project Management',
      description: 'Plan, track, and deliver projects on time',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: '💰',
      title: 'Finance Hub',
      description: 'Invoices, expenses, budgets, and financial reports',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: '🤝',
      title: 'Client Portal',
      description: 'Self-service portal for clients to track projects',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: '🏪',
      title: 'Vendor Portal',
      description: 'Manage suppliers, orders, and vendor performance',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: '👔',
      title: 'HR Management',
      description: 'Employee management, recruitment, and organizational development',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: '👤',
      title: 'Employee Portal',
      description: 'Personal dashboard for employees to manage tasks and time',
      color: 'from-green-500 to-green-600',
    },
  ];

  const stats = [
    { label: 'Active Users', value: '500+' },
    { label: 'Projects Managed', value: '1,200+' },
    { label: 'Portals', value: '10' },
    { label: 'Uptime', value: '99.9%' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">360</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  360° ERP System
                </h1>
                <p className="text-xs text-gray-600">Complete Business Management</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            ✨ All-in-One Business Solution
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Manage Your Entire Business
            <br />
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              From One Platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            360° ERP brings together sales, inventory, projects, finance, and more into a unified system. 
            Streamline operations, boost productivity, and grow your business with confidence.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => router.push('/auth/login')}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-6 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-200"
            >
              Get Started →
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-6 rounded-xl text-lg font-semibold"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <p className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Ten Powerful Portals
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each role gets a dedicated portal with tools designed for their specific needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose 360° ERP?
            </h3>
            <p className="text-xl text-gray-600">
              Built for modern businesses that demand excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h4>
              <p className="text-gray-600">
                Built with Next.js and modern technologies for blazing fast performance and smooth user experience.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Secure & Reliable</h4>
              <p className="text-gray-600">
                Role-based access control ensures data security. Your business information is protected at every level.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Fully Customizable</h4>
              <p className="text-gray-600">
                Tailor each portal to match your workflow. Flexible architecture adapts to your unique business needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center shadow-2xl">
            <h3 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses already using 360° ERP to streamline their operations
            </p>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              Start Your Journey →
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">360</span>
                </div>
                <span className="text-xl font-bold">360° ERP</span>
              </div>
              <p className="text-gray-400 text-sm">
                Complete business management solution for modern enterprises.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Product</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Roadmap</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Support</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>API Reference</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 360° ERP System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
