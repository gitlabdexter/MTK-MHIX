
import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_DATA } from '../constants';
import { AppData, User, Server, ServerProtocol, Subscription, SubscriptionType } from '../types';
import { DashboardIcon, UsersIcon, ServerIcon, SubscriptionsIcon, SettingsIcon } from './Icons';

type AdminPage = 'dashboard' | 'users' | 'servers' | 'subscriptions' | 'settings';

export const AdminPanel: React.FC = () => {
    const [page, setPage] = useState<AdminPage>('dashboard');
    const [data, setData] = useLocalStorage<AppData>('dx-vpn-data', INITIAL_DATA);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
        { id: 'users', label: 'User Management', icon: UsersIcon },
        { id: 'servers', label: 'Server Management', icon: ServerIcon },
        { id: 'subscriptions', label: 'Subscriptions', icon: SubscriptionsIcon },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];
    
    const renderContent = () => {
        switch(page) {
            case 'dashboard': return <Dashboard data={data} />;
            case 'users': return <UserManagement data={data} setData={setData} />;
            case 'servers': return <ServerManagement data={data} setData={setData} />;
            case 'subscriptions': return <SubscriptionManagement data={data} setData={setData} />;
            case 'settings': return <SettingsManagement data={data} setData={setData} />;
            default: return <Dashboard data={data} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full">
            <aside className="w-full md:w-64 bg-dx-light-2 dark:bg-dx-dark-2 p-4 md:p-6 shadow-lg">
                <nav>
                    <ul className="flex flex-row md:flex-col gap-2">
                        {menuItems.map(item => (
                            <li key={item.id} className="flex-1 md:flex-none">
                                <button 
                                    onClick={() => setPage(item.id as AdminPage)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${page === item.id ? 'bg-dx-accent/20 text-dx-accent shadow-dx-glow' : 'hover:bg-dx-light-3 dark:hover:bg-dx-dark-3'}`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="hidden md:inline">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 p-4 md:p-8 overflow-y-auto text-dx-dark dark:text-dx-light">
                {renderContent()}
            </main>
        </div>
    );
};

// Sub-components for each admin page

const Dashboard: React.FC<{data: AppData}> = ({ data }) => {
    const stats = useMemo(() => {
        const totalUsers = data.users.length;
        const totalFaqs = data.faq.length;
        const totalFeedback = data.feedback.length;
        const totalServers = data.servers.length;
        const freeSubs = data.subscriptions.find(s => s.type === SubscriptionType.FREE);
        const freeSubUsers = data.users.filter(u => u.subscriptionId === freeSubs?.id).length;
        const paidSubUsers = totalUsers - freeSubUsers;
        const total = totalUsers + totalFaqs + totalFeedback + totalServers;

        const calculatePercent = (count: number) => total > 0 ? ((count / total) * 100).toFixed(0) : 0;

        return [
            { label: 'Users', count: totalUsers, percent: calculatePercent(totalUsers) },
            { label: 'FAQ', count: totalFaqs, percent: calculatePercent(totalFaqs) },
            { label: 'Feedback', count: totalFeedback, percent: calculatePercent(totalFeedback) },
            { label: 'Server', count: totalServers, percent: calculatePercent(totalServers) },
            { label: 'Free Subscription', count: freeSubUsers, percent: calculatePercent(freeSubUsers) },
            { label: 'Paid Subscription', count: paidSubUsers, percent: calculatePercent(paidSubUsers) },
        ];
    }, [data]);
    
    const topBandwidthUsers = [...data.users].sort((a, b) => b.bandwidthUsage - a.bandwidthUsage).slice(0, 10);
    const topDataUsers = [...data.users].sort((a, b) => b.dataUsage - a.dataUsage).slice(0, 10);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dx-accent tracking-wider">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-dx-light-2 dark:bg-dx-dark-2 p-6 rounded-xl border border-dx-light-3 dark:border-dx-dark-3 hover:shadow-dx-glow transition-shadow duration-300">
                        <h3 className="text-lg text-dx-gray">{stat.label}</h3>
                        <p className="text-4xl font-bold my-2">{stat.count}</p>
                        <p className="text-dx-accent">{stat.percent}% of total</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UserTable title="Top 10 Users by Max Bandwidth" users={topBandwidthUsers} metric="bandwidthUsage" unit="GB" />
                <UserTable title="Top 10 Users by Max Data Use" users={topDataUsers} metric="dataUsage" unit="GB" />
            </div>
        </div>
    );
};

const UserTable: React.FC<{ title: string; users: User[]; metric: 'bandwidthUsage' | 'dataUsage', unit: string }> = ({ title, users, metric, unit }) => (
    <div className="bg-dx-light-2 dark:bg-dx-dark-2 p-6 rounded-xl border border-dx-light-3 dark:border-dx-dark-3">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-dx-light-3 dark:border-dx-dark-3 text-dx-gray">
                    <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3 text-right">Usage</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-b border-dx-light-3 dark:border-dx-dark-3 last:border-0 hover:bg-dx-light-3/50 dark:hover:bg-dx-dark-3/50">
                            <td className="p-3">{user.name}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3 text-right font-mono">{user[metric]} {unit}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const UserManagement: React.FC<{ data: AppData, setData: React.Dispatch<React.SetStateAction<AppData>> }> = ({ data, setData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | Partial<User> | null>(null);

    const openModalForNew = () => {
        setEditingUser({ name: '', email: '', subscriptionId: data.subscriptions[0]?.id || '', bandwidthUsage: 0, dataUsage: 0 });
        setIsModalOpen(true);
    };

    const openModalForEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const handleSave = (userToSave: User | Partial<User>) => {
        if ('id' in userToSave && userToSave.id) { // Editing existing user
            setData(prev => ({
                ...prev,
                users: prev.users.map(u => u.id === userToSave.id ? { ...u, ...userToSave } as User : u)
            }));
        } else { // Creating new user
            const newUser: User = {
                id: `user-${Date.now()}`,
                name: userToSave.name || 'New User',
                email: userToSave.email || 'new@example.com',
                subscriptionId: userToSave.subscriptionId || data.subscriptions[0]?.id,
                bandwidthUsage: 0,
                dataUsage: 0,
            };
            setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
        }
        closeModal();
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-dx-accent">User Management</h2>
                <button onClick={openModalForNew} className="bg-dx-accent text-dx-dark font-bold py-2 px-4 rounded-lg hover:opacity-80 transition-opacity">
                    Add New User
                </button>
            </div>
            <div className="bg-dx-light-2 dark:bg-dx-dark-2 p-6 rounded-xl border border-dx-light-3 dark:border-dx-dark-3 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-dx-light-3 dark:border-dx-dark-3 text-dx-gray">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Subscription</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.users.map(user => {
                            const sub = data.subscriptions.find(s => s.id === user.subscriptionId);
                            return (
                                <tr key={user.id} className="border-b border-dx-light-3 dark:border-dx-dark-3 last:border-0 hover:bg-dx-light-3/50 dark:hover:bg-dx-dark-3/50">
                                    <td className="p-3 whitespace-nowrap">{user.name}</td>
                                    <td className="p-3 whitespace-nowrap">{user.email}</td>
                                    <td className="p-3 whitespace-nowrap">{sub?.name || 'N/A'}</td>
                                    <td className="p-3 text-right space-x-4 whitespace-nowrap">
                                        <button onClick={() => openModalForEdit(user)} className="text-dx-accent hover:opacity-80 font-semibold">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-400 font-semibold">Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {isModalOpen && editingUser && (
                <UserModal
                    user={editingUser}
                    subscriptions={data.subscriptions}
                    onSave={handleSave}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

const UserModal: React.FC<{
    user: User | Partial<User>;
    subscriptions: Subscription[];
    onSave: (user: User | Partial<User>) => void;
    onClose: () => void;
}> = ({ user, subscriptions, onSave, onClose }) => {
    const [formData, setFormData] = useState(user);
    const [password, setPassword] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password) {
            console.log(`Password for user ${formData.email} changed. In a real app, this would be hashed and saved securely.`);
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
            <div className="bg-dx-light dark:bg-dx-dark-2 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-dx-light-3 dark:border-dx-dark-3 transform transition-all" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-6 text-dx-accent">{'id' in formData ? 'Edit User' : 'Add User'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-dx-gray text-sm">Name</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full bg-dx-light-2 dark:bg-dx-dark-3 p-2 rounded-lg border-2 border-transparent focus:border-dx-accent outline-none" />
                    </div>
                    <div>
                        <label className="block mb-1 text-dx-gray text-sm">Email</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required className="w-full bg-dx-light-2 dark:bg-dx-dark-3 p-2 rounded-lg border-2 border-transparent focus:border-dx-accent outline-none" />
                    </div>
                    <div>
                        <label className="block mb-1 text-dx-gray text-sm">Password</label>
                        <input type="password" name="password" placeholder={'id' in formData ? 'Leave blank to keep current' : 'Enter password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-dx-light-2 dark:bg-dx-dark-3 p-2 rounded-lg border-2 border-transparent focus:border-dx-accent outline-none" />
                    </div>
                    <div>
                        <label className="block mb-1 text-dx-gray text-sm">Subscription</label>
                        <select name="subscriptionId" value={formData.subscriptionId} onChange={handleChange} className="w-full bg-dx-light-2 dark:bg-dx-dark-3 p-2 rounded-lg border-2 border-transparent focus:border-dx-accent outline-none appearance-none">
                            {subscriptions.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg bg-dx-light-3 dark:bg-dx-dark-3 hover:opacity-80 transition-opacity font-semibold">Cancel</button>
                        <button type="submit" className="py-2 px-5 rounded-lg bg-dx-accent text-dx-dark font-bold hover:opacity-80 transition-opacity">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ServerManagement: React.FC<{data: AppData, setData: React.Dispatch<React.SetStateAction<AppData>>}> = ({data, setData}) => {
    // Simplified form state
    const [newServer, setNewServer] = useState<Partial<Server>>({ protocol: ServerProtocol.WIREGUARD, provideTo: 'Free' });

    const handleCreate = () => {
        const serverToAdd: Server = {
            id: `server-${Date.now()}`,
            countryCode: newServer.countryCode || 'N/A',
            countryName: newServer.countryName || 'N/A',
            protocol: newServer.protocol || ServerProtocol.WIREGUARD,
            serverIp: newServer.serverIp || '0.0.0.0',
            provideTo: newServer.provideTo || 'Free',
            latitude: newServer.latitude || 0,
            longitude: newServer.longitude || 0,
            ...newServer,
        };
        setData(prev => ({...prev, servers: [...prev.servers, serverToAdd]}));
        setNewServer({ protocol: ServerProtocol.WIREGUARD, provideTo: 'Free' });
    };
    
    return (
         <div>
            <h2 className="text-3xl font-bold text-dx-accent mb-6">Server Management</h2>
            {/* Create form */}
            <div className="bg-dx-light-2 dark:bg-dx-dark-2 p-6 rounded-xl border border-dx-light-3 dark:border-dx-dark-3 mb-8">
                 <h3 className="text-xl font-semibold mb-4">Create New Server</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {/* Form fields here, simplified */}
                     <select value={newServer.protocol} onChange={e => setNewServer({...newServer, protocol: e.target.value as ServerProtocol})} className="bg-dx-light-3 dark:bg-dx-dark-3 p-2 rounded">
                         {Object.values(ServerProtocol).map(p => <option key={p} value={p}>{p}</option>)}
                     </select>
                     <input type="text" placeholder="Country Code (e.g., US)" onChange={e => setNewServer({...newServer, countryCode: e.target.value})} className="bg-dx-light-3 dark:bg-dx-dark-3 p-2 rounded"/>
                     <input type="text" placeholder="Country Name" onChange={e => setNewServer({...newServer, countryName: e.target.value})} className="bg-dx-light-3 dark:bg-dx-dark-3 p-2 rounded"/>
                     <input type="text" placeholder="Server IP" onChange={e => setNewServer({...newServer, serverIp: e.target.value})} className="bg-dx-light-3 dark:bg-dx-dark-3 p-2 rounded"/>
                     {(newServer.protocol === ServerProtocol.IPSEC_EAP || newServer.protocol === ServerProtocol.IPSEC_PSK) && (
                         <>
                             <input type="text" placeholder="Remote ID" onChange={e => setNewServer({...newServer, remoteId: e.target.value})} className="bg-dx-light-3 dark:bg-dx-dark-3 p-2 rounded"/>
                             <input type="text" placeholder="Local ID" onChange={e => setNewServer({...newServer, localId: e.target.value})} className="bg-dx-light-3 dark:bg-dx-dark-3 p-2 rounded"/>
                             <input type="text" placeholder="Secret Key" onChange={e => setNewServer({...newServer, secretKey: e.target.value})} className="bg-dx-light-3 dark:bg-dx-dark-3 p-2 rounded"/>
                         </>
                     )}
                 </div>
                 <button onClick={handleCreate} className="mt-4 bg-dx-accent text-dx-dark font-bold py-2 px-4 rounded hover:opacity-80">Create Server</button>
            </div>
            {/* Server List */}
            <div className="bg-dx-light-2 dark:bg-dx-dark-2 p-6 rounded-xl border border-dx-light-3 dark:border-dx-dark-3">
                 <h3 className="text-xl font-semibold mb-4">All Servers</h3>
                 {/* Table of servers */}
            </div>
         </div>
    );
};

const SubscriptionManagement: React.FC<{data: AppData, setData: React.Dispatch<React.SetStateAction<AppData>>}> = ({data, setData}) => {
    // Simplified logic
    return (
        <div>
            <h2 className="text-3xl font-bold text-dx-accent mb-6">Subscription Management</h2>
            <div className="bg-dx-light-2 dark:bg-dx-dark-2 p-6 rounded-xl border border-dx-light-3 dark:border-dx-dark-3">
                {data.subscriptions.map(sub => (
                    <div key={sub.id} className="mb-4 p-4 border border-dx-dark-3 rounded">
                        <h4 className="font-bold">{sub.name} ({sub.type})</h4>
                        {sub.type === SubscriptionType.PREMIUM && <p>Price: ${sub.price}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsManagement: React.FC<{data: AppData, setData: React.Dispatch<React.SetStateAction<AppData>>}> = ({data, setData}) => {
    const [settings, setSettings] = useState(data.settings);
    
    const handleSave = () => {
        setData(prev => ({ ...prev, settings: settings }));
        alert('Settings saved!');
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-dx-accent mb-6">Settings</h2>
            <div className="bg-dx-light-2 dark:bg-dx-dark-2 p-6 rounded-xl border border-dx-light-3 dark:border-dx-dark-3 space-y-4">
                {Object.entries(settings).map(([key, value]) => (
                    <div key={key}>
                        <label className="capitalize block mb-1 text-dx-gray">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setSettings(s => ({ ...s, [key]: e.target.value }))}
                            className="w-full bg-dx-light-3 dark:bg-dx-dark-3 p-2 rounded border-2 border-transparent focus:border-dx-accent outline-none"
                        />
                    </div>
                ))}
                <button onClick={handleSave} className="bg-dx-accent text-dx-dark font-bold py-2 px-6 rounded hover:opacity-80 transition-opacity">Save Settings</button>
            </div>
        </div>
    );
};
