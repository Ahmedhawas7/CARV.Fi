
import React, { useEffect, useState } from 'react';
import { User } from '../types'; // Keep User type for prop compatibility for now
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LOTTERY_ABI } from '../services/abis';
import { formatUnits, parseUnits } from 'viem';
import BuyTicketModal from './BuyTicketModal';
import { ChainType } from '../services/web3Config';

// Address would come from env in real prod
const LOTTERY_CONTRACT = "0x1234567890123456789012345678901234567890";
// Mock address for UI to not crash, user must deploy and update env.

interface LotteryProps {
    user: User; // Legacy prop
    t: any;
    onUpdateUser: (u: User) => void;
}

const Lottery: React.FC<LotteryProps> = ({ user, t, onUpdateUser }) => {
    const { address, isConnected } = useAccount();
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();

    // Read Data
    const { data: jackpotData } = useReadContract({
        address: LOTTERY_CONTRACT,
        abi: LOTTERY_ABI,
        functionName: 'weeklyJackpotPool',
        query: { enabled: isConnected } // Only fetch if connected
    });

    // For demo purposes, we might still fallback to local state if contract read fails 
    // (since contract isn't actually deployed on the user's localhost chain usually)
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [displayJackpot, setDisplayJackpot] = useState("0");

    // Placeholder USDC balance for demo (should be fetched from on-chain in real prod)
    const usdcBalance = 10.50;

    useEffect(() => {
        if (jackpotData) {
            setDisplayJackpot(formatUnits(jackpotData as bigint, 6)); // USDC 6 decimals
        }
    }, [jackpotData]);

    const handlePurchaseComplete = async (count: number) => {
        // Award points: 100 GEM Points per 1 USDC spent
        const pointsAwarded = count * 100;

        onUpdateUser({
            ...user,
            gemPoints: (user.gemPoints || 0) + pointsAwarded,
            dailyTicketCount: (user.dailyTicketCount || 0) + count,
            lastTicketDate: new Date().toISOString().split('T')[0]
        });

        alert(`Successfully purchased ${count} tickets! Received ${pointsAwarded} GEM Points.`);
        setShowBuyModal(false);
    };

    const currentChain: ChainType = address?.startsWith('0x') ? 'evm' : 'solana'; // Simple check

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-32 animate-in fade-in">
            {/* Header / Jackpot */}
            <div className="text-center space-y-4">
                <h2 className="text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 drop-shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                    Weekly Jackpot
                </h2>
                <div className="text-5xl font-mono font-black text-white text-glow border-y border-white/10 py-6 bg-black/40">
                    💎 {displayJackpot} USDC
                </div>
                <div className="flex justify-center gap-4 text-[10px] text-gray-500 font-mono border border-white/5 rounded-full px-4 py-1 w-fit mx-auto bg-black/20">
                    <span>Networks: BASE</span>
                    <span>•</span>
                    <span>Settlement: USDC</span>
                    <span>•</span>
                    <span>Contract: {LOTTERY_CONTRACT.slice(0, 6)}...</span>
                </div>
            </div>

            <div className="glass-card p-8 rounded-[40px] text-center space-y-6">
                <h3 className="text-3xl font-black uppercase italic">Get your Tickets</h3>

                {!isConnected ? (
                    <div className="p-4 bg-red-500/20 text-red-200 rounded-xl font-bold">
                        Please Connect Wallet to Play
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-400">1 Ticket = 1 USDC</p>
                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="w-full max-w-md mx-auto py-5 gradient-bg rounded-2xl font-black uppercase text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.05] transition-all text-xl"
                        >
                            Buy Tickets Now
                        </button>
                    </div>
                )}
            </div>

            <BuyTicketModal
                isOpen={showBuyModal}
                onClose={() => setShowBuyModal(false)}
                onPurchase={handlePurchaseComplete}
                currentChain={currentChain}
                usdcBalance={usdcBalance}
            />

            <div className="text-center text-gray-500 text-xs mt-10">
                <p>Note: You must deploy the contracts to Base and update `LOTTERY_CONTRACT` in the code.</p>
            </div>
        </div>
    );
};

export default Lottery;
