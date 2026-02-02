import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { clusterApiUrl } from '@solana/web3.js';

// EVM Configuration (Wagmi + RainbowKit)
export const config = getDefaultConfig({
  appName: 'CARV.Fi',
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // Replace with env in production
  chains: [base, baseSepolia],
  ssr: false, // Vite
});

// Solana Configuration
export const SOLANA_NETWORK = 'mainnet-beta'; // or 'devnet' for testing
export const SOLANA_RPC_ENDPOINT = clusterApiUrl(SOLANA_NETWORK);

// Chain identifiers
export type ChainType = 'evm' | 'solana';

export const SUPPORTED_CHAINS = {
  evm: {
    name: 'Base',
    chainId: 8453,
    icon: '🔵',
  },
  solana: {
    name: 'Solana',
    network: SOLANA_NETWORK,
    icon: '🟣',
  },
} as const;
