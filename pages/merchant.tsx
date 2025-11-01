import { useState, useEffect, useRef } from 'react';
import { Box, Stack, Button as UIButton, Text, useColorModeValue } from '@interchain-ui/react';
import { QRCodeSVG } from 'qrcode.react';
import { useChain } from '@interchain-kit/react';
import { WalletState as WalletStatus } from '@interchain-kit/core';
import { Bill } from '@/pages/api/bills';
import { formatAmount } from '@/utils/wallet';
import { ButtonConnect, ButtonConnected, ButtonConnecting, ButtonDisconnected } from '@/components/wallet/Connect';

function MerchantDashboardContent() {
  const { 
    address, 
    chain, 
    status, 
    connect, 
    openView,
    disconnect 
  } = useChain('noble'); // Merchant uses Keplr (Cosmos wallet) - receives USDC on Noble
  
  const [billAmount, setBillAmount] = useState('');
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasAttemptedAutoConnect = useRef(false);

  // Track connection state in localStorage
  useEffect(() => {
    if (status === WalletStatus.Connected) {
      localStorage.setItem('wallet_connected', 'true');
    } else if (status === WalletStatus.Rejected) {
      // Clear connection state if user rejected
      localStorage.removeItem('wallet_connected');
    }
  }, [status]);

  // Auto-connect wallet on mount if previously connected
  useEffect(() => {
    if (hasAttemptedAutoConnect.current) return;
    
    const wasConnected = localStorage.getItem('wallet_connected');
    if (wasConnected === 'true' && status === WalletStatus.Disconnected) {
      hasAttemptedAutoConnect.current = true;
      // Small delay to ensure wallet extension is ready
      const timer = setTimeout(() => {
        connect();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // Check when status becomes available

  // Call hooks at top level
  const bgColor = useColorModeValue('$white', '$blackAlpha500');
  const boxShadow = useColorModeValue(
    '0 0 2px #dfdfdf, 0 0 6px -2px #d3d3d3',
    '0 0 2px #363636, 0 0 8px -2px #4f4f4f'
  );
  const qrBgColor = useColorModeValue('$gray100', '$gray800');

  useEffect(() => {
    // Poll for bill updates
    if (currentBill) {
      const interval = setInterval(() => {
        fetchBill(currentBill.id);
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [currentBill]);

  const fetchBill = async (billId: string) => {
    try {
      const res = await fetch(`/api/bills/${billId}`);
      if (res.ok) {
        const bill = await res.json();
        setCurrentBill(bill);
        if (bill.remainingAmount === '0') {
          // Bill is paid, stop polling
        }
      }
    } catch (err) {
      console.error('Error fetching bill:', err);
    }
  };

  const createBill = async () => {
    if (!billAmount || !address) {
      setError('Please enter an amount and connect your Keplr wallet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert amount to USDC (6 decimals)
      const amount = (parseFloat(billAmount) * 1_000_000).toString();

      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantAddress: address, // Noble address (Cosmos address from Keplr)
          merchantChainId: chain.chainId || 'noble-1', // Noble chain ID
          totalAmount: amount,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create bill');
      }

      const bill = await res.json();
      setCurrentBill(bill);
      setBillAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentUrl = (billId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/pay/${billId}`;
    }
    return '';
  };

  const remainingAmount = currentBill ? formatAmount(currentBill.remainingAmount) : '0';
  const totalAmount = currentBill ? formatAmount(currentBill.totalAmount) : '0';
  const isPaid = currentBill && currentBill.remainingAmount === '0';

  return (
    // @ts-ignore
    <Box
      py="$16"
      px="$8"
      maxWidth="800px"
      mx="auto"
    >
      <Stack direction="vertical" space="$8">
        {/* @ts-ignore */}
        <Box>
          <Text 
            fontSize="$xl" 
            fontWeight="$bold" 
            attributes={{ mb: '$4' }}
          >
            Merchant Dashboard
          </Text>
          <Stack direction="horizontal" space="$4" attributes={{ alignItems: 'center', mb: '$4' }}>
            <Text fontSize="$sm" color="$gray500">
              {address ? `Connected: ${address.slice(0, 8)}...${address.slice(-6)}` : 'Please connect your Keplr wallet'}
            </Text>
            {/* @ts-ignore */}
            <Box>
              {status === WalletStatus.Connected ? (
                // @ts-ignore
                <ButtonConnected onClick={openView} />
              ) : status === WalletStatus.Connecting ? (
                // @ts-ignore
                <ButtonConnecting />
              ) : (
                // @ts-ignore
                <ButtonDisconnected onClick={connect} />
              )}
            </Box>
          </Stack>
        </Box>

        {!currentBill ? (
          // @ts-ignore
          <Box
            p="$8"
            borderRadius="$lg"
            backgroundColor={bgColor}
            boxShadow={boxShadow}
          >
            <Stack direction="vertical" space="$4">
              <Text fontSize="$md" fontWeight="$semibold">
                Create New Bill
              </Text>
              <Text fontSize="$sm" color="$gray500">
                You will receive USDC on Noble via Skip Go
              </Text>
              <input
                type="number"
                placeholder="Enter bill amount (USDC)"
                value={billAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillAmount(e.target.value)}
                step="0.01"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '16px',
                }}
              />
              {error && (
                <Text fontSize="$sm" color="$red500">
                  {error}
                </Text>
              )}
              <UIButton
                onClick={createBill}
                disabled={loading || !address}
                isLoading={loading}
                domAttributes={{
                  style: {
                    backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                  },
                }}
              >
                Create Bill
              </UIButton>
            </Stack>
          </Box>
        ) : (
          // @ts-ignore
          <Box
            p="$8"
            borderRadius="$lg"
            backgroundColor={bgColor}
            boxShadow={boxShadow}
          >
            <Stack 
              direction="vertical" 
              space="$6" 
              attributes={{ alignItems: 'center' }}
            >
              {isPaid ? (
                <>
                  <Text fontSize="$2xl" fontWeight="$bold" color="$green500">
                    Thank You!
                  </Text>
                  <Text fontSize="$md" color="$gray500">
                    Bill has been fully paid
                  </Text>
                  <UIButton
                    onClick={() => {
                      setCurrentBill(null);
                      setBillAmount('');
                    }}
                    domAttributes={{
                      style: {
                        backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                      },
                    }}
                  >
                    Create New Bill
                  </UIButton>
                </>
              ) : (
                <>
                  <Text fontSize="$xl" fontWeight="$bold">
                    Bill #{currentBill.id.slice(0, 8)}
                  </Text>
                  <Stack 
                    direction="vertical" 
                    space="$2" 
                    attributes={{ alignItems: 'center' }}
                  >
                    <Text fontSize="$lg" color="$gray500">
                      Total: {totalAmount} USDC
                    </Text>
                    <Text fontSize="$lg" fontWeight="$bold">
                      Remaining: {remainingAmount} USDC
                    </Text>
                  </Stack>
                  {/* @ts-ignore */}
                  <Box
                    p="$6"
                    borderRadius="$md"
                    backgroundColor={qrBgColor}
                  >
                    {/* @ts-ignore */}
                    <QRCodeSVG
                      value={getPaymentUrl(currentBill.id)}
                      size={256}
                      level="M"
                      includeMargin={true}
                    />
                  </Box>
                  <Text fontSize="$sm" color="$gray500" textAlign="center">
                    Scan this QR code to pay
                  </Text>
                  <Text fontSize="$xs" color="$gray400" textAlign="center" fontFamily="mono">
                    {getPaymentUrl(currentBill.id)}
                  </Text>
                </>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default function MerchantDashboard() {
  return (
    // @ts-ignore
    <MerchantDashboardContent />
  );
}
