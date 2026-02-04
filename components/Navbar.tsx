import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Zap, ShoppingBag, Trophy, Wallet, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex items-center gap-2.5 px-6 py-3 rounded-2xl transition-all duration-500 group",
      isActive
        ? "text-hxfi-purple-glow"
        : "text-white/40 hover:text-white"
    )}
  >
    {isActive && (
      <motion.div
        layoutId="hxfi-nav-bg"
        className="absolute inset-0 bg-hxfi-purple/10 rounded-2xl border border-hxfi-purple/20 shadow-hxfi-glow"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <Icon className={cn("w-5 h-5 relative z-10 transition-transform group-hover:scale-110", isActive && "drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]")} />
    <span className="font-bold italic uppercase tracking-tighter text-sm relative z-10 hidden lg:block font-hud">{label}</span>
  </button>
);

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletAddress: string | null;
  onConnect: () => void;
  lang: string;
  setLang: (lang: any) => void;
}

const Navbar = ({ activeTab, setActiveTab, walletAddress, onConnect, lang, setLang }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 font-sans">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 py-4 hxfi-glass border-white/5 bg-black/20 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-hxfi-gradient rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.4)] relative group overflow-hidden">
            <Zap className="text-white w-7 h-7 relative z-10 group-hover:scale-125 transition-transform" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
            />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-bold italic tracking-tighter hxfi-text-glow leading-none font-hud">
              HXFi
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-hxfi-purple-glow ml-0.5 font-sans">
              Protocol
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-white/[0.02] p-1.5 rounded-[1.5rem] border border-white/5">
          <NavItem
            icon={LayoutDashboard}
            label="Nexus"
            isActive={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={Trophy}
            label="Missions"
            isActive={activeTab === 'tasks'}
            onClick={() => setActiveTab('tasks')}
          />
          <NavItem
            icon={ShoppingBag}
            label="Armory"
            isActive={activeTab === 'store'}
            onClick={() => setActiveTab('store')}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 group"
          >
            <Globe className="w-5 h-5 text-white/40 group-hover:text-hxfi-purple-glow transition-colors" />
          </button>

          <button
            onClick={onConnect}
            className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-hxfi-purple/30 rounded-2xl hover:bg-hxfi-purple/10 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-hxfi-purple/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Wallet className="w-5 h-5 text-hxfi-purple-glow relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-black italic uppercase tracking-tighter relative z-10">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Initialize Link"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
