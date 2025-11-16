
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_DATA } from '../constants';
import { AppData, Server, User, Subscription, SubscriptionType } from '../types';
import { GlobeIcon, SpeedometerIcon, UserIcon, DxvpnLogo, LocationMarkerIcon, GiftIcon, SpinnerIcon, CheckCircleIcon } from './Icons';

type UserPage = 'home' | 'speed' | 'map' | 'profile' | 'free';

export const UserApp: React.FC = () => {
    const [data] = useLocalStorage<AppData>('dx-vpn-data', INITIAL_DATA);
    // For demo, we'll assume we are user-1
    const currentUser = data.users[0]; 
    const currentSub = data.subscriptions.find(s => s.id === currentUser.subscriptionId);
    
    const [page, setPage] = useState<UserPage>('home');
    const [isConnected, setIsConnected] = useState(false);
    const [selectedServer, setSelectedServer] = useState<Server | null>(data.servers[0] || null);
    const [time, setTime] = useState('00:00:00');
    const [isServerListOpen, setIsServerListOpen] = useState(false);

    useEffect(() => {
        let timer: number;
        if (isConnected) {
            let seconds = 0;
            timer = window.setInterval(() => {
                seconds++;
                setTime(new Date(seconds * 1000).toISOString().substr(11, 8));
            }, 1000);
        } else {
            setTime('00:00:00');
        }
        return () => window.clearInterval(timer);
    }, [isConnected]);

    const availableServers = data.servers.filter(server => 
        currentSub?.type === SubscriptionType.PREMIUM ? true : server.provideTo === 'Free'
    );
    
    const renderContent = () => {
        switch(page) {
            case 'home': return <HomeView isConnected={isConnected} setIsConnected={setIsConnected} selectedServer={selectedServer} time={time} onSelectServerClick={() => setIsServerListOpen(true)} />;
            case 'speed': return <SpeedView isConnected={isConnected} />;
            case 'map': return <MapView servers={data.servers} setSelectedServer={(server) => { setSelectedServer(server); setPage('home'); }} isConnected={isConnected}/>;
            case 'profile': return <ProfileView user={currentUser} subscription={currentSub} isConnected={isConnected} />;
            case 'free': return <FreeInternetView />;
            default: return <HomeView isConnected={isConnected} setIsConnected={setIsConnected} selectedServer={selectedServer} time={time} onSelectServerClick={() => setIsServerListOpen(true)} />;
        }
    }

    const navItems = [
        { id: 'home', label: 'Home', icon: DxvpnLogo },
        { id: 'speed', label: 'Speed', icon: SpeedometerIcon },
        { id: 'map', label: 'Map', icon: GlobeIcon },
        { id: 'free', label: 'Free Internet', icon: GiftIcon },
        { id: 'profile', label: 'Profile', icon: UserIcon },
    ];
    
    return (
        <div className="h-full flex flex-col bg-dx-light-2 dark:bg-dx-dark-2">
            <div className="flex-1 p-6 overflow-y-auto">
                {renderContent()}
            </div>
            <ServerSelectionSheet 
              isOpen={isServerListOpen}
              onClose={() => setIsServerListOpen(false)}
              servers={availableServers}
              currentServerId={selectedServer?.id}
              onSelect={(server) => {
                if (!isConnected) {
                    setSelectedServer(server);
                }
                setIsServerListOpen(false);
              }}
            />
            <nav className="flex justify-around p-2 bg-dx-light dark:bg-dx-dark border-t border-dx-light-3 dark:border-dx-dark-3">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setPage(item.id as UserPage)} className={`flex flex-col items-center p-2 rounded-lg w-20 transition-colors ${page === item.id ? 'text-dx-accent' : 'text-dx-gray'}`}>
                        <item.icon className="h-7 w-7 mb-1" />
                        <span className="text-xs">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

// Sub-components for each user page

const HomeView: React.FC<{
    isConnected: boolean;
    setIsConnected: (v: boolean) => void;
    selectedServer: Server | null;
    time: string;
    onSelectServerClick: () => void;
}> = ({ isConnected, setIsConnected, selectedServer, time, onSelectServerClick }) => {
    return (
        <div className="flex flex-col items-center justify-between h-full text-center">
            <div className="w-full">
                <div className="flex items-center justify-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <h2 className="text-2xl font-semibold">{isConnected ? 'Connected' : 'Disconnected'}</h2>
                </div>
                <p className="text-dx-gray">{isConnected ? `Your IP: ${selectedServer?.serverIp}` : 'Your IP: 127.0.0.1'}</p>
                <p className="text-2xl font-mono mt-4">{time}</p>
            </div>
            
            <button
                onClick={() => setIsConnected(!isConnected)}
                className={`my-8 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                    isConnected
                        ? 'bg-dx-accent shadow-dx-glow border-4 border-dx-dark'
                        : 'bg-dx-dark-3 border-4 border-dx-gray'
                }`}
            >
                <span className="text-4xl font-bold text-white">
                    {isConnected ? 'STOP' : 'TAP'}
                </span>
            </button>
            
            <div className="w-full">
               <button 
                    onClick={onSelectServerClick}
                    className="w-full bg-dx-light-3 dark:bg-dx-dark-3 p-3 rounded-lg text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    disabled={isConnected}
                >
                    {selectedServer ? (
                        <>
                          <img src={`https://flagcdn.com/w40/${selectedServer.countryCode.toLowerCase()}.png`} alt={`${selectedServer.countryName} flag`} className="w-8 h-auto rounded" />
                          <span>{selectedServer.countryName}</span>
                        </>
                    ) : (
                        <span>Select a Server</span>
                    )}
                </button>
            </div>
        </div>
    );
};

const SpeedView: React.FC<{ isConnected: boolean }> = ({ isConnected }) => {
    const [isTesting, setIsTesting] = useState(false);
    const [results, setResults] = useState<{download: number, upload: number} | null>(null);

    const runTest = () => {
        setIsTesting(true);
        setResults(null);
        setTimeout(() => {
            setResults({
                download: Math.random() * 150 + 20, // 20-170 Mbps
                upload: Math.random() * 80 + 10, // 10-90 Mbps
            });
            setIsTesting(false);
        }, 3000);
    };

    return (
        <div className="text-center flex flex-col justify-center items-center h-full">
            <div className="flex items-center justify-center gap-2 mb-8">
                <h2 className="text-3xl font-bold">Speed Test</h2>
                <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            </div>
            {isTesting ? (
                <>
                    <SpinnerIcon className="w-24 h-24 text-dx-accent animate-spin my-8" />
                    <p className="text-dx-gray">Testing your connection...</p>
                </>
            ) : results ? (
                 <>
                    <div className="flex justify-around w-full my-8">
                        <div>
                            <p className="text-dx-gray">Download</p>
                            <p className="text-3xl font-bold">{results.download.toFixed(1)} <span className="text-lg">Mbps</span></p>
                        </div>
                        <div>
                            <p className="text-dx-gray">Upload</p>
                            <p className="text-3xl font-bold">{results.upload.toFixed(1)} <span className="text-lg">Mbps</span></p>
                        </div>
                    </div>
                     <button onClick={runTest} className="w-full max-w-xs mt-8 bg-dx-accent text-dx-dark font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity transform active:scale-95">
                         Test Again
                     </button>
                 </>
            ) : (
                <>
                    <SpeedometerIcon className="w-24 h-24 text-dx-accent my-8" />
                    <p className="text-dx-gray mb-8">Check your download and upload speed.</p>
                     <button onClick={runTest} className="w-full max-w-xs bg-dx-accent text-dx-dark font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity transform active:scale-95">
                         Start Test
                     </button>
                </>
            )}
        </div>
    );
};

const MapView: React.FC<{servers: Server[], setSelectedServer: (s: Server) => void, isConnected: boolean}> = ({ servers, setSelectedServer, isConnected }) => {
    return (
        <div>
            <div className="flex items-center justify-center gap-2 mb-4">
                <h2 className="text-3xl font-bold">Select a Location</h2>
                <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            </div>
            <div className="relative aspect-video bg-dx-dark-3 rounded-lg overflow-hidden map-bg">
                 <div 
                    className="absolute inset-0" 
                    style={{
                        backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)`,
                        backgroundSize: `20px 20px`
                    }}
                ></div>

                {servers.map(server => {
                    // Simple projection. Not accurate.
                    const x = 50 + (server.longitude / 3.6);
                    const y = 25 - (server.latitude / 3.6);
                    return (
                        <button 
                            key={server.id} 
                            onClick={() => setSelectedServer(server)} 
                            style={{ left: `${x}%`, top: `${y}%` }} 
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 group p-2"
                            aria-label={`Select server in ${server.countryName}`}
                        >
                            <LocationMarkerIcon className="w-6 h-6 text-dx-accent animate-pulse group-hover:animate-none group-hover:text-dx-accent-2 transition-all duration-200 transform group-hover:scale-150" />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-dx-dark-2 text-white px-2 py-1 rounded-md text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {server.countryName}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

const ProfileView: React.FC<{ user: User, subscription?: Subscription, isConnected: boolean }> = ({ user, subscription, isConnected }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            </div>
            <div className="bg-dx-light-3 dark:bg-dx-dark-3 p-4 rounded-lg">
                <p className="text-dx-gray">Email</p>
                <p>{user.email}</p>
            </div>
            <div className="bg-dx-light-3 dark:bg-dx-dark-3 p-4 rounded-lg">
                <p className="text-dx-gray">Current Plan</p>
                <p className="font-bold text-dx-accent text-lg">{subscription?.name || 'N/A'}</p>
            </div>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1"><p>Bandwidth Usage</p><p>{user.bandwidthUsage} GB</p></div>
                    <div className="w-full bg-dx-dark-3 rounded-full h-2.5"><div className="bg-dx-accent h-2.5 rounded-full" style={{width: `${user.bandwidthUsage/5}%`}}></div></div>
                </div>
                 <div>
                    <div className="flex justify-between mb-1"><p>Data Usage</p><p>{user.dataUsage} GB</p></div>
                    <div className="w-full bg-dx-dark-3 rounded-full h-2.5"><div className="bg-dx-accent-2 h-2.5 rounded-full" style={{width: `${user.dataUsage/2}%`}}></div></div>
                </div>
            </div>
            {subscription?.type === SubscriptionType.FREE && <button className="w-full bg-dx-accent text-dx-dark font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity transform active:scale-95 shadow-lg shadow-dx-accent/30">Upgrade to Premium</button>}
        </div>
    );
};

const FreeInternetView: React.FC = () => {
    type ConnectionStatus = 'idle' | 'loading' | 'tunneling' | 'connected';
    const [status, setStatus] = useState<ConnectionStatus>('idle');

    useEffect(() => {
        if (status === 'loading') {
            const tunnelingTimer = setTimeout(() => {
                setStatus('tunneling');
            }, 4000); // 4 seconds for loading

            const connectedTimer = setTimeout(() => {
                setStatus('connected');
            }, 10000); // 4s loading + 6s tunneling = 10s total

            return () => {
                clearTimeout(tunnelingTimer);
                clearTimeout(connectedTimer);
            };
        }
    }, [status]);

    const handleStart = () => {
        setStatus('loading');
    };
    
    const handleReset = () => {
        setStatus('idle');
    }

    const renderStatus = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <SpinnerIcon className="w-24 h-24 text-dx-accent mb-6 animate-spin" />
                        <h2 className="text-3xl font-bold mb-4">Loading...</h2>
                        <p className="text-dx-gray mb-8 max-w-xs">
                            Establishing a secure connection. Please wait.
                        </p>
                    </>
                );
            case 'tunneling':
                return (
                    <>
                        <GlobeIcon className="w-24 h-24 text-dx-accent mb-6 animate-pulse" />
                        <h2 className="text-3xl font-bold mb-4">Tunneling...</h2>
                        <p className="text-dx-gray mb-8 max-w-xs">
                            Encrypting your traffic and routing through our secure servers.
                        </p>
                    </>
                );
            case 'connected':
                return (
                    <>
                        <CheckCircleIcon className="w-24 h-24 text-green-400 mb-6" />
                        <h2 className="text-3xl font-bold mb-4 text-green-400">Connected</h2>
                        <p className="text-dx-gray mb-8 max-w-xs">
                            You are now connected to the free internet.
                        </p>
                        <button onClick={handleReset} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity">
                            Disconnect
                        </button>
                    </>
                );
            case 'idle':
            default:
                return (
                    <>
                        <GiftIcon className="w-24 h-24 text-dx-accent mb-6 animate-pulse" />
                        <h2 className="text-3xl font-bold mb-4">Unlock Free Internet</h2>
                        <p className="text-dx-gray mb-8 max-w-xs">
                           This feature is usually for Premium subscribers. Tap below for a temporary free connection.
                        </p>
                        <button onClick={handleStart} className="w-full bg-dx-accent text-dx-dark font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity">
                            Start Free Connection
                        </button>
                    </>
                );
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            {renderStatus()}
        </div>
    );
};

// New Component for Server Selection
const ServerSelectionSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  servers: Server[];
  onSelect: (server: Server) => void;
  currentServerId?: string | null;
}> = ({ isOpen, onClose, servers, onSelect, currentServerId }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-60' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-dx-dark-2 rounded-t-2xl p-4 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-12 h-1.5 bg-dx-gray/50 rounded-full mx-auto mb-4"></div>
        <h3 className="text-center text-xl font-semibold mb-4">Available Servers</h3>
        <ul className="max-h-[50vh] overflow-y-auto space-y-2">
          {servers.map(server => (
            <li key={server.id}>
              <button 
                onClick={() => onSelect(server)} 
                className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${currentServerId === server.id ? 'bg-dx-accent/10' : 'hover:bg-dx-dark-3'}`}
              >
                <img src={`https://flagcdn.com/w40/${server.countryCode.toLowerCase()}.png`} alt={server.countryName} className="w-10 h-auto rounded-md" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{server.countryName}</p>
                  <p className="text-sm text-dx-gray">{server.protocol}</p>
                </div>
                {server.provideTo === 'Premium' && <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">PREMIUM</span>}
                {currentServerId === server.id && <CheckCircleIcon className="w-6 h-6 text-dx-accent ml-auto" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
