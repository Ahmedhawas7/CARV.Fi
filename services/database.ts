
import { User, TaskConfig, UserTaskProgress } from '../types';

const DB_NAME = 'CarvFi_DB';
const DB_VERSION = 1;

export const STORES = {
    USERS: 'users',
    TASKS: 'tasks',
    USER_TASKS: 'user_tasks',
    SETTINGS: 'settings'
};

class DatabaseService {
    private db: IDBDatabase | null = null;
    private pendingOpen: Promise<void> | null = null;

    async init(): Promise<void> {
        if (this.db) return;
        if (this.pendingOpen) return this.pendingOpen;

        this.pendingOpen = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("Database error: " + (event.target as any).error);
                reject((event.target as any).error);
            };

            request.onsuccess = (event) => {
                this.db = (event.target as any).result;
                console.log("Database initialized successfully");
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as any).result;

                // Users Store
                if (!db.objectStoreNames.contains(STORES.USERS)) {
                    db.createObjectStore(STORES.USERS, { keyPath: 'walletAddress' });
                }

                // Tasks Store
                if (!db.objectStoreNames.contains(STORES.TASKS)) {
                    db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
                }

                // User Tasks Progress Store
                if (!db.objectStoreNames.contains(STORES.USER_TASKS)) {
                    const userTaskStore = db.createObjectStore(STORES.USER_TASKS, { keyPath: ['userId', 'taskId'] });
                    userTaskStore.createIndex('userId', 'userId', { unique: false });
                }

                // Settings/Global Store
                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }
            };
        });

        return this.pendingOpen;
    }

    // Generic Helpers
    public async getTransaction(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
        await this.init();
        const transaction = this.db!.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    // --- User Operations ---

    async getUser(walletAddress: string): Promise<User | null> {
        const store = await this.getTransaction(STORES.USERS);
        return new Promise((resolve, reject) => {
            const request = store.get(walletAddress);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllUsers(): Promise<User[]> {
        const store = await this.getTransaction(STORES.USERS);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async saveUser(user: User): Promise<void> {
        const store = await this.getTransaction(STORES.USERS, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.put(user);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // --- Task Config Operations ---

    async getAllTasks(): Promise<TaskConfig[]> {
        const store = await this.getTransaction(STORES.TASKS);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async saveTaskConfig(task: TaskConfig): Promise<void> {
        const store = await this.getTransaction(STORES.TASKS, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.put(task);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async bulkSaveTasks(tasks: TaskConfig[]): Promise<void> {
        const store = await this.getTransaction(STORES.TASKS, 'readwrite');
        return new Promise((resolve, reject) => {
            // We can't use async/await inside the transaction easily like this for loop
            // Standard pattern:
            let completed = 0;
            if (tasks.length === 0) {
                resolve();
                return;
            }

            tasks.forEach(task => {
                const req = store.put(task);
                req.onsuccess = () => {
                    completed++;
                    if (completed === tasks.length) resolve();
                };
                req.onerror = () => reject(req.error);
            });
        });
    }


    // --- User Task Progress Operations ---

    async getUserTaskProgress(userId: string, taskId: string): Promise<UserTaskProgress | null> {
        // Composite key is an array [userId, taskId]
        const store = await this.getTransaction(STORES.USER_TASKS);
        return new Promise((resolve, reject) => {
            const request = store.get([userId, taskId]);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserTasks(userId: string): Promise<UserTaskProgress[]> {
        const store = await this.getTransaction(STORES.USER_TASKS);
        const index = store.index('userId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(IDBKeyRange.only(userId));
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async saveUserTaskProgress(progress: UserTaskProgress): Promise<void> {
        const store = await this.getTransaction(STORES.USER_TASKS, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.put(progress);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export const dbService = new DatabaseService();
