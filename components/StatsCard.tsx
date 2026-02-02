
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color, suffix }) => {
  return (
    <div className={`glass-card p-8 rounded-[35px] relative overflow-hidden group hover:border-primary/40 transition-all duration-500`}>
      <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${color} opacity-5 blur-[80px] group-hover:opacity-20 transition-opacity`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-[0.2em]">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-mono font-bold text-glow tracking-tighter">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix && <span className="text-gray-500 text-xs font-bold">{suffix}</span>}
          </div>
        </div>
        <div className="text-4xl bg-white/5 p-4 rounded-2xl border border-white/5 transition-transform group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
