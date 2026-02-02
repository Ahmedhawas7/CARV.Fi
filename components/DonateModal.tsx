import React, { useState } from 'react';

interface DonateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    const walletAddress = "0x296Bd27a4702f5cf0a5362452540eF7a1E4ce36D";

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-card p-10 rounded-[50px] max-w-lg w-full space-y-8 border border-primary/40 shadow-[0_0_100px_rgba(168,85,247,0.2)] animate-in zoom-in duration-500 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-3xl shadow-lg">💝</div>
                        <h2 className="text-4xl font-black text-glow italic uppercase tracking-tighter">Support Us</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90"
                    >
                        <span className="text-2xl">✕</span>
                    </button>
                </div>

                <div className="space-y-6 relative z-10 text-center">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-primary uppercase italic tracking-widest">Donate</h3>
                        <div className="bg-black/60 p-6 rounded-[30px] border-2 border-primary/20 group relative">
                            <p className="text-sm font-mono text-gray-300 break-all select-all">{walletAddress}</p>
                            <button
                                onClick={handleCopy}
                                className="mt-4 w-full py-4 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {copied ? (
                                    <>✅ COPIED</>
                                ) : (
                                    <>📋 COPY ADDRESS</>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-white/5">
                        <p className="text-gray-400 font-bold leading-relaxed">
                            "Your support ensures that CARVFi remains the elite choice for multi-chain loyalty and decentralized growth. If you believe this vision should continue, feel free to contribute."
                        </p>
                        <p className="text-primary font-black text-xl italic uppercase font-cairo" dir="rtl">
                            "دعمكم هو الوقود الذي يضمن استمرار CARVFi كخيار النخبة للولاء متعدد الشبكات. إذا كنت تؤمن بوجوب استمرار هذه الرؤية، فلا تتردد في المساهمة."
                        </p>
                    </div>
                </div>

                <div className="pt-6 relative z-10">
                    <button
                        onClick={onClose}
                        className="w-full gradient-bg py-6 rounded-[30px] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                        THANK YOU
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonateModal;
