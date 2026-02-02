
import React, { useEffect, useState } from 'react';
import { User, LotteryPool } from '../types';
import { lotteryService, LOTTERY_CONSTANTS } from '../services/lottery';

interface LotteryProps {
    user: User;
    t: any;
    onUpdateUser: (u: User) => void;
}

const Lottery: React.FC<LotteryProps> = ({ user, t, onUpdateUser }) => {
    const [dailyPool, setDailyPool] = useState<LotteryPool | null>(null);
    const [jackpot, setJackpot] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastWinners, setLastWinners] = useState<{ wallet: string, amount: number }[]>([]);

    const today = new Date().toISOString().split('T')[0];
    const userTicketsToday = user.lastTicketDate === today ? (user.dailyTicketCount || 0) : 0;

    const refreshData = async () => {
        // 1. Run checks
        await lotteryService.checkAndRunDraws();

        // 2. Fetch Data
        const poolId = `daily_${today}`;
        const pool = await lotteryService.getPool(poolId);
        setDailyPool(pool);

        const weeklyJackpot = await lotteryService.getCurrentJackpot();
        setJackpot(weeklyJackpot);

        // 3. Last Winners (Yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const prevPoolId = `daily_${yesterday.toISOString().split('T')[0]}`;
        const prevPool = await lotteryService.getPool(prevPoolId);
        if (prevPool && prevPool.winners) {
            setLastWinners(prevPool.winners);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleBuyTicket = async () => {
        if (!confirm(`Buy Ticket for ${LOTTERY_CONSTANTS.TICKET_PRICE} GEMs?`)) return;

        setLoading(true);
        const result = await lotteryService.buyTicket(user);
        if (result.success && result.updatedUser) {
            onUpdateUser(result.updatedUser);
            await refreshData(); // Refresh pool data
            alert("🎟️ Ticket Acquired! Good luck.");
        } else {
            alert(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-32 animate-in fade-in">

            {/* Header / Jackpot */}
            <div className="text-center space-y-4">
                <h2 className="text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 drop-shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                    Weekly Jackpot
                </h2>
                <div className="text-5xl font-mono font-black text-white text-glow border-y border-white/10 py-6 bg-black/40">
                    💎 {jackpot.toLocaleString()}
                </div>
                <p className="text-gray-400 uppercase tracking-[0.5em] text-xs font-bold">Reserves from Daily Pools</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Daily Draw Card */}
                <div className="glass-card p-8 rounded-[40px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🎰</div>
                    <h3 className="text-3xl font-black uppercase italic mb-6">Daily Draw</h3>

                    <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-gray-400 text-xs font-bold uppercase">Prize Pool</span>
                            <span className="text-2xl font-mono font-bold text-primary">{dailyPool?.prizePool || 0} GEMs</span>
                        </div>

                        <div className="bg-black/40 rounded-2xl p-6 text-center space-y-2 border border-white/5">
                            <div className="text-gray-500 text-[10px] uppercase tracking-widest">Tickets Remaining</div>
                            <div className="text-4xl font-black text-white">{10 - userTicketsToday} <span className="text-base text-gray-600">/ 10</span></div>
                        </div>

                        <button
                            onClick={handleBuyTicket}
                            disabled={loading || userTicketsToday >= 10 || user.points < 10}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-700 rounded-xl font-black uppercase text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? 'Processing...' : `Buy Ticket (10 GEMs)`}
                        </button>
                        <div className="text-center text-[10px] text-gray-500 font-mono">
                            10% Burn • 60% Winners • 30% Jackpot reserve
                        </div>
                    </div>
                </div>

                {/* Winners Feed */}
                <div className="glass-card p-8 rounded-[40px] flex flex-col">
                    <h3 className="text-2xl font-black uppercase italic mb-6 text-gray-300">Yesterday's Winners</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] scrollbar-thin scrollbar-thumb-white/10 pr-2">
                        {lastWinners.length > 0 ? lastWinners.map((w, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black border-2 border-white">
                                        #{i + 1}
                                    </div>
                                    <span className="font-mono text-sm text-gray-300">{w.wallet.slice(0, 6)}...</span>
                                </div>
                                <span className="text-primary font-bold">+{w.amount}</span>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-600 text-sm font-bold uppercase">No winners yet...</div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="text-xs text-center text-gray-500">
                            Calculated automatically at 00:00 UTC
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Lottery;
