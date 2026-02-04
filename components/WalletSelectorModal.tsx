import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnect } from 'wagmi';
import { X, Shield, Cpu, ChevronRight, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface WalletOption {
    id: string;
    name: string;
    icon: string;
    installed: boolean;
}

interface WalletSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectWallet: (walletId: string) => void;
}

const WalletSelectorModal: React.FC<WalletSelectorModalProps> = ({ isOpen, onClose, onSelectWallet }) => {
    const { connectors } = useConnect();
    const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

    useEffect(() => {
        if (!isOpen) return;
        const wallets: WalletOption[] = connectors.map((connector) => {
            const name = connector.name;
            let iconText = '🔷';
            if (name.toLowerCase().includes('metamask')) iconText = '🦊';
            else if (name.toLowerCase().includes('trust')) iconText = '🛡️';
            else if (name.toLowerCase().includes('rainbow')) iconText = '🌈';

            return {
                id: connector.id,
                name: connector.name,
                icon: iconText,
                installed: true,
            };
        });
        setAvailableWallets(wallets);
    }, [isOpen, connectors]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="hxfi-glass p-10 max-w-[480px] w-full relative z-10 border-white/5 space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-hxfi-purple/10 border border-hxfi-purple/30 flex items-center justify-center">
                                    <Cpu className="w-6 h-6 text-hxfi-purple-glow" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white hxfi-text-glow">Access Nexus</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Secure Neural Activation</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-hxfi-purple/5 border border-hxfi-purple/20 rounded-2xl flex items-center gap-4">
                            <Shield className="w-6 h-6 text-hxfi-purple-glow shrink-0" />
                            <p className="text-white/50 text-[11px] font-medium leading-relaxed italic">
                                Initialize an end-to-end encrypted neural link via your primary provider to authenticate with the HXFi protocol.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {availableWallets.map((wallet) => (
                                <button
                                    key={wallet.id}
                                    onClick={() => onSelectWallet(wallet.id)}
                                    className="group w-full p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] hover:bg-hxfi-purple/10 hover:border-hxfi-purple/40 transition-all flex items-center gap-5 text-left relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-hxfi-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform relative z-10">
                                        {wallet.icon}
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <div className="font-black italic uppercase tracking-tighter text-lg text-white group-hover:text-hxfi-purple-glow transition-colors">{wallet.name}</div>
                                        <div className="text-[9px] font-black italic uppercase tracking-[0.2em] text-white/20">Verified Protocol</div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-hxfi-purple-glow group-hover:translate-x-2 transition-all relative z-10" />
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-hxfi-purple-glow animate-pulse" />
                            <span className="text-[9px] font-black italic uppercase tracking-[0.5em] text-white/20">Awaiting Signal</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default WalletSelectorModal;
