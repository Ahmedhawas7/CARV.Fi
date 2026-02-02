
import React, { useState, useEffect } from 'react';
import { TaskConfig, UserTaskProgress } from '../types';
import { taskService } from '../services/taskService';

interface TaskCardProps {
  task: TaskConfig;
  status: 'pending' | 'completed' | 'ready_to_claim';
  progress?: UserTaskProgress;
  userId: string;
  onComplete: (points: number) => void;
  isLoading?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, status, userId, onComplete }) => {
  const [internalStatus, setInternalStatus] = useState<'idle' | 'verifying' | 'claimable' | 'done'>('idle');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (status === 'completed') {
      setInternalStatus('done');
    }
  }, [status]);

  const handleAction = () => {
    if (internalStatus === 'idle') {
      // 1. Open Link
      if (task.url) {
        window.open(task.url, '_blank');
      }

      // 2. Start Verification Wait
      setInternalStatus('verifying');
      const waitTime = task.waitTimestamp || 5; // Default 5s wait
      setCountdown(waitTime);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setInternalStatus('claimable');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (internalStatus === 'claimable') {
      // 3. Claim Reward
      handleClaim();
    }
  };

  const handleClaim = async () => {
    try {
      const result = await taskService.completeTask(userId, task.id);
      if (result.success) {
        setInternalStatus('done');
        onComplete(result.pointsAwarded);
      }
    } catch (e) {
      console.error("Claim failed", e);
    }
  };

  const getButtonContent = () => {
    switch (internalStatus) {
      case 'idle':
        return <span className="flex items-center gap-2">{t_action(task.action)}</span>;
      case 'verifying':
        return <span className="animate-pulse flex items-center gap-2">⏳ {countdown}s</span>;
      case 'claimable':
        return <span className="text-green-400 font-bold animate-pulse">CLAIM +{task.points}</span>;
      case 'done':
        return <span className="text-gray-500 flex items-center gap-2">✅ DONE</span>;
    }
  };

  // Helper for translation (simplified)
  const t_action = (act: string) => {
    const map: any = { share: 'Share', like: 'Like', follow: 'Follow', join: 'Join', subscribe: 'Subscribe' };
    return map[act] || act.toUpperCase();
  };

  const getPlatformColor = (p: string) => {
    const colors: any = {
      twitter: 'hover:border-blue-400/50 hover:bg-blue-400/5',
      discord: 'hover:border-indigo-500/50 hover:bg-indigo-500/5',
      youtube: 'hover:border-red-500/50 hover:bg-red-500/5',
      telegram: 'hover:border-sky-400/50 hover:bg-sky-400/5'
    };
    return colors[p] || 'hover:border-primary/50';
  };

  return (
    <div className={`relative group border border-white/5 bg-black/20 rounded-[24px] p-5 transition-all duration-300 ${getPlatformColor(task.platform)} ${internalStatus === 'done' ? 'opacity-50 grayscale' : 'hover:-translate-y-1 hover:shadow-xl'}`}>

      {/* Frequency Badge */}
      <div className="absolute top-3 right-3">
        {task.frequency === 'daily' && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Daily</span>}
        {task.frequency === 'once' && <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest border border-purple-500/20">One-Time</span>}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon Box */}
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
          {task.icon}
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-bold text-gray-200 leading-tight pr-12">{task.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>

          <div className="pt-3 flex items-center justify-between">
            <div className="text-xs font-mono text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg">
              +{task.points} GEMs
            </div>

            <button
              onClick={handleAction}
              disabled={internalStatus === 'verifying' || internalStatus === 'done'}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 
                ${internalStatus === 'claimable'
                  ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                  : internalStatus === 'done'
                    ? 'bg-transparent border-transparent cursor-default'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}
              `}
            >
              {getButtonContent()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
