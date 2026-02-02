
import React, { useState } from 'react';
import { User } from '../types';
import { dbService } from '../services/database';

interface PremiumModalProps {
    user: User;
    onClose: () => void;
    onUpgrade: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ user, onClose, onUpgrade }) => {
    const [processing, setProcessing] = useState(false);

    const handleUpgrade = async () => {
        setProcessing(true);

        // Simulate Payment Processing
        setTimeout(async () => {
            try {
                const updatedUser = { ...user, isPremium: true };
                await dbService.saveUser(updatedUser);
                onUpgrade();
                alert("Welcome to the Elite. Premium Status Activated.");
                onClose();
            } catch (e) {
                alert("Payment Failed");
            } finally {
                setProcessing(false);
            }
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-black border border-yellow-500/30 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(234,179,8,0.2)] animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-gradient-to-b from-yellow-500/20 to-transparent p-8 text-center space-y-4 border-b border-yellow-500/10">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-xl shadow-yellow-500/20 rotate-3">👑</div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Unlock <span className="text-yellow-400">Elite Status</span></h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">Maximize your earning potential. Join the top 1% of nodes on the network.</p>
                </div>

                {/* Benefits Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-white/5 rounded-lg text-yellow-400 text-xl">⚡</div>
                            <div>
                                <h4 className="font-bold text-white">2x Mining Multiplier</h4>
                                <p className="text-xs text-gray-500">Double your daily GEM generation permanently.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-white/5 rounded-lg text-yellow-400 text-xl">🎨</div>
                            <div>
                                <h4 className="font-bold text-white">Gold Profile Border</h4>
                                <p className="text-xs text-gray-500">Stand out on the leaderboard with exclusive styling.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-white/5 rounded-lg text-yellow-400 text-xl">🎟️</div>
                            <div>
                                <h4 className="font-bold text-white">Free Weekly Raffle</h4>
                                <p className="text-xs text-gray-500">One free entry to the ETH raffle every week.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-white/5 rounded-lg text-yellow-400 text-xl">🤝</div>
                            <div>
                                <h4 className="font-bold text-white">Priority Support</h4>
                                <p className="text-xs text-gray-500">Direct line to the core dev team.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="p-8 bg-white/5 border-t border-white/5 flex flex-col items-center gap-4">
                    <div className="text-center">
                        <span className="text-3xl font-black text-white">$4.99 <span className="text-sm font-medium text-gray-500">/ month</span></span>
                    </div>
                    <button
                        onClick={handleUpgrade}
                        disabled={processing}
                        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-black uppercase tracking-widest text-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Processing on Chain...' : 'Upgrade Now'}
                    </button>
                    <button onClick={onClose} className="text-xs text-gray-500 hover:text-white uppercase tracking-widest font-bold">No thanks, I hate earning money</button>
                </div>

            </div>
        </div>
    );
};

export default PremiumModal;
