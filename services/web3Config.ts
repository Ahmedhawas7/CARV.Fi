import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

// EVM Configuration (Wagmi + RainbowKit)
export const config = getDefaultConfig({
  appName: 'XFi',
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // Replace with env in production
  chains: [base],
  ssr: false, // Vite
});

// Chain identifiers
export type ChainType = 'evm';

export const SUPPORTED_CHAINS = {
  evm: {
    name: 'Base',
    chainId: 8453,
    icon: '🔵',
  },
} as const;
