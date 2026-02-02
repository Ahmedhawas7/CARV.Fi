
import React, { useState } from 'react';
import { User, StoreItem } from '../types';
import { dbService } from '../services/database';
import BuyGemsModal from './BuyGemsModal';

interface StoreProps {
    user: User;
    t: any;
    updatePoints: (amount: number) => void;
    onUpdateUser: (fields: Partial<User>) => void;
}

const ITEMS: StoreItem[] = [
    {
        id: 'boost_2x_24h',
        name: '2x Mining Boost',
        description: 'Double your mining speed for 24 hours. Maximum efficiency.',
        price: 250,
        image: '⚡',
        type: 'boost'
    },
    {
        id: 'raffle_ticket_eth',
        name: 'ETH Raffle Ticket',
        description: 'Entry into the weekly 1 ETH prize pool. Winner announced Sunday.',
        price: 125,
        image: '🎟️',
        type: 'digital'
    },
    {
        id: 'discord_role_vip',
        name: 'VIP Discord Role',
        description: 'Get the exclusive "Node Operator" role and private channel access.',
        price: 500,
        image: '👑',
        type: 'digital'
    },
    {
        id: 'whitelist_spot',
        name: 'Alpha WL Spot',
        description: 'Guaranteed whitelist for the upcoming "Neural Nodes" NFT mint.',
        price: 2500,
        image: '📝',
        type: 'digital',
        stock: 10
    }
];

const Store: React.FC<StoreProps> = ({ user, t, updatePoints, onUpdateUser }) => {
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [showBuyGems, setShowBuyGems] = useState(false);

    const handlePurchase = async (item: StoreItem) => {
        if (user.points < item.price) {
            alert("Insufficient GEMs. Keep mining!");
            return;
        }

        if (!confirm(`Purchase ${item.name} for ${item.price} GEMs?`)) return;

        setPurchasing(item.id);

        try {
            // 1. Deduct Points
            const newPoints = user.points - item.price;

            // 2. Add to Inventory
            const newItem = {
                id: crypto.randomUUID(),
                itemId: item.id,
                name: item.name,
                purchasedAt: Date.now()
            };
            const newInventory = [...(user.inventory || []), newItem];

            // 3. Save to DB
            const updatedUser = { ...user, points: newPoints, inventory: newInventory };
            await dbService.saveUser(updatedUser);

            // 4. Update UI
            updatePoints(-item.price); // Negative to deduct
            onUpdateUser({ inventory: newInventory });

            alert(`Successfully purchased ${item.name}!`);
        } catch (e) {
            console.error("Purchase failed", e);
            alert("Transaction failed. Please try again.");
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-32">
            <header className="text-center space-y-4 relative">
                <h2 className="text-6xl font-black text-glow tracking-tighter italic uppercase">Marketplace</h2>
                <p className="text-gray-500 uppercase text-[10px] tracking-[0.6em] font-black">Exchange Value • Secure Assets</p>

                <div className="flex flex-col items-center gap-4 mt-8">
                    <div className="inline-flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Balance:</span>
                        <span className="text-primary font-mono font-black text-2xl">{user.points.toLocaleString()}</span>
                        <span className="text-2xl">💎</span>
                    </div>

                    <button
                        onClick={() => setShowBuyGems(true)}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        <span>+</span> Top Up GEMs
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ITEMS.map((item) => (
                    <div key={item.id} className="glass-card p-6 rounded-[30px] flex flex-col justify-between group relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40">

                        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl group-hover:scale-110 transition-transform">{item.image}</div>

                        <div className="space-y-4 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl border border-white/10 group-hover:bg-primary/20 transition-colors">
                                {item.image}
                            </div>

                            <div>
                                <h3 className="text-xl font-black leading-tight mb-1">{item.name}</h3>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed min-h-[40px]">{item.description}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Cost</span>
                                <span className={`font-mono font-black text-lg ${user.points >= item.price ? 'text-white' : 'text-red-500'}`}>
                                    {item.price.toLocaleString()} <span className="text-xs text-primary">GEMs</span>
                                </span>
                            </div>

                            <button
                                onClick={() => handlePurchase(item)}
                                disabled={user.points < item.price || purchasing === item.id}
                                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${user.points >= item.price
                                    ? 'gradient-bg hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20'
                                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {purchasing === item.id ? 'Processing...' : user.points < item.price ? 'Insufficient Funds' : 'Purchase Access'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inventory Preview */}
            {user.inventory && user.inventory.length > 0 && (
                <div className="glass-card p-8 rounded-[40px] space-y-6">
                    <h3 className="text-2xl font-black uppercase text-gray-300">Your Inventory</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                        {user.inventory.map((inv) => (
                            <div key={inv.id} className="flex-shrink-0 bg-black/40 border border-white/10 p-4 rounded-2xl min-w-[150px]">
                                <div className="text-sm font-bold text-white">{inv.name}</div>
                                <div className="text-[9px] text-gray-500 uppercase mt-1">Acquired</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showBuyGems && (
                <BuyGemsModal
                    user={user}
                    onClose={() => setShowBuyGems(false)}
                    onPurchase={(amount) => {
                        updatePoints(amount);
                        // onUpdateUser handled by updatePoints mostly
                    }}
                />
            )}
        </div>
    );
};

export default Store;
