// Basic UI components to replace @interchain-ui/react
import React from 'react';
import { colors } from '@/config/colors';

// Token mapping utility with professional color palette
const tokenMap: Record<string, string> = {
  '$white': colors.background.light,
  '$black': colors.text.primary,
  '$blackAlpha500': 'rgba(0, 0, 0, 0.5)',
  '$blackAlpha200': 'rgba(0, 0, 0, 0.2)',
  '$blackAlpha700': 'rgba(0, 0, 0, 0.7)',
  '$whiteAlpha100': 'rgba(255, 255, 255, 0.1)',
  '$whiteAlpha700': 'rgba(255, 255, 255, 0.7)',
  '$gray50': colors.gray[50],
  '$gray100': colors.gray[100],
  '$gray200': colors.gray[200],
  '$gray300': colors.gray[300],
  '$gray400': colors.gray[400],
  '$gray500': colors.gray[500],
  '$gray600': colors.gray[600],
  '$gray700': colors.gray[700],
  '$gray900': colors.gray[900],
  '$purple300': colors.primary[300],
  '$purple600': colors.primary[600],
  '$purple700': colors.primary[700],
  '$primary200': colors.primary[200],
  '$primary500': colors.primary[500],
  '$primary600': colors.primary[600],
  '$green500': colors.success[500],
  '$green600': colors.success[600],
  '$green50': colors.success[50],
  '$green900': colors.success[900],
  '$red500': colors.error[500],
  '$orange200': colors.warning[200],
  '$orange300': colors.warning[300],
  '$text': colors.text.primary,
  '$background': colors.background.light,
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
  '$xs': '0.75rem',
  '$sm': '0.875rem',
  '$md': '1rem',
  '$lg': '1.125rem',
  '$xl': '1.25rem',
  '$2xl': '1.5rem',
  '$3xl': '1.875rem',
  '$4xl': '2.25rem',
  '$5xl': '3rem',
  '$light': '300',
  '$normal': '400',
  '$medium': '500',
  '$semibold': '600',
  '$bold': '700',
  '$borderRadiusMd': '0.375rem',
  '$borderRadiusLg': '0.5rem',
  '$borderRadiusXl': '0.75rem',
  '$full': '50%',
  '$short': '1.25',
  '$tall': '1.75',
};

function resolveToken(token: string | undefined): string | undefined {
  if (!token) return token;
  if (typeof token === 'string' && token.startsWith('$')) {
    return tokenMap[token] || token;
  }
  return token;
}

function resolveTokens(obj: any): any {
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

export interface BoxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  children?: React.ReactNode;
  as?: 'div' | 'header' | 'footer' | 'section' | 'article';
  py?: string;
  px?: string | { mobile?: string; tablet?: string };
  mx?: string;
  my?: string;
  mb?: string;
  mt?: string;
  ml?: string;
  mr?: string;
  p?: string;
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
  display?: string;
  flex?: string;
  justifyContent?: string;
  alignItems?: string;
  overflow?: string;
  backgroundColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  borderWidth?: string;
  borderBottomWidth?: string;
  borderStyle?: string;
  borderBottomStyle?: string;
  borderColor?: string;
  borderBottomColor?: string;
  gap?: string;
  textAlign?: 'left' | 'center' | 'right';
  attributes?: Record<string, any>;
}

export function Box({ 
  children, 
  as = 'div',
  py, 
  px, 
  mx, 
  my, 
  mb,
  mt,
  ml,
  mr,
  p,
  maxWidth,
  maxHeight,
  width,
  height,
  display,
  flex,
  justifyContent,
  alignItems,
  overflow,
  backgroundColor,
  borderRadius,
  boxShadow,
  borderWidth,
  borderBottomWidth,
  borderStyle,
  borderBottomStyle,
  borderColor,
  borderBottomColor,
  gap,
  textAlign,
  attributes,
  style,
  className,
  ...props 
}: BoxProps) {
  // Handle responsive px
  const pxValue = typeof px === 'object' ? px.mobile || px.tablet : px;
  const paddingValue = p || py;
  
  const styles: React.CSSProperties = {
    paddingTop: paddingValue ? resolveToken(paddingValue) : resolveToken(py),
    paddingBottom: paddingValue ? resolveToken(paddingValue) : resolveToken(py),
    paddingLeft: paddingValue ? resolveToken(paddingValue) : resolveToken(pxValue),
    paddingRight: paddingValue ? resolveToken(paddingValue) : resolveToken(pxValue),
    marginLeft: resolveToken(ml || mx),
    marginRight: resolveToken(mr || mx),
    marginTop: resolveToken(mt || my),
    marginBottom: resolveToken(mb || my),
    maxWidth: resolveToken(maxWidth),
    maxHeight: resolveToken(maxHeight),
    width: resolveToken(width === 'full' ? '100%' : width),
    height: resolveToken(height),
    display,
    flex,
    justifyContent,
    alignItems,
    overflow,
    backgroundColor: resolveToken(backgroundColor),
    borderRadius: resolveToken(borderRadius),
    boxShadow: resolveToken(boxShadow),
    borderWidth: resolveToken(borderWidth),
    borderBottomWidth: resolveToken(borderBottomWidth),
    borderStyle,
    borderBottomStyle,
    borderColor: resolveToken(borderColor),
    borderBottomColor: resolveToken(borderBottomColor),
    gap: resolveToken(gap),
    textAlign,
    ...(attributes?.style ? resolveTokens(attributes.style) : {}),
    ...style,
  };

  const Component = as;
  return React.createElement(Component, { style: styles, className, ...props }, children);
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  space?: string;
  alignItems?: string;
  justifyContent?: string;
  flexWrap?: string;
  attributes?: Record<string, any>;
}

