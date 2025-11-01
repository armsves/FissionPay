import { Layout } from "@/components";
import { Box, Stack, Button as UIButton, Text } from '@/components/ui';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <Box py="$16" px="$8" maxWidth="800px" mx="auto">
        <Stack direction="vertical" space="$8" attributes={{ alignItems: "center" }}>
          <Text fontSize="$3xl" fontWeight="$bold" textAlign="center">
            FissionPay
          </Text>
          <Text fontSize="$lg" color="$gray500" textAlign="center">
            Split bills and receive payments across chains
          </Text>
          
          <Stack direction="horizontal" space="$4" attributes={{ flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/merchant">
              <UIButton
                size="lg"
                domAttributes={{
                  style: {
                    backgroundImage: 'linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)',
                    minWidth: '200px',
                  },
                }}
              >
                Merchant Dashboard
              </UIButton>
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Layout>
  );
}
