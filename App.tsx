
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Language, User } from './types';
import { translations } from './translations';
import { dbService } from './services/database';
import { lotteryService } from './services/lottery';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import ChatBot from './components/ChatBot';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import Store from './components/Store';
import PremiumModal from './components/PremiumModal';
import Lottery from './components/Lottery';

// Web3 Imports
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, useSignMessage } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from './services/web3Config';
import { authService } from './services/authService';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'chat' | 'profile' | 'store' | 'lotto'>('tasks');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [refInput, setRefInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Wagmi Hook
  const { address: web3Address, isConnected: isWeb3Connected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    // Initialize DB on mount
    dbService.init().catch(console.error);

    // Initial Lottery Check (Lazy Trigger)
    lotteryService.checkAndRunDraws().catch(console.error);

    // Check Session & Restore User
    const session = authService.getSession();
    if (session) {
      dbService.getUser(session.address).then(u => {
        if (u) setUser(u);
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref && ref.length === 6) {
      setRefInput(ref);
    }
  }, []);

  // Sync Web3 Auth
  useEffect(() => {
    const handleAuth = async () => {
      // If wallet connected but user not logged in OR address mismatch
      if (web3Address) {
        const session = authService.getSession();
        if (session && session.address === web3Address) {
          // Already authenticated locally, ensure user loaded
          if (!user) {
            const u = await dbService.getUser(web3Address);
            if (u) setUser(u);
          }
          return;
        }
        // Not authenticated (no session) or wallet changed
        if (!user || user.walletAddress !== web3Address) {
          connectWallet(web3Address);
        }
      }
    };
    handleAuth();
  }, [web3Address, user]);

  const calculateLevel = (points: number) => {
    const lvl = Math.floor(Math.sqrt(points / 50)) + 1;
    return Math.min(lvl, 50);
  };

  const nextLevelPoints = useMemo(() => {
    if (!user || user.level >= 50) return null;
    return 50 * Math.pow(user.level, 2);
  }, [user]);

  const updatePoints = useCallback(async (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const newPoints = prev.points + amount;
      const newLevel = calculateLevel(newPoints);
      const newUser = { ...prev, points: newPoints, level: newLevel };

      // Async update DB
      dbService.saveUser(newUser).catch(console.error);

      return newUser;
    });
  }, []);

  const connectWallet = async (forcedAddress?: string) => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      let address = forcedAddress;

      // Fallback if not driven by wagmi hook (e.g. initial button click)
      if (!address) {
        // Assuming button click triggered wallet connect via Wagmi UI externally
        // So we just return and let useEffect catch the address change
        setIsConnecting(false);
        return;
      }

      // SIGNATURE AUTHENTICATION
      // Check if we already have a valid session for this address
      const validSession = authService.getSession();

      if (!validSession || validSession.address !== address) {
        const timestamp = Date.now();
        const msg = `Sign to authenticate with CARVFi\nWallet: ${address}\nTimestamp: ${timestamp}`;

        try {
          const signature = await signMessageAsync({ message: msg });
          authService.login(address, signature);
        } catch (e) {
          console.warn("User reject sig", e);
          setIsConnecting(false);
          return;
        }
      }

      // Step 3: Fetch/Create Profile from DB
      let profile = await dbService.getUser(address);

      if (!profile) {
        // Create new user if not found
        const generateRefCode = () => Math.floor(100000 + Math.random() * 900000).toString();
        profile = {
          walletAddress: address,
          username: `Agent_${address.slice(0, 4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
          points: 0,
          streak: 0,
          level: 1,
          lastCheckIn: null,
          tasksCompleted: [],
          referralCode: generateRefCode(),
          referralsCount: 0,
          isNewUser: true
        };
        await dbService.saveUser(profile);
        setShowReferralModal(true);
      }

      setUser(profile);

    } catch (err: any) {
      console.error("Wallet Error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleReferralSubmit = async (isSkip = false) => {
    if (!user) return;
    let bonus = (!isSkip && refInput.length === 6) ? 300 : 0;
    const updatedUser = { ...user, isNewUser: false, points: user.points + bonus, level: calculateLevel(user.points + bonus) };

    await dbService.saveUser(updatedUser);
    setUser(updatedUser);
    setShowReferralModal(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-12 rounded-[60px] max-w-2xl space-y-10 animate-in zoom-in duration-500 border border-primary/30 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full"></div>
          <div className="gradient-bg w-24 h-24 rounded-[35px] mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.4)] relative z-10">
            <span className="text-4xl text-white">🆔</span>
          </div>
          <div className="space-y-4 relative z-10">
            <h1 className="text-6xl font-black text-glow tracking-tighter italic uppercase leading-none">{t.landingTitle}</h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">{t.landingDesc}</p>
          </div>
          <div className="space-y-6 relative z-10">
            {/* Custom Connect Button logic handled by Navbar or direct Wagmi usage */}
            <button
              onClick={() => connectWallet(web3Address)}
              disabled={isConnecting}
              className="w-full gradient-bg py-7 rounded-[30px] font-black text-2xl hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group disabled:opacity-50"
            >
              {/* Simplified for demo: merges solana/evm flow */}
              {isConnecting ? "Connecting..." : t.connectWallet}
            </button>
            <div className="flex justify-center gap-6 pt-6 border-t border-white/5">
              <button onClick={() => setLang('ar')} className={`text-sm font-black uppercase tracking-widest ${lang === 'ar' ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>العربية</button>
              <button onClick={() => setLang('en')} className={`text-sm font-black uppercase tracking-widest ${lang === 'en' ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>English</button>
            </div>
          </div>
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.4em]">Integrated with CARV Protocol API v2.0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar lang={lang} setLang={setLang} user={user} onConnect={() => connectWallet(web3Address)} t={t} onOpenPremium={() => setShowPremiumModal(true)} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-700 pb-32">
        {activeTab === 'tasks' && (
          <Dashboard
            user={user}
            t={t}
            onCheckIn={() => {
              const today = new Date().toISOString().split('T')[0];
              if (user.lastCheckIn === today) return;
              updatePoints(10);
              const newUser = { ...user, streak: user.streak + 1, lastCheckIn: today };
              setUser(newUser);
              dbService.saveUser(newUser).catch(console.error);
            }}
            updatePoints={updatePoints}
            nextLevelPoints={nextLevelPoints}
            checkInReward={10}
          />
        )}
        {activeTab === 'leaderboard' && <Leaderboard t={t} />}
        {activeTab === 'chat' && (
          <ChatBot
            isOpen={true}
            setIsOpen={() => { }}
            lang={lang}
            t={t}
            updatePoints={updatePoints}
            isStandalone
          />
        )}
        {activeTab === 'profile' && <Profile user={user} t={t} onUpdate={(fields) => {
          const newUser = { ...user, ...fields };
          setUser(newUser);
          dbService.saveUser(newUser).catch(console.error);
        }} />}
        {activeTab === 'store' && user && (
          <Store
            user={user}
            t={t}
            updatePoints={updatePoints}
            onUpdateUser={(fields) => {
              const newUser = { ...user, ...fields };
              setUser(newUser);
            }}
          />
        )}
        {activeTab === 'lotto' && user && (
          <Lottery
            user={user}
            t={t}
            onUpdateUser={(u) => setUser(u)}
          />
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-card rounded-[40px] px-8 py-4 border border-white/10 shadow-2xl z-50 flex items-center gap-10">
        <NavBtn id="tasks" current={activeTab} onClick={setActiveTab} icon="💎" label={t.tasks} />
        <NavBtn id="store" current={activeTab} onClick={setActiveTab} icon="🛍️" label="Shop" />
        <NavBtn id="lotto" current={activeTab} onClick={setActiveTab} icon="🎰" label="Lotto" />
        <NavBtn id="chat" current={activeTab} onClick={setActiveTab} icon="🤖" label={t.chatWithAI} />
        <NavBtn id="leaderboard" current={activeTab} onClick={setActiveTab} icon="🏆" label={t.leaderboard} />
        <NavBtn id="profile" current={activeTab} onClick={setActiveTab} icon="👤" label={t.profile} />
      </nav>

      {showPremiumModal && user && (
        <PremiumModal
          user={user}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            const newUser = { ...user, isPremium: true };
            setUser(newUser);
            dbService.saveUser(newUser);
          }}
        />
      )}

      {showReferralModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="glass-card p-12 rounded-[50px] max-w-md w-full space-y-10 border border-primary/40 shadow-2xl">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-glow italic uppercase">{t.referralTitle}</h2>
              <p className="text-gray-400 text-sm">{t.referralDesc}</p>
            </div>
            <input
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-black/60 border-2 border-primary/20 rounded-[30px] p-6 text-center text-4xl font-mono tracking-[0.6em] focus:border-primary outline-none"
              placeholder="000000"
            />
            <button onClick={() => handleReferralSubmit(false)} disabled={refInput.length !== 6} className="w-full gradient-bg py-5 rounded-2xl font-black text-white text-lg disabled:opacity-30">
              {t.submit}
            </button>
            <button onClick={() => handleReferralSubmit(true)} className="w-full text-gray-500 font-bold uppercase text-xs tracking-widest">{t.skip}</button>
          </div>
        </div>
      )}

      {/* Admin Floating Button */}
      {user && (
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-32 right-6 w-12 h-12 bg-white/5 hover:bg-primary text-gray-400 hover:text-black rounded-full flex items-center justify-center transition-all z-40 border border-white/10"
          title="Admin Panel"
        >
          ⚙️
        </button>
      )}

      {/* Admin Panel Overlay */}
      {showAdmin && user && (
        <AdminPanel currentUser={user} onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const NavBtn = ({ id, current, onClick, icon, label }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex flex-col items-center gap-1 transition-all relative ${current === id ? 'text-primary scale-125' : 'text-gray-500 hover:text-gray-300'}`}
  >
    <span className="text-3xl">{icon}</span>
    {current === id && <span className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#a855f7]"></span>}
  </button>
);

export default App;
