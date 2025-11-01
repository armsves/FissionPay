import { Layout } from "@/components";
import { Box, Stack, Button as UIButton, Text } from '@/components/ui';
import Link from 'next/link';
import Image from 'next/image';
import { colors } from '@/config/colors';

export default function Home() {
  return (
    <Layout>
      <Box 
        py="$16" 
        px="$8" 
        maxWidth="1000px" 
        mx="auto"
        style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Stack direction="vertical" space="$6" attributes={{ alignItems: "center" }}>
          {/* Logo and Title */}
          <Stack direction="vertical" space="$6" attributes={{ alignItems: "center" }}>
            
            <Text 
              fontSize="$5xl" 
              fontWeight="$bold" 
              textAlign="center"
              domAttributes={{
                style: {
                  background: "linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontSize: "3.5rem",
                  lineHeight: "1.2",
                  marginBottom: "0.5rem",
                },
              }}
            >
              FissionPay
            </Text>
            <Text 
              fontSize="$lg" 
              color="$gray600" 
              textAlign="center" 
              style={{ 
                maxWidth: "650px", 
                lineHeight: "1.7",
                fontSize: "1.125rem",
              }}
            >
              Split bills and receive payments across chains seamlessly. 
              Powered by cross-chain infrastructure for the future of decentralized payments.
            </Text>
          </Stack>
          
          {/* CTA Button */}
          <Stack direction="horizontal" space="$4" attributes={{ flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/merchant" style={{ textDecoration: "none" }}>
              <UIButton
                size="lg"
                domAttributes={{
                  style: {
                    backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                    minWidth: '240px',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    padding: '1rem 2rem',
                    boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3), 0 4px 6px -2px rgba(124, 58, 237, 0.2)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  },
                }}
              >
                Get Started
              </UIButton>
            </Link>
          </Stack>

          {/* Features */}
          <Box mt="$8" style={{ width: '100%' }}>
            <Stack 
              direction="horizontal" 
              space="$6" 
              attributes={{ 
                flexWrap: "wrap", 
                justifyContent: "center",
                gap: "1.5rem",
              }}
            >
              {/* Feature 1 */}
              <Box 
                p="$8" 
                borderRadius="$xl"
                backgroundColor="$white"
                style={{
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${colors.border.light}`,
                  textAlign: "center",
                  minWidth: "240px",
                  flex: "1 1 280px",
                  maxWidth: "320px",
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                className="feature-card"
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
                <Box
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: colors.warning[100],
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  ⚡
                </Box>
                <Text fontSize="$lg" fontWeight="$bold" color="$gray900" style={{ marginBottom: "0.5rem" }}>
                  Fast Payments
                </Text>
                <Text fontSize="$sm" color="$gray600" style={{ lineHeight: "1.6" }}>
                  Cross-chain in seconds
                </Text>
              </Box>

              {/* Feature 2 */}
              <Box 
                p="$8" 
                borderRadius="$xl"
                backgroundColor="$white"
                style={{
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${colors.border.light}`,
                  textAlign: "center",
                  minWidth: "240px",
                  flex: "1 1 280px",
                  maxWidth: "320px",
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                className="feature-card"
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
                <Box
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: colors.primary[100],
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  🔗
                </Box>
                <Text fontSize="$lg" fontWeight="$bold" color="$gray900" style={{ marginBottom: "0.5rem" }}>
                  Multi-Chain
                </Text>
                <Text fontSize="$sm" color="$gray600" style={{ lineHeight: "1.6" }}>
                  Support for all chains
                </Text>
              </Box>

              {/* Feature 3 */}
              <Box 
                p="$8" 
                borderRadius="$xl"
                backgroundColor="$white"
                style={{
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${colors.border.light}`,
                  textAlign: "center",
                  minWidth: "240px",
                  flex: "1 1 280px",
                  maxWidth: "320px",
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                className="feature-card"
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
                <Box
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: colors.success[100],
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  🔒
                </Box>
                <Text fontSize="$lg" fontWeight="$bold" color="$gray900" style={{ marginBottom: "0.5rem" }}>
                  Secure
                </Text>
                <Text fontSize="$sm" color="$gray600" style={{ lineHeight: "1.6" }}>
                  Non-custodial & safe
                </Text>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Layout>
  );
}
