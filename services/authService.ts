
interface AuthSession {
    address: string;
    signature: string;
    network: 'base' | 'solana';
    timestamp: number;
}

const STORAGE_KEY = 'carvfi_session';

export const authService = {
    // Save session
    login: (address: string, signature: string, network: 'base' | 'solana' = 'base') => {
        const session: AuthSession = {
            address,
            signature,
            network,
            timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        return session;
    },

    // Check if logged in
    getSession: (): AuthSession | null => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;
        try {
            const session: AuthSession = JSON.parse(data);
            // Optional: Expiry check (e.g. 24h)
            if (Date.now() - session.timestamp > 86400000) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return session;
        } catch {
            return null;
        }
    },

    // Clear session
    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        // Also clear Wagmi/RainbowKit state if possible, or reload page
    },

    // Update network pref
    setNetwork: (network: 'base' | 'solana') => {
        const session = authService.getSession();
        if (session) {
            session.network = network;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        }
    }
};
