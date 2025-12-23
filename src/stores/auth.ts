import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, UserRole } from '@/types';
import { MockJWTUtils, ROLE_REDIRECTS } from '@/lib/auth';

interface AuthStore extends AuthState {
  // Whether the auth store has finished initial boot (checked cookies/token)
  initialized: boolean;
  // Setter for initialized
  setInitialized: (v: boolean) => void;
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  
  // State setters
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call - In production, replace with real API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user lookup based on email
          const mockUser = getMockUser(email, password);
          
          if (!mockUser) {
            set({ isLoading: false });
            return false;
          }
          
          // Generate JWT token
          const token = MockJWTUtils.generateToken(mockUser);
          
          // Set token in cookie for server-side middleware
          document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          
          set({
            user: mockUser,
            token,
            isAuthenticated: true,
            isLoading: false,
            initialized: true,
          });
          
          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        // Clear cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-token=; path=/; max-age=0';
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
        });

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      refreshUser: async () => {
        let { token } = get();
        
        // If no token in state, try to get from cookie
        if (!token && typeof document !== 'undefined') {
          const cookies = document.cookie.split(';');
          const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
          if (authCookie) {
            token = authCookie.split('=')[1];
            set({ token });
          }
        }
        
        if (!token) {
          // mark initialized even if no token found so layouts can react
          set({ initialized: true });
          return;
        }
        
        try {
          // Verify token
          const payload = MockJWTUtils.verifyToken(token);
          
          if (!payload) {
            get().logout();
            return;
          }
          
          // In production, fetch fresh user data from API
          // For now, reconstruct user from token
          const user = await getMockUserById(payload.sub);
          
          if (user) {
            set({ user, isAuthenticated: true, token, initialized: true });
          } else {
            get().logout();
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          get().logout();
        }
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        
        if (!user) return;
        
        const updatedUser = {
          ...user,
          ...updates,
          updatedAt: new Date(),
        };
        
        set({ user: updatedUser });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setInitialized: (v: boolean) => set({ initialized: v }),

      setToken: (token: string | null) => {
        set({ token });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: 'largify-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Mock user data for development
const MOCK_USERS: Record<string, User> = {
  'admin@largify.com': {
    id: 'user-1',
    email: 'admin@largify.com',
    firstName: 'John',
    lastName: 'Administrator',
    role: 'super_admin',
    department: 'IT',
    avatar: '/avatars/admin.jpg',
    phone: '+1-555-0100',
    isActive: true,
    lastLogin: new Date('2024-01-20T10:00:00Z'),
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
    permissions: {
      role: 'super_admin',
      modules: {
        dashboard: ['read', 'write', 'admin'],
        users: ['read', 'write', 'admin', 'delete'],
        crm: ['read', 'write', 'admin', 'delete'],
        inventory: ['read', 'write', 'admin', 'delete'],
        projects: ['read', 'write', 'admin', 'delete'],
        finance: ['read', 'write', 'admin', 'delete'],
        hr: ['read', 'write', 'admin', 'delete'],
        quotations: ['read', 'write', 'admin', 'delete'],
        reports: ['read', 'write', 'admin'],
        settings: ['read', 'write', 'admin'],
      },
      dataScope: 'global',
    },
  },
  
  'sales.manager@largify.com': {
    id: 'user-2',
    email: 'sales.manager@largify.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'sales_manager',
    department: 'Sales',
    avatar: '/avatars/sales-manager.jpg',
    phone: '+1-555-0200',
    isActive: true,
    lastLogin: new Date('2024-01-19T15:30:00Z'),
    createdAt: new Date('2023-02-01T00:00:00Z'),
    updatedAt: new Date('2024-01-19T15:30:00Z'),
    permissions: {
      role: 'sales_manager',
      modules: {
        dashboard: ['read', 'write'],
        users: ['read'],
        crm: ['read', 'write', 'approve'],
        inventory: ['read'],
        projects: ['read', 'write'],
        finance: ['read'],
        hr: [],
        quotations: ['read', 'write', 'approve'],
        reports: ['read'],
        settings: ['read'],
      },
      dataScope: 'department',
    },
  },
  
  'sales.rep@largify.com': {
    id: 'user-3',
    email: 'sales.rep@largify.com',
    firstName: 'Mike',
    lastName: 'Davis',
    role: 'sales_rep',
    department: 'Sales',
    avatar: '/avatars/sales-rep.jpg',
    phone: '+1-555-0300',
    isActive: true,
    lastLogin: new Date('2024-01-20T09:15:00Z'),
    createdAt: new Date('2023-03-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T09:15:00Z'),
    permissions: {
      role: 'sales_rep',
      modules: {
        dashboard: ['read'],
        users: ['read'],
        crm: ['read', 'write'],
        inventory: ['read'],
        projects: ['read'],
        finance: ['read'],
        hr: [],
        quotations: ['read', 'write'],
        reports: ['read'],
        settings: ['read'],
      },
      dataScope: 'assigned',
    },
  },
  
  'inventory@largify.com': {
    id: 'user-4',
    email: 'inventory@largify.com',
    firstName: 'Lisa',
    lastName: 'Chen',
    role: 'inventory_manager',
    department: 'Operations',
    avatar: '/avatars/inventory.jpg',
    phone: '+1-555-0400',
    isActive: true,
    lastLogin: new Date('2024-01-20T08:00:00Z'),
    createdAt: new Date('2023-04-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T08:00:00Z'),
    permissions: {
      role: 'inventory_manager',
      modules: {
        dashboard: ['read', 'write'],
        users: ['read'],
        crm: ['read'],
        inventory: ['read', 'write', 'approve'],
        projects: ['read'],
        finance: ['read'],
        hr: [],
        quotations: ['read'],
        reports: ['read'],
        settings: ['read'],
      },
      dataScope: 'department',
    },
  },
  
  'project@largify.com': {
    id: 'user-5',
    email: 'project@largify.com',
    firstName: 'David',
    lastName: 'Wilson',
    role: 'project_manager',
    department: 'Operations',
    avatar: '/avatars/project.jpg',
    phone: '+1-555-0500',
    isActive: true,
    lastLogin: new Date('2024-01-19T16:45:00Z'),
    createdAt: new Date('2023-05-01T00:00:00Z'),
    updatedAt: new Date('2024-01-19T16:45:00Z'),
    permissions: {
      role: 'project_manager',
      modules: {
        dashboard: ['read', 'write'],
        users: ['read'],
        crm: ['read'],
        inventory: ['read'],
        projects: ['read', 'write', 'approve'],
        finance: ['read'],
        hr: [],
        quotations: ['read'],
        reports: ['read'],
        settings: ['read'],
      },
      dataScope: 'assigned',
    },
  },
  
  'finance@largify.com': {
    id: 'user-6',
    email: 'finance@largify.com',
    firstName: 'Emily',
    lastName: 'Brown',
    role: 'finance_manager',
    department: 'Finance',
    avatar: '/avatars/finance.jpg',
    phone: '+1-555-0600',
    isActive: true,
    lastLogin: new Date('2024-01-20T07:30:00Z'),
    createdAt: new Date('2023-06-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T07:30:00Z'),
    permissions: {
      role: 'finance_manager',
      modules: {
        dashboard: ['read', 'write'],
        users: ['read'],
        crm: ['read'],
        inventory: ['read'],
        projects: ['read'],
        finance: ['read', 'write', 'approve'],
        hr: [],
        quotations: ['read', 'approve'],
        reports: ['read', 'write'],
        settings: ['read'],
      },
      dataScope: 'global',
    },
  },
  
  'hr@largify.com': {
    id: 'user-9',
    email: 'hr@largify.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'hr_manager',
    department: 'Human Resources',
    avatar: '/avatars/hr.jpg',
    phone: '+1-555-0900',
    isActive: true,
    lastLogin: new Date('2024-01-20T08:00:00Z'),
    createdAt: new Date('2023-09-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T08:00:00Z'),
    permissions: {
      role: 'hr_manager',
      modules: {
        dashboard: ['read', 'write'],
        users: ['read', 'write'],
        crm: [],
        inventory: [],
        projects: ['read'],
        finance: ['read'],
        hr: ['read', 'write', 'approve'],
        quotations: [],
        reports: ['read'],
        settings: ['read'],
      },
      dataScope: 'global',
    },
  },
  
  'employee@largify.com': {
    id: 'user-10',
    email: 'employee@largify.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'employee',
    department: 'Operations',
    avatar: '/avatars/employee.jpg',
    phone: '+1-555-1000',
    isActive: true,
    lastLogin: new Date('2024-01-20T09:00:00Z'),
    createdAt: new Date('2023-10-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T09:00:00Z'),
    permissions: {
      role: 'employee',
      modules: {
        dashboard: ['read'],
        users: ['read'],
        crm: [],
        inventory: [],
        projects: ['read'],
        finance: ['read'],
        hr: ['read'],
        quotations: [],
        reports: [],
        settings: ['read'],
      },
      dataScope: 'own',
    },
  },
  
  'client@example.com': {
    id: 'user-7',
    email: 'client@example.com',
    firstName: 'Robert',
    lastName: 'Client',
    role: 'client',
    department: 'External',
    avatar: '/avatars/client.jpg',
    phone: '+1-555-0700',
    isActive: true,
    lastLogin: new Date('2024-01-19T14:20:00Z'),
    createdAt: new Date('2023-07-01T00:00:00Z'),
    updatedAt: new Date('2024-01-19T14:20:00Z'),
    permissions: {
      role: 'client',
      modules: {
        dashboard: ['read'],
        users: [],
        crm: [],
        inventory: [],
        projects: ['read'],
        finance: ['read'],
        hr: [],
        quotations: ['read'],
        reports: [],
        settings: ['read'],
      },
      dataScope: 'own',
    },
  },
  
  'vendor@supplier.com': {
    id: 'user-8',
    email: 'vendor@supplier.com',
    firstName: 'James',
    lastName: 'Vendor',
    role: 'vendor',
    department: 'External',
    avatar: '/avatars/vendor.jpg',
    phone: '+1-555-0800',
    isActive: true,
    lastLogin: new Date('2024-01-20T11:10:00Z'),
    createdAt: new Date('2023-08-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T11:10:00Z'),
    permissions: {
      role: 'vendor',
      modules: {
        dashboard: ['read'],
        users: [],
        crm: [],
        inventory: ['read', 'write'],
        projects: [],
        finance: ['read'],
        hr: [],
        quotations: [],
        reports: [],
        settings: ['read'],
      },
      dataScope: 'own',
    },
  },
};

function getMockUser(email: string, password: string): User | null {
  // Simple password check (in production, hash and verify properly)
  const validPasswords = ['password', 'demo123', 'largify2024'];
  
  if (!validPasswords.includes(password)) {
    return null;
  }
  
  return MOCK_USERS[email] || null;
}

async function getMockUserById(userId: string): Promise<User | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return Object.values(MOCK_USERS).find(user => user.id === userId) || null;
}

// Utility function to get redirect URL for user role
export function getRedirectUrl(role: UserRole): string {
  return ROLE_REDIRECTS[role] || '/auth/login';
}

// Hook for checking permissions
export function usePermissions() {
  const user = useAuthStore(state => state.user);
  
  const hasPermission = (module: keyof User['permissions']['modules'], permission: string) => {
    if (!user) return false;
    return user.permissions.modules[module]?.includes(permission as any) || false;
  };
  
  const canAccess = (module: keyof User['permissions']['modules']) => {
    if (!user) return false;
    return (user.permissions.modules[module]?.length || 0) > 0;
  };
  
  return {
    user,
    hasPermission,
    canAccess,
    dataScope: user?.permissions.dataScope || 'own',
  };
}

export default useAuthStore;