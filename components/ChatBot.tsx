
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { handleAiChatStream } from '../services/gemini';

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lang: 'ar' | 'en';
  t: any;
  updatePoints: (amt: number) => void;
  isStandalone?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, setIsOpen, lang, t, updatePoints, isStandalone }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t.aiGreeting, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Placeholder for assistant message to update via stream
    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: Date.now() }]);

    await handleAiChatStream(
      input, 
      lang, 
      (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const last = newMessages[newMessages.length - 1];
          if (last.role === 'assistant') {
            last.content += chunk;
          }
          return newMessages;
        });
      },
      updatePoints
    );
    
    setIsTyping(false);
  };

  if (!isOpen) return null;

  const chatContainer = (
    <div className={`flex flex-col h-full bg-card border border-white/10 ${isStandalone ? 'rounded-[50px] h-[calc(100vh-180px)] shadow-2xl overflow-hidden' : 'h-[600px] rounded-[50px]'}`}>
      <div className="p-8 border-b border-white/5 flex items-center justify-between gradient-bg rounded-t-[50px]">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[24px] bg-white/20 flex items-center justify-center text-4xl shadow-inner border border-white/20">🤖</div>
          <div>
            <h3 className="font-bold text-2xl text-white tracking-tighter">{t.chatWithAI}</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Neural Link Established</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
            <div className={`max-w-[80%] p-5 rounded-[30px] ${
              m.role === 'user' 
                ? 'gradient-bg text-white rounded-tr-none shadow-lg shadow-primary/20' 
                : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content || '...'}</p>
              <p className="text-[8px] mt-2 opacity-40 text-right uppercase tracking-widest">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length-1].content === '' && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-5 rounded-[30px] rounded-tl-none border border-white/10 flex gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-black/40 border-t border-white/5 rounded-b-[50px]">
        <div className="relative flex items-center group">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'ar' ? 'أرسل بروتوكولاً للذكاء الاصطناعي...' : 'Transmit message to AI...'}
            className="w-full bg-background border border-white/10 rounded-[30px] py-6 px-8 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm pr-20 transition-all font-mono"
          />
          <button 
            onClick={handleSend} 
            disabled={isTyping || !input.trim()} 
            className="absolute right-4 p-4 text-primary hover:text-white transition-colors disabled:opacity-20"
          >
            <svg className="w-8 h-8 rotate-90 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return isStandalone ? (
    <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500">{chatContainer}</div>
  ) : (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-xl">{chatContainer}</div>
    </div>
  );
};

export default ChatBot;
