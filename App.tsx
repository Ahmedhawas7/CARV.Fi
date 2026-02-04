import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  Zap,
  Star,
  Gem,
  TrendingUp,
  ChevronRight,
  Gift,
  Activity,
  Cpu,
  Layers
} from 'lucide-react';

import { Language, User } from './types';
import { translations } from './translations';
import { dbService } from './services/database';
import { lotteryService } from './services/lottery';
import { authService } from './services/authService';

import Navbar from './components/Navbar';
import Layout from './components/Layout';
import ProfileSection from './components/Profile';
import StatCard from './components/StatsCard';
import TaskItem from './components/TaskCard';
import WalletSelectorModal from './components/WalletSelectorModal';

// Web3 Imports
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, useSignMessage, useConnect, useDisconnect } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from './services/web3Config';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const { address: evmAddress } = useAccount();
  const { signMessageAsync: signEvmMessage } = useSignMessage();
  const { connect: connectEvm, connectors } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();

  const t = translations[lang];

  useEffect(() => {
    dbService.init().catch(console.error);
    lotteryService.checkAndRunDraws().catch(console.error);
  }, []);

  const handleWalletSelect = async (walletId: string) => {
    setShowWalletModal(false);
    setIsConnecting(true);
    try {
      const connector = connectors.find(c => c.id === walletId);
      if (connector) {
        await connectEvm({ connector });
        setTimeout(() => authenticateWallet(), 1000);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setIsConnecting(false);
    }
  };

  const authenticateWallet = async () => {
    try {
      const address = evmAddress;
      if (!address) {
        setIsConnecting(false);
        return;
      }

      const existingSession = await authService.restoreSession(address, 'evm');
      if (existingSession) {
        await loadUserProfile(address);
        setIsConnecting(false);
        return;
      }

      const message = authService.generateAuthMessage(address, 'evm');
      const signature = await signEvmMessage({
        message,
        account: address as `0x${string}`,
      });

      await authService.login(address, 'evm', signature);
      await loadUserProfile(address);
      setIsConnecting(false);
      toast.success("Identity Verified", {
        style: { background: '#040406', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)', padding: '16px', borderRadius: '16px' }
      });
    } catch (error) {
      console.error('Authentication error:', error);
      setIsConnecting(false);
    }
  };

  const loadUserProfile = async (address: string) => {
    let profile = await dbService.getUser(address);
    if (!profile) {
      profile = {
        walletAddress: address,
        username: `Agent_${address.slice(2, 6).toUpperCase()}`,
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`,
        points: 0,
        gemPoints: 0,
        streak: 1,
        level: 1,
        lastCheckIn: null,
        tasksCompleted: [],
        referralCode: Math.floor(100000 + Math.random() * 900000).toString(),
        referralsCount: 0,
        isNewUser: true,
      };
      await dbService.saveUser(profile);
    } else {
      profile.streak = authService.getLoginStreak();
    }
    setUser(profile);
  };

  const handleDisconnect = async () => {
    if (user) await authService.logout(user.walletAddress, 'evm');
    disconnectEvm();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-hxfi-mesh opacity-50" />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.4, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hxfi-purple/10 blur-[200px] rounded-full"
          />
          <div className="scanline" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="hxfi-glass p-16 max-w-2xl w-full text-center relative z-10 border-white/5 space-y-12 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        >
          <div className="relative inline-block scale-125 mb-4">
            <div className="absolute inset-[-20px] border border-dashed border-hxfi-purple/30 rounded-[2.5rem] animate-[spin_20s_linear_infinite]" />
            <div className="w-24 h-24 bg-hxfi-gradient rounded-[2rem] flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(124,58,237,0.5)] group overflow-hidden">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Cpu className="w-12 h-12 text-white" />
              </motion.div>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-7xl font-bold italic tracking-tighter text-white uppercase hxfi-text-glow leading-none font-hud">
              HX<span className="text-hxfi-purple">Fi</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <span className="hxfi-badge font-sans">Protcol v3.0 // Autonomous</span>
            </div>
            <p className="text-white/40 text-lg font-medium tracking-tight italic max-w-md mx-auto font-sans">
              Initialize your neural link to the decentralized agent layer.
            </p>
          </div>

          <button
            onClick={() => setShowWalletModal(true)}
            disabled={isConnecting}
            className="hxfi-btn w-full flex items-center justify-center gap-4 py-6 text-2xl group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            {isConnecting ? (
              <Activity className="w-7 h-7 animate-pulse" />
            ) : (
              <>
                <Zap className="w-7 h-7 text-white fill-white group-hover:scale-125 transition-transform" />
                Activate Connection
              </>
            )}
          </button>

          <div className="pt-8 border-t border-white/5 opacity-50 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-hxfi-purple-glow" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">SVM Layer</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Multi-Agent</span>
          </div>
        </motion.div>

        <WalletSelectorModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onSelectWallet={handleWalletSelect}
        />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen selection:bg-hxfi-purple/30">
      <Toaster position="bottom-right" />
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletAddress={user.walletAddress}
        onConnect={() => setShowWalletModal(true)}
        lang={lang}
        setLang={setLang}
      />

      <Layout>
        <div className="space-y-12">
          {/* Agent Core Section */}
          <ProfileSection user={{
            ...user,
            xp: user.points % 1000,
            maxXp: 1000,
          }} />

          {/* Neural Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Neural GEMS"
              value={user.points}
              icon={Gem}
              variant="purple"
              trend="+24.5%"
              description="Current Epoch"
            />
            <StatCard
              label="System Stars"
              value={user.gemPoints}
              icon={Star}
              variant="gold"
              description="Global Rank"
            />
            <StatCard
              label="Node Efficiency"
              value={`${(85 + Math.random() * 10).toFixed(1)}%`}
              icon={Activity}
              variant="blue"
              trend="OPTIMIZED"
            />
            <StatCard
              label="Entry Tickets"
              value={user.dailyTicketCount || 0}
              icon={Gift}
              variant="green"
              description="Active Lottery"
            />
          </div>

          {/* Missions Layer */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-bold italic uppercase tracking-tighter text-white font-hud">Ops: Dark Sector</h3>
                  <span className="hxfi-badge bg-white/5 text-white/50 border-white/5 font-sans">03 Active Missions</span>
                </div>
                <p className="text-white/20 text-xs font-bold italic uppercase tracking-widest mt-1 font-sans">Sychronize agents to unlock reward pooling</p>
              </div>
              <button className="hxfi-glass px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-hxfi-purple-glow hover:border-hxfi-purple/50 transition-all font-sans">
                Access Archive
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TaskItem
                title="Initialize X-Channel"
                description="Synchronize your identity on the primary visual mainframe."
                reward={150}
                platform="twitter"
                status="pending"
                onAction={() => toast.loading("Executing X-Protocol Redirect...")}
              />
              <TaskItem
                title="Secure Neural Comms"
                description="Establish an encrypted line on the HXFi Discord channel."
                reward={300}
                platform="discord"
                status="pending"
                onAction={() => toast.loading("Redirecting to Discord HUB...")}
              />
              <TaskItem
                title="Weekly Node Sync"
                description="Validate your systemic presence for the current cycle."
                reward={50}
                platform="website"
                status="completed"
                onAction={() => { }}
              />
              <TaskItem
                title="Watch Vision Stream"
                description="Ingest the latest protocol roadmap through the neural tube."
                reward={100}
                platform="youtube"
                status="locked"
                onAction={() => { }}
              />
            </div>
          </div>
        </div>
      </Layout>

      {/* Decorative Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] opacity-30">
        <motion.div
          animate={{ y: [0, 100, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-[10%] right-[10%] w-[400px] h-[400px] bg-hxfi-purple blur-[120px] rounded-full"
        />
      </div>
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

export default App;
