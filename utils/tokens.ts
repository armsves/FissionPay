// Token mapping utility to convert Interchain UI tokens to CSS values
export const tokenMap: Record<string, string> = {
  // Colors
  '$white': '#ffffff',
  '$black': '#000000',
  '$blackAlpha500': 'rgba(0, 0, 0, 0.5)',
  '$blackAlpha200': 'rgba(0, 0, 0, 0.2)',
  '$blackAlpha700': 'rgba(0, 0, 0, 0.7)',
  '$whiteAlpha100': 'rgba(255, 255, 255, 0.1)',
  '$whiteAlpha700': 'rgba(255, 255, 255, 0.7)',
  '$gray100': '#f3f4f6',
  '$gray200': '#e5e7eb',
  '$gray300': '#d1d5db',
  '$gray400': '#9ca3af',
  '$gray500': '#6b7280',
  '$gray700': '#374151',
  '$gray800': '#1f2937',
  '$purple300': '#c4b5fd',
  '$purple600': '#9333ea',
  '$primary200': '#c4b5fd',
  '$primary500': '#9333ea',
  '$green500': '#10b981',
  '$green600': '#059669',
  '$green50': '#f0fdf4',
  '$green900': '#14532d',
  '$red500': '#ef4444',
  '$orange200': '#fed7aa',
  '$orange300': '#fdba74',
  '$text': '#000000',
  '$background': '#ffffff',
  
  // Spacing
  '$2': '0.125rem',
  '$3': '0.1875rem',
  '$4': '0.25rem',
  '$5': '0.3125rem',
  '$6': '0.375rem',
  '$8': '0.5rem',
  '$9': '0.5625rem',
  '$10': '0.625rem',
  '$12': '0.75rem',
  '$14': '0.875rem',
  '$15': '0.9375rem',
  '$16': '1rem',
  '$19': '1.1875rem',
  '$24': '1.5rem',
  
  // Font sizes
  '$xs': '0.75rem',
  '$sm': '0.875rem',
  '$md': '1rem',
  '$lg': '1.125rem',
  '$xl': '1.25rem',
  '$2xl': '1.5rem',
  '$3xl': '1.875rem',
  
  // Font weights
  '$light': '300',
  '$normal': '400',
  '$medium': '500',
  '$semibold': '600',
  '$bold': '700',
  
  // Border radius
  '$borderRadiusMd': '0.375rem',
  '$borderRadiusLg': '0.5rem',
  '$borderRadiusXl': '0.75rem',
  '$full': '50%',
  
  // Other
  '$short': '1.25',
  '$tall': '1.75',
};

export function resolveToken(token: string): string {
  if (token.startsWith('$')) {
    return tokenMap[token] || token;
  }
  return token;
}

export function resolveTokens(obj: any): any {
  if (typeof obj === 'string') {
    return resolveToken(obj);
  }
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map(resolveTokens);
    }
    const resolved: any = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveTokens(value);
    }
    return resolved;
  }
  return obj;
}

