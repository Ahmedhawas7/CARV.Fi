import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { handleAiChatStream } from '../services/gemini';

interface AIInsightCardProps {
    user: User;
    lang: 'ar' | 'en';
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ user, lang }) => {
    const [insight, setInsight] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            setLoading(true);
            let fullText = "";
            const prompt = lang === 'ar'
                ? "أعطني نصيحة سريعة ملهمة لتحسين نشاطي في منصة CARVFi بناءً على مستواي الحالي."
                : "Give me a quick personal insight or advice to maximize my CARVFi activity based on my current level.";

            try {
                await handleAiChatStream(
                    prompt,
                    lang,
                    (chunk) => {
                        fullText += chunk;
                        setInsight(fullText);
                    },
                    () => { }, // No points for passive insight
                    user
                );
            } catch (e) {
                setInsight(lang === 'ar' ? "فشل الحصول على نصيحة" : "Failed to get insight");
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [user.level, lang]);

    return (
        <div className="glass-card p-6 rounded-[30px] border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">🤖</div>

            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-lg shadow-lg">✨</div>
                <h3 className="text-xl font-black text-glow italic uppercase tracking-tighter">AI Insight</h3>
            </div>

            {loading && !insight ? (
                <div className="h-20 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <p className="text-gray-400 text-sm leading-relaxed font-medium animate-in fade-in duration-500">
                    {insight || (lang === 'ar' ? 'جاري التفكير...' : 'Thinking...')}
                </p>
            )}

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Oracle v2.0</span>
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-150"></div>
                </div>
            </div>
        </div>
    );
};

export default AIInsightCard;
