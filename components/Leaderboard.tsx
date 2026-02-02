
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/database';
import { User, LeaderboardEntry } from '../types';

interface LeaderboardProps {
  t: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ t }) => {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const allUsers = await dbService.getAllUsers();
      // Sort by gemPoints descending, fallback to points
      const sorted = allUsers
        .sort((a, b) => (b.gemPoints || 0) - (a.gemPoints || 0) || b.points - a.points)
        .slice(0, 10); // Top 10
      setLeaders(sorted);
    } catch (e) {
      console.error("Failed to load leaderboard", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-pulse">
        <div className="h-10 w-48 bg-white/10 mx-auto rounded-xl"></div>
        <div className="h-32 bg-white/5 rounded-[40px]"></div>
        <div className="h-32 bg-white/5 rounded-[40px]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-black text-glow tracking-tighter italic uppercase">{t.topUsers}</h2>
        <div className="flex justify-center gap-4">
          <button className="gradient-bg text-white px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">{t.allTime}</button>
          <button className="bg-white/5 border border-white/10 text-gray-500 px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">{t.weekly}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {leaders.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-mono">No Heroes Yet. Be the first.</div>
        ) : (
          leaders.map((user, idx) => (
            <div
              key={user.walletAddress || idx}
              className={`glass-card p-8 rounded-[40px] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] relative group ${idx === 0 ? 'border-primary/40 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : ''
                }`}
            >
              <div className="flex items-center gap-8 relative z-10">
                <div className={`w-12 text-3xl font-mono font-black italic ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-500' : 'text-gray-700'
                  }`}>
                  #{idx + 1}
                </div>
                <div className="relative">
                  <div className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-40 blur transition duration-500 ${idx === 0 ? 'bg-yellow-400' : 'bg-primary'}`}></div>
                  <div className="w-16 h-16 rounded-[22px] gradient-bg flex items-center justify-center text-2xl shadow-xl relative overflow-hidden">
                    <img src={user.avatar} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback')} />
                  </div>
                </div>
                <div>
                  <p className="font-mono font-bold text-2xl tracking-tighter group-hover:text-primary transition-colors">{user.username}</p>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-3 py-1 rounded-full uppercase">Lv. {user.level}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{(user.walletAddress || '0x...').slice(0, 10)}...</span>
                  </div>
                </div>
              </div>
              <div className="text-right relative z-10">
                <p className="text-3xl font-mono font-black text-glow tracking-tighter">{(user.gemPoints || 0).toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">{t.gemPoints}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
