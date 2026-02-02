
import { dbService } from './database';
import { User, LotteryPool, LotteryTicket } from '../types';

export const LOTTERY_CONSTANTS = {
    TICKET_PRICE: 1000,
    DAILY_LIMIT: 10,
    DISTRIBUTION: {
        DAILY_WINNERS: 0.60, // 60%
        JACKPOT_RESERVE: 0.30, // 30%
        PLATFORM_FEE: 0.10 // 10%
    },
    DAILY_WINNER_COUNT: 5
};


class LotteryService {

    private getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    private getWeekId() {
        const d = new Date();
        const onejan = new Date(d.getFullYear(), 0, 1);
        const millisecsInDay = 86400000;
        const weekIdx = Math.ceil((((d.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7);
        return `weekly_${d.getFullYear()}_${weekIdx}`;
    }

    // --- Core Actions ---

    async buyTicket(user: User): Promise<{ success: boolean; message: string; updatedUser?: User }> {
        const today = this.getTodayDate();

        // Check Limits
        if (user.lastTicketDate === today && (user.dailyTicketCount || 0) >= LOTTERY_CONSTANTS.DAILY_LIMIT) {
            return { success: false, message: "Daily ticket limit reached (10/10)." };
        }

        // Check Balance
        if (user.points < LOTTERY_CONSTANTS.TICKET_PRICE) {
            return { success: false, message: "Insufficient GEMs." };
        }

        try {
            // 1. Get or Create Daily Pool
            const poolId = `daily_${today}`;
            let pool = await this.getPool(poolId) || await this.createPool(poolId, 'daily');

            // 2. Create Ticket
            const ticket: LotteryTicket = {
                id: crypto.randomUUID(),
                userId: user.walletAddress!,
                poolId: poolId,
                purchasedAt: Date.now()
            };

            // 3. Update User
            const newCount = (user.lastTicketDate === today) ? (user.dailyTicketCount || 0) + 1 : 1;
            const updatedUser: User = {
                ...user,
                points: user.points - LOTTERY_CONSTANTS.TICKET_PRICE,
                dailyTicketCount: newCount,
                lastTicketDate: today
            };

            // 4. Update Pool
            pool.prizePool += LOTTERY_CONSTANTS.TICKET_PRICE;
            pool.participants.push(user.walletAddress!);

            // Save All
            await dbService.saveUser(updatedUser);
            await this.saveTicket(ticket);
            await this.savePool(pool);

            return { success: true, message: "Ticket Purchased!", updatedUser };

        } catch (e) {
            console.error("Lottery Error", e);
            return { success: false, message: "System Error." };
        }
    }

    // --- Logic & Draws ---

    async checkAndRunDraws() {
        // 1. Check Previous Day Draw
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayId = `daily_${yesterday.toISOString().split('T')[0]}`;

        const yesterdayPool = await this.getPool(yesterdayId);
        if (yesterdayPool && yesterdayPool.status === 'open') {
            await this.runDailyDraw(yesterdayPool);
        }

        // 2. Check Previous Week (Simplified: Just check if we need to close current weekly)
        // NOTE: For this demo, we'll focus on the Daily Draw logic primarily as requested.
    }

    private async runDailyDraw(pool: LotteryPool) {
        if (pool.participants.length === 0) {
            pool.status = 'completed';
            await this.savePool(pool);
            return;
        }

        const totalPrize = pool.prizePool;
        const dailyShare = totalPrize * LOTTERY_CONSTANTS.DISTRIBUTION.DAILY_WINNERS; // 60%
        const jackpotShare = totalPrize * LOTTERY_CONSTANTS.DISTRIBUTION.JACKPOT_RESERVE; // 30%
        // 10% is fee, stays in system (burned)

        // Select Winners
        const uniqueParticipants = [...new Set(pool.participants)];
        const winners: { wallet: string; amount: number }[] = [];

        // Shuffle
        const shuffled = uniqueParticipants.sort(() => 0.5 - Math.random());
        const winnerCount = Math.min(shuffled.length, LOTTERY_CONSTANTS.DAILY_WINNER_COUNT);
        const prizePerWinner = Math.floor(dailyShare / winnerCount);

        for (let i = 0; i < winnerCount; i++) {
            const winnerWallet = shuffled[i];
            winners.push({ wallet: winnerWallet, amount: prizePerWinner });

            // Distribute Prizes immediately to User Wallet (DB)
            const winner = await dbService.getUser(winnerWallet);
            if (winner) {
                winner.points += prizePerWinner;
                await dbService.saveUser(winner);
            }
        }

        // Move Reserve to Weekly Jackpot
        const weekId = this.getWeekId();
        let weeklyPool = await this.getPool(weekId) || await this.createPool(weekId, 'weekly');
        weeklyPool.prizePool += jackpotShare;

        // Update Pool Status
        pool.winners = winners;
        pool.status = 'completed';
        pool.drawnAt = new Date().toISOString();

        await this.savePool(pool);
        await this.savePool(weeklyPool);

        console.log(`Daily Draw ${pool.id} Complete. ${winners.length} Winners. ${jackpotShare} added to Jackpot.`);
    }

    // --- DB Helpers ---

    async getPool(id: string): Promise<LotteryPool | null> {
        const store = await dbService.getTransaction(dbService.STORES.LOTTERY);
        return new Promise((resolve) => {
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    }

    async createPool(id: string, type: 'daily' | 'weekly'): Promise<LotteryPool> {
        const pool: LotteryPool = {
            id,
            type,
            status: 'open',
            prizePool: 0,
            participants: []
        };
        await this.savePool(pool);
        return pool;
    }

    async savePool(pool: LotteryPool) {
        const store = await dbService.getTransaction(dbService.STORES.LOTTERY, 'readwrite');
        store.put(pool);
    }

    async saveTicket(ticket: LotteryTicket) {
        const store = await dbService.getTransaction(dbService.STORES.TICKETS, 'readwrite');
        store.put(ticket);
    }

    async getCurrentJackpot(): Promise<number> {
        const weekId = this.getWeekId();
        const pool = await this.getPool(weekId);
        return pool ? pool.prizePool : 0;
    }
}

export const lotteryService = new LotteryService();
