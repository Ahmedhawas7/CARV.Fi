import React, { useState, useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { ChainType } from '../services/web3Config';

interface WalletOption {
    id: string;
    name: string;
    icon: string;
    chain: ChainType;
    installed: boolean;
}

interface WalletSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectWallet: (walletId: string, chain: ChainType) => void;
}

const WalletSelectorModal: React.FC<WalletSelectorModalProps> = ({ isOpen, onClose, onSelectWallet }) => {
    const { connectors } = useConnect();
    const { wallets: solanaWallets } = useWallet();
    const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

    useEffect(() => {
        if (!isOpen) return;

        const wallets: WalletOption[] = [];

        // Detect EVM wallets via Wagmi connectors
        connectors.forEach((connector) => {
            const name = connector.name;
            let icon = '🔷';

            if (name.toLowerCase().includes('metamask')) {
                icon = '🦊';
            } else if (name.toLowerCase().includes('trust')) {
                icon = '🛡️';
            } else if (name.toLowerCase().includes('rainbow')) {
                icon = '🌈';
            }

            wallets.push({
                id: connector.id,
                name: connector.name,
                icon,
                chain: 'evm',
                installed: true, // Wagmi handles detection
            });
        });

        // Detect Solana wallets
        solanaWallets.forEach((wallet) => {
            let icon = '🟣';
            const name = wallet.adapter.name;

            if (name.toLowerCase().includes('phantom')) {
                icon = '👻';
            } else if (name.toLowerCase().includes('backpack')) {
                icon = '🎒';
            }

            wallets.push({
                id: wallet.adapter.name,
                name: wallet.adapter.name,
                icon,
                chain: 'solana',
                installed: wallet.adapter.readyState === 'Installed',
            });
        });

        setAvailableWallets(wallets);
    }, [isOpen, connectors, solanaWallets]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
            <div className="glass-card p-8 rounded-[40px] max-w-md w-full space-y-6 border border-primary/30 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-glow italic uppercase">Connect Wallet</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-gray-400 text-sm">
                    Select your wallet and network to continue
                </p>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {availableWallets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No wallets detected</p>
                            <p className="text-xs mt-2">Please install a wallet extension</p>
                        </div>
                    ) : (
                        availableWallets.map((wallet) => (
                            <button
                                key={`${wallet.chain}-${wallet.id}`}
                                onClick={() => {
                                    if (wallet.installed) {
                                        onSelectWallet(wallet.id, wallet.chain);
                                    }
                                }}
                                disabled={!wallet.installed}
                                className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${wallet.installed
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 cursor-pointer'
                                        : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <span className="text-3xl">{wallet.icon}</span>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-white">{wallet.name}</div>
                                    <div className="text-xs text-gray-400">
                                        {wallet.chain === 'evm' ? '🔵 Base Network' : '🟣 Solana'}
                                    </div>
                                </div>
                                {!wallet.installed && (
                                    <span className="text-xs text-red-400">Not Installed</span>
                                )}
                            </button>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] text-gray-600 text-center">
                        By connecting, you agree to sign a message for authentication
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletSelectorModal;
