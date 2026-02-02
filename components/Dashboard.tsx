
import React, { useState, useEffect } from 'react';
import { User, TaskConfig } from '../types';
import TaskCard from './TaskCard';
import StatsCard from './StatsCard';
import { taskService } from '../services/taskService';

interface DashboardProps {
  user: User;
  t: any;
  onCheckIn: () => void;
  updatePoints: (amount: number) => void;
  nextLevelPoints: number | null;
  checkInReward: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user, t, onCheckIn, updatePoints, nextLevelPoints, checkInReward }) => {
  const [tasks, setTasks] = useState<{ task: TaskConfig, status: 'pending' | 'completed' | 'ready_to_claim' }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'daily' | 'social'>('all');

  useEffect(() => {
    loadTasks();
  }, [user.walletAddress]); // Reload when user changes

  const loadTasks = async () => {
    if (!user.walletAddress) return;
    try {
      await taskService.initTasks();
      const data = await taskService.getAvailableTasks(user.walletAddress);
      setTasks(data);
    } catch (e) {
      console.error("Task load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCompletion = (points: number) => {
    updatePoints(points); // Update global app state
    loadTasks(); // Refresh local list
  };

  const filteredTasks = tasks.filter(item => {
    if (filter === 'all') return true;
    return item.task.type === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[40px] glass-card p-8 border border-primary/20 bg-primary/5 group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-all duration-1000"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full p-1 bg-gradient-to-tr ${user.isPremium ? 'from-yellow-400 to-orange-500 shadow-[0_0_30px_rgba(234,179,8,0.5)]' : 'from-primary to-indigo-500'}`}>
                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-background" />
              </div>
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full border text-xs font-black uppercase ${user.isPremium ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-black border-primary text-primary'}`}>
                {user.isPremium ? 'ELITE' : `Lv. ${user.level}`}
              </div>

            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">{user.username}</h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-mono mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <StatsCard title="GEMs Mined" value={user.points.toLocaleString()} icon="💎" />
            <StatsCard title="Daily Streak" value={`${user.streak} Days`} icon="🔥" />
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span>Progress to Lv. {user.level + 1}</span>
            <span>{nextLevelPoints ? `${Math.floor(nextLevelPoints - user.points)} XP left` : 'MAX LEVEL'}</span>
          </div>
          <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-1000 ease-out relative"
              style={{ width: `${Math.min(100, (user.points % 100))}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Mining Check-in */}
      <div className="glass-card p-1 rounded-[30px] border border-white/5">
        <button
          onClick={onCheckIn}
          disabled={user.lastCheckIn === new Date().toISOString().split('T')[0]}
          className="w-full py-6 rounded-[25px] gradient-bg font-black text-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
        >
          {user.lastCheckIn === new Date().toISOString().split('T')[0] ? (
            <>✅ {t.dailyClaimed}</>
          ) : (
            <>⛏️ {t.dailyCheckIn} <span className="bg-white/20 px-2 py-0.5 rounded text-sm text-white">+{checkInReward}</span></>
          )}
        </button>
      </div>

      {/* Task Filters */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'social', 'daily'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f
              ? 'bg-white text-black border-white'
              : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
              }`}
          >
            {f} Tasks
          </button>
        ))}
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-20 text-center text-gray-500 animate-pulse">Loading Identity Protocol...</div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((item) => (
            <TaskCard
              key={item.task.id}
              task={item.task}
              status={item.status}
              userId={user.walletAddress!}
              onComplete={handleTaskCompletion}
            />
          ))
        ) : (
          <div className="col-span-2 py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-[30px]">
            No active tasks found in this sector.
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
