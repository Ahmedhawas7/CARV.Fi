import React, { useState } from 'react';
import { ChainType } from '../services/web3Config';

interface BuyTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchase: (ticketCount: number) => Promise<void>;
    currentChain: ChainType;
    usdcBalance: number;
}

const BuyTicketModal: React.FC<BuyTicketModalProps> = ({
    isOpen,
    onClose,
    onPurchase,
    currentChain,
    usdcBalance,
}) => {
    const [ticketCount, setTicketCount] = useState(1);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const TICKET_PRICE = 1; // 1 USDC per ticket
    const MAX_TICKETS = 10; // Daily limit
    const totalCost = ticketCount * TICKET_PRICE;
    const gemPointsEarned = ticketCount * 100; // 100 GEM per ticket

    const handlePurchase = async () => {
        if (totalCost > usdcBalance) {
            alert('Insufficient USDC balance');
            return;
        }

        setIsPurchasing(true);
        try {
            await onPurchase(ticketCount);
            onClose();
            setTicketCount(1);
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            setIsPurchasing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
            <div className="glass-card p-8 rounded-[40px] max-w-md w-full space-y-6 border border-primary/30 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-glow italic uppercase">Buy Tickets</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Network Badge */}
                    <div className={`px-4 py-2 rounded-full text-center text-sm font-bold ${currentChain === 'evm'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        }`}>
                        {currentChain === 'evm' ? '🔵 Base Network' : '🟣 Solana Network'}
                    </div>

                    {/* Ticket Count Selector */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Number of Tickets</label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-2xl font-bold transition-colors"
                                disabled={ticketCount <= 1}
                            >
                                −
                            </button>
                            <div className="flex-1 text-center">
                                <div className="text-5xl font-black text-glow">{ticketCount}</div>
                                <div className="text-xs text-gray-500">Max: {MAX_TICKETS} per day</div>
                            </div>
                            <button
                                onClick={() => setTicketCount(Math.min(MAX_TICKETS, ticketCount + 1))}
                                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-2xl font-bold transition-colors"
                                disabled={ticketCount >= MAX_TICKETS}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Price per ticket</span>
                            <span className="font-bold text-green-400">1 USDC</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total Cost</span>
                            <span className="text-2xl font-black text-green-400">{totalCost} USDC</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                            <span className="text-gray-400">GEM Points Earned</span>
                            <span className="text-xl font-bold text-yellow-400">+{gemPointsEarned} ⭐</span>
                        </div>
                    </div>

                    {/* Balance Check */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Your USDC Balance</span>
                        <span className={`font-mono font-bold ${usdcBalance >= totalCost ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {usdcBalance.toFixed(2)} USDC
                        </span>
                    </div>

                    {/* Purchase Button */}
                    <button
                        onClick={handlePurchase}
                        disabled={isPurchasing || totalCost > usdcBalance}
                        className="w-full gradient-bg py-5 rounded-2xl font-black text-white text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        {isPurchasing ? 'Processing...' : `Buy ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
                    </button>

                    {totalCost > usdcBalance && (
                        <p className="text-red-400 text-sm text-center">
                            Insufficient USDC balance. Please add funds to your wallet.
                        </p>
                    )}
                </div>

                <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] text-gray-600 text-center">
                        Tickets are non-refundable. GEM points are awarded after successful purchase.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BuyTicketModal;
