import { setClientOptions, route, executeRoute } from '@skip-go/client';
import { SigningStargateClient } from '@cosmjs/stargate';
import { OfflineSigner } from '@cosmjs/proto-signing';

// Initialize Skip Go client
export function initializeSkipGo(apiKey?: string) {
  setClientOptions({
    apiUrl: process.env.NEXT_PUBLIC_SKIP_API_URL || 'https://api.skip.money',
    apiKey: apiKey || process.env.NEXT_PUBLIC_SKIP_API_KEY,
  });
}

// Get Cosmos signer
export async function getCosmosSigner(
  chainId: string,
  signer: OfflineSigner
): Promise<SigningStargateClient> {
  // Get RPC endpoint for the chain
  // In production, you'd want to fetch this from chain registry
  const rpcEndpoint = getRpcEndpoint(chainId);
  
  return await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    signer
  );
}

// Get EVM signer wrapper
export function getEvmSigner(chainId: string) {
  return async (): Promise<any> => {
    // This will be handled by wagmi/viem
    return null;
  };
}

// Helper to get RPC endpoint for a chain
function getRpcEndpoint(chainId: string): string {
  // Map chain IDs to RPC endpoints
  // In production, use chain registry
  const rpcMap: Record<string, string> = {
    'noble-1': 'https://rpc.noble.strange.love',
    'celestia': 'https://rpc.celestia.pops.one',
    'cosmoshub-4': 'https://cosmos-rpc.polkachu.com',
  };
  
  return rpcMap[chainId] || 'https://rpc.cosmos.network';
}

// Get user address for a chain
export async function getUserAddress(
  chainId: string,
  cosmosSigner?: OfflineSigner,
  evmAccount?: any
): Promise<string> {
  // Determine chain type and get address accordingly
  if (chainId.includes('-1') || chainId.includes('-4')) {
    // Cosmos chain
    if (!cosmosSigner) {
      throw new Error('Cosmos signer required for Cosmos chain');
    }
    const accounts = await cosmosSigner.getAccounts();
    return accounts[0].address;
  } else {
    // EVM chain
    if (!evmAccount) {
      throw new Error('EVM account required for EVM chain');
    }
    return evmAccount.address;
  }
}

// Calculate route for payment
export async function calculateRoute(params: {
  sourceAssetDenom: string;
  sourceAssetChainId: string; // Fixed: should be sourceAssetChainId, not sourceAssetChainID
  destAssetDenom: string;
  destAssetChainId: string; // Fixed: should be destAssetChainId, not destAssetChainID
  amountIn: string;
}) {
  const routeResult = await route({
    sourceAssetDenom: params.sourceAssetDenom,
    sourceAssetChainId: params.sourceAssetChainId,
    destAssetDenom: params.destAssetDenom,
    destAssetChainId: params.destAssetChainId,
    amountIn: params.amountIn,
    smartRelay: true,
  });

  return routeResult;
}

// Execute payment route
export async function executePaymentRoute(params: {
  route: any;
  userAddresses: Array<{ chainId: string; address: string }>;
  getCosmosSigner: (chainId: string) => Promise<any>;
  getEvmSigner: (chainId: string) => Promise<any>;
  onTransactionCompleted?: (chainID: string, txHash: string, status: any) => void;
  onTransactionBroadcast?: (params: { txHash: string; chainID: string }) => void;
}) {
  return await executeRoute({
    route: params.route,
    userAddresses: params.userAddresses,
    getCosmosSigner: params.getCosmosSigner,
    getEvmSigner: params.getEvmSigner,
    getSvmSigner: async () => {
      throw new Error('Solana wallet support has been removed');
    },
    onTransactionCompleted: params.onTransactionCompleted
      ? async (txInfo: { chainId: string; txHash: string; status?: any }) => {
          params.onTransactionCompleted!(txInfo.chainId, txInfo.txHash, txInfo.status);
        }
      : undefined,
    onTransactionBroadcast: params.onTransactionBroadcast
      ? async (txInfo: { txHash: string; chainId: string }) => {
          params.onTransactionBroadcast!({ txHash: txInfo.txHash, chainID: txInfo.chainId });
        }
      : undefined,
  });
}

