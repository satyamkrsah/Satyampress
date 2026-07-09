import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun, LogOut } from 'lucide-react';

const AccountSettings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold mb-6 text-black dark:text-cream-dark border-b border-gray-200 dark:border-gray-800 pb-4">
        Account Settings
      </h2>

      <div className="space-y-8 max-w-md">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Preferences</h3>
          <div className="flex items-center justify-between p-4 border border-black dark:border-white bg-gray-50 dark:bg-black">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5 text-gold" /> : <Sun className="w-5 h-5 text-gold" />}
              <div>
                <p className="font-medium text-black dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme for the application</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-gold' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Danger Zone</h3>
          <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Log out of your account on this device.
            </p>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors uppercase text-xs font-semibold tracking-wider"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
