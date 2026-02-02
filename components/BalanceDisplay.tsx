import React, { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ChainType } from '../services/web3Config';

interface BalanceDisplayProps {
    chain: ChainType;
    userLevel?: number;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ chain, userLevel = 1 }) => {
    const [usdcBalance, setUsdcBalance] = useState('0.00');
    const [gemBalance, setGemBalance] = useState('0');
    const [ticketCount, setTicketCount] = useState(0);
    const [winProbability, setWinProbability] = useState('0.00');

    // EVM hooks
    const { address: evmAddress } = useAccount();
    const { data: evmBalance } = useBalance({
        address: evmAddress,
    });

    // Solana hooks
    const { publicKey: solanaAddress } = useWallet();
    const { connection } = useConnection();

    useEffect(() => {
        const fetchBalances = async () => {
            if (chain === 'evm' && evmAddress) {
                // Fetch EVM balances
                // TODO: Fetch USDC balance from contract
                // TODO: Fetch GEM balance from contract
                // TODO: Fetch ticket count from LotteryController
                setUsdcBalance('0.00'); // Placeholder
                setGemBalance('0'); // Placeholder
                setTicketCount(0); // Placeholder
                setWinProbability('0.00'); // Placeholder
            } else if (chain === 'solana' && solanaAddress) {
                // Fetch Solana balances
                try {
                    const balance = await connection.getBalance(solanaAddress);
                    const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(2);
                    // TODO: Fetch USDC SPL token balance
                    // TODO: Fetch GEM SPL token balance
                    setUsdcBalance('0.00'); // Placeholder
                    setGemBalance('0'); // Placeholder
                    setTicketCount(0); // Placeholder
                    setWinProbability('0.00'); // Placeholder
                } catch (error) {
                    console.error('Error fetching Solana balance:', error);
                }
            }
        };

        fetchBalances();
    }, [chain, evmAddress, solanaAddress, connection]);

    return (
        <div className="hidden md:flex items-center gap-4 bg-black/50 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            {/* USDC Balance */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="text-xs text-green-400 font-bold">$</span>
                <span className="text-sm font-mono font-bold text-white">{usdcBalance}</span>
            </div>

            {/* GEM Balance */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="text-xs text-yellow-400 font-bold">💎</span>
                <span className="text-sm font-mono font-bold text-white">{gemBalance}</span>
            </div>

            {/* Tickets */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="text-xs text-purple-400 font-bold">🎫</span>
                <span className="text-sm font-mono font-bold text-white">{ticketCount}</span>
            </div>

            {/* Win Probability */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="text-xs text-blue-400 font-bold">🎯</span>
                <span className="text-sm font-mono font-bold text-white">{winProbability}%</span>
            </div>

            {/* Level */}
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-mono text-gray-300">Lvl {userLevel}</span>
            </div>
        </div>
    );
};

export default BalanceDisplay;
