import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Stack, Button as UIButton, Text, Input, useColorModeValue } from '@/components/ui';
import { useChain } from '@/components/wallet/ChainProvider';
import { useAccount, useConnect, useDisconnect, useWalletClient, useSwitchChain } from 'wagmi';
import { chains, assetLists } from '@chain-registry/v2';
import { Layout } from '@/components';
import { Bill } from '@/pages/api/bills';
import { formatAmount, calculatePercentageAmount, parseAmount } from '@/utils/wallet';
import { initializeSkipGo, calculateRoute, executePaymentRoute, getUserAddress } from '@/utils/skipGo';
import { EvmWalletProvider } from '@/components/wallet/EvmWalletProvider';
import { ChainSelect } from '@/components/wallet/Chain';
import { colors } from '@/config/colors';

// Extend Window interface for Keplr and Ethereum
declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      getKey: (chainId: string) => Promise<{ bech32Address: string }>;
    };
    ethereum?: any;
  }
}

type PaymentPercentage = 25 | 50 | 75 | 100 | 'custom';

function PaymentPageContent() {
  const router = useRouter();
  const { id } = router.query;
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState('');
  const [selectedPercentage, setSelectedPercentage] = useState<PaymentPercentage>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [walletType, setWalletType] = useState<'keplr' | 'metamask' | null>(null);
  const [selectedSourceChain, setSelectedSourceChain] = useState<string | null>(null);
  const [selectedSourceAsset, setSelectedSourceAsset] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'routing' | 'executing' | 'success' | 'error'>('idle');

  // Cosmos wallet
  const cosmosChain = useChain('noble'); // Use chain name 'noble', not chainId 'noble-1'

  // EVM wallet
  const { address: evmAddress, isConnected: isEvmConnected, chainId: currentChainId } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();
  const { data: walletClient, isLoading: isWalletClientLoading } = useWalletClient();
  const { switchChain } = useSwitchChain();

  // Call all hooks at top level (before any conditional returns)
  const bgColor = useColorModeValue('$white', '$blackAlpha500');
  const grayBgColor = useColorModeValue('$gray100', '$gray800');
  const greenBgColor = useColorModeValue('$green50', '$green900');

  useEffect(() => {
    initializeSkipGo();
  }, []);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchBill(id);
    } else if (router.isReady && !id) {
      // Router is ready but no ID - show error
      setLoading(false);
      setError('Invalid bill ID');
    }
  }, [id, router.isReady]);

  const fetchBill = async (billId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/bills/${billId}`);
      if (res.ok) {
        const billData = await res.json();
        setBill(billData);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || 'Bill not found');
        setBill(null);
      }
    } catch (err) {
      setError('Failed to load bill');
      setBill(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async (type: 'keplr' | 'metamask') => {
    setWalletType(type);
    setError('');
    setRouteResult(null); // Reset route when wallet changes

    try {
      if (type === 'keplr') {
        await cosmosChain.connect();
        // Reset selection - user must choose chain
        setSelectedSourceChain(null);
        setSelectedSourceAsset(null);
      } else if (type === 'metamask') {
        // Check if already connected
        if (isEvmConnected && evmAddress) {
          // Wallet already connected, just set the wallet type and source chain/asset
          setSelectedSourceChain('10'); // Optimism mainnet
          setSelectedSourceAsset('0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'); // USDC on Optimism
          return;
        }

        // Connect using wagmi's injected connector
        const injectedConnector = connectors.find((c) => c.id === 'injected' || c.name?.toLowerCase().includes('metamask'));

        if (!injectedConnector) {
          throw new Error('MetaMask connector not found. Please ensure MetaMask is installed.');
        }

        try {
          await connectAsync({ connector: injectedConnector });
        } catch (err: any) {
          // If connector is already connected, that's fine - just continue
          if (err.message?.includes('already connected') || err.message?.includes('Connector already connected')) {
            // Wallet is already connected, just continue
            console.log('Wallet already connected');
          } else {
            throw err;
          }
        }

        // Auto-select for EVM - Optimism USDC for testing
        setSelectedSourceChain('10'); // Optimism mainnet
        setSelectedSourceAsset('0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'); // USDC on Optimism
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const isWalletConnected = () => {
    if (walletType === 'keplr') return cosmosChain.status === 'Connected';
    if (walletType === 'metamask') return isEvmConnected;
    return false;
  };

  const getPaymentAmount = () => {
    if (!bill) return '0';

    if (selectedPercentage === 'custom') {
      if (!customAmount) return '0';
      return parseAmount(customAmount);
    }

    const percentage = selectedPercentage / 100;
    const amount = calculatePercentageAmount(bill.remainingAmount, percentage);
    return amount;
  };

  const calculatePaymentRoute = async () => {
    if (!bill || !walletType || !selectedSourceChain || !selectedSourceAsset) {
      setError('Please select source chain and token');
      return;
    }

    setPaymentStatus('routing');
    setError('');

    try {
      const paymentAmount = getPaymentAmount();

      // Destination is USDC on Noble (merchant receives via Skip Go)
      const route = await calculateRoute({
        sourceAssetDenom: selectedSourceAsset,
        sourceAssetChainId: selectedSourceChain,
        destAssetDenom: 'uusdc', // USDC on Noble
        destAssetChainId: bill.merchantChainId || 'noble-1', // Noble chain ID
        amountIn: paymentAmount,
      });

      setRouteResult(route);
      setPaymentStatus('idle');
    } catch (err: any) {
      setError(err.message || 'Failed to calculate route');
      setPaymentStatus('error');
    }
  };

  const executePayment = async () => {
    if (!bill || !routeResult || !walletType) return;

    // Verify wallet is connected before executing
    if (!isWalletConnected()) {
      setError('Wallet not connected. Please connect your wallet first.');
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus('executing');
    setError('');

    try {
      // Pre-check: Verify we can get addresses for all required chains
      // If route requires Cosmos chains and user didn't connect Keplr, try to get addresses from Keplr if available
      const requiredCosmosChains = routeResult.requiredChainAddresses.filter((chainId: string) =>
        chainId.match(/-\d+$/) || chainId.includes('cosmos') || chainId.includes('noble') ||
        chainId.includes('osmosis') || chainId.includes('celestia')
      );

      if (requiredCosmosChains.length > 0 && walletType !== 'keplr') {
        // Check if Keplr is available and try to get addresses
        if (window.keplr) {
          try {
            for (const chainId of requiredCosmosChains) {
              const chainInfo = chains.find(c => c.chainId === chainId);
              if (chainInfo) {
                await window.keplr.enable(chainId);
              }
            }
          } catch (err: any) {
            // If Keplr is available but not enabled for these chains, show helpful error
            throw new Error(
              `This payment route requires Keplr wallet for Cosmos chains. ` +
              `Please connect your Keplr wallet and ensure it has access to the required chains.`
            );
          }
        } else {
          throw new Error(
            `This payment route requires Keplr wallet for Cosmos chains. ` +
            `Please install and connect Keplr wallet to complete this cross-chain payment.`
          );
        }
      }

      // Get user addresses for required chains
      // The addresses must be in the same order as requiredChainAddresses
      // For Cosmos chains, we may need to get addresses for different chains using the same wallet
      const userAddresses = await Promise.all(
        routeResult.requiredChainAddresses.map(async (chainId: string) => {
          let address: string | undefined;

          // Determine chain type and get appropriate address
          // Cosmos chains - need to get address for each chain
          if (chainId.match(/-\d+$/) || chainId.includes('cosmos') || chainId.includes('noble') || chainId.includes('osmosis') || chainId.includes('celestia')) {
            // Check if this is the destination chain (merchant's chain)
            const isDestinationChain = chainId === bill.merchantChainId;

            // Try to get address from Keplr if available (even if user connected with different wallet)
            try {
              if (window.keplr) {
                // Get chain info from chain registry
                const { chains } = await import('@chain-registry/v2');
                const chainInfo = chains.find(c => c.chainId === chainId);

                if (chainInfo) {
                  // Enable the chain in Keplr if not already enabled
                  await window.keplr.enable(chainId);
                  // Get address for this chain
                  const key = await window.keplr.getKey(chainId);
                  address = key.bech32Address;
                }
              }
            } catch (err: any) {
              console.warn(`Failed to get Keplr address for chain ${chainId}:`, err);
            }

            // If still no address and user has Keplr connected, use current address
            if (!address && walletType === 'keplr' && cosmosChain.address) {
              address = cosmosChain.address;
            }

            // If still no address, we need Keplr for Cosmos chains
            if (!address) {
              const chainName = chains.find(c => c.chainId === chainId)?.prettyName || chainId;
              throw new Error(
                `This payment route requires a Cosmos wallet (Keplr) for chain ${chainName} (${chainId}). ` +
                `Please connect your Keplr wallet and ensure it has access to this chain.`
              );
            }
          }
          // EVM chains (numeric chain IDs like "1", "137", etc.)
          else {
            if (walletType === 'metamask' && evmAddress) {
              address = evmAddress;
            } else {
              throw new Error(`EVM wallet (Metamask) required for chain ${chainId}`);
            }
          }

          if (!address) {
            throw new Error(
              `Missing address for chain ${chainId}. ` +
              `Please ensure your ${walletType} wallet is connected and supports this chain.`
            );
          }

          return { chainId, address }; // Use chainId (lowercase 'd') not chainID
        })
      );

      console.log('Final user addresses:', userAddresses);

      let txHash = '';

      await executePaymentRoute({
        route: routeResult,
        userAddresses,
        getCosmosSigner: async (chainId: string) => {
          // @ts-expect-error - signingStargateClient may not be in type definitions but exists at runtime
          if (!cosmosChain.signingStargateClient) {
            throw new Error('Cosmos signer not available');
          }
          // @ts-expect-error - signingStargateClient may not be in type definitions but exists at runtime
          return cosmosChain.signingStargateClient;
        },
        getEvmSigner: async (chainId: string) => {
          if (walletType !== 'metamask') {
            throw new Error(`EVM wallet (Metamask) not connected for chain ${chainId}`);
          }

          // Verify wallet is connected
          if (!isEvmConnected || !evmAddress) {
            throw new Error(`Metamask wallet not connected. Please connect your wallet first.`);
          }

          // Check if we need to switch chains first
          const targetChainId = parseInt(chainId);
          if (currentChainId !== targetChainId && switchChain) {
            try {
              await switchChain({ chainId: targetChainId });
              // Wait for chain switch to complete and wallet client to update
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (err: any) {
              throw new Error(`Failed to switch to chain ${chainId}: ${err.message}`);
            }
          }

          // Get fresh wallet client - it might not be available immediately after connection
          // Try multiple times with delays
          let client = walletClient;
          let attempts = 0;
          const maxAttempts = 5;

          while (!client && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            // Re-fetch wallet client by checking if it's available
            // Note: We can't directly refresh useWalletClient, but we can wait for it
            attempts++;

            // If still loading, wait a bit more
            if (isWalletClientLoading) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          // If still no wallet client, try to get it from window.ethereum directly
          if (!client && typeof window !== 'undefined' && window.ethereum) {
            try {
              const { createWalletClient, custom } = await import('viem');
              const { mainnet } = await import('viem/chains');

              // Get accounts from ethereum
              const accounts = await window.ethereum.request({ method: 'eth_accounts' });
              if (accounts && accounts.length > 0) {
                client = createWalletClient({
                  chain: mainnet,
                  transport: custom(window.ethereum),
                  account: accounts[0] as `0x${string}`,
                }) as any;
              }
            } catch (err) {
              console.warn('Failed to create wallet client from window.ethereum:', err);
            }
          }

          if (!client) {
            throw new Error(`EVM wallet client not available for chain ${chainId}. Please ensure Metamask is connected and try refreshing the page.`);
          }

          // Verify the wallet client has the required account property
          if (!client.account) {
            throw new Error(`EVM wallet account not available for chain ${chainId}`);
          }

          // Return the wallet client which Skip Go can use for signing
          return client;
        },
        onTransactionCompleted: async (chainID: string, hash: string, status: any) => {
          txHash = hash;
          setPaymentStatus('success');

          // Update bill on server
          const paymentAmount = getPaymentAmount();
          await fetch(`/api/bills/${bill.id}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentAmount,
              txHash: hash,
            }),
          });

          // Refresh bill
          await fetchBill(bill.id);
        },
        onTransactionBroadcast: async ({ txHash: hash, chainID }) => {
          console.log('Transaction broadcasted:', hash, chainID);
        },
      });
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setPaymentStatus('error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box py="$24" px="$8" maxWidth="900px" mx="auto" style={{ textAlign: 'center' }}>
          <Box
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: colors.gray[100],
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '32px',
            }}
          >
            ⏳
          </Box>
          <Text fontSize="$xl" fontWeight="$semibold" color="$gray600">
            Loading bill...
          </Text>
        </Box>
      </Layout>
    );
  }

  if (error || !bill) {
    return (
      <Layout>
        <Box py="$24" px="$8" maxWidth="900px" mx="auto">
          <Box
            p="$10"
            borderRadius="$xl"
            backgroundColor="$white"
            style={{
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: `1px solid ${colors.border.light}`,
              textAlign: 'center',
            }}
          >
            <Stack direction="vertical" space="$6" attributes={{ alignItems: 'center' }}>
              <Box
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: colors.error[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}
              >
                ⚠️
              </Box>
              <Text fontSize="$2xl" fontWeight="$bold" color={colors.error[600]}>
                {error || 'Bill not found'}
              </Text>
              <Text fontSize="$md" color="$gray600">
                Please check the URL and try again
              </Text>
            </Stack>
          </Box>
        </Box>
      </Layout>
    );
  }

  const remainingAmount = formatAmount(bill.remainingAmount);
  const paymentAmount = formatAmount(getPaymentAmount());
  const isConnected = isWalletConnected();
  const totalAmount = formatAmount(bill.totalAmount);
  const paidAmount = formatAmount((parseFloat(bill.totalAmount) - parseFloat(bill.remainingAmount)).toString());
  const paidPercentage = ((parseFloat(bill.totalAmount) - parseFloat(bill.remainingAmount)) / parseFloat(bill.totalAmount)) * 100;

  return (
    <Layout>
      <Box py="$6" px="$6" maxWidth="900px" mx="auto" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="vertical" space="$4" style={{ flex: 1 }}>
          {/* Header Section */}
          <Box>
            <Text
              fontSize="$3xl"
              fontWeight="$bold"
              style={{ marginBottom: '0.5rem' }}
              domAttributes={{
                style: {
                  background: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '1.75rem',
                  lineHeight: '1.2',
                },
              }}
            >
              Pay Bill
            </Text>

            {/* Bill Summary Card */}
            <Box
              p="$4"
              borderRadius="$lg"
              backgroundColor="$white"
              style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: `1px solid ${colors.border.light}`,
                background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.background.light} 100%)`,
              }}
            >
              <Stack direction="horizontal" attributes={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Box>
                  <Text fontSize="$xs" color="$gray500" style={{ marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Bill Total
                  </Text>
                  <Text fontSize="$lg" fontWeight="$bold" color="$gray900">
                    {totalAmount} USDC
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="$xs" color="$gray500" style={{ marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Paid
                  </Text>
                  <Text fontSize="$lg" fontWeight="$bold" color={colors.success[600]}>
                    {paidAmount} USDC
                  </Text>
                </Box>
                <Box style={{ textAlign: 'right' }}>
                  <Text fontSize="$xs" color="$gray500" style={{ marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Remaining
                  </Text>
                  <Text fontSize="$lg" fontWeight="$bold" color={colors.primary[600]}>
                    {remainingAmount} USDC
                  </Text>
                </Box>
              </Stack>

              {/* Progress Bar */}
              {paidPercentage > 0 && (
                <Box style={{ marginTop: '0.75rem' }}>
                  <Box
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: colors.gray[200],
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        width: `${paidPercentage}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${colors.success[400]} 0%, ${colors.success[600]} 100%)`,
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                  <Text fontSize="$xs" color="$gray500" style={{ marginTop: '0.25rem', textAlign: 'center' }}>
                    {paidPercentage.toFixed(1)}% Paid
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {!isConnected ? (
            /* Wallet Connection Card */
            <Box
              p="$6"
              borderRadius="$xl"
              backgroundColor="$white"
              style={{
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: `1px solid ${colors.border.light}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative gradient accent */}
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                }}
              />

              <Stack direction="vertical" space="$4">
                <Box>
                  <Stack direction="horizontal" space="$2" attributes={{ alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Box
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: colors.primary[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.primary[600],
                        fontSize: '20px',
                      }}
                    >
                      🔗
                    </Box>
                    <Text fontSize="$xl" fontWeight="$bold" style={{ color: colors.text.primary }}>
                      Connect Wallet
                    </Text>
                  </Stack>
                  <Text fontSize="$sm" color="$gray600" style={{ marginLeft: '44px', lineHeight: '1.5' }}>
                    Choose your wallet to proceed
                  </Text>
                </Box>

                <Stack direction="vertical" space="$3">
                  <UIButton
                    onClick={() => handleConnectWallet('keplr')}
                    size="md"
                    domAttributes={{
                      style: {
                        backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                        width: '100%',
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '0.875rem 1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3), 0 2px 4px -1px rgba(124, 58, 237, 0.2)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      },
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>💼</span>
                    Connect Keplr
                  </UIButton>
                  <UIButton
                    onClick={() => handleConnectWallet('metamask')}
                    size="md"
                    domAttributes={{
                      style: {
                        backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                        width: '100%',
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '0.875rem 1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3), 0 2px 4px -1px rgba(124, 58, 237, 0.2)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      },
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🦊</span>
                    Connect Metamask
                  </UIButton>
                </Stack>
              </Stack>
            </Box>
          ) : (
            <>
              {/* Token/Chain Selection */}
              {isConnected && !selectedSourceChain && walletType === 'keplr' && (
                <Box
                  p="$6"
                  borderRadius="$xl"
                  backgroundColor="$white"
                  style={{
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  <Stack direction="vertical" space="$4">
                    <Box>
                      <Stack direction="horizontal" space="$2" attributes={{ alignItems: 'center', marginBottom: '0.5rem' }}>
                        <Box
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: colors.primary[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.primary[600],
                            fontSize: '20px',
                          }}
                        >
                          🔗
                        </Box>
                        <Text fontSize="$lg" fontWeight="$bold" style={{ color: colors.text.primary }}>
                          Select Source Chain & Token
                        </Text>
                      </Stack>
                      <Text fontSize="$sm" color="$gray600" style={{ marginLeft: '44px', lineHeight: '1.5' }}>
                        Choose which chain and token you want to pay with
                      </Text>
                    </Box>
                    <ChainSelect
                      chains={chains}
                      chainName={cosmosChain.chain?.chainName}
                      onChange={async (chainName) => {
                        if (chainName) {
                          const chain = chains.find(c => c.chainName === chainName);
                          if (chain && chain.chainId && window.keplr) {
                            try {
                              // Enable the selected chain in Keplr
                              await window.keplr.enable(chain.chainId);
                              setSelectedSourceChain(chain.chainId || null);
                              // Get assets for this chain from asset list
                              const assets = assetLists.find(list => list.chainName === chainName);
                              if (assets && assets.assets.length > 0) {
                                // Use the first asset (usually native token)
                                const firstAsset = assets.assets[0];
                                // @ts-expect-error - denom property may have different name in Asset type
                                setSelectedSourceAsset(firstAsset.denom || firstAsset.base || null);
                              } else {
                                // Fallback to base denom
                                const baseDenom = chain.fees?.feeTokens?.[0]?.denom || 'uatom';
                                setSelectedSourceAsset(baseDenom);
                              }
                            } catch (err: any) {
                              setError(err.message || 'Failed to switch chain');
                            }
                          }
                        }
                      }}
                    />
                  </Stack>
                </Box>
              )}

              {/* Payment Amount Selection */}
              {selectedSourceChain && selectedSourceAsset && (
                <Box
                  p="$6"
                  borderRadius="$xl"
                  backgroundColor="$white"
                  style={{
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: `1px solid ${colors.border.light}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative gradient accent */}
                  <Box
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                    }}
                  />

                  <Stack direction="vertical" space="$4">
                    {/* Payment Source Info */}
                    {(walletType === 'keplr' && selectedSourceChain) || walletType === 'metamask' ? (
                      <Box
                        p="$3"
                        borderRadius="$md"
                        backgroundColor={colors.gray[50]}
                        style={{
                          border: `1px solid ${colors.border.light}`,
                        }}
                      >
                        {walletType === 'keplr' && selectedSourceChain && (
                          <Stack direction="vertical" space="$1">
                            <Text fontSize="$md" fontWeight="$semibold" color="$gray900">
                              Paying from {chains.find(c => c.chainId === selectedSourceChain)?.prettyName || selectedSourceChain}
                            </Text>
                            <Text fontSize="$xs" color="$gray500">
                              Token: {assetLists.find(list => {
                                const chain = chains.find(c => c.chainId === selectedSourceChain);
                                return chain && list.chainName === chain.chainName;
                              })?.assets.find(a => {
                                return (a as any).denom === selectedSourceAsset || (a as any).base === selectedSourceAsset;
                              })?.symbol || selectedSourceAsset}
                            </Text>
                          </Stack>
                        )}
                        {walletType === 'metamask' && (
                          <Stack direction="vertical" space="$1">
                            <Text fontSize="$md" fontWeight="$semibold" color="$gray900">
                            Paying from Optimism (USDC)
                            </Text>
                          </Stack>
                        )}
                      </Box>
                    ) : null}

                    {/* Payment Amount Selection */}
                    <Box>
                      <Text fontSize="$lg" color="$gray900" fontWeight="$bold" style={{ marginBottom: '0.75rem' }}>
                        Select Payment Amount
                      </Text>

                      <Stack direction="horizontal" space="$2" attributes={{ flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        {([25, 50, 75, 100] as const).map((percent) => (
                          <UIButton
                            key={percent}
                            onClick={() => setSelectedPercentage(percent)}
                            variant={selectedPercentage === percent ? 'solid' : 'outlined'}
                            size="sm"
                            domAttributes={{
                              style: {
                                minWidth: '70px',
                                ...(selectedPercentage === percent ? {
                                  backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                                  boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)',
                                } : {}),
                              },
                            }}
                          >
                            {percent}%
                          </UIButton>
                        ))}
                        <UIButton
                          onClick={() => setSelectedPercentage('custom')}
                          variant={selectedPercentage === 'custom' ? 'solid' : 'outlined'}
                          size="sm"
                          domAttributes={{
                            style: {
                              minWidth: '85px',
                              ...(selectedPercentage === 'custom' ? {
                                backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)',
                              } : {}),
                            },
                          }}
                        >
                          Custom
                        </UIButton>
                      </Stack>

                      {selectedPercentage === 'custom' && (
                        <Box style={{ marginBottom: '0.75rem' }}>
                          <Input
                            type="number"
                            label="Custom Amount"
                            placeholder="0.00"
                            value={customAmount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAmount(e.target.value)}
                            step="0.01"
                            min="0"
                            helperText="Enter custom payment amount in USDC"
                            style={{
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Payment Summary */}
                    <Box
                      p="$4"
                      borderRadius="$md"
                      backgroundColor={colors.primary[50]}
                      style={{
                        border: `2px solid ${colors.primary[200]}`,
                      }}
                    >
                      <Stack direction="horizontal" attributes={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box>
                          <Text fontSize="$xs" color="$gray600" style={{ marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            Payment Amount {paymentAmount} USDC
                          </Text>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Route Result */}
                    {routeResult && (
                      <Box
                        p="$4"
                        borderRadius="$md"
                        backgroundColor={colors.success[50]}
                        style={{
                          border: `2px solid ${colors.success[200]}`,
                        }}
                      >
                        <Stack direction="horizontal" space="$2" attributes={{ alignItems: 'center' }}>
                          <Box style={{ fontSize: '20px' }}>✅</Box>
                          <Box>
                            <Text fontSize="$xs" color={colors.success[700]} fontWeight="$semibold" style={{ marginBottom: '0.125rem' }}>
                              Route Calculated {formatAmount(routeResult.amountOut)} USDC will be received
                            </Text>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {/* Error Display */}
                    {error && (
                      <Box
                        p="$3"
                        borderRadius="$md"
                        backgroundColor={colors.error[50]}
                        style={{
                          border: `1px solid ${colors.error[200]}`,
                        }}
                      >
                        <Text fontSize="$xs" color={colors.error[700]}>
                          ⚠️ {error}
                        </Text>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Stack direction="horizontal" space="$2" attributes={{ flexWrap: 'wrap' }}>
                      {!routeResult ? (
                        <UIButton
                          onClick={calculatePaymentRoute}
                          disabled={paymentStatus === 'routing'}
                          isLoading={paymentStatus === 'routing'}
                          size="md"
                          domAttributes={{
                            style: {
                              backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                              flex: 1,
                              minWidth: '180px',
                              fontSize: '1rem',
                              fontWeight: 600,
                              padding: '0.875rem 1.5rem',
                              boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3), 0 2px 4px -1px rgba(124, 58, 237, 0.2)',
                            },
                          }}
                        >
                          Calculate Route
                        </UIButton>
                      ) : (
                        <UIButton
                          onClick={executePayment}
                          disabled={paymentStatus === 'executing' || paymentStatus === 'success'}
                          isLoading={paymentStatus === 'executing'}
                          size="md"
                          domAttributes={{
                            style: {
                              backgroundImage: paymentStatus === 'success'
                                ? `linear-gradient(90deg, ${colors.success[400]} 0%, ${colors.success[600]} 100%)`
                                : 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                              flex: 1,
                              minWidth: '180px',
                              fontSize: '1rem',
                              fontWeight: 600,
                              padding: '0.875rem 1.5rem',
                              boxShadow: paymentStatus === 'success'
                                ? `0 4px 6px -1px ${colors.success[300]}`
                                : '0 4px 6px -1px rgba(124, 58, 237, 0.3), 0 2px 4px -1px rgba(124, 58, 237, 0.2)',
                            },
                          }}
                        >
                          {paymentStatus === 'success' ? '✓ Payment Successful!' : 'Pay Now'}
                        </UIButton>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Stack>
      </Box>
    </Layout>
  );
}

export default function PaymentPage() {
  return (
    <EvmWalletProvider>
      <PaymentPageContent />
    </EvmWalletProvider>
  );
}

