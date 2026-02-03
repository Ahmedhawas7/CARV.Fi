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
import WalletSelectorModal from './components/WalletSelectorModal';
import HowItWorks from './components/HowItWorks';
import DonateModal from './components/DonateModal';
import MysteryBoxModal from './components/MysteryBoxModal';

// Web3 Imports - EVM
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, useSignMessage, useConnect, useDisconnect } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config, ChainType } from './services/web3Config';

// Web3 Imports - Solana
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

import { authService } from './services/authService';

const queryClient = new QueryClient();

// Solana configuration
const network = WalletAdapterNetwork.Mainnet;

const AppContent: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'chat' | 'profile' | 'store' | 'lotto' | 'how-it-works'>('tasks');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [refInput, setRefInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showMysteryBox, setShowMysteryBox] = useState(false);
  const [currentChain, setCurrentChain] = useState<ChainType>('evm');

  // EVM Hooks
  const { address: evmAddress } = useAccount();
  const { signMessageAsync: signEvmMessage } = useSignMessage();
  const { connect: connectEvm, connectors } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();

  // Solana Hooks
  const { publicKey: solanaAddress, signMessage: signSolanaMessage, select: selectSolanaWallet, disconnect: disconnectSolana } = useWallet();

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    // Initialize DB on mount
    dbService.init().catch(console.error);
    lotteryService.checkAndRunDraws().catch(console.error);

    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref && ref.length === 6) {
      setRefInput(ref);
    }
  }, []);

  // Handle wallet connection and authentication
  const handleWalletSelect = async (walletId: string, chain: ChainType) => {
    setShowWalletModal(false);
    setIsConnecting(true);
    setCurrentChain(chain);

    try {
      if (chain === 'evm') {
        // Connect EVM wallet
        const connector = connectors.find(c => c.id === walletId);
        if (connector) {
          await connectEvm({ connector });
          // Wait for address to be available
          setTimeout(() => authenticateWallet(chain), 1000);
        }
      } else {
        // Connect Solana wallet
        selectSolanaWallet(walletId);
        // Wait for publicKey to be available
        setTimeout(() => authenticateWallet(chain), 1000);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (user) {
      const theme = user.level >= 50 ? 'neural' : user.level >= 25 ? 'gold' : 'default';
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [user?.level]);

  const authenticateWallet = async (chain: ChainType) => {
    try {
      const address = chain === 'evm' ? evmAddress : solanaAddress?.toBase58();
      if (!address) {
        console.error('No address available');
        setIsConnecting(false);
        return;
      }

      // Check for existing session
      const existingSession = await authService.restoreSession(address, chain);
      if (existingSession) {
        await loadUserProfile(address);
        setIsConnecting(false);
        return;
      }

      // Request signature for authentication
      const message = authService.generateAuthMessage(address, chain);
      let signature: string;

      if (chain === 'evm') {
        signature = await signEvmMessage({
          message,
          account: address as `0x${string}`,
        });
      } else {
        if (!signSolanaMessage) {
          throw new Error('Solana wallet does not support message signing');
        }
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await signSolanaMessage(encodedMessage);
        signature = Buffer.from(signedMessage).toString('base64');
      }

      // Save session
      await authService.login(address, chain, signature);
      await loadUserProfile(address);
      setIsConnecting(false);
    } catch (error) {
      console.error('Authentication error:', error);
      setIsConnecting(false);
    }
  };

  const loadUserProfile = async (address: string) => {
    let profile = await dbService.getUser(address);

    if (!profile) {
      const generateRefCode = () => Math.floor(100000 + Math.random() * 900000).toString();
      profile = {
        walletAddress: address,
        username: `Agent_${address.slice(0, 4)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        points: 0,
        gemPoints: 0,
        streak: authService.getLoginStreak(),
        level: 1,
        lastCheckIn: null,
        tasksCompleted: [],
        referralCode: generateRefCode(),
        referralsCount: 0,
        isNewUser: true,
      };
      await dbService.saveUser(profile);
      setShowReferralModal(true);
    } else {
      profile.streak = authService.getLoginStreak();
    }

    setUser(profile);
  };

  const handleDisconnect = async () => {
    if (user) {
      await authService.logout(user.walletAddress, currentChain);
    }

    if (currentChain === 'evm') {
      disconnectEvm();
    } else {
      disconnectSolana();
    }

    setUser(null);
  };

  const calculateLevel = (points: number) => {
    const lvl = Math.floor(Math.sqrt(points / 50)) + 1;
    return Math.min(lvl, 50);
  };

  const nextLevelPoints = useMemo(() => {
    if (!user || user.level >= 50) return null;
    return 50 * Math.pow(user.level, 2);
  }, [user]);

  const updatePoints = useCallback(async (amount: number, reason: string = 'Activity') => {
    setUser(prev => {
      if (!prev) return null;
      const newPoints = prev.points + amount;
      const newGemPoints = (prev.gemPoints || 0) + (amount > 0 ? amount : 0); // Only positive changes affect activity score
      const newLevel = calculateLevel(newPoints);
      const newUser = { ...prev, points: newPoints, gemPoints: newGemPoints, level: newLevel };

      // Handle passive referral bonus
      if (amount > 0 && prev.referredBy) {
        dbService.getUser(prev.referredBy).then(referrer => {
          if (referrer) {
            const bonus = Math.max(1, Math.floor(amount * 0.05));
            const updatedReferrer = {
              ...referrer,
              points: referrer.points + bonus,
              gemPoints: (referrer.gemPoints || 0) + bonus,
              level: calculateLevel(referrer.points + bonus)
            };
            dbService.saveUser(updatedReferrer).catch(console.error);
          }
        }).catch(console.error);
      }

      dbService.saveUser(newUser).catch(console.error);
      return newUser;
    });
  }, []);

  const handleReferralSubmit = async (isSkip = false) => {
    if (!user) return;
    let bonus = 0;
    let referredByAddress = undefined;

    if (!isSkip && refInput.length === 6) {
      const referrer = await dbService.getUserByReferralCode(refInput);
      if (referrer && referrer.walletAddress !== user.walletAddress) {
        bonus = 300; // Sign-up bonus
        referredByAddress = referrer.walletAddress;

        // Update referrer stats
        const updatedReferrer = {
          ...referrer,
          referralsCount: (referrer.referralsCount || 0) + 1,
          points: (referrer.points || 0) + 100, // Small immediate bonus for inviter
          gemPoints: (referrer.gemPoints || 0) + 100
        };
        await dbService.saveUser(updatedReferrer);
      }
    }

    const updatedUser = {
      ...user,
      isNewUser: false,
      referredBy: referredByAddress,
      points: user.points + bonus,
      level: calculateLevel(user.points + bonus)
    };
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
            <button
              onClick={() => setShowWalletModal(true)}
              disabled={isConnecting}
              className="w-full gradient-bg py-7 rounded-[30px] font-black text-2xl hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
            <div className="flex justify-center gap-6 pt-6 border-t border-white/5">
              <button onClick={() => setLang('ar')} className={`text-sm font-black uppercase tracking-widest ${lang === 'ar' ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>العربية</button>
              <button onClick={() => setLang('en')} className={`text-sm font-black uppercase tracking-widest ${lang === 'en' ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>English</button>
            </div>
          </div>
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.4em]">Multi-Chain Powered by CARV Protocol</p>
        </div>

        <WalletSelectorModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onSelectWallet={handleWalletSelect}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar
        lang={lang}
        setLang={setLang}
        user={user}
        onConnect={() => setShowWalletModal(true)}
        onDisconnect={handleDisconnect}
        currentChain={currentChain}
        t={t}
        onOpenPremium={() => setShowPremiumModal(true)}
      />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-700 pb-32">
        {activeTab === 'tasks' && (
          <Dashboard
            user={user}
            t={t}
            lang={lang}
            onCheckIn={() => {
              const today = new Date().toISOString().split('T')[0];
              if (user.lastCheckIn === today) return;
              updatePoints(10, 'Daily Check-in');
              const newUser = {
                ...user,
                streak: user.streak + 1,
                lastCheckIn: today,
                gemPoints: (user.gemPoints || 0) + 10
              };
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
            user={user}
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
            onOpenMysteryBox={() => setShowMysteryBox(true)}
          />
        )}
        {activeTab === 'lotto' && user && (
          <Lottery
            user={user}
            t={t}
            onUpdateUser={(u) => setUser(u)}
          />
        )}
        {activeTab === 'how-it-works' && <HowItWorks />}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-card rounded-[40px] px-8 py-4 border border-white/10 shadow-2xl z-50 flex items-center gap-10">
        <NavBtn id="tasks" current={activeTab} onClick={setActiveTab} icon="💎" label={t.tasks} />
        <NavBtn id="store" current={activeTab} onClick={setActiveTab} icon="🛍️" label="Shop" />
        <NavBtn id="lotto" current={activeTab} onClick={setActiveTab} icon="🎰" label="Lotto" />
        <NavBtn id="how-it-works" current={activeTab} onClick={setActiveTab} icon="📖" label={t.howItWorks} />
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

      {user && (
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-32 right-6 w-12 h-12 bg-white/5 hover:bg-primary text-gray-400 hover:text-black rounded-full flex items-center justify-center transition-all z-40 border border-white/10"
          title="Admin Panel"
        >
          ⚙️
        </button>
      )}

      {showAdmin && user && (
        <AdminPanel currentUser={user} onClose={() => setShowAdmin(false)} />
      )}

      {/* Floating Donation Button */}
      <div className="fixed bottom-32 left-8 z-[100] group">
        <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <button
          onClick={() => setShowDonateModal(true)}
          onMouseEnter={() => setShowDonateModal(true)}
          className="relative w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
          title="Support Project"
        >
          💝
          <span className="absolute left-full ml-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
            Support Project
          </span>
        </button>
      </div>

      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
      />

      {user && (
        <MysteryBoxModal
          isOpen={showMysteryBox}
          onClose={() => setShowMysteryBox(false)}
          user={user}
          onOpenBox={async (loot) => {
            if (loot.type === 'points') {
              updatePoints(loot.amount, 'Mystery Box Reward');
            } else if (loot.type === 'tickets') {
              const newCount = (user.dailyTicketCount || 0) + loot.amount;
              const newUser = { ...user, dailyTicketCount: newCount };
              setUser(newUser);
              await dbService.saveUser(newUser);
            }
          }}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <AppContent />
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
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