export function Stack({ 
  children, 
  direction = 'horizontal',
  space,
  alignItems,
  justifyContent,
  flexWrap,
  attributes,
  style,
  ...props 
}: StackProps) {
  const styles: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    gap: resolveToken(space),
    alignItems: resolveToken(alignItems),
    justifyContent: resolveToken(justifyContent),
    flexWrap,
    ...(attributes?.style ? resolveTokens(attributes.style) : {}),
    ...(attributes?.mx ? { marginLeft: resolveToken(attributes.mx), marginRight: resolveToken(attributes.mx) } : {}),
    ...(attributes?.px ? { paddingLeft: resolveToken(attributes.px), paddingRight: resolveToken(attributes.px) } : {}),
    ...(attributes?.py ? { paddingTop: resolveToken(attributes.py), paddingBottom: resolveToken(attributes.py) } : {}),
    ...(attributes?.mb ? { marginBottom: resolveToken(attributes.mb) } : {}),
    ...(attributes?.maxWidth ? { maxWidth: resolveToken(attributes.maxWidth) } : {}),
    ...(attributes?.borderRadius ? { borderRadius: resolveToken(attributes.borderRadius) } : {}),
    ...(attributes?.backgroundColor ? { backgroundColor: resolveToken(attributes.backgroundColor) } : {}),
    ...(attributes?.boxShadow ? { boxShadow: resolveToken(attributes.boxShadow) } : {}),
    ...(attributes?.justifyContent ? { justifyContent: resolveToken(attributes.justifyContent) } : {}),
    ...style,
  };

  return (
    <div style={styles} {...props}>
      {children}
    </div>
  );
}

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  children?: React.ReactNode;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div';
  fontSize?: string;
  fontWeight?: string;
  color?: string | { base?: string; hover?: string };
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: string;
  fontFamily?: string;
  attributes?: Record<string, any>;
  domAttributes?: Record<string, any>;
}

export function Text({ 
  children, 
  as = 'p',
  fontSize,
  fontWeight,
  color,
  textAlign,
  lineHeight,
  fontFamily,
  attributes,
  domAttributes,
  style,
  ...props 
}: TextProps) {
  const colorValue = typeof color === 'string' ? resolveToken(color) : (typeof color === 'object' && color?.base ? resolveToken(color.base) : undefined);
  
  const styles: React.CSSProperties = {
    fontSize: resolveToken(fontSize),
    fontWeight: resolveToken(fontWeight),
    color: colorValue,
    textAlign,
    lineHeight: resolveToken(lineHeight),
    fontFamily,
    ...(attributes?.style ? resolveTokens(attributes.style) : {}),
    ...(domAttributes?.style ? resolveTokens(domAttributes.style) : {}),
    ...style,
  };

  const Component = as;
  return <Component style={styles} {...props}>{children}</Component>;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outlined' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  domAttributes?: {
    style?: React.CSSProperties;
  };
}

