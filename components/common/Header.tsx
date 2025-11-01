import {
  Box,
  Stack,
  Text,
  useColorModeValue,
} from "@/components/ui";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  const borderColor = useColorModeValue("$gray200", "$gray700");
  const bgColor = useColorModeValue("$white", "$blackAlpha500");

  return (
    <Box
      as="header"
      width="100%"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor={borderColor}
      backgroundColor={bgColor}
      attributes={{
        style: {
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        },
      }}
    >
      <Box
        maxWidth="1200px"
        mx="auto"
        px="$8"
        py="$4"
      >
        <Stack
          direction="horizontal"
          space="$4"
          attributes={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <Stack
              direction="horizontal"
              space="$3"
              attributes={{ alignItems: "center" }}
            >
              <Box
                style={{
                  width: "40px",
                  height: "40px",
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Image
                  src="/FissionPay-logo.png"
                  alt="FissionPay Logo"
                  width={40}
                  height={40}
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Text
                fontSize="$2xl"
                fontWeight="$bold"
                color={useColorModeValue("$purple600", "$purple300")}
                domAttributes={{
                  style: {
                    background: "linear-gradient(109.6deg, rgba(157,75,199,1) 11.2%, rgba(119,81,204,1) 83.1%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  },
                }}
              >
                FissionPay
              </Text>
            </Stack>
          </Link>
          
          <Stack
            direction="horizontal"
            space="$6"
            attributes={{ alignItems: "center" }}
          >
            <Link href="/merchant">
              <Text
                fontSize="$md"
                fontWeight="$medium"
                color={{
                  base: useColorModeValue("$gray700", "$gray300"),
                  hover: useColorModeValue("$purple600", "$purple300"),
                }}
                domAttributes={{
                  style: {
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  },
                }}
              >
                Merchant
              </Text>
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
