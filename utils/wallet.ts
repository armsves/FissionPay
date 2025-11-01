// Wallet utilities for handling different wallet types

export type WalletType = 'keplr' | 'metamask';

export interface WalletInfo {
  type: WalletType;
  address: string;
  chainId?: string;
}

// Helper to detect wallet type from chain ID
export function detectWalletType(chainId: string): WalletType {
  if (chainId.includes('-1') || chainId.includes('-4')) {
    return 'keplr';
  } else {
    return 'metamask';
  }
}

// Format amount for display
export function formatAmount(amount: string, decimals: number = 6): string {
  const num = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const fractional = num % divisor;
  
  if (fractional === BigInt(0)) {
    return whole.toString();
  }
  
  const fractionalStr = fractional.toString().padStart(decimals, '0');
  // Remove trailing zeros
  const trimmed = fractionalStr.replace(/0+$/, '');
  return trimmed ? `${whole}.${trimmed}` : whole.toString();
}

// Parse amount from display format
export function parseAmount(amount: string, decimals: number = 6): string {
  const parts = amount.split('.');
  const whole = parts[0] || '0';
  const fractional = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
  
  return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(fractional)).toString();
}

// Calculate percentage amount
export function calculatePercentageAmount(
  totalAmount: string,
  percentage: number
): string {
  const total = BigInt(totalAmount);
  // percentage is already a decimal (0.0 to 1.0), so multiply by 100 to get percentage value
  // Then divide by 100 to get the actual amount
  const percentageValue = BigInt(Math.floor(percentage * 100));
  const result = (total * percentageValue) / BigInt(100);
  return result.toString();
}

