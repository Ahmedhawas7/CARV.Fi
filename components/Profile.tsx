
import React, { useState } from 'react';
import { User } from '../types';
import { generateNeuralAvatar } from '../services/gemini';

interface ProfileProps {
  user: User;
  t: any;
  onUpdate: (updatedFields: Partial<User>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, t, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    avatar: user.avatar,
    carvUid: user.carvUid || '',
    playDomain: user.playDomain || '',
    twitter: user.twitter || '',
    discord: user.discord || '',
    telegram: user.telegram || '',
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imgPrompt, setImgPrompt] = useState('');

  const avatars = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Milo`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Luna`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Jade`,
  ];

  const handleSave = () => {
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAiGenerate = async () => {
    if (!imgPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    const result = await generateNeuralAvatar(imgPrompt);
    if (result) {
      updateField('avatar', result);
    }
    setIsGenerating(false);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyRefLink = () => {
    const link = `${window.location.origin}/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatus = (field: keyof typeof formData) => {
    const currentVal = formData[field];
    const savedVal = (user as any)[field] || '';
    
    if (currentVal !== savedVal) return 'pending';
    if (savedVal && savedVal.trim() !== '') return 'verified';
    return 'unbound';
  };

  const StatusBadge = ({ status }: { status: 'pending' | 'verified' | 'unbound' }) => {
    if (status === 'pending') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-yellow-500/20 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
          Pending Sync
        </span>
      );
    }
    if (status === 'verified') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
          {t.complete}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span>
        Unbound
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-500 pb-32">
      <header className="text-center space-y-3">
        <h2 className="text-6xl font-black text-glow tracking-tighter italic uppercase">{t.profile}</h2>
        <p className="text-gray-500 uppercase text-[10px] tracking-[0.6em] font-black">SVM Neural Synchronization</p>
      </header>
      
      {/* Referral Hub */}
      <div className="glass-card p-10 rounded-[50px] border border-primary/30 bg-primary/5 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-6 text-6xl opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">💎</div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-black italic uppercase text-primary">{t.referralReward}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Scale your network to gain massive XP</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t.referralCode}</p>
              <div className="bg-black/60 p-6 rounded-[25px] text-4xl font-mono font-black text-center border-2 border-primary/20 text-glow">
                {user.referralCode}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t.referralLink}</p>
              <button 
                onClick={copyRefLink}
                className="w-full bg-black/60 p-6 rounded-[25px] text-sm font-mono flex flex-col items-center justify-center gap-2 border-2 border-white/5 hover:border-primary/40 transition-all group/btn h-full"
              >
                <span className="truncate w-full opacity-40 group-hover/btn:opacity-100 transition-opacity">.../?ref={user.referralCode}</span>
                <span className="text-primary font-black uppercase text-lg tracking-widest">{copied ? t.copied : t.copy}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-12 rounded-[60px] space-y-12 relative overflow-hidden shadow-2xl border border-white/5">
        {/* Visual Identity Selector */}
        <div className="flex flex-col items-center gap-10">
          <div className="relative group">
            <div className="absolute -inset-4 gradient-bg rounded-full opacity-20 group-hover:opacity-100 blur-2xl transition duration-1000"></div>
            <img src={formData.avatar} className="relative w-48 h-48 rounded-full border-4 border-primary/30 p-2 bg-background shadow-[0_0_50px_rgba(0,0,0,0.5)] object-cover" alt="Avatar" />
            {isGenerating && (
               <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-20">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               </div>
            )}
            <div className="absolute bottom-2 right-2 w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center border-2 border-background shadow-xl">✨</div>
          </div>
          
          {/* AI Generator UI */}
          <div className="w-full max-w-md space-y-4">
             <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{t.avatar}</p>
             <div className="relative">
                <input 
                  value={imgPrompt}
                  onChange={(e) => setImgPrompt(e.target.value)}
                  placeholder={t.avatarPrompt}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-mono focus:border-primary outline-none transition-all pr-32"
                />
                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !imgPrompt.trim()}
                  className="absolute right-2 top-2 bottom-2 gradient-bg px-4 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all active:scale-95"
                >
                  {isGenerating ? t.generating : t.generateAvatar}
                </button>
             </div>
             <div className="flex gap-4 flex-wrap justify-center">
                {avatars.map((av, i) => (
                  <button 
                    key={i} 
                    onClick={() => updateField('avatar', av)} 
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${formData.avatar === av ? 'border-primary shadow-[0_0_10px_#a855f7]' : 'border-white/10 opacity-30 hover:opacity-100'}`}
                  >
                    <img src={av} alt="option" className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Identity Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">{t.username}</label>
            <input 
              value={formData.username}
              onChange={(e) => updateField('username', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-[30px] p-6 focus:ring-4 focus:ring-primary/20 outline-none text-xl font-mono transition-all"
              placeholder="DISPLAY_NAME"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">{t.carvUid}</label>
            <input 
              value={formData.carvUid}
              onChange={(e) => updateField('carvUid', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-[30px] p-6 focus:ring-4 focus:ring-primary/20 outline-none text-xl font-mono transition-all"
              placeholder="UID-XXXX"
            />
          </div>
        </div>

        {/* Social Identity Section */}
        <div className="space-y-8 pt-6 border-t border-white/5">
           <header className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase text-white/80 tracking-tighter">{t.socialLinks}</h3>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest italic">Multi-Chain Attestation Layer</p>
           </header>
           
           <div className="grid grid-cols-1 gap-6">
              {[
                { key: 'twitter' as const, icon: '🐦', label: t.twitter },
                { key: 'discord' as const, icon: '👾', label: t.discord },
                { key: 'telegram' as const, icon: '✈️', label: t.telegram }
              ].map((social) => (
                <div key={social.key} className="relative group">
                   <div className="flex items-center gap-4 bg-black/20 p-4 rounded-[35px] border border-white/5 group-hover:border-white/10 transition-all">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/5 shadow-inner">
                        {social.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between px-2">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{social.label}</label>
                           <StatusBadge status={getStatus(social.key)} />
                        </div>
                        <input 
                          value={formData[social.key]}
                          onChange={(e) => updateField(social.key, e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 outline-none text-lg font-mono placeholder:text-gray-800"
                          placeholder="@handle_id"
                        />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full gradient-bg py-8 rounded-[35px] font-black text-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 group"
        >
          {isSaved ? <span className="flex items-center gap-3 animate-in zoom-in">✅ {t.identitySaved}</span> : t.saveChanges}
        </button>
      </div>
    </div>
  );
};

export default Profile;
