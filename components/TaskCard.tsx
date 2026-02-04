import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Disc as Discord, Youtube, Send, Globe, ChevronRight, Zap, Lock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TaskPlatform = 'twitter' | 'discord' | 'youtube' | 'telegram' | 'website';

interface TaskItemProps {
  title: string;
  description: string;
  reward: number;
  platform: TaskPlatform;
  status: 'pending' | 'completed' | 'claiming' | 'locked';
  onAction: () => void;
}

const platformConfig = {
  twitter: { icon: Twitter, color: "text-[#1DA1F2]", glow: "shadow-[#1DA1F2]/20" },
  discord: { icon: Discord, color: "text-[#5865F2]", glow: "shadow-[#5865F2]/20" },
  youtube: { icon: Youtube, color: "text-[#FF0000]", glow: "shadow-[#FF0000]/20" },
  telegram: { icon: Send, color: "text-[#229ED9]", glow: "shadow-[#229ED9]/20" },
  website: { icon: Globe, color: "text-hxfi-purple-glow", glow: "shadow-hxfi-purple/20" },
};

const TaskItem = ({ title, description, reward, platform, status, onAction }: TaskItemProps) => {
  const config = platformConfig[platform];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      whileHover={status !== 'locked' ? { x: 8 } : {}}
      className={cn(
        "hxfi-glass p-6 flex flex-col sm:flex-row items-center gap-8 border-white/5 transition-all group overflow-hidden relative",
        status === 'completed' && "opacity-40 grayscale-[0.5]",
        status === 'locked' && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Platform Icon with Glow Backdrop */}
      <div className="relative shrink-0">
        <div className={cn(
          "w-16 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner",
          status !== 'locked' && "group-hover:border-hxfi-purple/40"
        )}>
          {status === 'locked' ? (
            <Lock className="w-7 h-7 text-white/20" />
          ) : (
            <Icon className={cn("w-8 h-8 transition-all duration-500 group-hover:drop-shadow-[0_0_12px_rgba(124,58,237,0.5)]", config.color)} />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
          <h4 className="text-xl font-bold italic uppercase tracking-tighter text-white truncate font-hud">{title}</h4>
          <span className="hxfi-badge border-white/5 bg-white/5 text-white/40 group-hover:text-hxfi-purple-glow transition-colors font-sans">
            {platform}
          </span>
        </div>
        <p className="text-white/30 text-xs font-medium tracking-tight h-[1.5em] truncate font-sans">{description}</p>
      </div>

      <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
        <div className="flex items-center gap-2 bg-hxfi-gold/10 px-4 py-1.5 rounded-xl border border-hxfi-gold/20 shadow-hxfi-gold-glow font-hud">
          <Zap className="w-3.5 h-3.5 text-hxfi-gold fill-hxfi-gold" />
          <span className="text-lg font-bold italic text-hxfi-gold">+{reward}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (status === 'pending') onAction();
          }}
          disabled={status !== 'pending'}
          className={cn(
            "w-full sm:w-auto px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn",
            status === 'pending' && "bg-hxfi-purple text-white hover:bg-hxfi-purple-deep shadow-hxfi-glow",
            status === 'claiming' && "bg-hxfi-purple/20 text-hxfi-purple animate-pulse cursor-wait",
            status === 'completed' && "bg-hxfi-green/10 text-hxfi-green border border-hxfi-green/20 cursor-default",
            status === 'locked' && "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
          )}
        >
          {status === 'pending' && (
            <span className="flex items-center justify-center gap-2">
              Sync Node
              <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
            </span>
          )}
          {status === 'claiming' && "Synchronizing..."}
          {status === 'completed' && "Mission Success"}
          {status === 'locked' && "Protocol Locked"}
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;
