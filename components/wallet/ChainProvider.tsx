// Basic wallet provider to replace @interchain-kit/react ChainProvider
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export enum WalletStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected',
  Rejected = 'Rejected',
}

interface ChainContextType {
  chain: { chainName?: string };
  status: WalletStatus;
  wallet: any;
  username?: string;
  address?: string;
  message?: string;
  connect: () => Promise<void>;
  openView: () => void;
  disconnect: () => void;
}

const ChainContext = createContext<ChainContextType | null>(null);

export function ChainProvider({ children }: { children: ReactNode }) {
  return <ChainContext.Provider value={null}>{children}</ChainContext.Provider>;
}

export function useChain(chainName?: string): ChainContextType {
  const [status, setStatus] = useState<WalletStatus>(WalletStatus.Disconnected);
  const [address, setAddress] = useState<string | undefined>();
  const [chain, setChain] = useState<{ chainName?: string }>({ chainName });

  useEffect(() => {
    if (chainName) {
      setChain({ chainName });
    }
  }, [chainName]);

  const connect = async () => {
    if (typeof window === 'undefined' || !window.keplr) {
      throw new Error('Keplr wallet not found');
    }

    setStatus(WalletStatus.Connecting);
    try {
      const chainId = 'noble-1'; // Default to Noble
      await window.keplr.enable(chainId);
      const key = await window.keplr.getKey(chainId);
      setAddress(key.bech32Address);
      setStatus(WalletStatus.Connected);
    } catch (error: any) {
      setStatus(WalletStatus.Rejected);
      throw error;
    }
  };

  const disconnect = () => {
    setStatus(WalletStatus.Disconnected);
    setAddress(undefined);
  };

  const openView = () => {
    // Simple implementation - could open wallet extension
    console.log('Open wallet view');
  };

  return {
    chain,
    status,
    wallet: null,
    address,
    connect,
    openView,
    disconnect,
  };
}

// Extend Window interface
declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      getKey: (chainId: string) => Promise<{ bech32Address: string }>;
    };
  }
}

