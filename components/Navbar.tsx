import React from 'react';
import { Language, User } from '../types';
import { ChainType } from '../services/web3Config';
import BalanceDisplay from './BalanceDisplay';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  user: User;
  onConnect: () => void;
  onDisconnect: () => void;
  currentChain: ChainType;
  t: any;
  onOpenPremium?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  user,
  onConnect,
  onDisconnect,
  currentChain,
  t,
  onOpenPremium
}) => {
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
          {/* Chain Badge */}
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${currentChain === 'evm'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-purple-500 text-purple-400 bg-purple-500/10'
            }`}>
            {currentChain === 'evm' ? '🔵 BASE' : '🟣 SOLANA'}
          </div>

          {/* Balance Display */}
          {user.walletAddress && (
            <BalanceDisplay chain={currentChain} userLevel={user.level} />
          )}

          {/* Wallet Address & Disconnect */}
          {user.walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-mono text-gray-300">
                {user.walletAddress.slice(0, 4)}...{user.walletAddress.slice(-4)}
              </div>
              <button
                onClick={onDisconnect}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
                title="Disconnect"
              >
                ⏻
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="gradient-bg px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              {t.connectWallet}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
