import { useState, useEffect, useRef } from 'react';
import { Box, Stack, Button as UIButton, Text, Input, useColorModeValue } from '@/components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { useChain } from '@/components/wallet/ChainProvider';
import { WalletStatus } from '@/components/wallet/ChainProvider';
import { Bill } from '@/pages/api/bills';
import { formatAmount } from '@/utils/wallet';
import { ButtonConnect, ButtonConnected, ButtonConnecting, ButtonDisconnected } from '@/components/wallet/Connect';
import { Layout } from '@/components';
import { colors } from '@/config/colors';

function MerchantDashboardContent() {
  const { 
    address, 
    chain, 
    status, 
    connect, 
    openView,
    disconnect 
  } = useChain('noble');
  
  const [billAmount, setBillAmount] = useState('');
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasAttemptedAutoConnect = useRef(false);

  useEffect(() => {
    if (status === WalletStatus.Connected) {
      localStorage.setItem('wallet_connected', 'true');
    } else if (status === WalletStatus.Rejected) {
      localStorage.removeItem('wallet_connected');
    }
  }, [status]);

  useEffect(() => {
    if (hasAttemptedAutoConnect.current) return;
    
    const wasConnected = localStorage.getItem('wallet_connected');
    if (wasConnected === 'true' && status === WalletStatus.Disconnected) {
      hasAttemptedAutoConnect.current = true;
      const timer = setTimeout(() => {
        connect();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    if (currentBill) {
      const interval = setInterval(() => {
        fetchBill(currentBill.id);
      }, 3000);

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
          // Bill is paid
        }
      }
    } catch (err) {
      console.error('Error fetching bill:', err);
    }
  };

  const createBill = async () => {
    if (!billAmount || !address) {
      setError('Please enter an amount and connect your wallet');
      return;
    }

    const amount = parseFloat(billAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const amountInUSDC = (amount * 1_000_000).toString();

      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantAddress: address,
          merchantChainId: chain.chainName ? `${chain.chainName}-1` : 'noble-1',
          totalAmount: amountInUSDC,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const remainingAmount = currentBill ? formatAmount(currentBill.remainingAmount) : '0';
  const totalAmount = currentBill ? formatAmount(currentBill.totalAmount) : '0';
  const isPaid = currentBill && currentBill.remainingAmount === '0';
  const paidPercentage = currentBill 
    ? ((parseFloat(currentBill.totalAmount) - parseFloat(currentBill.remainingAmount)) / parseFloat(currentBill.totalAmount)) * 100 
    : 0;

  return (
    <Layout>
      <Box py="$24" px="$8" maxWidth="950px" mx="auto">
        <Stack direction="vertical" space="$10">
          {/* Header Section */}
          <Box>
            <Stack direction="vertical" space="$6">
              <Text 
                fontSize="$5xl" 
                fontWeight="$bold" 
                style={{ marginBottom: '0.5rem' }}
                domAttributes={{
                  style: {
                    background: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '2.5rem',
                    lineHeight: '1.2',
                  },
                }}
              >
                Merchant Dashboard
              </Text>
              
              {/* Wallet Connection Card */}
              <Box
                p="$6"
                borderRadius="$xl"
                backgroundColor="$white"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: `1px solid ${colors.border.light}`,
                  background: status === WalletStatus.Connected 
                    ? `linear-gradient(135deg, ${colors.success[50]} 0%, ${colors.background.light} 100%)`
                    : colors.background.light,
                }}
              >
                <Stack direction="horizontal" space="$4" attributes={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Stack direction="horizontal" space="$3" attributes={{ alignItems: 'center' }}>
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: status === WalletStatus.Connected ? colors.success[100] : colors.gray[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: status === WalletStatus.Connected ? colors.success[600] : colors.gray[400],
                        fontSize: '24px',
                      }}
                    >
                      💼
                    </Box>
                    <Box>
                      <Text fontSize="$xs" color="$gray500" style={{ marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        Wallet Status
                      </Text>
                      <Text fontSize="$lg" fontWeight="$semibold" color={status === WalletStatus.Connected ? colors.success[700] : colors.gray[700]}>
                        {address ? (
                          <>
                            Connected: {address.slice(0, 10)}...{address.slice(-8)}
                          </>
                        ) : (
                          'Please connect your Keplr wallet'
                        )}
                      </Text>
                    </Box>
                  </Stack>
                  <Box>
                    {status === WalletStatus.Connected ? (
                      <ButtonConnected onClick={openView} />
                    ) : status === WalletStatus.Connecting ? (
                      <ButtonConnecting />
                    ) : (
                      <ButtonDisconnected onClick={connect} />
                    )}
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>

          {!currentBill ? (
            /* Create Bill Card */
            <Box
              p="$12"
              borderRadius="$2xl"
              backgroundColor="$white"
              style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
                  height: '4px',
                  background: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                }}
              />
              
              <Stack direction="vertical" space="$8">
                <Box>
                  <Stack direction="horizontal" space="$3" attributes={{ alignItems: 'center', marginBottom: '0.75rem' }}>
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: colors.primary[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.primary[600],
                      }}
                    >
                      💵
                    </Box>
                    <Text fontSize="$3xl" fontWeight="$bold" style={{ color: colors.text.primary }}>
                      Create New Bill
                    </Text>
                  </Stack>
                  <Text fontSize="$md" color="$gray600" style={{ marginLeft: '60px', lineHeight: '1.6' }}>
                    Receive payments in USDC on Noble chain via Skip Protocol
                  </Text>
                </Box>

                <Box>
                  <Input
                    type="number"
                    label="Bill Amount"
                    placeholder="0.00"
                    value={billAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setBillAmount(e.target.value);
                      setError('');
                    }}
                    step="0.01"
                    min="0"
                    error={error}
                    helperText="Enter the amount in USDC"
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      padding: '1rem 1.25rem',
                    }}
                  />
                </Box>

                <UIButton
                  onClick={createBill}
                  disabled={loading || !address || !billAmount}
                  isLoading={loading}
                  size="lg"
                  domAttributes={{
                    style: {
                      backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                      width: '100%',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      padding: '1.125rem 2rem',
                      boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3), 0 4px 6px -2px rgba(124, 58, 237, 0.2)',
                      transition: 'all 0.2s ease',
                    },
                  }}
                >
                  Create Bill
                </UIButton>
              </Stack>
            </Box>
          ) : (
            /* Bill Display Card */
            <Box
              p="$12"
              borderRadius="$2xl"
              backgroundColor="$white"
              style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
                  height: '4px',
                  background: isPaid 
                    ? `linear-gradient(90deg, ${colors.success[400]} 0%, ${colors.success[600]} 100%)`
                    : 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                }}
              />
              
              <Stack direction="vertical" space="$10" attributes={{ alignItems: 'center' }}>
                {isPaid ? (
                  <>
                    <Box
                      style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.success[400]} 0%, ${colors.success[600]} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                        boxShadow: `0 10px 25px -5px ${colors.success[300]}`,
                      }}
                    >
                      ✓
                    </Box>
                    <Box style={{ textAlign: 'center' }}>
                      <Text fontSize="$4xl" fontWeight="$bold" color={colors.success[600]} style={{ marginBottom: '0.75rem' }}>
                        Payment Complete!
                      </Text>
                      <Text fontSize="$lg" color="$gray600" style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                        Thank you for using FissionPay. Your payment has been successfully processed.
                      </Text>
                      <UIButton
                        onClick={() => {
                          setCurrentBill(null);
                          setBillAmount('');
                        }}
                        size="lg"
                        domAttributes={{
                          style: {
                            backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                            minWidth: '240px',
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            padding: '1rem 2rem',
                            boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3), 0 4px 6px -2px rgba(124, 58, 237, 0.2)',
                          },
                        }}
                      >
                        Create New Bill
                      </UIButton>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box style={{ width: '100%', textAlign: 'center' }}>
                      <Box
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.5rem 1rem',
                          borderRadius: '9999px',
                          backgroundColor: colors.primary[50],
                          color: colors.primary[700],
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          marginBottom: '1rem',
                        }}
                      >
                        Bill #{currentBill.id.slice(0, 8)}
                      </Box>
                      <Text fontSize="$xl" fontWeight="$bold" style={{ marginBottom: '0.5rem', color: colors.text.primary }}>
                        Active Payment Request
                      </Text>
                      <Text fontSize="$sm" color="$gray500" style={{ lineHeight: '1.6' }}>
                        Share this QR code or payment link with your customer
                      </Text>
                    </Box>

                    {/* Payment Progress */}
                    <Box style={{ width: '100%', padding: '1.5rem', borderRadius: '1rem', backgroundColor: colors.gray[50] }}>
                      <Stack direction="horizontal" attributes={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Text fontSize="$sm" color="$gray600" fontWeight="$semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Payment Progress
                        </Text>
                        <Text fontSize="$sm" color="$gray600" fontWeight="$bold" style={{ color: colors.primary[600] }}>
                          {paidPercentage.toFixed(1)}% Paid
                        </Text>
                      </Stack>
                      <Box
                        style={{
                          width: '100%',
                          height: '12px',
                          backgroundColor: colors.gray[200],
                          borderRadius: '9999px',
                          overflow: 'hidden',
                          marginBottom: '1.5rem',
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
                        }}
                      >
                        <Box
                          style={{
                            width: `${paidPercentage}%`,
                            height: '100%',
                            background: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                            borderRadius: '9999px',
                            transition: 'width 0.5s ease',
                            boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)',
                          }}
                        />
                      </Box>
                      <Stack direction="horizontal" attributes={{ justifyContent: 'space-between' }}>
                        <Box>
                          <Text fontSize="$xs" color="$gray500" style={{ marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            Total Amount
                          </Text>
                          <Text fontSize="$2xl" fontWeight="$bold" color="$gray900">
                            {totalAmount} USDC
                          </Text>
                        </Box>
                        <Box style={{ textAlign: 'right' }}>
                          <Text fontSize="$xs" color="$gray500" style={{ marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            Remaining
                          </Text>
                          <Text fontSize="$2xl" fontWeight="$bold" color={colors.primary[600]}>
                            {remainingAmount} USDC
                          </Text>
                        </Box>
                      </Stack>
                    </Box>

                    {/* QR Code */}
                    <Box
                      p="$10"
                      borderRadius="$xl"
                      backgroundColor="$white"
                      style={{
                        border: `2px solid ${colors.border.light}`,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        background: `linear-gradient(135deg, ${colors.background.light} 0%, ${colors.gray[50]} 100%)`,
                      }}
                    >
                      <QRCodeSVG
                        value={getPaymentUrl(currentBill.id)}
                        size={280}
                        level="M"
                        includeMargin={true}
                      />
                    </Box>

                    {/* Payment Link */}
                    <Box style={{ width: '100%' }}>
                      <Text fontSize="$sm" color="$gray600" fontWeight="$semibold" textAlign="center" style={{ marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Payment Link
                      </Text>
                      <Box
                        p="$4"
                        borderRadius="$lg"
                        backgroundColor="$gray50"
                        style={{
                          border: `1px solid ${colors.border.light}`,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          wordBreak: 'break-all',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          backgroundColor: colors.gray[50],
                        }}
                      >
                        <Text style={{ color: colors.text.secondary, flex: 1 }}>
                          {getPaymentUrl(currentBill.id)}
                        </Text>
                        <Stack direction="horizontal" space="$2">
                          <button
                            onClick={() => copyToClipboard(getPaymentUrl(currentBill.id))}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: `1px solid ${colors.border.light}`,
                              backgroundColor: colors.background.light,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: colors.text.secondary,
                              transition: 'all 0.2s ease',
                              fontSize: '16px',
                            }}
                            onMouseEnter={(e: any) => {
                              e.currentTarget.style.backgroundColor = colors.gray[100];
                              e.currentTarget.style.color = colors.primary[600];
                            }}
                            onMouseLeave={(e: any) => {
                              e.currentTarget.style.backgroundColor = colors.background.light;
                              e.currentTarget.style.color = colors.text.secondary;
                            }}
                            title="Copy link"
                          >
                            📋
                          </button>
                          <a
                            href={getPaymentUrl(currentBill.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: `1px solid ${colors.border.light}`,
                              backgroundColor: colors.background.light,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: colors.text.secondary,
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                              fontSize: '16px',
                            }}
                            onMouseEnter={(e: any) => {
                              e.currentTarget.style.backgroundColor = colors.gray[100];
                              e.currentTarget.style.color = colors.primary[600];
                            }}
                            onMouseLeave={(e: any) => {
                              e.currentTarget.style.backgroundColor = colors.background.light;
                              e.currentTarget.style.color = colors.text.secondary;
                            }}
                            title="Open in new tab"
                          >
                            🔗
                          </a>
                        </Stack>
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>
    </Layout>
  );
}

export default MerchantDashboardContent;
