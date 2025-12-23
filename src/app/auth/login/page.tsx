'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth';
import { Loader2, Mail, Lock, Building2, Users, TrendingUp, Shield } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    
    if (success) {
      const targetUrl = redirectUrl || getDashboardUrl(email);
      router.push(targetUrl);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const getDashboardUrl = (email: string): string => {
    const roleMapping: Record<string, string> = {
      'admin@largify.com': '/admin/dashboard',
      'sales.manager@largify.com': '/sales/dashboard',
      // 'sales.rep@largify.com': '/sales/leads',
      'inventory@largify.com': '/inventory/dashboard',
      'project@largify.com': '/project/dashboard',
      'finance@largify.com': '/finance/dashboard',
      'hr@largify.com': '/hr/dashboard',
      'employee@largify.com': '/employee/dashboard',
      'client@example.com': '/client/projects',
      // 'vendor@supplier.com': '/vendor/orders',
    };
    return roleMapping[email] || '/admin/dashboard';
  };

  const demoAccounts = [
    { email: 'admin@largify.com', role: 'Super Admin', description: 'Full system access', color: 'red', icon: Shield },
   
    // { email: 'sales.rep@largify.com', role: 'Sales Rep', description: 'Lead management', color: 'green', icon: Users },
    { email: 'hr@largify.com', role: 'HR Manager', description: 'Human resources', color: 'amber', icon: Users },
    { email: 'inventory@largify.com', role: 'Inventory Manager', description: 'Stock control', color: 'blue', icon: Building2 },
    { email: 'project@largify.com', role: 'Project Manager', description: 'Project oversight', color: 'purple', icon: Building2 },
     { email: 'sales.manager@largify.com', role: 'Sales Manager', description: 'Sales team oversight', color: 'green', icon: TrendingUp },
    { email: 'employee@largify.com', role: 'Employee', description: 'Employee portal', color: 'gray', icon: Users },
    { email: 'client@example.com', role: 'Client', description: 'Customer portal', color: 'indigo', icon: Users },
     { email: 'finance@largify.com', role: 'Finance Manager', description: 'Financial controls', color: 'yellow', icon: TrendingUp },
    // { email: 'vendor@supplier.com', role: 'Vendor', description: 'Supplier portal', color: 'pink', icon: Building2 },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { border: string; bg: string; text: string; badge: string }> = {
      red: { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
      green: { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
      blue: { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
      purple: { border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
      yellow: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
      amber: { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
      gray: { border: 'border-l-gray-500', bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' },
      indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
      pink: { border: 'border-l-pink-500', bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Largify <span className="text-blue-600">360ERP</span>
          </h1>
          <p className="text-lg text-gray-600">Comprehensive Enterprise Resource Planning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Login Form - Left Side */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Enter your credentials to access your portal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="border-l-4">
                      <AlertDescription className="font-medium">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@company.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                        className="h-12 pl-11 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        className="h-12 pl-11 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In to Portal'
                    )}
                  </Button>
                </form>
                
                <div className="pt-4 border-t">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Demo Access</p>
                    <p className="text-xs text-gray-600 mb-2">Use any demo account with password:</p>
                    <code className="bg-white px-4 py-2 rounded-md font-bold text-blue-600 text-sm inline-block border border-blue-200">
                      password
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Accounts - Right Side */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Demo Accounts</h3>
                <p className="text-sm text-gray-600">Click any account to auto-fill login credentials</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                {demoAccounts.map((account, index) => {
                  const colors = getColorClasses(account.color);
                  const IconComponent = account.icon;
                  return (
                    <Card 
                      key={index} 
                      className={`cursor-pointer hover:shadow-xl transition-all duration-200 border-l-4 ${colors.border} hover:scale-[1.02] bg-white/90 backdrop-blur-sm`}
                      onClick={() => {
                        setEmail(account.email);
                        setPassword('password');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2.5 ${colors.bg} rounded-lg shrink-0`}>
                            <IconComponent className={`h-5 w-5 ${colors.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-gray-900 text-base">{account.role}</h4>
                              <span className={`px-2.5 py-0.5 ${colors.badge} text-xs font-bold rounded-full`}>
                                {index < 6 ? 'Internal' : 'External'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{account.description}</p>
                            <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate">
                              {account.email}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Features Footer */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Shield, text: 'Role-Based Access' },
              { icon: Users, text: 'CRM & Sales' },
              { icon: Building2, text: 'Inventory Control' },
              { icon: TrendingUp, text: 'Project Management' },
              { icon: Building2, text: 'Financial Controls' },
              { icon: Users, text: 'Client Portal' },
            ].map((feature, idx) => {
              const FeatureIcon = feature.icon;
              return (
                <div key={idx} className="flex items-center space-x-2 text-gray-700">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FeatureIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}