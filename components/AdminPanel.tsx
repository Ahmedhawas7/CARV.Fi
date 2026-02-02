
import React, { useState, useEffect } from 'react';
import { User, TaskConfig } from '../types';
import { dbService } from '../services/database';
import { taskService } from '../services/taskService';

// Hardcoded Admin Wallets (Replace with your actual wallet address)
const ADMIN_WALLETS = [
    '8wF5...demo', // Placeholder
    // Add user's wallet here after they connect
];

interface AdminPanelProps {
    currentUser: User;
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onClose }) => {
    const [activeTab, setActiveTab] = useState<'tasks' | 'users' | 'airdrop'>('tasks');
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<TaskConfig[]>([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [newTask, setNewTask] = useState<Partial<TaskConfig>>({
        type: 'social',
        platform: 'twitter',
        frequency: 'once',
        points: 100,
        isActive: true
    });

    const [airdropAmount, setAirdropAmount] = useState(100);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const allUsers = await dbService.getAllUsers();
            const allTasks = await dbService.getAllTasks();
            setUsers(allUsers);
            setTasks(allTasks);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.id) return alert('Start with ID and Title');

        // Auto-generate ID if missing
        const task: TaskConfig = {
            id: newTask.id || `task_${Date.now()}`,
            action: newTask.action || 'visit',
            icon: newTask.icon || '⚡',
            description: newTask.description || '',
            url: newTask.url || '',
            waitTimestamp: 5,
            ...newTask as any
        };

        await dbService.saveTaskConfig(task);
        alert('Task Created!');
        loadData();
        setNewTask({ type: 'social', platform: 'twitter', frequency: 'once', points: 100, isActive: true });
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm('Delete this task?')) return;
        // Note: Deleting from IndexedDB cleanly requires a dedicated delete method, 
        // for now we set active=false to soft delete
        const task = tasks.find(t => t.id === id);
        if (task) {
            await dbService.saveTaskConfig({ ...task, isActive: false });
            loadData();
        }
    };

    const handleAirdrop = async (targetWallet: string) => {
        const user = users.find(u => u.walletAddress === targetWallet);
        if (!user) return;

        const newPoints = user.points + airdropAmount;
        const updated = { ...user, points: newPoints };
        await dbService.saveUser(updated);
        alert(`Sent ${airdropAmount} GEMs to ${user.username}`);
        loadData();
    };

    // Simple Admin Auth Check
    // In a real app, this should be backend verified.
    // For this client-side demo, we trust the wallet address string.
    // We allow "Demo_Agent" or configured admins.
    // if (!ADMIN_WALLETS.includes(currentUser.walletAddress || '') && currentUser.walletAddress?.indexOf('Demo') === -1) {
    //   return (
    //     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-10 text-center">
    //       <h1 className="text-4xl font-black text-red-500">ACCESS DENIED</h1>
    //       <button onClick={onClose} className="mt-4 text-white underline">Close</button>
    //     </div>
    //   );
    // }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl overflow-y-auto">
            <div className="container mx-auto p-6 max-w-6xl">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Admin <span className="text-primary">Command</span></h1>
                        <span className="px-3 py-1 bg-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest rounded-full border border-red-500/20">Authorized</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl font-bold">Close ✕</button>
                </header>

                <div className="flex gap-6 mb-8 border-b border-white/10 pb-1">
                    {['tasks', 'users', 'airdrop'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`text-sm font-black uppercase tracking-[0.2em] pb-4 transition-all border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-300'}`}
                        >
                            {tab} Management
                        </button>
                    ))}
                </div>

                {activeTab === 'users' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="glass-card p-6 rounded-[30px] overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/10">
                                        <th className="pb-4 pl-4">User Identity</th>
                                        <th className="pb-4">Wallet</th>
                                        <th className="pb-4">Points</th>
                                        <th className="pb-4">Level</th>
                                        <th className="pb-4">Tasks Done</th>
                                        <th className="pb-4">Streak</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map(u => (
                                        <tr key={u.walletAddress} className="group hover:bg-white/5 transition-colors">
                                            <td className="py-4 pl-4 flex items-center gap-3">
                                                <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                                <span className="font-bold font-mono text-sm">{u.username}</span>
                                            </td>
                                            <td className="font-mono text-xs text-gray-400">{u.walletAddress}</td>
                                            <td className="font-black text-primary">{u.points.toLocaleString()}</td>
                                            <td className="font-bold text-white">Lv. {u.level}</td>
                                            <td className="text-gray-400">?</td>
                                            <td className="text-orange-400 font-bold">🔥 {u.streak}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card p-8 rounded-[30px] space-y-4 border border-white/10">
                                <h3 className="text-xl font-black uppercase">Create Task</h3>
                                <input
                                    placeholder="Task ID (e.g. twitter_follow)"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-mono"
                                    value={newTask.id || ''} onChange={e => setNewTask({ ...newTask, id: e.target.value })}
                                />
                                <input
                                    placeholder="Title"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm"
                                    value={newTask.title || ''} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                                <textarea
                                    placeholder="Description"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm"
                                    value={newTask.description || ''} onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number" placeholder="Points"
                                        className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm"
                                        value={newTask.points} onChange={e => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
                                    />
                                    <select
                                        className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm"
                                        value={newTask.frequency} onChange={e => setNewTask({ ...newTask, frequency: e.target.value as any })}
                                    >
                                        <option value="once">One Time</option>
                                        <option value="daily">Daily</option>
                                    </select>
                                </div>
                                <button onClick={handleCreateTask} className="w-full gradient-bg py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:brightness-110">
                                    Add Task
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                            {tasks.filter(t => t.isActive).map(task => (
                                <div key={task.id} className="glass-card p-4 rounded-xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">{task.icon}</div>
                                        <div>
                                            <h4 className="font-bold">{task.title}</h4>
                                            <p className="text-xs text-gray-500 font-mono">ID: {task.id} • {task.points} GEMs</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <button className="px-3 py-1 bg-white/10 text-xs font-bold rounded hover:bg-white/20">Edit</button>
                                        <button onClick={() => handleDeleteTask(task.id)} className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded hover:bg-red-500/20">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'airdrop' && (
                    <div className="animate-in fade-in max-w-2xl mx-auto space-y-8">
                        <div className="glass-card p-10 rounded-[40px] text-center space-y-6">
                            <h2 className="text-3xl font-black uppercase text-glow">Manual Airdrop</h2>
                            <p className="text-gray-400">Select a user to manually reward points.</p>

                            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto text-left">
                                {users.map(u => (
                                    <button
                                        key={u.walletAddress}
                                        onClick={() => handleAirdrop(u.walletAddress!)}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-primary/20 hover:border-primary/50 border border-transparent transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={u.avatar} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <div className="font-bold">{u.username}</div>
                                                <div className="text-[10px] font-mono text-gray-500">{u.walletAddress}</div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-primary text-black font-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                                            SEND {airdropAmount}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminPanel;
