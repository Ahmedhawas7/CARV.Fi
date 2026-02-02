import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'CARV.Fi',
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // Replaced with env in real prod
  chains: [base, baseSepolia],
  ssr: false, // Vite
});
