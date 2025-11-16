
import React, { useState, useEffect } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { UserApp } from './components/UserApp';
import { SunIcon, MoonIcon, UserShieldIcon, UserIcon, DxvpnLogo } from './components/Icons';
import { useLocalStorage } from './hooks/useLocalStorage';

type ViewMode = 'admin' | 'user';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [view, setView] = useLocalStorage<ViewMode>('dx-vpn-view', 'user');
  const [theme, setTheme] = useLocalStorage<Theme>('dx-vpn-theme', 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleView = () => {
    setView(prevView => (prevView === 'user' ? 'admin' : 'user'));
  };

  return (
    <div className={`min-h-screen font-sans text-black dark:text-white bg-dx-light dark:bg-dx-dark transition-colors duration-300 flex flex-col`}>
      <header className="sticky top-0 z-50 bg-dx-light-2/80 dark:bg-dx-dark-2/80 backdrop-blur-sm shadow-md dark:shadow-dx-accent/20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <DxvpnLogo className="h-8 w-8 text-dx-dark dark:text-dx-accent" />
            <h1 className="text-xl font-bold tracking-wider">
              DX <span className="text-dx-dark dark:text-dx-accent">VPN</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleView}
              className="p-2 rounded-full hover:bg-dx-light-3 dark:hover:bg-dx-dark-3 transition-colors"
              title={`Switch to ${view === 'user' ? 'Admin' : 'User'} View`}
            >
              {view === 'user' ? <UserShieldIcon className="h-6 w-6" /> : <UserIcon className="h-6 w-6" />}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-dx-light-3 dark:hover:bg-dx-dark-3 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {view === 'admin' ? <AdminPanel /> : <UserApp />}
      </main>
      <footer className="text-center py-2 bg-dx-light dark:bg-dx-dark text-dx-gray text-sm border-t border-dx-light-3 dark:border-dx-dark-3">
        This app is created by CV CREATION
      </footer>
    </div>
  );
};

export default App;
