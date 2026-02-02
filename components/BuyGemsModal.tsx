
import React, { useState } from 'react';
import { User } from '../types';
import { dbService } from '../services/database';

interface BuyGemsModalProps {
    user: User;
    onClose: () => void;
    onPurchase: (amount: number) => void;
}

const PACKAGES = [
    { id: 'gems_1k', amount: 1000, price: 0.1, label: 'Starter_Pack' },
    { id: 'gems_5k', amount: 5000, price: 0.45, label: 'Miner_Kit', recommended: true },
    { id: 'gems_20k', amount: 20000, price: 1.5, label: 'Whale_Chest' },
];

const BuyGemsModal: React.FC<BuyGemsModalProps> = ({ user, onClose, onPurchase }) => {
    const [processing, setProcessing] = useState<string | null>(null);

    const handleBuy = async (pkg: typeof PACKAGES[0]) => {
        if (!confirm(`Pay ${pkg.price} SOL for ${pkg.amount.toLocaleString()} GEMs?`)) return;

        setProcessing(pkg.id);

        // Simulate Blockchain Transaction
        setTimeout(async () => {
            try {
                const updatedUser = { ...user, points: user.points + pkg.amount };
                await dbService.saveUser(updatedUser);
                onPurchase(pkg.amount);
                alert(`Successfully purchased ${pkg.amount} GEMs!`);
                onClose();
            } catch (e) {
                alert("Transaction Failed");
            } finally {
                setProcessing(null);
            }
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-[#09090b] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                <div className="p-8 border-b border-white/5 bg-white/5">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Top Up <span className="text-primary">GEMs</span></h2>
                    <p className="text-gray-400 text-sm">Purchase instant mining power with SOL</p>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PACKAGES.map((pkg) => (
                        <div key={pkg.id} className={`relative p-6 rounded-3xl border flex flex-col gap-4 group transition-all hover:-translate-y-1 ${pkg.recommended ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'bg-black/40 border-white/10 hover:border-white/20'}`}>
                            {pkg.recommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-lg">
                                    Best Value
                                </div>
                            )}

                            <div className="text-center space-y-2">
                                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">{pkg.label}</div>
                                <div className="text-4xl font-black text-white text-glow">{pkg.amount >= 1000 ? `${pkg.amount / 1000}k` : pkg.amount}</div>
                            </div>

                            <div className="flex-1 flex items-center justify-center py-4">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl ${pkg.recommended ? 'bg-primary/20 text-primary animate-pulse' : 'bg-white/5 text-gray-400'}`}>
                                    💎
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-center">
                                    <span className="text-2xl font-bold text-white">{pkg.price} <span className="text-sm text-gray-500">SOL</span></span>
                                </div>
                                <button
                                    onClick={() => handleBuy(pkg)}
                                    disabled={!!processing}
                                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${pkg.recommended
                                            ? 'bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/30'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    {processing === pkg.id ? 'Confirming...' : 'Buy Now'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-black/40 text-center text-[10px] text-gray-600 font-mono border-t border-white/5">
                    Prices are estimated. Network fees may apply. Secure Gateway via Solana Pay.
                </div>

            </div>
        </div>
    );
};

export default BuyGemsModal;
