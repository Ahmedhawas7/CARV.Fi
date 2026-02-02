
import { dbService } from './database';
import { TaskConfig, UserTaskProgress, User } from '../types';

// Default Task Configuration
const DEFAULT_TASKS: TaskConfig[] = [
    // Social Tasks (One-time)
    {
        id: 'twitter_follow_main',
        type: 'social',
        platform: 'twitter',
        action: 'follow',
        title: 'Follow CARV.Fi on X',
        description: 'Follow our official account for updates.',
        points: 150,
        url: 'https://twitter.com/carv_fi',
        frequency: 'once', // Never renews
        icon: '🐦',
        isActive: true
    },
    {
        id: 'discord_join_main',
        type: 'social',
        platform: 'discord',
        action: 'join',
        title: 'Join Discord Server',
        description: 'Join the community and verify your role.',
        points: 200,
        url: 'https://discord.gg/carvfi',
        frequency: 'once',
        icon: '👾',
        isActive: true
    },
    {
        id: 'youtube_sub_main',
        type: 'social',
        platform: 'youtube',
        action: 'subscribe',
        title: 'Subscribe to YouTube',
        description: 'Watch our latest tutorials and updates.',
        points: 100,
        url: 'https://youtube.com/@carvfi',
        frequency: 'once',
        icon: '📺',
        isActive: true
    },

    // Daily Tasks (Renewable)
    {
        id: 'daily_tweet_share',
        type: 'daily',
        platform: 'twitter',
        action: 'share',
        title: 'Share Daily Alpha',
        description: 'Tweet about CARV.Fi to earn daily points.',
        points: 50,
        url: 'https://twitter.com/intent/tweet?text=Mining%20%24GEMs%20on%20CARV.Fi%20%F0%9F%92%8E',
        frequency: 'daily',
        icon: '🔁',
        isActive: true,
        waitTimestamp: 5 // 5 seconds wait before verify
    },
    {
        id: 'daily_discord_chat',
        type: 'daily',
        platform: 'discord',
        action: 'share',
        title: 'Say GM in Discord',
        description: 'Engage with the community daily.',
        points: 30,
        url: 'https://discord.gg/carvfi',
        frequency: 'daily',
        icon: '💬',
        isActive: true
    }
];

export const taskService = {

    // Initialize default tasks if they don't exist
    async initTasks() {
        const existing = await dbService.getAllTasks();
        if (existing.length === 0) {
            console.log('Seeding default tasks...');
            await dbService.bulkSaveTasks(DEFAULT_TASKS);
        }
    },

    async getAvailableTasks(userId: string): Promise<{ task: TaskConfig, status: 'pending' | 'completed' | 'ready_to_claim', progress?: UserTaskProgress }[]> {
        const allTasks = await dbService.getAllTasks();
        const userProgress = await dbService.getUserTasks(userId);

        // Create a map for quick lookup
        const progressMap = new Map(userProgress.map(p => [p.taskId, p]));

        return allTasks.map(task => {
            const progress = progressMap.get(task.id);
            let status: 'pending' | 'completed' | 'ready_to_claim' = 'pending';

            if (progress) {
                if (progress.status === 'completed') {
                    // Check if it should renew
                    if (task.frequency === 'daily') {
                        const lastClaim = new Date(progress.completedAt);
                        const today = new Date();
                        if (lastClaim.getDate() !== today.getDate() || lastClaim.getMonth() !== today.getMonth() || lastClaim.getFullYear() !== today.getFullYear()) {
                            status = 'pending'; // Reset for new day
                        } else {
                            status = 'completed';
                        }
                    } else if (task.frequency === 'once') {
                        status = 'completed';
                    }
                }
            }

            return { task, status, progress };
        });
    },

    async completeTask(userId: string, taskId: string): Promise<{ success: boolean, pointsAwarded: number, newTotal: number }> {
        const user = await dbService.getUser(userId);
        if (!user) throw new Error('User not found');

        const tasks = await dbService.getAllTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');

        // Check if allowed
        const progress = await dbService.getUserTaskProgress(userId, taskId);

        // Validation Logic
        if (progress && progress.status === 'completed') {
            if (task.frequency === 'once') return { success: false, pointsAwarded: 0, newTotal: user.points };

            if (task.frequency === 'daily') {
                const lastClaim = new Date(progress.completedAt);
                const today = new Date();
                const isSameDay = lastClaim.getDate() === today.getDate() &&
                    lastClaim.getMonth() === today.getMonth() &&
                    lastClaim.getFullYear() === today.getFullYear();
                if (isSameDay) return { success: false, pointsAwarded: 0, newTotal: user.points };
            }
        }

        // Award Points
        const newPoints = user.points + task.points;
        const newLevel = Math.floor(Math.sqrt(newPoints / 50)) + 1; // Simple level formula from App.tsx

        // Update User
        const updatedUser = { ...user, points: newPoints, level: newLevel };
        await dbService.saveUser(updatedUser);

        // Save Progress
        const newProgress: UserTaskProgress = {
            userId,
            taskId,
            status: 'completed',
            completedAt: Date.now(),
            lastClaimedAt: Date.now()
        };
        await dbService.saveUserTaskProgress(newProgress);

        return { success: true, pointsAwarded: task.points, newTotal: newPoints };
    }
};
