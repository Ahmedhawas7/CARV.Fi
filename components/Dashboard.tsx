
import React from 'react';
import { User } from '../types';
import StatsCard from './StatsCard';
import TaskCard from './TaskCard';

interface DashboardProps {
  user: User;
  t: any;
  onCheckIn: () => void;
  updatePoints: (amt: number) => void;
  nextLevelPoints: number | null;
  checkInReward: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user, t, onCheckIn, updatePoints, nextLevelPoints, checkInReward }) => {
  const isCheckedIn = user.lastCheckIn === new Date().toISOString().split('T')[0];
  const prevLevelPoints = user.level > 1 ? 50 * Math.pow(user.level - 1, 2) : 0;
  const currentLevelProgress = user.points - prevLevelPoints;
  const levelRange = nextLevelPoints ? (nextLevelPoints - prevLevelPoints) : 1;
  const progress = Math.min(Math.max((currentLevelProgress / levelRange) * 100, 0), 100);

  return (
    <div className="space-y-10">
      {/* Official CARV ID Status Card */}
      <div className="glass-card p-10 rounded-[50px] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group shadow-[0_0_80px_rgba(168,85,247,0.1)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] rounded-full"></div>
        
        <div className="relative">
          <div className="absolute -inset-2 gradient-bg rounded-[40px] opacity-20 group-hover:opacity-40 blur-xl transition duration-1000"></div>
          <img src={user.avatar} className="relative w-32 h-32 rounded-[38px] border-2 border-primary/30 p-1.5 bg-background shadow-2xl" alt="Avatar" />
          <div className="absolute -top-3 -right-3 w-10 h-10 gradient-bg rounded-2xl flex items-center justify-center border-2 border-background shadow-xl">
            <span className="text-white text-xs font-black">SBT</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h2 className="text-4xl font-black font-mono tracking-tighter text-glow uppercase">{user.username}</h2>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">Verified Identity</span>
            </div>
            <p className="text-gray-500 font-mono text-xs opacity-60">ID: {user.walletAddress?.slice(0, 16)}...</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <div className="px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-xs font-black font-mono shadow-lg shadow-primary/5">
              {user.points.toLocaleString()} {t.points}
            </div>
            <div className="px-5 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-2xl text-xs font-black">
              🔥 {user.streak} DAY STREAK
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">{t.level} {user.level}</span>
            <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{user.level >= 50 ? 'MAX REACHED' : `${t.level} ${user.level + 1}`}</span>
          </div>
          <div className="relative h-5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 shadow-inner">
            <div 
              className="h-full gradient-bg rounded-full transition-all duration-1000 relative" 
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          {nextLevelPoints && (
            <p className="text-[10px] text-right text-gray-600 font-mono font-bold tracking-widest">
              {(nextLevelPoints - user.points).toLocaleString()} GEMs TO LEVEL UP
            </p>
          )}
        </div>
      </div>

      {/* Protocol Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label={t.points} value={user.points} icon="💎" color="from-primary to-indigo-600" />
        <StatsCard label={t.streak} value={user.streak} icon="⛏️" suffix=" Days" color="from-orange-500 to-red-600" />
        <StatsCard label={t.rank} value="#CARV-47" icon="📶" color="from-blue-500 to-cyan-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Data Mining Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black italic flex items-center gap-3 uppercase tracking-tighter">
            <span className="w-2 h-8 bg-primary rounded-full"></span>
            {t.dailyQuest}
          </h2>
          <div className="glass-card p-10 rounded-[45px] flex flex-col sm:flex-row items-center justify-between gap-6 group relative overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center text-4xl shadow-2xl transition-all group-hover:scale-110 ${isCheckedIn ? 'bg-green-500/10 text-green-500' : 'bg-primary/20 text-primary border border-primary/20'}`}>
                {isCheckedIn ? '✅' : '⛏️'}
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic leading-none mb-2">{t.checkIn}</h3>
                <p className="text-gray-500 text-xs font-mono font-bold">
                  Mining Rate: <span className="text-primary">+{checkInReward} GEMs / Day</span>
                </p>
              </div>
            </div>
            <button 
              disabled={isCheckedIn}
              onClick={onCheckIn}
              className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-lg transition-all relative z-10 uppercase italic ${
                isCheckedIn 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-not-allowed' 
                : 'gradient-bg hover:scale-105 active:scale-95 shadow-xl shadow-primary/20'
              }`}
            >
              {isCheckedIn ? t.checkedIn : t.verify}
            </button>
          </div>
        </section>

        {/* Data Attestation Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black italic flex items-center gap-3 uppercase tracking-tighter">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            {t.twitterTasks}
          </h2>
          <div className="grid gap-4">
            <TaskCard title="Bind Twitter Data" points={150} icon="🐦" onComplete={() => updatePoints(150)} t={t} />
            <TaskCard title="Bind Discord Identity" points={150} icon="👾" onComplete={() => updatePoints(150)} t={t} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
