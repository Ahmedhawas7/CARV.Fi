
import React from 'react';
import { Language, User } from '../types';
import { useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { authService } from '../services/authService';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  user: User;
  onConnect: () => void;
  t: any;
  onOpenPremium?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ lang, setLang, user, onConnect, t, onOpenPremium }) => {
  const { disconnect } = useDisconnect();
  const session = authService.getSession();
  const currentNetwork = session?.network || 'base';

  const handleLogout = () => {
    authService.logout();
    disconnect();
    window.location.reload();
  };

  const toggleNetwork = () => {
    const newNet = currentNetwork === 'base' ? 'solana' : 'base';
    authService.setNetwork(newNet);
    window.location.reload();
  };

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-white/10 py-4 bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="gradient-bg p-2 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <span className="text-2xl">🎲</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-glow hidden sm:block italic">{t.appName}</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">

          {/* Network Switcher */}
          <button
            onClick={toggleNetwork}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${currentNetwork === 'base'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-purple-500 text-purple-400 bg-purple-500/10'
              }`}
          >
            {currentNetwork === 'base' ? '🔵 BASE' : '🟣 SOLANA'}
          </button>

          {user.walletAddress && (
            <div className="hidden md:flex items-center gap-4 bg-black/50 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              {/* USDC Balance (Mocked for now, strictly would use useBalance) */}
              <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="text-xs text-green-400 font-bold">$</span>
                <span className="text-sm font-mono font-bold text-white">0.00</span>
              </div>

              {/* GEM Balance */}
              <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="text-xs text-yellow-400 font-bold">💎</span>
                <span className="text-sm font-mono font-bold text-white">0</span>
              </div>

              {/* Points/Level */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-mono text-gray-300">Lvl {user.level}</span>
              </div>
            </div>
          )}

          {user.walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-mono text-gray-300">
                {user.walletAddress.slice(0, 4)}...{user.walletAddress.slice(-4)}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
                title="Disconnect"
              >
                ⏻
              </button>
            </div>
          ) : (
            <ConnectButton label={t.connectWallet} showBalance={false} chainStatus="icon" accountStatus="avatar" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