export function Button({ 
  children, 
  size = 'md',
  variant = 'solid',
  isLoading,
  disabled,
  leftIcon,
  domAttributes,
  style,
  ...props 
}: ButtonProps) {
  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
  };

  const variantStyles = {
    solid: {
      backgroundColor: colors.primary[600],
      color: colors.background.light,
      border: 'none',
      boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)',
    },
    outlined: {
      backgroundColor: 'transparent',
      color: colors.primary[600],
      border: `1px solid ${colors.primary[600]}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary[600],
      border: 'none',
    },
  };

  const styles: React.CSSProperties = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    borderRadius: '0.5rem',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    ...domAttributes?.style,
    ...style,
  };

  return (
    <button 
      style={styles} 
      disabled={disabled || isLoading} 
      {...props}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading && variant === 'solid') {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(124, 58, 237, 0.4), 0 4px 6px -2px rgba(124, 58, 237, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading && variant === 'solid') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(124, 58, 237, 0.3)';
        }
      }}
    >
      {leftIcon}
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

export function ClipboardCopyText({ 
  text, 
  truncate 
}: { 
  text: string; 
  truncate?: 'start' | 'middle' | 'end'; 
}) {
  const truncateText = (text: string, type: 'start' | 'middle' | 'end' = 'middle') => {
    if (text.length <= 20) return text;
    if (type === 'start') return '...' + text.slice(-17);
    if (type === 'end') return text.slice(0, 17) + '...';
    return text.slice(0, 10) + '...' + text.slice(-10);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span>{truncateText(text, truncate)}</span>
      <button onClick={handleCopy} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
        Copy
      </button>
    </div>
  );
}

export function Container({ 
  children, 
  maxWidth,
  attributes,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { maxWidth?: string; attributes?: Record<string, any> }) {
  return (
    <div style={{ maxWidth, margin: '0 auto', width: '100%', ...attributes?.style }} {...props}>
      {children}
    </div>
  );
}

// Input component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, style, ...props }: InputProps) {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontSize: '0.875rem', 
          fontWeight: 500,
          color: colors.text.primary 
        }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          fontSize: '1rem',
          borderRadius: '0.5rem',
          border: error ? `1px solid ${colors.error[500]}` : `1px solid ${colors.border.light}`,
          backgroundColor: colors.background.light,
          color: colors.text.primary,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          outline: 'none',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.primary[600];
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? colors.error[500] : colors.border.light;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: colors.error[500] }}>
          {error}
        </div>
      )}
      {helperText && !error && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: colors.text.secondary }}>
          {helperText}
        </div>
      )}
    </div>
  );
}

export function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />;
}

export function Link({ 
  children, 
  href, 
  target,
  underline = true,
  ...props 
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { underline?: boolean }) {
  return (
    <a 
      href={href} 
      target={target}
      style={{ 
        textDecoration: underline ? 'underline' : 'none', 
        color: colors.primary[600],
        transition: 'color 0.2s ease',
      }}
      {...props}
    >
      {children}
    </a>
  );
}

export function Icon({ name, size, attributes }: { name: string; size?: string; attributes?: Record<string, any> }) {
  // Simple icon placeholder - you can replace with react-icons or similar
  return <span style={{ fontSize: size, ...attributes?.style }}>🔗</span>;
}

// Combobox component
export interface ComboboxProps {
  children?: React.ReactNode;
  selectedKey?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSelectionChange?: (value: string) => void;
  inputAddonStart?: React.ReactNode;
  styleProps?: Record<string, any>;
}

export function Combobox({ 
  children, 
  selectedKey,
  inputValue,
  onInputChange,
  onSelectionChange,
  inputAddonStart,
  styleProps,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState(inputValue || '');

  React.useEffect(() => {
    setValue(inputValue || '');
  }, [inputValue]);

  const handleItemClick = (itemValue: string) => {
    onSelectionChange?.(itemValue);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', ...styleProps?.width }}>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '0.5rem' }}>
        {inputAddonStart}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onInputChange?.(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          style={{ flex: 1, padding: '0.5rem', border: 'none', outline: 'none' }}
        />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ccc', borderRadius: '0.5rem', zIndex: 1000, maxHeight: '200px', overflow: 'auto', marginTop: '0.25rem' }}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === Combobox.Item) {
              return React.cloneElement(child as React.ReactElement<any>, {
                onClick: () => handleItemClick(child.props.textValue || child.key as string),
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}

Combobox.Item = ({ children, textValue, onClick, style, ...props }: { children: React.ReactNode; textValue: string; onClick?: () => void; style?: React.CSSProperties }) => (
  <div {...props} onClick={onClick} style={{ padding: '0.5rem', cursor: 'pointer', ...style }}>{children}</div>
);

// Avatar component
export function Avatar({ 
  name, 
  src, 
  size = 'md',
  getInitials,
  fallbackMode,
  attributes,
}: { 
  name: string; 
  src?: string; 
  size?: 'xs' | 'sm' | 'md' | 'lg';
  getInitials?: (name: string) => string;
  fallbackMode?: 'bg' | 'initials';
  attributes?: Record<string, any>;
}) {
  const sizeMap = { xs: '24px', sm: '32px', md: '40px', lg: '48px' };
  
  return (
    <div 
      style={{ 
        width: sizeMap[size], 
        height: sizeMap[size], 
        borderRadius: '50%', 
        backgroundColor: colors.primary[600],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.background.light,
        fontWeight: 600,
        ...attributes?.style 
      }}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <span>{getInitials ? getInitials(name) : name[0]}</span>
      )}
    </div>
  );
}

// Skeleton component
export function Skeleton({ 
  width, 
  height, 
  borderRadius 
}: { 
  width?: string; 
  height?: string; 
  borderRadius?: string;
}) {
  return (
    <div 
      style={{ 
        width: width || '100%', 
        height: height || '1rem', 
        borderRadius: borderRadius || '0.25rem',
        backgroundColor: '#e5e7eb',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

export type IconName = string;

// Simple hooks
export function useColorModeValue(light: string, dark: string) {
  // Simplified - always returns light mode value, but resolve token
  return resolveToken(light) || light;
}

export function useTheme() {
  return { themeClass: '' };
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

