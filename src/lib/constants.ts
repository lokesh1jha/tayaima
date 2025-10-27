// Application Routes and Links
export const ROUTES = {
  // Public routes
  HOME: '/',
  PRODUCTS: '/products',
  CONTACT: '/contact',
  RETURN_POLICY: '/return-policy',
  LOGIN: '/login',
  SIGNUP: '/signup',
  CHECKOUT: '/checkout',
  
  // Product routes
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  
  // User dashboard routes
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  PROFILE_ORDERS: '/dashboard/profile#orders',
  PROFILE_ADDRESS: '/dashboard/profile#address',
  PROFILE_PERSONAL: '/dashboard/profile#personal',
  PROFILE_SETTINGS: '/dashboard/profile#settings',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_EDIT: (id: string) => `/admin/products/${id}`,
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Order routes
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  
  // API routes
  API: {
    PRODUCTS: '/api/products',
    CATEGORIES: '/api/categories',
    CART: '/api/cart',
    ORDERS: '/api/orders',
    ORDER_CANCEL: (id: string) => `/api/orders/${id}/cancel`,
    USER_PROFILE: '/api/user/profile',
    USER_ORDERS: '/api/user/orders',
    USER_ADDRESSES: '/api/user/addresses',
    ADMIN_PRODUCTS: '/api/admin/products',
    ADMIN_PRODUCT: (id: string) => `/api/admin/products/${id}`,
    ADMIN_CATEGORIES: '/api/admin/categories',
    ADMIN_UPLOADS: '/api/admin/uploads',
  },
  
  // Auth routes
  POST_LOGIN: '/post-login',
} as const;

// External links
export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com',
  SUPPORT: 'mailto:tayaima.com@gmail.com',
} as const;

// Navigation items
export const NAV_ITEMS = {
  ADMIN: [
    { href: ROUTES.ADMIN, label: 'Overview' },
    { href: ROUTES.ADMIN_ORDERS, label: 'Orders' },
    { href: ROUTES.ADMIN_PRODUCTS, label: 'Products' },
    { href: ROUTES.ADMIN_CATEGORIES, label: 'Categories' },
    { href: ROUTES.ADMIN_USERS, label: 'Customers' },
    { href: ROUTES.ADMIN_SETTINGS, label: 'Settings' },
  ],
  PROFILE: [
    { key: 'orders', label: 'Orders' },
    { key: 'address', label: 'Address' },
    { key: 'personal', label: 'Personal Details' },
  ],
} as const;

// Helper functions
export const UTILS = {
  // Navigate to a profile tab and update the URL hash
  navigateToProfileTab: (tab: string) => {
    if (typeof window !== 'undefined') {
      window.location.hash = `#${tab}`;
    }
  },
  
  // Get current profile tab from URL hash
  getCurrentProfileTab: () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['orders', 'address', 'personal'];
      return validTabs.includes(hash) ? hash : 'orders';
    }
    return 'orders';
  },
} as const;
