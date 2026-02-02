import React from 'react';

const HowItWorks: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-6xl font-black text-glow italic uppercase leading-none">
                    How It Works
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Learn how to participate in CARVFi lottery, earn GEM points, and win prizes
                </p>
            </div>

            {/* Quick Start */}
            <section className="glass-card p-8 rounded-[40px] space-y-6">
                <h2 className="text-3xl font-black text-primary">🚀 Quick Start</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { step: '1', title: 'Connect Wallet', desc: 'Connect your MetaMask, Phantom, or other supported wallet' },
                        { step: '2', title: 'Get USDC', desc: 'Ensure you have USDC on Base or Solana network' },
                        { step: '3', title: 'Buy Tickets', desc: 'Purchase lottery tickets at 1 USDC each' },
                        { step: '4', title: 'Win Prizes', desc: 'Wait for daily/weekly draws and claim your winnings' },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                            <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-2xl font-black flex-shrink-0">
                                {item.step}
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Lottery System */}
            <section className="glass-card p-8 rounded-[40px] space-y-6">
                <h2 className="text-3xl font-black text-primary">🎰 Lottery System</h2>

                <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <span>☀️</span> Daily Draw
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>• Happens every 24 hours</li>
                            <li>• 5 winners selected randomly</li>
                            <li>• Winners split 60% of the daily pool</li>
                            <li>• Max 10 tickets per wallet per day</li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <span>🌟</span> Weekly Jackpot
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>• Happens every 7 days</li>
                            <li>• 1 grand winner selected</li>
                            <li>• Winner gets 90% of jackpot pool</li>
                            <li>• 30% of daily pools feed the jackpot</li>
                        </ul>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-200">
                        <strong>💡 Pro Tip:</strong> More tickets = Higher win probability. Your chances are calculated as: (Your Tickets / Total Tickets) × 100%
                    </p>
                </div>
            </section>

            {/* GEM Points */}
            <section className="glass-card p-8 rounded-[40px] space-y-6">
                <h2 className="text-3xl font-black text-primary">⭐ GEM Activity Points</h2>

                <p className="text-gray-300">
                    GEM points are <strong className="text-yellow-400">activity rewards</strong>, not a currency. You earn them by participating in the platform:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: '🎫', action: 'Buy 1 Ticket', points: '+100 GEM' },
                        { icon: '📅', action: 'Daily Login', points: '+10 GEM' },
                        { icon: '🔥', action: '7-Day Streak', points: '+50 GEM' },
                        { icon: '👥', action: 'Refer a Friend', points: '+200 GEM' },
                        { icon: '🎉', action: 'First Purchase', points: '+500 GEM' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{item.icon}</span>
                                <span className="text-sm text-gray-300">{item.action}</span>
                            </div>
                            <span className="font-bold text-yellow-400">{item.points}</span>
                        </div>
                    ))}
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm text-purple-200">
                        <strong>📊 Leaderboard:</strong> Top GEM earners are featured on the leaderboard. Future rewards and benefits coming soon!
                    </p>
                </div>
            </section>

            {/* Technical Details */}
            <section className="glass-card p-8 rounded-[40px] space-y-6">
                <h2 className="text-3xl font-black text-primary">⚙️ Technical Details</h2>

                <div className="space-y-4 text-sm text-gray-300">
                    <div>
                        <h3 className="font-bold text-white mb-2">🔐 Security</h3>
                        <ul className="space-y-1 ml-4">
                            <li>• Chainlink VRF for provably fair randomness</li>
                            <li>• Smart contracts audited and verified</li>
                            <li>• Non-custodial - you control your funds</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-2">💰 Prize Distribution</h3>
                        <ul className="space-y-1 ml-4">
                            <li>• 60% → Daily winners (split among 5)</li>
                            <li>• 30% → Weekly jackpot pool</li>
                            <li>• 10% → Platform fee</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-2">🌐 Supported Networks</h3>
                        <ul className="space-y-1 ml-4">
                            <li>• Base (EVM) - MetaMask, TrustWallet, Rainbow</li>
                            <li>• Solana (SVM) - Phantom wallet</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="glass-card p-8 rounded-[40px] space-y-6">
                <h2 className="text-3xl font-black text-primary">❓ FAQ</h2>

                <div className="space-y-4">
                    {[
                        {
                            q: 'How much does a ticket cost?',
                            a: 'Each lottery ticket costs exactly 1 USDC. No hidden fees.',
                        },
                        {
                            q: 'Can I buy tickets with GEM points?',
                            a: 'No. GEM points are activity rewards only. All ticket purchases require USDC.',
                        },
                        {
                            q: 'When are winners selected?',
                            a: 'Daily draws happen every 24 hours. Weekly jackpot draws happen every 7 days. Winners are selected using Chainlink VRF for fairness.',
                        },
                        {
                            q: 'How do I claim my winnings?',
                            a: 'Winnings are automatically sent to your wallet after the draw. No manual claim needed.',
                        },
                        {
                            q: 'What happens if I disconnect my wallet?',
                            a: 'Your tickets and GEM points are saved. Reconnect anytime to continue.',
                        },
                    ].map((faq, i) => (
                        <details key={i} className="p-4 rounded-2xl bg-black/40 border border-white/5 cursor-pointer">
                            <summary className="font-bold text-white">{faq.q}</summary>
                            <p className="mt-2 text-sm text-gray-400">{faq.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <div className="text-center p-8 glass-card rounded-[40px]">
                <h3 className="text-2xl font-black mb-4">Ready to Start?</h3>
                <p className="text-gray-400 mb-6">Connect your wallet and buy your first ticket today!</p>
                <button className="gradient-bg px-8 py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-opacity">
                    Get Started →
                </button>
            </div>
        </div>
    );
};

export default HowItWorks;
