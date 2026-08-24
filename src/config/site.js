export const site = {
  name: 'ShopEasy',
  tagline: 'Everything you love, delivered',
  logo: 'ShopEasy'
};

export const theme = {
  '--color-primary': '#2874F0',
  '--color-primary-hover': '#5C9DFF',
  '--color-primary-soft': 'rgba(40, 116, 240, 0.16)',
  '--color-accent': '#FF9F01',
  '--color-accent-hover': '#FFC24D',
  '--color-accent-soft': 'rgba(255, 159, 1, 0.16)',
  '--color-buy': '#2563EB',
  '--color-buy-hover': '#06B6D4',
  '--color-cyan': '#06B6D4',
  '--color-success': '#22D3EE',
  '--color-success-hover': '#06B6D4',
  '--color-success-soft': 'rgba(34, 211, 238, 0.16)',
  '--color-danger': '#F87171',
  '--color-danger-hover': '#EF4444',
  '--color-danger-soft': 'rgba(248, 113, 113, 0.16)',
  '--color-warning': '#FFC24D',
  '--color-bg': '#0B1020',
  '--color-surface': '#141B34',
  '--color-surface-2': '#1A2340',
  '--color-glass': 'rgba(20, 27, 52, 0.72)',
  '--color-glass-strong': 'rgba(11, 16, 32, 0.85)',
  '--color-text': '#FFFFFF',
  '--color-text-secondary': '#94A3B8',
  '--color-border': 'rgba(255, 255, 255, 0.08)',
  '--color-border-hover': 'rgba(255, 255, 255, 0.15)',
  '--color-border-focus': '#5C9DFF',
  '--color-footer': '#0B1020',
  '--gradient-primary': 'linear-gradient(135deg, #2874F0, #5C9DFF)',
  '--gradient-pink': 'linear-gradient(135deg, #FF9F01, #FFC24D)',
  '--gradient-blue': 'linear-gradient(135deg, #2563EB, #06B6D4)',
  '--gradient-hero': 'linear-gradient(135deg, rgba(40, 116, 240, 0.35), rgba(37, 99, 235, 0.28), rgba(255, 159, 1, 0.25))',
  '--glow-primary': 'rgba(40, 116, 240, 0.35)',
  '--glow-blue': 'rgba(6, 182, 212, 0.30)',
  '--glow-pink': 'rgba(255, 159, 1, 0.35)',
  '--glass-blur': '20px',
  '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.30)',
  '--shadow': '0 8px 24px rgba(0, 0, 0, 0.40)',
  '--shadow-lg': '0 16px 48px rgba(0, 0, 0, 0.45)',
  '--radius-sm': '10px',
  '--radius': '14px',
  '--radius-lg': '20px',
  '--radius-xl': '24px',
  '--transition': '0.25s cubic-bezier(0.4, 0, 0.2, 1)'
};

export const layout = {
  sticky: true,
  compact: false,
  maxWidth: '1200px',
  showSearch: true,
  showCart: true,
  showAccount: true,
  showHamburger: true,
  showBottomNav: true,
  searchPlaceholder: 'Search for products...'
};

export const pricing = {
  currency: 'INR',
  freeShippingThreshold: 999,
  shippingFee: 49
};

export const nav = {
  links: [
    { label: 'Products', to: '/products' },
    { label: 'About', to: '/#about' },
    { label: 'Contact', to: '/#contact' }
  ],
  guest: [
    { label: 'Login', to: '/login', variant: 'primary' },
    { label: 'Register', to: '/register', variant: 'ghost' }
  ],
  account: [
    { label: 'My Orders', to: '/account/orders', roles: ['user'] },
    { label: 'My Profile', to: '/account/profile', roles: ['user'] }
  ]
};

// The separate admin panel URL. Set this once the admin app is deployed,
// so storefront admins are redirected there automatically.
export const adminUrl = '';

