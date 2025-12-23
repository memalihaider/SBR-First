import { UserRole, Permission, Module, RolePermissions } from '@/types';

// Define role-based permissions matrix
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    role: 'super_admin',
    modules: {
      dashboard: ['read', 'write', 'admin'],
      users: ['read', 'write', 'admin', 'delete'],
      crm: ['read', 'write', 'admin', 'delete'],
      inventory: ['read', 'write', 'admin', 'delete'],
      projects: ['read', 'write', 'admin', 'delete'],
      finance: ['read', 'write', 'admin', 'delete'],
      quotations: ['read', 'write', 'admin', 'delete'],
      hr: ['read', 'write', 'admin'],
      reports: ['read', 'write', 'admin'],
      settings: ['read', 'write', 'admin'],
    },
    dataScope: 'global',
  },
  
  sales_manager: {
    role: 'sales_manager',
    modules: {
      dashboard: ['read', 'write'],
      users: ['read'],
      crm: ['read', 'write', 'approve'],
      inventory: ['read'],
      projects: ['read', 'write'],
      finance: ['read'],
      quotations: ['read', 'write', 'approve'],
      hr: [],
      reports: ['read'],
      settings: ['read'],
    },
    dataScope: 'department',
  },
  
  sales_rep: {
    role: 'sales_rep',
    modules: {
      dashboard: ['read'],
      users: ['read'],
      crm: ['read', 'write'],
      inventory: ['read'],
      projects: ['read'],
      finance: ['read'],
      quotations: ['read', 'write'],
      hr: [],
      reports: ['read'],
      settings: ['read'],
    },
    dataScope: 'assigned',
  },
  
  inventory_manager: {
    role: 'inventory_manager',
    modules: {
      dashboard: ['read', 'write'],
      users: ['read'],
      crm: ['read'],
      inventory: ['read', 'write', 'approve'],
      projects: ['read'],
      finance: ['read'],
      quotations: ['read'],
      hr: [],
      reports: ['read'],
      settings: ['read'],
    },
    dataScope: 'department',
  },
  
  project_manager: {
    role: 'project_manager',
    modules: {
      dashboard: ['read', 'write'],
      users: ['read'],
      crm: ['read'],
      inventory: ['read'],
      projects: ['read', 'write', 'approve'],
      finance: ['read'],
      quotations: ['read'],
      hr: [],
      reports: ['read'],
      settings: ['read'],
    },
    dataScope: 'assigned',
  },
  
  finance_manager: {
    role: 'finance_manager',
    modules: {
      dashboard: ['read', 'write'],
      users: ['read'],
      crm: ['read'],
      inventory: ['read'],
      projects: ['read'],
      finance: ['read', 'write', 'approve'],
      quotations: ['read'],
      hr: [],
      reports: ['read', 'write'],
      settings: ['read'],
    },
    dataScope: 'global',
  },
  
  hr_manager: {
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
  
  employee: {
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
  
  client: {
    role: 'client',
    modules: {
      dashboard: ['read'],
      users: [],
      crm: [],
      inventory: [],
      projects: ['read'],
      finance: ['read'],
      quotations: ['read'],
      hr: [],
      reports: [],
      settings: ['read'],
    },
    dataScope: 'own',
  },
  
  vendor: {
    role: 'vendor',
    modules: {
      dashboard: ['read'],
      users: [],
      crm: [],
      inventory: ['read', 'write'],
      projects: [],
      finance: ['read'],
      quotations: [],
      hr: [],
      reports: [],
      settings: ['read'],
    },
    dataScope: 'own',
  },
};

// Portal configurations for each role
export const PORTAL_CONFIGS = {
  super_admin: {
    name: 'Super Admin Portal',
    path: '/admin',
    defaultRoute: '/admin/dashboard',
    theme: {
      primaryColor: '#DC2626', // Red
      logoUrl: '/logos/admin-logo.png',
    },
  },
  
  sales_manager: {
    name: 'Sales Management Portal',
    path: '/sales',
    defaultRoute: '/sales/dashboard',
    theme: {
      primaryColor: '#059669', // Green
      logoUrl: '/logos/sales-logo.png',
    },
  },
  
  sales_rep: {
    name: 'Sales Portal',
    path: '/sales',
    defaultRoute: '/sales/leads',
    theme: {
      primaryColor: '#059669', // Green
      logoUrl: '/logos/sales-logo.png',
    },
  },
  
  inventory_manager: {
    name: 'Inventory Management Portal',
    path: '/inventory',
    defaultRoute: '/inventory/dashboard',
    theme: {
      primaryColor: '#7C3AED', // Purple
      logoUrl: '/logos/inventory-logo.png',
    },
  },
  
  project_manager: {
    name: 'Project Management Portal',
    path: '/project',
    defaultRoute: '/project/dashboard',
    theme: {
      primaryColor: '#EA580C', // Orange
      logoUrl: '/logos/project-logo.png',
    },
  },
  
  finance_manager: {
    name: 'Finance Portal',
    path: '/finance',
    defaultRoute: '/finance/dashboard',
    theme: {
      primaryColor: '#0891B2', // Cyan
      logoUrl: '/logos/finance-logo.png',
    },
  },
  
  hr_manager: {
    name: 'HR Management Portal',
    path: '/hr',
    defaultRoute: '/hr/dashboard',
    theme: {
      primaryColor: '#F59E0B', // Amber
      logoUrl: '/logos/hr-logo.png',
    },
  },
  
  employee: {
    name: 'Employee Portal',
    path: '/employee',
    defaultRoute: '/employee/dashboard',
    theme: {
      primaryColor: '#6B7280', // Gray
      logoUrl: '/logos/employee-logo.png',
    },
  },
  
  client: {
    name: 'Client Portal',
    path: '/client',
    defaultRoute: '/client/projects',
    theme: {
      primaryColor: '#1D4ED8', // Blue
      logoUrl: '/logos/client-logo.png',
    },
  },
  
  vendor: {
    name: 'Vendor Portal',
    path: '/vendor',
    defaultRoute: '/vendor/orders',
    theme: {
      primaryColor: '#BE185D', // Pink
      logoUrl: '/logos/vendor-logo.png',
    },
  },
};

// Permission checking utilities
export class PermissionChecker {
  static hasPermission(
    userRole: UserRole,
    module: Module,
    permission: Permission
  ): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) return false;
    
    const modulePermissions = rolePermissions.modules[module];
    return modulePermissions.includes(permission);
  }
  
  static hasAnyPermission(
    userRole: UserRole,
    module: Module,
    permissions: Permission[]
  ): boolean {
    return permissions.some(permission => 
      this.hasPermission(userRole, module, permission)
    );
  }
  
  static canAccessModule(userRole: UserRole, module: Module): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) return false;
    
    const modulePermissions = rolePermissions.modules[module];
    return modulePermissions.length > 0;
  }
  
  static getDataScope(userRole: UserRole): 'global' | 'department' | 'assigned' | 'own' {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions?.dataScope || 'own';
  }
  
  static getAccessibleModules(userRole: UserRole): Module[] {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) return [];
    
    return Object.entries(rolePermissions.modules)
      .filter(([_, permissions]) => permissions.length > 0)
      .map(([module]) => module as Module);
  }
}

