import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Flame, Star, Binary, Cpu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProfileSectionProps {
  user: {
    username: string;
    level: number;
    xp: number;
    maxXp: number;
    streak: number;
    walletAddress: string | null;
    avatar?: string;
  };
}

const ProfileSection = ({ user }: ProfileSectionProps) => {
  const progress = (user.xp / user.maxXp) * 100;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Agent Neural Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="xl:col-span-8 hxfi-glass p-10 relative overflow-hidden group border-white/5"
      >
        {/* Animated Background Pulse */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-hxfi-purple/20 blur-[100px] rounded-full"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group/avatar">
            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-2 border-hxfi-purple shadow-[0_0_40px_rgba(124,58,237,0.3)] bg-black/40">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                alt="Agent"
                className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700"
              />
            </div>

            {/* Level Hexagon */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-hxfi-purple border-4 border-background rotate-[15deg] flex items-center justify-center shadow-2xl">
              <div className="-rotate-[15deg] flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-white/50 leading-none font-hud">LVL</span>
                <span className="text-2xl font-black italic text-white leading-none font-hud">{user.level}</span>
              </div>
            </div>

            {/* Orbital Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-15px] border border-dashed border-hxfi-purple/20 rounded-[3rem] pointer-events-none"
            />
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <span className="hxfi-badge font-sans">Neural-Link Active</span>
                <span className="hxfi-badge border-hxfi-gold/30 text-hxfi-gold font-sans">S-Tier Agent</span>
              </div>
              <h2 className="text-5xl font-bold italic tracking-tighter text-white uppercase hxfi-text-glow font-hud">
                {user.username}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-white/30 font-mono text-xs mt-2 font-sans">
                <Cpu className="w-3 h-3" />
                <span>ID: {user.walletAddress ? user.walletAddress.slice(0, 16) : "UNKNOWN_ORIGIN"}...</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] font-sans">Neural Sync Progress</span>
                  <span className="text-hxfi-purple-glow font-bold text-2xl italic font-hud">{Math.round(progress)}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] font-sans">Next Core Unlock</span>
                  <span className="text-white/60 font-mono text-xs block font-sans">{user.maxXp - user.xp} XP NEEDED</span>
                </div>
              </div>

              <div className="relative h-6 w-full bg-white/5 rounded-2xl border border-white/5 p-1 overflow-hidden font-sans">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-hxfi-purple via-hxfi-purple-glow to-hxfi-indigo rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.5)] relative overflow-hidden"
                >
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Block */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="xl:col-span-4 flex flex-col gap-6"
      >
        <div className="flex-1 hxfi-card flex flex-col justify-between border-hxfi-indigo/30 bg-hxfi-indigo/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Binary className="w-24 h-24 text-hxfi-purple" />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-white/30 tracking-widest font-sans">Active Streak</span>
              <span className="text-4xl font-black italic text-white font-hud">{user.streak} <span className="text-sm font-medium text-white/20 uppercase not-italic font-sans">Cycles</span></span>
            </div>
          </div>

          <button className="w-full py-4 mt-6 hxfi-glass bg-white/5 border-white/10 text-white/60 font-black uppercase tracking-tighter italic text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3">
            <Shield className="w-4 h-4 text-hxfi-purple-glow" />
            Validate Presence
          </button>
        </div>

        <div className="h-32 hxfi-card bg-hxfi-gold/5 border-hxfi-gold/20 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase text-hxfi-gold/60 tracking-widest font-sans">Achievement Stars</span>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-hxfi-gold fill-hxfi-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <span className="text-3xl font-black italic text-white font-hud">4.8k</span>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 15 }}
            className="w-16 h-16 bg-hxfi-gold/10 rounded-2xl flex items-center justify-center border border-hxfi-gold/30"
          >
            <Zap className="w-8 h-8 text-hxfi-gold" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSection;
