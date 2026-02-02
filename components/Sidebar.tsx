
import React from 'react';

interface SidebarProps {
  activeTab: 'home' | 'leaderboard' | 'tasks';
  setActiveTab: (tab: 'home' | 'leaderboard' | 'tasks') => void;
  t: any;
  lang: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, t, lang }) => {
  const menuItems = [
    { id: 'home', label: t.tasks, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: 'leaderboard', label: t.leaderboard, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )},
    { id: 'tasks', label: t.profile, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )}
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 gap-2">
      {menuItems.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as any)}
          className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
            activeTab === item.id 
              ? 'gradient-bg text-white shadow-lg shadow-purple-500/20' 
              : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          {item.icon}
          <span className="font-bold text-lg">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