// Route access control
export const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  super_admin: '/admin/dashboard',
  sales_manager: '/sales/dashboard',
  sales_rep: '/sales/leads',
  inventory_manager: '/inventory/dashboard',
  project_manager: '/project/dashboard',
  finance_manager: '/finance/dashboard',
  hr_manager: '/hr/dashboard',
  employee: '/employee/dashboard',
  client: '/client/projects',
  vendor: '/vendor/orders',
};

export function getPortalFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  
  const portal = segments[0];
  const validPortals = ['admin', 'sales', 'inventory', 'project', 'finance', 'hr', 'employee', 'client', 'vendor'];
  
  return validPortals.includes(portal) ? portal : null;
}

export function canAccessRoute(userRole: UserRole, pathname: string): boolean {
  // Allow access to public routes
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  
  // Get portal from path
  const portal = getPortalFromPath(pathname);
  if (!portal) return false;
  
  // Check if user role can access this portal
  const userPortalPath = PORTAL_CONFIGS[userRole]?.path;
  return userPortalPath?.includes(portal) || false;
}

// Mock JWT utilities (for development)
export class MockJWTUtils {
  private static SECRET = 'largify-360erp-secret-key';
  
  static generateToken(user: any): string {
    // In production, use a real JWT library
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    
    // Simple base64 encoding for development
    return btoa(JSON.stringify(payload));
  }
  
  static verifyToken(token: string): any | null {
    try {
      const payload = JSON.parse(atob(token));
      
      // Check expiration
      if (payload.exp < Date.now()) {
        return null;
      }
      
      return payload;
    } catch (error) {
      return null;
    }
  }
  
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp < Date.now();
    } catch (error) {
      return true;
    }
  }
}

export default {
  ROLE_PERMISSIONS,
  PORTAL_CONFIGS,
  PermissionChecker,
  PUBLIC_ROUTES,
  ROLE_REDIRECTS,
  getPortalFromPath,
  canAccessRoute,
  MockJWTUtils,
};
