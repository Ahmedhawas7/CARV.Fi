import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface MysteryBoxModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenBox: (result: LootResult) => void;
    user: User;
}

interface LootResult {
    type: 'points' | 'tickets' | 'multiplier';
    amount: number;
    label: string;
    icon: string;
}

const MysteryBoxModal: React.FC<MysteryBoxModalProps> = ({ isOpen, onClose, onOpenBox, user }) => {
    const [isOpening, setIsOpening] = useState(false);
    const [result, setResult] = useState<LootResult | null>(null);

    const handleOpen = async () => {
        if (isOpening) return;
        setIsOpening(true);

        // Shake animation for 2 seconds
        await new Promise(r => setTimeout(r, 2000));

        // Generate result
        const rand = Math.random();
        let loot: LootResult;

        if (rand < 0.7) {
            // 70% chance for GEM points (50-250)
            const amount = Math.floor(Math.random() * 201) + 50;
            loot = { type: 'points', amount, label: 'GEM Points', icon: '💎' };
        } else if (rand < 0.95) {
            // 25% chance for Tickets (1-3)
            const amount = Math.floor(Math.random() * 3) + 1;
            loot = { type: 'tickets', amount, label: 'Lotto Tickets', icon: '🎰' };
        } else {
            // 5% chance for Mega Points (500-1000)
            const amount = Math.floor(Math.random() * 501) + 500;
            loot = { type: 'points', amount, label: 'JACKPOT GEMs', icon: '🔥' };
        }

        setResult(loot);
        setIsOpening(false);
        onOpenBox(loot); // Execute transaction effect
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-card p-10 rounded-[50px] max-w-lg w-full space-y-8 border border-primary/40 shadow-[0_0_100px_rgba(168,85,247,0.3)] animate-in zoom-in duration-500 relative overflow-hidden text-center">

                <h2 className="text-4xl font-black text-glow italic uppercase tracking-tighter">Mystery Box</h2>

                <div className="py-12 relative">
                    {!result ? (
                        <div className={`text-9xl transition-all duration-300 ${isOpening ? 'animate-bounce scale-110' : 'hover:scale-110 cursor-pointer hover:rotate-6'}`} onClick={handleOpen}>
                            🎁
                        </div>
                    ) : (
                        <div className="animate-in zoom-in spin-in-12 duration-700">
                            <div className="text-8xl mb-4">{result.icon}</div>
                            <div className="text-5xl font-black text-primary">+{result.amount}</div>
                            <div className="text-xl font-bold text-gray-400 uppercase tracking-widest">{result.label}</div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {!result ? (
                        <button
                            onClick={handleOpen}
                            disabled={isOpening}
                            className="w-full gradient-bg py-6 rounded-[30px] font-black text-xl hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            {isOpening ? "Opening..." : "OPEN BOX (200 GEMs)"}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setResult(null);
                                onClose();
                            }}
                            className="w-full bg-white/10 hover:bg-white/20 py-6 rounded-[30px] font-black text-xl transition-all"
                        >
                            CLOSE
                        </button>
                    )}
                </div>

                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Seeded randomness powered by Neural Chain VRF</p>
            </div>
        </div>
    );
};

export default MysteryBoxModal;
