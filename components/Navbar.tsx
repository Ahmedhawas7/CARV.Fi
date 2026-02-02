
import React from 'react';
import { Language, User } from '../types';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  user: User;
  onConnect: () => void;
  t: any;
}

const Navbar: React.FC<NavbarProps> = ({ lang, setLang, user, onConnect, t }) => {
  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-border py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="gradient-bg p-2 rounded-xl">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-glow hidden sm:block">{t.appName}</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {user.walletAddress && (
            <div className="hidden md:flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-mono text-gray-300">{user.points} {t.points}</span>
            </div>
          )}

          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors uppercase font-bold text-xs"
          >
            {lang === 'ar' ? 'English' : 'عربي'}
          </button>

          {user.walletAddress ? (
            <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl text-sm font-mono text-purple-400">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </div>
          ) : (
            <button 
              onClick={onConnect}
              className="gradient-bg px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
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
