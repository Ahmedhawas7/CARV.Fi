import { sessionStore } from './sessionStore';
import { ChainType } from './web3Config';

interface AuthSession {
    address: string;
    chain: ChainType;
    signature: string;
    timestamp: number;
    loginStreak: number;
}

class AuthService {
    private currentSession: AuthSession | null = null;

    async login(address: string, chain: ChainType, signature: string): Promise<void> {
        const timestamp = Date.now();

        await sessionStore.saveSession({
            walletAddress: address,
            chain,
            signature,
            timestamp,
        });

        const session = await sessionStore.getSession(address, chain);
        if (session) {
            this.currentSession = {
                address: session.walletAddress,
                chain: session.chain,
                signature: session.signature,
                timestamp: session.timestamp,
                loginStreak: session.loginStreak,
            };
        }
    }

    async restoreSession(address: string, chain: ChainType): Promise<AuthSession | null> {
        const session = await sessionStore.getSession(address, chain);
        if (!session) {
            this.currentSession = null;
            return null;
        }

        this.currentSession = {
            address: session.walletAddress,
            chain: session.chain,
            signature: session.signature,
            timestamp: session.timestamp,
            loginStreak: session.loginStreak,
        };

        return this.currentSession;
    }

    async logout(address: string, chain: ChainType): Promise<void> {
        await sessionStore.clearSession(address, chain);
        this.currentSession = null;
    }

    getCurrentSession(): AuthSession | null {
        return this.currentSession;
    }

    getLoginStreak(): number {
        return this.currentSession?.loginStreak || 0;
    }

    // Generate message to sign for authentication
    generateAuthMessage(address: string, chain: ChainType): string {
        const timestamp = Date.now();
        return `Sign to authenticate with CARVFi\n\nWallet: ${address}\nChain: ${chain}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost gas.`;
    }
}

export const authService = new AuthService();
