import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'purple' | 'gold' | 'blue' | 'green';
  description?: string;
  trend?: string;
}

const variants = {
  purple: {
    bg: "bg-hxfi-purple/5",
    border: "border-hxfi-purple/20",
    icon: "text-hxfi-purple-glow",
    accent: "bg-hxfi-purple",
  },
  gold: {
    bg: "bg-hxfi-gold/5",
    border: "border-hxfi-gold/20",
    icon: "text-hxfi-gold",
    accent: "bg-hxfi-gold",
  },
  blue: {
    bg: "bg-hxfi-indigo/20",
    border: "border-hxfi-indigo/40",
    icon: "text-blue-400",
    accent: "bg-blue-400",
  },
  green: {
    bg: "bg-hxfi-green/5",
    border: "border-hxfi-green/20",
    icon: "text-hxfi-green",
    accent: "bg-hxfi-green",
  },
};

const StatCard = ({ label, value, icon: Icon, variant = 'purple', description, trend }: StatCardProps) => {
  const style = variants[variant];

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className={cn(
        "hxfi-card relative overflow-hidden group",
        style.bg, style.border
      )}
    >
      {/* Dynamic Glow Ornament */}
      <div className={cn(
        "absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] opacity-20 transition-all duration-700 group-hover:opacity-40",
        style.accent
      )} />

      <div className="flex items-start justify-between relative z-10 mb-6">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:border-white/20",
          style.bg, style.border
        )}>
          <Icon className={cn("w-7 h-7 drop-shadow-2xl", style.icon)} />
        </div>
        {trend && (
          <div className="hxfi-badge border-hxfi-green/20 text-hxfi-green bg-hxfi-green/5 flex items-center gap-1 font-sans">
            <span className="w-1 h-1 rounded-full bg-hxfi-green animate-pulse" />
            {trend}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-1 font-sans">{label}</h3>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black italic text-white tracking-widest hxfi-text-glow font-hud">
            {value}
          </span>
          {description && (
            <span className="text-[10px] font-bold italic text-white/20 uppercase font-sans">{description}</span>
          )}
        </div>
      </div>

      {/* Progress Decorative Line */}
      <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '10%' }}
          className={cn("absolute inset-0 opacity-50", style.accent)}
        />
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      </div>
    </motion.div>
  );
};

export default StatCard;
