import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GemPointsData {
    userId: string; // wallet address
    totalPoints: number;
    history: PointTransaction[];
    lastUpdated: number;
}

interface PointTransaction {
    amount: number;
    reason: string;
    timestamp: number;
    txHash?: string;
}

interface GemPointsDB extends DBSchema {
    points: {
        key: string; // userId (wallet address)
        value: GemPointsData;
    };
}

// Point earning rules
export const POINT_RULES = {
    ticketPurchase: 100,      // 100 GEM per 1 USDC ticket
    dailyLogin: 10,           // 10 GEM per day
    weeklyStreak: 50,         // 50 GEM for 7-day streak
    referral: 200,            // 200 GEM per referral
    firstPurchase: 500,       // 500 GEM bonus for first purchase
};

class GemPointsService {
    private dbPromise: Promise<IDBPDatabase<GemPointsDB>>;

    constructor() {
        this.dbPromise = openDB<GemPointsDB>('carvfi-gem-points', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('points')) {
                    db.createObjectStore('points');
                }
            },
        });
    }

    async awardPoints(
        userId: string,
        amount: number,
        reason: string,
        txHash?: string
    ): Promise<number> {
        const db = await this.dbPromise;
        const existing = await db.get('points', userId);

        const transaction: PointTransaction = {
            amount,
            reason,
            timestamp: Date.now(),
            txHash,
        };

        const newData: GemPointsData = existing
            ? {
                ...existing,
                totalPoints: existing.totalPoints + amount,
                history: [...existing.history, transaction],
                lastUpdated: Date.now(),
            }
            : {
                userId,
                totalPoints: amount,
                history: [transaction],
                lastUpdated: Date.now(),
            };

        await db.put('points', newData, userId);
        return newData.totalPoints;
    }

    async getPoints(userId: string): Promise<number> {
        const db = await this.dbPromise;
        const data = await db.get('points', userId);
        return data?.totalPoints || 0;
    }

    async getPointsHistory(userId: string): Promise<PointTransaction[]> {
        const db = await this.dbPromise;
        const data = await db.get('points', userId);
        return data?.history || [];
    }

    async getAllUsers(): Promise<GemPointsData[]> {
        const db = await this.dbPromise;
        return db.getAll('points');
    }

    calculatePointsForTickets(ticketCount: number): number {
        return ticketCount * POINT_RULES.ticketPurchase;
    }

    async awardDailyLogin(userId: string): Promise<number> {
        return this.awardPoints(userId, POINT_RULES.dailyLogin, 'Daily Login');
    }

    async awardWeeklyStreak(userId: string): Promise<number> {
        return this.awardPoints(userId, POINT_RULES.weeklyStreak, '7-Day Streak Bonus');
    }

    async awardReferral(userId: string, referredBy: string): Promise<number> {
        return this.awardPoints(userId, POINT_RULES.referral, `Referred by ${referredBy}`);
    }

    async awardFirstPurchase(userId: string): Promise<number> {
        const history = await this.getPointsHistory(userId);
        const hasTicketPurchase = history.some(t => t.reason.includes('Ticket Purchase'));

        if (!hasTicketPurchase) {
            return this.awardPoints(userId, POINT_RULES.firstPurchase, 'First Purchase Bonus');
        }

        return 0;
    }
}

export const gemPointsService = new GemPointsService();
