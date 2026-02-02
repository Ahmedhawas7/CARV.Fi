
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Language, User } from './types';
import { translations } from './translations';
import { mockStore } from './services/mockStore';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import ChatBot from './components/ChatBot';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en'); 
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'chat' | 'profile'>('tasks');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [refInput, setRefInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref && ref.length === 6) {
      setRefInput(ref);
    }
  }, []);

  const calculateLevel = (points: number) => {
    const lvl = Math.floor(Math.sqrt(points / 50)) + 1;
    return Math.min(lvl, 50);
  };

  const nextLevelPoints = useMemo(() => {
    if (!user || user.level >= 50) return null;
    return 50 * Math.pow(user.level, 2);
  }, [user]);

  const updatePoints = useCallback((amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const newPoints = prev.points + amount;
      const newLevel = calculateLevel(newPoints);
      const newUser = { ...prev, points: newPoints, level: newLevel };
      mockStore.updateUser(newUser);
      return newUser;
    });
  }, []);

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    
    try {
      // Logic for standalone window check
      if (window.self !== window.top) {
        alert(lang === 'ar' ? 'يرجى فتح الموقع في تبويب مستقل لربط المحفظة.' : 'Please open the site in a standalone tab to connect your wallet.');
      }

      const provider = (window as any).backpack || (window as any).solana;

      if (!provider) {
        if (confirm(t.walletRequired)) {
          window.open('https://backpack.app/download', '_blank');
        }
        setIsConnecting(false);
        return;
      }

      // Step 1: Connect
      const resp = await provider.connect();
      const address = resp.publicKey?.toString() || resp.address;
      
      if (!address) throw new Error("Wallet address missing");

      // Step 2: Request Signature (Official CARV Style)
      // This is necessary for verifying the Data Attestation identity
      const message = `CARV Protocol Identity Authorization\n\nSign this message to bind your identity:\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}\n\nNo gas fees are required for this signature.`;
      const encodedMessage = new TextEncoder().encode(message);
      
      try {
        if (provider.signMessage) {
          await provider.signMessage(encodedMessage);
        }
      } catch (e) {
        console.warn("Signature declined, proceeding in restricted mode.");
      }

      // Step 3: Fetch Profile
      const profile = mockStore.getUserByWallet(address);
      setUser(profile);
      
      if (profile.isNewUser) {
        setShowReferralModal(true);
      }
    } catch (err: any) {
      console.error("Wallet Error:", err);
      // Fallback Demo
      if (confirm(lang === 'ar' ? "فشل الاتصال. هل تريد الدخول بوضع العرض (Demo)؟" : "Connection failed. Enter Demo Mode?")) {
        const demoAddr = "CARV_SBT_" + Math.random().toString(36).slice(2, 7).toUpperCase();
        setUser(mockStore.getUserByWallet(demoAddr));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleReferralSubmit = (isSkip = false) => {
    if (!user) return;
    let bonus = (!isSkip && refInput.length === 6) ? 300 : 0;
    const updatedUser = { ...user, isNewUser: false, points: user.points + bonus, level: calculateLevel(user.points + bonus) };
    setUser(updatedUser);
    mockStore.updateUser(updatedUser);
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
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full gradient-bg py-7 rounded-[30px] font-black text-2xl hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group disabled:opacity-50"
            >
              {isConnecting ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <img src="https://backpack.app/favicon.ico" className="w-8 h-8 rounded-lg" alt="BP" />
                  {t.connectWallet}
                </>
              )}
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
      <Navbar lang={lang} setLang={setLang} user={user} onConnect={connectWallet} t={t} />
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
              mockStore.updateUser(newUser);
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
            setIsOpen={() => {}} 
            lang={lang} 
            t={t} 
            updatePoints={updatePoints}
            isStandalone
          />
        )}
        {activeTab === 'profile' && <Profile user={user} t={t} onUpdate={(fields) => {
          const newUser = { ...user, ...fields };
          setUser(newUser);
          mockStore.updateUser(newUser);
        }} />}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-card rounded-[40px] px-8 py-4 border border-white/10 shadow-2xl z-50 flex items-center gap-10">
        <NavBtn id="tasks" current={activeTab} onClick={setActiveTab} icon="💎" label={t.tasks} />
        <NavBtn id="chat" current={activeTab} onClick={setActiveTab} icon="🤖" label={t.chatWithAI} />
        <NavBtn id="leaderboard" current={activeTab} onClick={setActiveTab} icon="🏆" label={t.leaderboard} />
        <NavBtn id="profile" current={activeTab} onClick={setActiveTab} icon="👤" label={t.profile} />
      </nav>
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
    </div>
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
