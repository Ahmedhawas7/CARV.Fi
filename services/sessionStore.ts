import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChainType } from './web3Config';

interface SessionData {
    walletAddress: string;
    chain: ChainType;
    signature: string;
    timestamp: number;
    loginStreak: number;
    lastLoginDate: string; // YYYY-MM-DD format
}

interface SessionDB extends DBSchema {
    sessions: {
        key: string; // walletAddress-chain
        value: SessionData;
    };
}

class SessionStore {
    private dbPromise: Promise<IDBPDatabase<SessionDB>>;

    constructor() {
        this.dbPromise = openDB<SessionDB>('carvfi-sessions', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('sessions')) {
                    db.createObjectStore('sessions');
                }
            },
        });
    }

    private getKey(address: string, chain: ChainType): string {
        return `${address.toLowerCase()}-${chain}`;
    }

    async saveSession(data: Omit<SessionData, 'loginStreak' | 'lastLoginDate'>): Promise<void> {
        const db = await this.dbPromise;
        const key = this.getKey(data.walletAddress, data.chain);

        // Get existing session to preserve/update streak
        const existing = await db.get('sessions', key);
        const today = new Date().toISOString().split('T')[0];

        let loginStreak = 1;
        if (existing) {
            const lastDate = new Date(existing.lastLoginDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day, keep streak
                loginStreak = existing.loginStreak;
            } else if (diffDays === 1) {
                // Consecutive day, increment
                loginStreak = existing.loginStreak + 1;
            }
            // else: streak broken, reset to 1
        }

        await db.put('sessions', {
            ...data,
            loginStreak,
            lastLoginDate: today,
        }, key);
    }

    async getSession(address: string, chain: ChainType): Promise<SessionData | null> {
        const db = await this.dbPromise;
        const key = this.getKey(address, chain);
        const session = await db.get('sessions', key);

        if (!session) return null;

        // Check if session is expired (24 hours)
        const now = Date.now();
        if (now - session.timestamp > 86400000) {
            await this.clearSession(address, chain);
            return null;
        }

        return session;
    }

    async clearSession(address: string, chain: ChainType): Promise<void> {
        const db = await this.dbPromise;
        const key = this.getKey(address, chain);
        await db.delete('sessions', key);
    }

    async getAllSessions(): Promise<SessionData[]> {
        const db = await this.dbPromise;
        return db.getAll('sessions');
    }
}

export const sessionStore = new SessionStore();
