
import React, { useState } from 'react';

interface TaskCardProps {
  title: string;
  points: number;
  icon: string;
  onComplete: () => void;
  t: any;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, points, icon, onComplete, t }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = () => {
    setLoading(true);
    setTimeout(() => {
      setIsCompleted(true);
      onComplete();
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="glass-card p-5 rounded-3xl border-l-4 border-l-blue-500 flex items-center justify-between hover:border-l-purple-500 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div>
          <h4 className="font-bold">{title}</h4>
          <span className="text-xs text-blue-400 font-mono">+{points} {t.points}</span>
        </div>
      </div>
      <button 
        disabled={isCompleted || loading}
        onClick={handleAction}
        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
          isCompleted 
          ? 'bg-green-500/10 text-green-500' 
          : 'bg-white/10 hover:bg-white/20'
        }`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          isCompleted ? '✓' : t.verify
        )}
      </button>
    </div>
  );
};

export default TaskCard;
